const execFile = require('child_process').execFile
const exec = require('child_process').exec
const path = require('path')
const isWin = /^win/.test(process.platform)
const isLinux = /^linux/.test(process.platform)
const isMac = /^darwin/.test(process.platform)
const wcscMac = path.resolve(__dirname, '../bin/wcsc')
const wcscWin = wcscMac + '.exe'
const wcscLinux = 'wine ' + wcscWin
const wccMac = path.resolve(__dirname, '../bin/wcc')
const wccWin = wccMac + '.exe'
const wccLinux = 'wine ' + wccWin
const wcsc = isWin ? wcscWin : isMac ? wcscMac : wcscLinux
const wcc = isWin ? wccWin : isMac ? wccMac : wccLinux
const wxml_args = ['-d']
const wxss_args = ['-lc'] //, '-db'这个参数貌似跟sourcemap相关，用wine跑的时偶尔会报错，所以不用
const chalk = require('chalk')

const wxssTranspile = require('wxss-transpiler')
const wxmlTranspiler = require('wxml-transpiler')

let wxmlMsgFlag = 1
let wxssMsgFlag = 1
exports.compileWxss = function compileWxss(srcs){
  let ret=new Promise(function(resolve,reject){
    // cache.setWxssMap(srcs)
    let execWcsc = execFile.bind(null, wcsc, wxss_args.concat(srcs))
    if (isLinux) {
      execWcsc = exec.bind(
        null,
        [wcsc]
          .concat(wxss_args)
          .concat(srcs)
          .join(' ')
      )
    }
    if (useDefaultCompiler) {
      if (wxssMsgFlag) {
        console.log(chalk.yellow('Using wcsc.exe to build: '))
        wxssMsgFlag = 0
      }
      execWcsc(
        {
          maxBuffer: 1024 * 600
        },
        (err, stdout, stderr) => {
          if (err) {
            console.error(err.stack)
            return reject(new Error(`${full_path} 编译失败，请检查`))
          }
          resolve(stdout)
        }
      )
    } else {
      if (wxssMsgFlag) {
        console.log(
          chalk.yellow('Using wxss-transpiler to transpile wxss ')
        )
        wxssMsgFlag = 0
      }
      wxssTranspile(srcs, {
        keepSlash: true
      }).then(stdout => {
        resolve(stdout)
      })
    }
    
  })
  return ret;
}

exports.compileWxml = function compileWxml(srcs){
    let ret= new Promise(function(resolve,reject){
      let execWcc = execFile.bind(null, wcc, wxml_args.concat(srcs))
      if (isLinux) {
        execWcc = exec.bind(
          null,
          [wcc]
            .concat(wxml_args)
            .concat(srcs)
            .join(' ')
        )
      }
      if (useDefaultCompiler) {
        if (wxmlMsgFlag) {
          console.log(chalk.yellow('Using wcc.exe to transpile wxml:'))
          wxmlMsgFlag = 0
        }
        execWcc(
          {
            maxBuffer: 1024 * 600
          },
          (err, stdout, stderr) => {
            if (err) {
              console.error(err.stack)
              return reject(new Error(`${full_path} 编译失败，请检查`))
            }
            resolve(stdout)
          }
        )
      } else {
        if (wxmlMsgFlag) {
          console.log(chalk.yellow('Using wxml-compiler to transpile wxml'))
          wxmlMsgFlag = 0
        }
        const res = wxmlTranspiler.wxmlCompile(srcs).render
        resolve(res)
      }
      
    })
    return ret;
  }
  // const useDefaultCompiler = process.env.DFT_CMP === 'true'
  const useDefaultCompiler = true