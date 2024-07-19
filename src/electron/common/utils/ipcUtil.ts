import { IpcMainEvent, IpcMainInvokeEvent, ipcMain } from "electron"
import { logger } from "@/electron/logger/init"
import 'reflect-metadata'
import { IpcMainBasicService } from "../../service/entity/ipcMainBasicService"
import { IpcActionEnum } from "../../service/decorators/ipcAction"
import CandlestickSeriesModel from "echarts/types/src/chart/candlestick/CandlestickSeries.js"
type handleListener = (event: IpcMainInvokeEvent, ...args: any[]) =>any
type onListener = (event: IpcMainEvent, ...args: any[]) =>any

export const enumControllerMethods = <T extends IpcMainBasicService>(clsInstane: T) => {
    // logger.info('start to register channel....')
    const result = {}
    const filterKeys = ['constructor']
    const keys = Object.getOwnPropertyNames(clsInstane.constructor.prototype)
    keys.forEach( key => {
        // 如果包含在过滤键值内，就跳过
        if (filterKeys.includes(key)) return
        // 获取函数体
        let attr = Reflect.get(clsInstane, key)
        // 获取函数体对应的任务类型
        const taskType = Reflect.getMetadata("TaskType", clsInstane, key)
        if (typeof attr === 'function'){
            // 拼接通道名
            const channel = `${clsInstane.prefix}::${key}`
            
            // 是主进程接收的函数
            if (taskType == IpcActionEnum.ipcMainOn){
                ipcMain.on(channel, (event: IpcMainEvent, ...args: any[]) => {
                    return (attr as onListener).apply(clsInstane, [event, ...args])
                })
            }
            // 主进程接受且返回值给渲染进程
            else if(taskType == IpcActionEnum.ipcMainHandle){
                ipcMain.handle(channel, (event: IpcMainInvokeEvent, ...args: any[]) => {
                    return(attr as handleListener).apply(clsInstane, [event, ...args])
                })
            }else{
                logger.error(`${channel},此通道函数未设置任务类型`)
            }
        }
    })
}