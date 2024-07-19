/**
 * 在主进程中，为了解耦，其余文件调用IPC实现同行统一通过事件总线的方式，
 * 所以在这边对事件总线进行初始化操作，并注册事件
 */
import { BrowserWindow } from "electron"
import { repoMainSend } from "../ipcAction/main/repository"
import { EventBus } from "../event/EventBus"
import { AbstractRepoItem, RepoStatus } from "@/types"
import { logger } from "@/electron/logger/init"
import { WindowsManager } from "../win/windowManager"

/**
 *
 * @param wm 窗体管理器
 */
export const eventBusInit = (wm: WindowsManager) => {

    const bus = EventBus.getInstance()
    /**
     * respo部分事件
     */
    bus.$on('repos::render-add-repos', (window: BrowserWindow, repo: AbstractRepoItem) => {
        repoMainSend.renderAddRepo(window, repo)
    })

    bus.$on('repos::switch-repos-status', (param: {repos: AbstractRepoItem, status: RepoStatus}) => {
        const win = wm.getMain()
        if(win){
            repoMainSend.switchRepoStatus(win,param)
        }
    })
    // 新建一个窗口
    bus.$on('window::addNewWindow', (params: {window: BrowserWindow}) => {
        const { window } = params
        wm.add(window)
    })
    // 新建一个窗体并置顶
    bus.$on('window::add-new-top-window', (params: {window: BrowserWindow}) => {
        const { window } = params
        wm.setNewest(window)
    })
    // 将置顶的窗体值置顶
    bus.$on('window::set-top-window', (params: {window: BrowserWindow}) => {
        const { window } = params
        wm.setMainWindow(window, true)
    })
    // 移除窗体
    bus.$on('window::removeWindow', (params: {wid:number}) => {
        const { wid } = params
        wm.remove(wid)
    })
    // 记录日志
    bus.$on('log::logRecord', (params: {level: string, title: string, content: string}) => {
        const { level, title, content} = params
        const _level = level.toLowerCase()
        if (_level === 'info'){
            logger.info(`${title} | ${content}`)
        } else if(_level === 'warn') {
            logger.warn(`${title} | ${content}`)
        } else if(_level === 'error') {
            logger.error(`${title} | ${content}`)
        }
    })

}