import 'reflect-metadata'
import { IpcMainTaskCenter } from '../entity/ipcMainTaskCenter';
import { logger } from "@/electron/logger/init"
import { abortWrapper } from '@/electron/common/utils/tools'

const taskCenter = IpcMainTaskCenter.getInstane()
/**
 * 关于ipc通信任务的注解
 */
export function Task(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
     // 定义元数据键
     const metadataKey = 'Task';
    
     // 使用传入的信息创建对象
     // 使用 Reflect.defineMetadata 添加元数据到目标函数上
     Reflect.defineMetadata(metadataKey, true, descriptor.value, propertyKey);
     let oldVal = descriptor.value!
     // logger.info(descriptor)
     descriptor.value = function (...args: any[]){
         // old返回一个promise
         const taskID = args.pop()
         taskCenter.record(taskID)
         let res = oldVal.apply(this, args)
        if (res instanceof Promise){
            res = abortWrapper(res) // 给函数包装中断
            return (res as Promise<any>).then((res:any) => {
                if (taskCenter.in(taskID)) {
                    return Promise.resolve(res)
                }
                else (Reflect.get(res, 'abort') as Function)()  // 执行函数中断
            }, error => {
                logger.info(`（错误）任务id${taskID}是否在任务列表中${taskCenter.in(taskID)}`)
                if (taskCenter.in(taskID)) return Promise.reject(error)
                else (Reflect.get(res, 'abort') as Function)()  // 执行函数中断
            }).finally(() => taskCenter.del(taskID))
        }else{
            taskCenter.del(taskID)
            return res
        }
    }
}