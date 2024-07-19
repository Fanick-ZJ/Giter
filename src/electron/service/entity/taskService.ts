import type { IpcMainEvent } from "electron"
import { logger } from "@/electron/logger/init"
import { IpcMainBasicService } from "./ipcMainBasicService"
import { IpcAction, IpcActionEnum } from "../decorators/ipcAction"

export class TaskService extends IpcMainBasicService{
    constructor(){
        super('task')
    }
    @IpcAction(IpcActionEnum.ipcMainHandle)
    clear(event: IpcMainEvent , taskId?: string | string[]) {
        logger.info('删除任务', taskId)
        this.taskCenter.clear(taskId)
    }
}