import { readGlobalConfig, writeToGlobalConfig, readConfig } from './lib/utils';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as del from 'del';
/**
 * config程序 用于管理配置文件
 * 功能有
 * * 添加配置文件，包括从现有配置文件衍生
 * * 切换配置文件(use命令)
 * * 删除配置文件
 * * 设置某个配置文件或当前配置文件的某个项（自带autocomplete）
 */


/**
 * 衍生一个配置
 * @param baseConfigname 原配置
 * @param newname 新配置
 */
export async function createConfig(baseConfigname:string,newname:string){
    //衍生出一个配置
    //复制重命名
    fse.writeJSON(`./config/${newname}.json`,await readConfig(baseConfigname));
}
export async function deleteConfig(configname:string){
    await del(`./config/${configname}.json`)
}
/**
 * 切换配置文件
 * @param configname 配置名
 */
export async function useConfig(configname:string)
{
    //切换配置文件
    //验证configname存在
    if(await fse.pathExists(path.resolve("./config",configname+".json")))
    {
        //global配置在工作目录
        let global=await readGlobalConfig();
        global.configName=configname;
        //写入到global
        await writeToGlobalConfig(global);
    }
    else
    {
        throw new Error("错误，指定的配置文件不存在");
    }
     
}