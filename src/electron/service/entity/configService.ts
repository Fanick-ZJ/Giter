import type { IpcMainEvent } from "electron"
import { logger } from "@/electron/logger/init"
import { IpcMainBasicService } from "./ipcMainBasicService"
import { IpcAction, IpcActionEnum } from "../decorators/ipcAction"
import { ConfigDB } from "@/electron/database/configDB"
import { Task } from "../decorators/task"

export class ConfigService extends IpcMainBasicService{
    db = new ConfigDB()
    constructor(){
        super('config')
    }
    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    setLanguage(event: IpcMainEvent, lang: string) {
        return this.db.setLanguage(lang)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getLanguage(event: IpcMainEvent) {
        return this.db.getLanguage()
    }
}