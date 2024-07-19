import 'reflect-metadata'
import { logger } from "@/electron/logger/init"
/**
 * 关于ipc通信任务的注解
 */
export enum IpcActionEnum {
    ipcMainOn,
    ipcMainHandle
}
export function IpcAction(t: IpcActionEnum): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // 定义元数据键
        const metadataKey = 'TaskType';
    
        // 使用传入的信息创建对象
        const infoObject = t;
    
        // 使用 Reflect.defineMetadata 添加元数据到目标函数上
        Reflect.defineMetadata(metadataKey, infoObject, target, propertyKey);
        return descriptor;
      };
}