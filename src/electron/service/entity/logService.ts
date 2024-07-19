import type { IpcMainEvent } from "electron"
import { logger } from "@/electron/logger/init"
import { IpcMainBasicService } from "./ipcMainBasicService"
import { IpcAction, IpcActionEnum } from "../decorators/ipcAction"

export class LogService extends IpcMainBasicService{
    constructor(){
        super('log')
    }

    @IpcAction(IpcActionEnum.ipcMainOn)
    logRecord(event: IpcMainEvent , title: string, level: string, content: string) {
        level = level.toLowerCase()
        if (level === 'info'){
            logger.info(`${title} | ${content}`)
        } else if(level === 'warn') {
            logger.warn(`${title} | ${content}`)
        } else if(level === 'error') {
            logger.error(`${title} | ${content}`)
        }
    }
}