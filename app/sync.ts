/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import * as koa from "koa"
import * as kstatic from "koa-static"
import * as krouter from "koa-router"


import { watchFile } from "fs";
import watchArticles, { watchSite } from "./watch";
import del = require("del");
import generate from "./generator";
import   * as clu from "cluster"

import { IConfig } from "./Interface/IConfig";
import * as fse from 'fs-extra';
import * as cluster from 'cluster';





/**
 * 此函数一定要作为单独程序启动
 * @param port 接口
 * @param configname 配置文件
 */
export default async function serve(port:number=80,configname="default"){
    let config=(await fse.readJSON(`./config/${configname}.json`)) as IConfig;
    //启动服务器
    let startServer=(port:number)=>{
        //启动服务器
        const app=new koa();
        //prefixify中间件
        app.use(async (ctx,next)=>{
            let p=ctx.path;
            if(p.startsWith(config.base_url)){

                // if(p==config.base_url&&!p.endsWith("/")) (p+="/",ctx.redirect(p));
                //去除
                let ap=p.slice(config.base_url.length);
                if(ap=="") ap="/";
                
                //使用去头后的调用next
                ctx.path=ap;
                return next();
            }
            //错误
            ctx.redirect(config.base_url+"/");
        })
        app.use(kstatic("."))
        app.listen(port);
    }
    console.log("ttt")
    //启动监视
    if(clu.isMaster){
        startServer(port);
        console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
        //删除原有content 全部重新生成
        // await del("./content");
        console.log("已启动全部重新生成");
        // await generate(configname)
        //开启监视进程
        let worker1=clu.fork();
        let worker2=clu.fork();
        worker1.send("article");
        worker2.send("site");
    }
    else{
        process.send("helo");
        cluster.addListener("message",(msg:"article"|"site")=>{
            console.log("开始监视文章");
            if(msg=="article"){
                
                watchArticles(configname);
            }
            else if(msg=="site"){
                //监控网站 读取指定配置文件中的网站设置
                
                let sname=config.site;
                watchSite(sname);
            }
        })
        
    }
    
    
}

if(require.main==module)
    serve();