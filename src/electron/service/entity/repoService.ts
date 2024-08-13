import { BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from "electron"
import { spawn } from "child_process"
import fsPath from "path"
import { DialogType, type RepoItem, type AbstractRepoItem } from "@/types"
import { WorkerThreadPoolMap, newWorker } from "@/electron/workers/workThread"
import RepoWatcher, { addRepoWatcher } from "@/electron/watcher/RepoWatcher"
import { isPathExist } from "../../common/utils/fileUtil"
import { IpcMainBasicService } from "./ipcMainBasicService"
import { IpcAction, IpcActionEnum } from "../decorators/ipcAction"
import { logger } from "@/electron/logger/init"
import { Task } from "../decorators/task"
import { tr } from "@/electron/app/lang/translate"
import { showErrorDialog } from "@/electron/common/utils/dialogUtil"
import { RepositoryDB } from "@/electron/database/repositoryDB"
import { WindowsManager } from "@/electron/win/windowManager"
import { getBranches, getCommitWithinBranches, getCurrentBranch, getRemote, getTags, hasGit, hasRemote, isCommited, isGitRepository, isPushed } from "lib/git"

export class RepoService extends IpcMainBasicService{
    private wtpInstance: WorkerThreadPoolMap
    private repoDB = new RepositoryDB()
    constructor(){
        super('repos')
        this.wtpInstance = WorkerThreadPoolMap.getInstance()
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    async reposExist(event: IpcMainInvokeEvent, path: string | string[]) {
        if (Array.isArray(path)){
            // 如果有多条指令需要执行就放到线程里面
            const worker = this.wtpInstance.run('repos', {name: 'isRepoExist', params: path})
            return worker
        }else{
            const exist = isPathExist(path)
            if (exist) {
                // 如果存在就检查是否为仓库
                return isGitRepository(path)
            }
            return false
        }
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    isCommited(event: IpcMainInvokeEvent, path: string) {
        const res = isCommited(path)
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    isPushed(event: IpcMainInvokeEvent, path: string) {
        const branch = this.wtpInstance.run('repos', {name: 'getRepoCommitList', path})
        return branch.then((res: string) => {
            const is = isPushed(path, res)
            return is
        })
    }

    @IpcAction(IpcActionEnum.ipcMainHandle)
    hasRemote (event: IpcMainInvokeEvent, path: string) {
        const res = hasRemote(path)
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    addWatcher(event: IpcMainInvokeEvent, repos: AbstractRepoItem) {
        const res = addRepoWatcher(repos)
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getBranches(event: IpcMainInvokeEvent, path: string){
        const res = getBranches(path)
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getRepoBranch(event: IpcMainInvokeEvent, path: string){
        const worker = this.wtpInstance.run('repos', {name: 'getRepoBranch', params: path})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getRemote(event: IpcMainInvokeEvent, path: string){
        const res = getRemote(path)
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getLog(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getLog', params})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    stopWatching(event: IpcMainInvokeEvent, repo: RepoItem) {
        const watcher = RepoWatcher.getInstance()
        watcher.removeRepo(repo)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getContributors(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getContributors', params})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getBranchCreatorInfo(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getBranchCreatorInfo', params})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getRepositoryInfo(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getRepositoryInfo', params})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getTags(event: IpcMainInvokeEvent, params: {path: string}) {
        const tags = getTags(params.path)
        return tags
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getBranchContributorsRank(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getBranchContributorsRank', params})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getContributeStat(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getContributeStat', params})
        return worker
    }

    @IpcAction(IpcActionEnum.ipcMainOn)
    openProject(event: IpcMainEvent, params: {path: string, ext: string}) {
        if(!isPathExist(params.path)){
            showErrorDialog(tr('local_repo_not_exist'), tr('error'))
            logger.error(`${tr('local_repo_not_exist')} => ${params.path}`)
            return
        }
        if(!isPathExist(params.ext)){
            showErrorDialog(tr('local_ext_not_exist'), tr('error'))
            logger.error(`${tr('local_ext_not_exist')} => ${params.ext}`)
            return
        }
        const tarDir = fsPath.dirname(params.ext)
        // 创建子进程，设置工作目录为指定路径
        const child = spawn(fsPath.basename(params.ext), [params.path], { cwd: tarDir , detached: true});

        // 监听输出
        child.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {        

        });
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getRepoFileList(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getRepoFileList', params})
        return worker
    }
    /**
     * 
     * @param event 
     * @param params
     *  path: 仓库路径
     *  fileHash: 文件的hash值 
     * @returns 
     */
    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getFileContent(event: IpcMainInvokeEvent, params: {path: string, fileHash: string}) {
        const worker = this.wtpInstance.run('repos', {name: 'getFileContent', params})
        return worker
    }
    @IpcAction(IpcActionEnum.ipcMainHandle)
    hasGit(event: IpcMainInvokeEvent) {
        return hasGit()
    }


    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getCommitFileInfo(event: IpcMainInvokeEvent, params: {path: string, hash: string}) {
        const res = this.wtpInstance.run('repos', {name: 'getCommitFileInfo', params})
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getRepoStaus(event: IpcMainInvokeEvent, repoPath: string) {
        const res = this.wtpInstance.run('repos', {name: 'getRepoStaus', params: repoPath})
        return res
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getBranchListContainCommit(event: IpcMainInvokeEvent, params: {path: string, hash: string}) {
        return getCommitWithinBranches(params.path, params.hash)
    }
    // 仓库相关的查询函数

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getAllRepos(event: IpcMainInvokeEvent, full: boolean = false) {
        const t1 = new Date()
        return this.repoDB.getAllRepository().then(async (repos: RepoItem[]) => {
            for (let i = 0; i < repos.length; i++) {
                const item = repos[i]
                if (full) {
                    if (isGitRepository(item.path)) {
                        item.curBranch = getCurrentBranch(item.path) 
                    }
                }
            }
            const t2 = new Date()
            logger.info(`getAllRepo cost time ${t2.getTime() - t1.getTime()}, is full ${full}`)
            return repos
        })
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    updateRepo(event: IpcMainInvokeEvent, repo: RepoItem) {
        return this.repoDB.updateRepository(repo)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    delRepo(event: IpcMainInvokeEvent, repoPath: string) {
        return this.repoDB.deleteRepository(repoPath)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getFileListByCommit(event: IpcMainInvokeEvent, params: {path: string, hash: string}) {
        return this.wtpInstance.run('repos', {name: 'getFileListByCommit', params})
    }

    @IpcAction(IpcActionEnum.ipcMainOn)
    updateMainWindowRepoInfo(event: IpcMainEvent, repo: RepoItem) {
        const winManager = WindowsManager.getInstance()
        this.repoDB.updateRepository(repo)
        const mainWin = winManager.getMain()
        mainWin.webContents.send('repos::update-main-window-repo-info', repo)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getCurrentBranch(event: IpcMainInvokeEvent, path: string) {
        return this.wtpInstance.run('repos', {name: 'getCurrentBranch', params: path})
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    isLocalRepoExist (event: IpcMainInvokeEvent, path: string) {
        return isPathExist(path) && isGitRepository(path)
    }

    @IpcAction(IpcActionEnum.ipcMainHandle) @Task
    getBranchCommtiCount(event: IpcMainInvokeEvent, params: {path: string, branch: string}) {
        return this.wtpInstance.run('repos', {name: 'getBranchCommtiCount', params})
    }
}