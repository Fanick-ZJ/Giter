import 'reflect-metadata'
import Database from "better-sqlite3"
import { logger } from "@/electron/logger/init"
import { getFunctionArguments, zipWithObj } from '@/electron/common/utils/tools'

/**
 * 引入 sqlite3 模块后，执行了 verbose 函数。 
 * verbose 函数用于将执行模式设置为输出调用堆栈，
 * 也就是说，如果代码出错， 将会定位到具体的代码执行函数，
 * 而不仅仅只是提示错误信息，方便我们调试代码。
 */

/**
 * 构建this对象
 * @param path 
 * @returns 
 */
function buildThisObj(path: string) {
    const option: Database.Options = {
        readonly: false,
        fileMustExist: true,
        timeout: 2000,
        verbose: logger.info
    }
    logger.info('db_path:', path)
    try{
        return {
            db: Database(path, option)
        }
    }
    catch (error) {
        logger.error(error)
        return {
            db: Database(path, option)
        }
    }
}
export function AutoInsertDB(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
     // 定义元数据键
     const metadataKey = 'AutoInsertDB';
    
     // 使用传入的信息创建对象
     // 使用 Reflect.defineMetadata 添加元数据到目标函数上
     Reflect.defineMetadata(metadataKey, true, descriptor.value, propertyKey);
     let oldVal = descriptor.value!
     const argsNameList = getFunctionArguments(oldVal)
     // logger.info(descriptor)
     descriptor.value = function (...args: any[]){
        // 根据参数对象是否包含 dbPath 参数，来判断是否需要使用默认的 dbPath
        let thisObj
        const kwargs = zipWithObj(argsNameList, args)
        if (kwargs['dbPath'] === undefined) {
            thisObj = buildThisObj(process.env.DB_PATH)
        } else {
            thisObj = buildThisObj(kwargs['dbPath'])
        }
        let res = oldVal.apply(thisObj, args)
        thisObj.db.close()
        return res
    }
}