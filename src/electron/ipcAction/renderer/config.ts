/**
 * 初始化dialog通讯要执行的方法
 */
import { BrowserWindow, IpcMainEvent, ipcMain, ipcRenderer } from "electron"

export const configSender ={
    setLanguage: (
        lang: string,
        taskId: string
    ) =>  ipcRenderer.invoke('config::setLanguage',  lang, taskId),
    getLanguage: (
        taskId: string
    ) => ipcRenderer.invoke('config::getLanguage', taskId),
}