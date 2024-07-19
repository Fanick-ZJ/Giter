import { TipDialog } from "@/electron/app/tipDialog/index"
import { EventBus } from "@/electron/event/EventBus"
import { DialogType } from "@/types"
import { BrowserWindow } from "electron"

export const showErrorDialog = (content: string, title: string) => {
    const bus = EventBus.getInstance()
    // 渲染进程传入要翻译的文字，主进程进行翻译
    const curWin = BrowserWindow.getFocusedWindow() as BrowserWindow
    const dialog = new TipDialog(curWin, DialogType.WARNING, content, title)
    bus.$emit('window::addNewWindow', {window: dialog.getWindow()})
    dialog.init()
}