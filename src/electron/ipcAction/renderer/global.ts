import { EventBus } from '@/electron/event/EventBus'
import { BrowserWindow, IpcMainEvent, ipcMain, ipcRenderer} from 'electron' 
import { logger } from "@/electron/logger/init"
// 从渲染进程到主进程出发的函数

// 这里写主线程设置的监听事件，在background.ts中调用
export const global_init_on = (win: BrowserWindow) => {
    const bus = EventBus.getInstance()
    // const windowsManager = WindowsManager.
    // 记录日志
    ipcMain.on('log::logRecord', (event: IpcMainEvent , title: string, level: string, content: string) => {
        level = level.toLowerCase()
        if (level === 'info'){
            logger.info(`${title} | ${content}`)
        } else if(level === 'warn') {
            logger.warn(`${title} | ${content}`)
        } else if(level === 'error') {
            logger.error(`${title} | ${content}`)
        }
    })
}

// 这里写渲染进程的触发事件
export const globalSender = {
    logRecoder: (title: string, 
        level: string, 
        content: string
    ) =>  ipcRenderer.send('log::logRecord', title, level, content),
}