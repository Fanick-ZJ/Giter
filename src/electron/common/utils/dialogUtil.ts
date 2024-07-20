import { TipDialog } from "@/electron/app/tipDialog/index"
import { EventBus } from "@/electron/event/EventBus"
import { WindowsManager } from "@/electron/win/windowManager"
import { DialogType } from "@/types"
import { BrowserWindow } from "electron"

export const showErrorDialog = (content: string, title: string) => {
    const bus = EventBus.getInstance()
    // 渲染进程传入要翻译的文字，主进程进行翻译
    const curWin = BrowserWindow.getFocusedWindow() as BrowserWindow
    const dlg = new TipDialog(curWin, DialogType.WARNING, content, title)
    const wm = WindowsManager.getInstance()
    wm.add(dlg.getWindow())
    dlg.init()
}