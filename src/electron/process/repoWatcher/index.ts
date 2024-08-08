// /**
//  * 这个文件用来监听已经加入数据库的仓库，当仓库有变通的时候，通知渲染进程改变状态显示
//  */

import { logger } from "@/electron/logger/init";
import { FSWatcher} from 'chokidar'
import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs'
import { getStatus } from "@/electron/common/utils/gitUtil";
import { RecvMsg, SendMsg } from './types';
import { AbstractRepoItem, unknown } from '@/types';
const ignoreFile = [
    '.git',
    '.git\\index.lock'
]


class WatcherItem{
    public repos: AbstractRepoItem
    public watcher?: FSWatcher
    public timeout?: NodeJS.Timeout
    public delay: number
    constructor(repos: AbstractRepoItem, delay: number){
        this.repos = repos
        this.delay = delay
    }
    public setWatcher(item: FSWatcher){
        this.watcher = item
    }
    /**
     * 对仓库文件的改变做出响应 
     * eventType 有rename, change, filename三种状态
     */ 
    private changeListener(eventType: string, fileName: string){
        if(this.isIgnore(fileName)) return
        clearTimeout(this.timeout)  // 请除前面的计时器
        this.timeout = setTimeout(() => {
            // 对文件进行监听，当文件发生变化的时候，执行检查更新
            const status = getStatus(this.repos.path)
            // 呼叫检查状态
            processSend({tag: 'change', data: {
                repos: this.repos,
                status: status
            }})
        }, this.delay) 
    }

    private isIgnore(repoPath: string){
        for (let i = 0 ; i < ignoreFile.length ; i++) {
            if (ignoreFile[i] == repoPath) return true
        }
        return false
    }
    public buildListener(){
        return this.changeListener.bind(this)
    }
 
}

class RepoWatcher {
    private watcherMap = new Map<string, WatcherItem>()
    
    addRepo(item: AbstractRepoItem){
        if (!this.watcherMap.get(item.path)) {
            this.addToWatcherMap(item)
            logger.info(`start to watch ${item.path}`)
        }
    }

    /**
     * 删除监控
     * @param path 
     */
    removeRepo(repoPath: string){
        if (this.watcherMap.get(repoPath)) {
            this.removeWatcher(repoPath)
            logger.info(`stop to watch ${repoPath}`)
        }
    }

    close() {
        this.watcherMap.forEach((item, key) => {
            this.removeWatcher(key)
        })
    }
    /**
     * 添加监视者到map中
     * @param reposItems
     */
    private addToWatcherMap(reposItem: AbstractRepoItem) {
        const item = new WatcherItem(reposItem, 1000)
        // 添加对子目录的监控
        const ignore = path.join(reposItem.path, '.gitignore')
        // 遍历仓库中的.gitignore文件
        const ignored = this.getIgnoreList(ignore)
        const watcher = chokidar.watch(reposItem.path, {
            ignored: ignored,
            persistent: true,   // 在监听任务执行期间继续执行
            ignoreInitial: true, // 忽略初始化事件监听器时的加载操作
            awaitWriteFinish: true,
            ignorePermissionErrors: true,
            atomic: true
          })
        watcher.on('all', item.buildListener())
        item.setWatcher(watcher)
        this.watcherMap.set(reposItem.path, item)
    }

    /**
     * 遍历.gitignore文件
     * @param repoPath 
     * @returns 
     */
    private getIgnoreList (repoPath: string) {
        const ignored: string[] = []
        if (fs.existsSync(repoPath)) {
            const ignoreContent = fs.readFileSync(repoPath, 'utf-8')
            const ignoreList = ignoreContent.split('\n')
            ignoreList.forEach(item => {
                if (item.trim() && !item.startsWith('#')) {
                    let ignoreItem = item.trim()
                    ignoreItem = (!ignoreItem.startsWith('/') ? '**/' : '**') + ignoreItem + (!ignoreItem.endsWith('/') ? '/**' : '**')
                    ignored.push(ignoreItem)
                }   
            })
        }
        return ignored
    }
    /**
     * 从map中删除监听者
     * @param path 
     */
    private removeWatcher(path: string){
        const watcher = this.watcherMap.get(path)?.watcher
        if(watcher){
            watcher.close().then( res => {
                this.watcherMap.delete(path)
                logger.info(`已经停止对${path}的监控`)
            }).catch(error => {
                logger.error(error)
            })
        }
    }

}

const watcher = new RepoWatcher()


process.on('message', (msg: RecvMsg) => {
    try{
        if (msg.tag === 'watch') {
            watcher.addRepo(msg.data)
            logger.info(`成功监听仓库：${msg.data.path}`)
        }
        else if (msg.tag === 'unwatch') {
            watcher.removeRepo(msg.data.path)
            logger.info(`结束监听仓库：${msg.data.path}`)
        }
        else if (msg.tag === 'close') {
            watcher.close()
            clearInterval(timer)
        }
    }catch (err) {
        logger.error(err)
    }  
})

const processSend = (data: SendMsg) => {
    if (process.send){
        process.send(data)
    }
}

const timer = setInterval(() => {}, 1000)