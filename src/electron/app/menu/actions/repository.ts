import {BrowserWindow, dialog, ipcMain} from 'electron'
import {tr} from '@/electron/app/lang/translate'
import {basename} from 'path'
import { EventBus } from '@/electron/event/EventBus'
import { logger } from "@/electron/logger/init"
import path from 'node:path'
import fs from 'fs'
import fsPromise from "fs/promises"
import { RepositoryDB } from '@/electron/database/repositoryDB'
import RepoWatcherProcess from '@/electron/watcher/RepoWatcher'
import { repoMainSend } from "@/electron/ipcAction/main/repository"
import { isGitRepository, getCurrentBranch } from 'lib/git'


export const importRespo = (window: BrowserWindow) => {
    const repoDB = new RepositoryDB()
    // 初始化事件总线
    const bus = EventBus.getInstance()
    // 打开dialog选择获取地址
    let path = dialog.showOpenDialogSync(
        window, 
        { 
            properties: ['openDirectory'],
            title: tr('add_respo'),
        }
    )
    if (typeof path === 'undefined'){
        return
    }
    // 校验是否为git项目
    const _path = path[0]
    const name = basename(_path)
    const isRepo = isGitRepository(_path)
    if(isRepo){
        repoDB.addRepository(_path, true)
        const repo = {
            path: _path,
            name,
            watchable: true,
            isTop: false,
            isHidden: false,
            isExist: true,
            currentBranch: getCurrentBranch(_path),
        }
        const watcher = RepoWatcherProcess.getInstance()
        watcher.addRepo(repo)
        repoMainSend.renderAddRepo(window, repo)
    }else{
        ipcMain.emit('dialog::showWarnDialog', null, 'warn', 'dialog.isNotARepo')
    }
}

export const addMoreRepos = (window: BrowserWindow) => {
    const repoDB = new RepositoryDB()
    // 初始化事件总线
    const bus = EventBus.getInstance()
    // 打开dialog选择获取地址
    const target = dialog.showOpenDialogSync(
        window,
        {
            properties: ['openDirectory'],
            title: tr('add_respo'),
        }
    )
    if (typeof target === 'undefined')return
    // 遍历文件夹
    const subPathsPromise = fsPromise.readdir(target[0], {recursive: false})
    subPathsPromise.then( async res => {
        for (let f of res) {
            f = path.join(target[0], f)
            const f_stat = fs.statSync(f)
            if (f_stat.isDirectory()) {
                const isRepo = isGitRepository(f)
                if(isRepo){
                    repoDB.addRepository(f, true)
                    const repo = {
                        path: f,
                        name: basename(f),
                        watchable: true,
                        isTop: false,
                        isHidden: false,
                        isExist: true
                    }
                    const watcher = RepoWatcherProcess.getInstance()
                    watcher.addRepo(repo)
                    repoMainSend.renderAddRepo(window, repo)
                }else{
                    ipcMain.emit('dialog::showWarnDialog', null, 'warn', 'dialog.isNotARepo')
                }
            }
        }
    })
}