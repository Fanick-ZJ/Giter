import { IpcMainTaskCenter } from "./ipcMainTaskCenter"

/**
 * 与渲染进程对应，每一个部分都要有一个处理对象，服务渲染进程到主进程的通信
 */
export class IpcMainBasicService{
    prefix: string
    
    taskCenter = IpcMainTaskCenter.getInstane()

    constructor(prefix: string){
        this.prefix = prefix
    }
    /**
     * 要在这里执行函数，插入并返回中断函数
     * @param fn 
     * @param param 
     * @param taskID 
     */
    invoke(fn: Function, param: any, taskID: TaskID){
        new Promise((resolve, reject) => {
            this.taskCenter.record(taskID)
            return fn(param)
        }).then(res => {
            this.taskCenter.del(taskID)
            return Promise.resolve(res)
        }).catch(error => {
            this.taskCenter.del(taskID)
            return Promise.reject(error)
        })
    }

    interrupt(id: TaskID | Array<TaskID> | undefined){
        return this.taskCenter.interrupt(id)
    }
}