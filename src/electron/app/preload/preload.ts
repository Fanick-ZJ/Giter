import { contextBridge, ipcRenderer} from "electron";
import { globalSender} from '@/electron/ipcAction/renderer/global'   // 加载全局ipc方法，渲染进程到主进程
import {repositoryRendererOn} from '@/electron/ipcAction/main/repository'
import {reposRenderSender} from '@/electron/ipcAction/renderer/repository'
import { dialogSender } from "@/electron/ipcAction/renderer/dialog";
import { routeRendererOn } from "@/electron/ipcAction/main/route";
import { TaskRenderSender } from "@/electron/ipcAction/renderer/task";
import { explorerSender } from "@/electron/ipcAction/renderer/explorer";
import { configSender } from "@/electron/ipcAction/renderer/config";

// contextBridge.exposeInMainWorld('globalAPI', {
//     // 暴露出渲染进程写日志的接口
//     logRecoder: globalSender.logRecoder,    // 日志记录方法
// })

contextBridge.exposeInMainWorld('repoAPI', {...reposRenderSender, ...repositoryRendererOn})

// dialog相關的IPC事件
contextBridge.exposeInMainWorld('dialogAPI', dialogSender)

// 关于路由的IPC事件
contextBridge.exposeInMainWorld('routeAPI', routeRendererOn)
// 关于任务的IPC事件
contextBridge.exposeInMainWorld('taskAPI', TaskRenderSender)

// 关于浏览器的API
contextBridge.exposeInMainWorld('explorerAPI', explorerSender)

// 关于配置文件的API
contextBridge.exposeInMainWorld('configAPI', configSender)