const compilewx=require('./compilewx')
const util=require('./util')
const wxssSourcemap = require('./wxss')
const g_customComponentsInfo={}
const g_pageComponents={}
let distPath={path:''}
let promiselist=[]
exports.g_customComponentsInfo=g_customComponentsInfo
exports.g_pageComponents=g_pageComponents
exports.distPath=distPath
function parseCustomComponentWxss(full_path){
  return new Promise(function(resolve,reject){
    let prefix=full_path.replace(/\//,'-').substring(0,full_path.length-5)
    util.parseImports(full_path, true, async (err, srcs) => {
      if (err) return reject(err)
      promiselist.push(await compilewx.compileWxss(srcs).then(async stdout=>{
        //store classes names
        let ret=util.prefixCss(prefix,stdout)
        g_customComponentsInfo[full_path]=ret
        await wxssSourcemap(full_path, ret.content).then(content => {
          ret.content=content
          resolve(ret)
        })
      })) 
    })
  })
  
}
function getWxsskeyByFullpathWxml(full_path){
  return full_path.substring(0,full_path.length-5)+'.wxss'
}
exports.parseCustomComponent=function  parseCustomComponent(page,full_path){
   
  //return new Promise(function(resolve,reject){
    util.parseImports(full_path, false, async (err, srcs) => {
      if (err) return 
      let tag=full_path.substring(0,full_path.length-5)
      let config=util.readFileSync(tag+'.json')
      config=JSON.parse(config)
      if(config&&config.usingComponents&&Object.keys(config.usingComponents).length>0){
        for(let key  in config.usingComponents){
          let fullpatht = config.usingComponents[key].replace(/^(\/|\.\/)/, '')+".wxml"
          parseCustomComponent(page,fullpatht)
        }
      }
      
      g_pageComponents[page].push(tag)
      let p1=parseCustomComponentWxss(full_path.substring(0,full_path.length-5)+'.wxss')
      let p2=compilewx.compileWxml(srcs)
      
      promiselist.push(p2)
      let pt=new Promise(function(resolve,reject){
        Promise.all([
            p1,p2
          ]).then((data)=>{
            resolve(data)
          })
        
        } )
      
      pt.then(data=>{
        console.log('自定义组件'+tag+' wxml wxss编译完成')
        let ccinfo=data[0]
        if(ccinfo&&ccinfo.classes){
          let curclasses=ccinfo.classes
          for(let key in curclasses){
            let patten=new RegExp(key,'g')
            data[1]=data[1].replace(patten,curclasses[key])
          }
          console.log('自定义组件'+tag+' wxml样式替换完成')
        }else{
          console.log('自定义组件'+tag+' 没有样式')
        }
        var path=full_path.substring(0,full_path.lastIndexOf('/'))
        var fname=full_path.substring(full_path.lastIndexOf('/'),(full_path.length)-5)
        util.createFile(distPath.path+'/'+path,fname+'-view.js',data[1],()=>{
          console.log('自定义组件'+tag+' view js已生成')
        })
        util.createFile(distPath.path+'/'+path,fname+'.css',data[0].content,()=>{
          console.log('自定义组件'+tag+' css已生成')
        })
        // g_customComponentsInfo[full_path]={
        //   content:data[1]
        // }
      })
      promiselist.push(pt)
      let pt3=util.parseJavascript(null,tag+'.js',false,true)
      let pt4=new Promise((resolve,reject)=>{
        pt3.then(({code,map})=>{
          var path=full_path.substring(0,full_path.lastIndexOf('/'))
          var fname=full_path.substring(full_path.lastIndexOf('/')+1,(full_path.length-5))+'.js'
          util.createFile(distPath.path+'/'+path,fname,code,()=>{
            console.log('自定义组件'+tag+' logic js已生成')
            resolve()
          })
        })
      })
      promiselist.push(pt3)
      promiselist.push(pt4)
   })
   return promiselist
}
exports.insert2PageForWeweb=function insert2PageForWeweb(page,content){
  let cmpts=g_pageComponents[page]
  
  if(cmpts){
    content += '@code-separator-line:['// components array
    for(var i=0;i<cmpts.length;i++){
      if(i==0){
        content += "\'"+cmpts[i]+"\'"
      }else{
        content += ","+"\'"+cmpts[i]+"\'"
      }
      
    }
    content += "]"
  }
  

  return content
}