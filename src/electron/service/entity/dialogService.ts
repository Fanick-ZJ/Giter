import { TipDialog } from "@/electron/app/tipDialog/index"
import { EventBus } from "@/electron/event/EventBus"
import { tr } from "@/electron/app/lang/translate"
import { DialogType } from "@/types"
import type { BrowserWindow as TBrowserWindow, IpcMainEvent } from "electron"
import  {BrowserWindow }  from "electron"
import { IpcMainBasicService } from "./ipcMainBasicService"
import { IpcAction, IpcActionEnum } from "../decorators/ipcAction"
import { logger } from "@/electron/logger/init"
import { WindowsManager } from "@/electron/win/windowManager"

export class DialogService extends IpcMainBasicService{
    win: TBrowserWindow
    wm = WindowsManager.getInstance()
    constructor(win: TBrowserWindow){
        super('dialog')
        this.win = win
    }

    @IpcAction(IpcActionEnum.ipcMainOn)
    closeDialog(event: IpcMainEvent, wid: number) {
        const bus = EventBus.getInstance()
        this.wm.remove(wid)
    }

    @IpcAction(IpcActionEnum.ipcMainOn)
    showWarnDialog(event: IpcMainEvent, title: string, content: string) {
        const bus = EventBus.getInstance()
        // 渲染进程传入要翻译的文字，主进程进行翻译
        const curWin = BrowserWindow.getFocusedWindow() as TBrowserWindow
        const dlg = new TipDialog(curWin, DialogType.WARNING, content, tr(title))
        this.wm.add(dlg.getWindow())
        dlg.init()
    }

    @IpcAction(IpcActionEnum.ipcMainOn)
    showErrorDialog(event: IpcMainEvent, title: string, content: string) {
        const bus = EventBus.getInstance()
        // 渲染进程传入要翻译的文字，主进程进行翻译
        const curWin = BrowserWindow.getFocusedWindow() as TBrowserWindow
        const dlg = new TipDialog(curWin, DialogType.ERROR, content, tr(title))
        this.wm.add(dlg.getWindow())
        dlg.init()
    }
}