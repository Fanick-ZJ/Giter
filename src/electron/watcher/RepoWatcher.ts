import { AbstractRepoItem } from '@/types'
import path from 'path'
import { fork, ChildProcess } from 'child_process'
import { SendMsg } from '../process/repoWatcher/types'
import { logger } from "@/electron/logger/init"
import { WindowsManager } from "../win/windowManager"
import { repoMainSend } from "../ipcAction/main/repository"
import RepoWatcher from '@/electron/watcher/RepoWatcher';
import { tr } from '../app/lang/translate'
import { RepositoryError } from '@/types/errorType'


/**
 * 添加一个仓库监听器，监听仓库状态的变化
 * @param repos
 * @returns 
 */
export const addRepoWatcher = (repos: AbstractRepoItem): Promise<boolean> => {
    try{
        // logger.info('添加',repos.name,'监视')
        const watcher = RepoWatcher.getInstance()
        watcher.addRepo(repos)
        return Promise.resolve(true)
    }catch(e){
        throw new RepositoryError(repos.path, "", tr('add_watcher_failed'))
    }
}

export default class RepoWatcherProcess {

    private static instance: RepoWatcherProcess
    private _process: ChildProcess
    private mainWin = WindowsManager.getInstance().getMain()

    private constructor(){
        this._process = fork(path.join(__dirname, 'process', 'repoWatcher','index.js'), {silent: true, env: process.env})
        this._process.on('message', (msg: SendMsg) => {
            if (msg.tag === 'change') {
                if (this.mainWin) {
                    repoMainSend.switchRepoStatus(this.mainWin, {repos: msg.data.repos, status: msg.data.status})
                }
            }
            else if (msg.tag === 'unwatched') {
                logger.info(`stop to watch ${msg.data.repos.path}`)
            }
            else if (msg.tag === 'watched') {
                logger.info(`start to watch ${msg.data.repos.path}`)
            }
            else if (msg.tag === 'error') {
                logger.error(msg.data)
            }
        })
        this._process.on('error', (err) => {
            logger.error(err)
        })
        this._process.on('exit', (code, signal) => {
            logger.error(`repoWatcherProcess exit with code: ${code} and signal: ${signal}`)
        })
    }

    public static getInstance(){
        if (!this.instance){
            this.instance = new RepoWatcherProcess()
        }
        return this.instance
    }
    
    addRepo(repos: AbstractRepoItem) {
        this._process.send({
            tag: 'watch',
            data: repos
        })
    }

    removeRepo(repos: AbstractRepoItem) {
        this._process.send({
            tag: 'unwatch',
            data: repos
        })
    }

}