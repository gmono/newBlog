
//转换器，用于把一个markdown转换为一个指定格式内容
//html内容+json对象

import * as fm from "front-matter"
import * as fs from "fs"
import * as mk from "marked"
// import * as h from "highlight.js"
import * as Prism from "prismjs"
import * as loadLanguages from 'prismjs/components/'
import { IConfig } from "./Interface/IConfig";

// import * as config from "../config.json"
//如果使用ts加载config会直接被编译到js文件里 这里使用node加载json模块
let config=require("../config.json")  as IConfig;
let langs=config.code_languages;


import * as template from "art-template"
let readAsync=async (fpath:string)=>{
  return new Promise<Buffer>((r)=>{
    fs.readFile(fpath,(e,d)=>{
      r(d);
    })
  })
};

import * as cheerio from "cheerio"
import { IArticleMeta } from "./Interface/IArticleMeta";
import { outputFile } from "fs-extra";

function htmlProcessing(html:string):string{
  //解析html并在code的pre标签添加class
  let $=cheerio.load(html);
  let codeblocks=$("code[class]");
  codeblocks.each((i,e)=>{
    //对每个code节点
    let parent=$(e).parent("pre");
    parent.attr("class",($(e).attr("class")));
  });
  return $.html();
}

export interface TransformResult
{
  html:string;
  meta:IArticleMeta;
  text:string;
}
let first=true;
async function transform(filepath:string):Promise<TransformResult>{
    if(first) {
      //加载语言高亮支持
      console.log(`设定语言支持：${langs}`)
      console.log("加载语言中.....");
      loadLanguages(langs);
      first=false;

    }
    let str=(await readAsync(filepath)).toString();
    let res=fm<IArticleMeta>(str);
    // console.log(res);
    mk.setOptions({
        renderer:new mk.Renderer(),
    
        highlight: (code,lang,cbk)=>{
            const ret=Prism.highlight(code,Prism.languages[lang],lang);
            // console.log(ret)
            return ret;
          },
          pedantic: false,
          gfm: true,
          breaks: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          xhtml: false
    })
    //实际内容
    let content=mk(res.body);
    //模板化
    let html=template(fs.realpathSync("./article_template.html"),{
        content:content
    }) as string;
    //添加html处理
    html=htmlProcessing(html);
    //提取文章元信息
    let meta=res.attributes;
    /**
     * 分别为 html内容
     * 文章元数据
     * 文章markdown原文
     */
    return {html,meta,text:res.body};
  
}
if(require.main==module)
transform("./articles/about.md").then((obj)=>{
  fs.writeFileSync("test.html",obj.html);
})
  
//打开浏览器查看

export default transform;