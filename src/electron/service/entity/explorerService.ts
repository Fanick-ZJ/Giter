import { BrowserWindow, dialog } from "electron"
import type { IpcMainEvent, IpcMainInvokeEvent } from "electron"
import { Base64Icon, Base64Image, DialogType, Success} from "@/types"
import { IpcMainBasicService } from "./ipcMainBasicService"
import { IpcAction, IpcActionEnum } from "../decorators/ipcAction"
import { logger } from "@/electron/logger/init"
import { Task } from "../decorators/task"
import { tr } from "@/electron/app/lang/translate"
import fs from 'fs'
import util from 'util'
import {exec} from 'child_process'
import { EventBus } from "@/electron/event/EventBus"
import { TipDialog } from "@/electron/app/tipDialog/index"
import { extractIcon } from "@/electron/common/utils/winUtil"
import { OpenWithDB } from "@/electron/database/openWithDB"

export class ExplorerService extends IpcMainBasicService{
    bus = EventBus.getInstance()
    win: BrowserWindow
    openWithDB = new OpenWithDB()
    
    constructor(win: BrowserWindow){
        super('explorer')
        this.win = win
    }
    @IpcAction(IpcActionEnum.ipcMainOn)
    open(event: IpcMainEvent, path: string) {
        logger.info('开始打开文件浏览器', path)
        fs.stat(path, (error:NodeJS.ErrnoException | null, stats: fs.Stats) => {
            if (error){
                this.bus.$emit('log::record', {title: '打开文件管理器错误', level: 'error', content: `打开文件浏览器错误，路径为：${path}`})
                const dialog = new TipDialog(this.win, DialogType.WARNING, tr('failed_to_open_explorer'), tr('error'))
                this.bus.$emit('window::addNewWindow', {window: dialog.getWindow()})
                dialog.init()
            }else {
                if (stats.isDirectory()) {
                    const platform = process.platform
                    if ( platform == 'win32'){
                        exec(`start ${path}`, (err, stdout, stderr) => {
                            if (error) {
                                this.bus.$emit('log::record', {title: '打开文件管理器错误', level: 'error', content: `打开文件浏览器错误，路径为：${path}`})
                            }
                        })
                    } else if (platform =='linux') {
                        exec(`xdg-open ${path}`, (err, stdout, stderr) => {
                            if (error) {
                                this.bus.$emit('log::record', {title: '打开文件管理器错误', level: 'error', content: `打开文件浏览器错误，路径为：${path}`})
                            }
                        })
                    }
                }
            }
        })
    }

    /**
     * 打开文件选择器
     * @param event 
     * @param title 
     * @param filter 
     * @param multiSelections 
     * @param showHiddenFiles 
     * @returns 
     */
    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    showOpenDialog(
        event: IpcMainInvokeEvent,
        params: {
            title: string,
            filters: Electron.FileFilter[],
            properties?:(   'openFile'
                            |'openDirectory'
                            | 'multiSelections'
                            | 'showHiddenFiles'
                            | 'promptToCreate'
                            | 'dontAddToRecent'
                        )[],
            buttonLabel?: string,
            defaultPath?: string
        }
        ): Promise<string[]> {
            const { title, properties, buttonLabel, defaultPath, filters} = params
            const res = dialog.showOpenDialog(this.win, {
                title: tr(title),
                properties,
                buttonLabel,
                defaultPath,
                filters
            }).then(val => {
                if (val.canceled) return Promise.resolve([])
                return Promise.resolve(val.filePaths)
            })
            return res 
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    extractIcon(event: IpcMainInvokeEvent, ext: string): Base64Icon | Success {
        const res = extractIcon(ext)
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    readImage(event: IpcMainInvokeEvent, path: string): Promise<Base64Image> {
        const readFilePromise = util.promisify(fs.readFile)
        return readFilePromise(path).then(data => {
            // 获取后缀
            const ext = path.split('.').pop()
            return `data:image/${ext};base64,`+Buffer.from(data).toString('base64')
        })
    }

    // 打开方式相关的查询函数

    @IpcAction(IpcActionEnum.ipcMainHandle)
    getAllOpenWithApps(event: IpcMainInvokeEvent) {
        return this.openWithDB.getAllApp()
    }

    @IpcAction(IpcActionEnum.ipcMainHandle)
    getOpenWithApp(event: IpcMainInvokeEvent, path: string) {
        return this.openWithDB.getApp(path)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle)
    delOpenWithApp(event: IpcMainInvokeEvent, path: string) {
        return this.openWithDB.deleteApp(path)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle)
    addOpenWithApp(event: IpcMainInvokeEvent, param: {path: string, name: string, icon: string, groups: string[]}) {
        return this.openWithDB.addApp(param.path, param.name, param.icon, param.groups)
    }

}
