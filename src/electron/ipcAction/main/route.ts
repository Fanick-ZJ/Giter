// 主进程到渲染进程通信，在主进程中调用，关于路由函数

import { RouteInfo } from "@/types/routeParamType";
import { BrowserWindow, IpcRendererEvent, ipcRenderer } from "electron";
export const routeMainSend = {
    routeTo : (window:BrowserWindow , routeInfo: RouteInfo<any>) => {
        window.webContents.send('route::to', routeInfo)
    },
}

// 渲染进程接收的函数，在渲染进程中调用
export const routeRendererOn = {
    routeTo: (
        callback: (event: IpcRendererEvent, ...args: any[]) => void
    ) => {
        ipcRenderer.on('route::to', callback)
    }
}
