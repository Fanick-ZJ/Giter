// 主进程到渲染进程通信，在主进程中调用，关于项目的方法

import { AbstractRepoItem, RepoStatus } from "@/types";
import { BrowserWindow, IpcRendererEvent, ipcRenderer } from "electron";

export const repoMainSend = {
    /**
     * 添加新的项目
     * @param window 主窗体
     * @param param
     */
    renderAddRepo: (window:BrowserWindow , repo: AbstractRepoItem) => {
        window.webContents.send('repos::render-add-repo', repo)
    },

    switchRepoStatus: (window:BrowserWindow, param: {repos: AbstractRepoItem, status: RepoStatus}) => {
        window.webContents.send('repos::switch-repos-status', param)
    }
        
}
// 渲染进程接收函数
export const repositoryRendererOn = {
    renderAddRepo: (
        callback: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on('repos::render-add-repo', callback),
    switchRepoStatus: (
        callback: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on('repos::switch-repos-status', callback),
    receiveUpdateRepoInfo: (
        callback: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on('repos::update-main-window-repo-info', callback)
}
