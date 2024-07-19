/**
 * 初始化dialog通讯要执行的方法
 */
import { BrowserWindow, IpcMainEvent, ipcMain, ipcRenderer } from "electron"


export const dialogSender ={
    showWarnDialog: (
        title: string,
        content: string
    ) =>  ipcRenderer.send('dialog::showWarnDialog',  title, content),
    showTipDialog:(
        title: string,
        content: string
    ) => ipcRenderer.send('dialog::showTipDialog', title, content),
    closeDialog: (
        wid: number
    ) => ipcRenderer.send('dialog::closeDialog', wid)
}