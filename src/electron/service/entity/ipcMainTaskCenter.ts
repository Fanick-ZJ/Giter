import { logger } from "@/electron/logger/init";

/**
 * 这个类用来管理主进程中的任务
 */
export class IpcMainTaskCenter{
    private static instance: IpcMainTaskCenter;
    private constructor () {}
    public static getInstane(){
        if (this.instance) return this.instance
        this.instance = new IpcMainTaskCenter() 
        return this.instance
    }
    private taskTagSet = new Set<string>();

    /**
     * 记录执行函数信息
     * @param id 
     * @param func 
     * @param cancelFn 
     */
    record(id: TaskID){
        this.taskTagSet.add(id)
    }

    del(id: TaskID){
        // logger.info(`将要删除id${id}`)
        // logger.info('删除前', this.taskTagSet)
        this.taskTagSet.delete(id)
        // logger.info('删除后', this.taskTagSet)
    }

    /**
     * 对某个任务进行中断
     * @param id 
     */
    interrupt(id: TaskID | Array<TaskID> | undefined){
        if (typeof(id) == "string"){    // 清除单个
            this.del(id)
        }else if (Array.isArray(id)){   // 清除多个
            id.forEach( i => this.del(i))
        }else {                         // 全部清除
            this.taskTagSet.clear()
        }
        return true
    }

    in(id: TaskID){
        return this.taskTagSet.has(id)
    }

    clear(taskId?: string | string[]){
        if(taskId){
            if (Array.isArray(taskId)){
                taskId.forEach(id => this.del(id))
            }
            else{
                this.del(taskId)
            }
        }
    }
}