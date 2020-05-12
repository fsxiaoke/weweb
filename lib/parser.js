const compilewx=require('./compilewx')
const custom_component_parser=require('./custom_component_parser')
const cache = require('./cache')
const config = require('./config')
const util = require('./util')
const wxssSourcemap = require('./wxss')
const convert = require('convert-source-map')
const wxmlTranspiler = require('wxml-transpiler')


module.exports.exe = function (fullPath) {
  fullPath = fullPath.replace(/^\.?\//, '')
  return new Promise(function (resolve, reject) {
    if (cache.get(fullPath)) {
      return resolve(cache.get(fullPath))
    }
    if (/\.wxml$/.test(fullPath)) {
      let full_path=fullPath
      let promiselist=[]
      util.parseImports(fullPath, false, async(err, srcs) => {
        if (err) return reject(err)
        
        let config=util.readFileSync(full_path.substring(0,full_path.length-5)+'.json')
        config=JSON.parse(config)
        if(config&&config.usingComponents&&Object.keys(config.usingComponents).length>0){
          for(let key  in config.usingComponents){
            let fullpatht = config.usingComponents[key].replace(/^(\/|\.\.\/)+/, '')+".wxml"
            custom_component_parser.g_pageComponents[full_path]=[]
            promiselist=custom_component_parser.parseCustomComponent(full_path,fullpatht)
          }
        }
        const wxmlCmpRes = wxmlTranspiler.wxmlCompile(srcs)
        const tagsInCode = wxmlCmpRes.tags
        await compilewx.compileWxml(srcs).then(stdout=>{
          cache[full_path] = stdout
          // resolve(stdout)
        })
        Promise.all(promiselist).then(()=>{
          const res = [cache[full_path], tagsInCode]
          resolve(res)
        })




        // if (useDefaultCompiler) {
        //   let execWcc = execFile.bind(null, wcc, wxmlArgs.concat(srcs))
        //   if (isLinux) {
        //     execWcc = exec.bind(
        //       null,
        //       [wcc]
        //         .concat(wxmlArgs)
        //         .concat(srcs)
        //         .join(' ')
        //     )
        //   }
        //   if (wxmlMsgFlag) {
        //     console.log(chalk.yellow('Using wcc.exe to transpile wxml:'))
        //     wxmlMsgFlag = 0
        //   }
        //   execWcc({ maxBuffer: 1024 * 600 }, (err, stdout, stderr) => {
        //     if (err) {
        //       console.error(err.stack)
        //       return reject(new Error(`${fullPath} 编译失败，请检查`))
        //     }
        //     const res = [stdout, tagsInCode]
        //     cache.set(fullPath, res)
        //     resolve(res)
        //   })
        // } else {
        //   if (wxmlMsgFlag) {
        //     console.log(chalk.yellow('Using wxml-compiler to transpile wxml:'))
        //     wxmlMsgFlag = 0
        //   }
        //   const res = [wxmlCmpRes.render, tagsInCode]
        //   cache.set(fullPath, res)
        //   resolve(res)
        // }
      })
    } else if (/\.wxss$/.test(fullPath)) {
      util.parseImports(fullPath, true, async(err, srcs) => {
        if (err) return reject(err)
        cache.setWxssMap(srcs)
        await compilewx.compileWxss(srcs).then( async stdout=>{
          await wxssSourcemap(fullPath, stdout).then(content => {
            cache[fullPath] = content
            resolve(content)
          }, reject)
        })

        // if (useDefaultCompiler) {
        //   if (wxssMsgFlag) {
        //     console.log(chalk.yellow('Using wcsc.exe to build: '))
        //     wxssMsgFlag = 0
        //   }
        //   let execWcsc = execFile.bind(null, wcsc, wxssArgs.concat(srcs))
        //   if (isLinux) {
        //     execWcsc = exec.bind(
        //       null,
        //       [wcsc]
        //         .concat(wxssArgs)
        //         .concat(srcs)
        //         .join(' ')
        //     )
        //   }
        //   execWcsc({ maxBuffer: 1024 * 600 }, (err, stdout, stderr) => {
        //     if (err) {
        //       console.error(err.stack)
        //       return reject(new Error(`${fullPath} 编译失败，请检查`))
        //     }
        //     wxssSourcemap(fullPath, stdout).then(content => {
        //       cache.set(fullPath, content)
        //       resolve(content)
        //     }, reject)
        //   })
        // } else {
        //   if (wxssMsgFlag) {
        //     console.log(
        //       chalk.yellow('Using wxss-transpiler to transpile wxss: ')
        //     )
        //     wxssMsgFlag = 0
        //   }
        //   wxssTranspile(srcs, { keepSlash: true }).then(stdout => {
        //     wxssSourcemap(fullPath, stdout).then(content => {
        //       cache.set(fullPath, content)
        //       resolve(content)
        //     }, reject)
        //   })
        // }
      })
    } else if (/\.js$/.test(fullPath)) {
      config().then(function (obj) {
        util.parseJavascript(obj, fullPath).then(
          function ({ code, map }) {
            code = code + '\n' + map ? convert.fromJSON(map).toComment() : ''
            cache.set(fullPath, code)
            resolve(code)
          },
          function (err) {
            console.error(err.stack)
            return reject(new Error(`${fullPath} 编译失败，请检查`))
          }
        )
      }, reject)
    } else {
      resolve()
    }
  }).catch(e => {
    console.error(fullPath + '==> Parse Page Error:', e)
  })
}
