import { RepoStatus } from "@/types";
import type {AbstractRepoItem, Branchs, RepoItem} from '@/types'
import { useRepoStore } from "@/renderer/store/modules/repository";
import { toRaw } from "vue";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";
import ErrorDialog from "../decorators/errorDialog";
import { getCurrentBranch } from 'lib/git';
export class RepoTaskService extends IpcRendererBasicTaskService{
    repoStore = useRepoStore()
    /**
     * 获取所有仓库
     */
    @ErrorDialog
    storeGetAllRepos() {
        console.log('开始获取仓库列表')
        this.invoke(window.repoAPI.getAllRepos, false).then(repos => {
            this.repoStore.set(repos)
        })
    }

    @ErrorDialog
    getAllRepos() {
        console.log('开始获取仓库列表')
        return this.invoke(window.repoAPI.getAllRepos)
    }

    

    /**
     * 添加仓库监听器
     * @param item 
     */
    @ErrorDialog
    addRepoWatcher(item: RepoItem){
        const invokeRet = this.invoke(window.repoAPI.addRepoWatcher, toRaw(item))
        return invokeRet
    }

    repoExist(repo: RepoItem) {
        const invokeRet = this.invoke(window.repoAPI.isRepoExist, repo.path)
    }

    @ErrorDialog
    removeRepoWatcher(item: RepoItem){
        const invokeRet = this.invoke(window.repoAPI.stopWatching, toRaw(item))
        return invokeRet
    }

    /**
     * 根据路径获取仓库对象
     * @param name 
     * @returns 
     */
    @ErrorDialog
    getRemote(path: string) {
        return this.invoke(window.repoAPI.getRemote, path)
    }
    /**
     * 获取提交日志
     * @param path 
     * @param branch 
     * @returns 
     */
    @ErrorDialog
    getLog(path: string, branch: string){
        const invokeRet = this.invoke(window.repoAPI.getLog, {path, branch})
        return invokeRet
    }
    /**
     * 获取仓库分支
     * @param path 
     * @returns 
     */
    @ErrorDialog
    getBrancheses(path: string){
        const invokeRet = this.invoke(window.repoAPI.getBrancheses, path)
        return invokeRet
    }
    /**
     * 获取仓库分支
     * @param path 
     * @returns 
     */
    @ErrorDialog
    getRepoBranch(path: string){
        const invokeRet = this.invoke(window.repoAPI.getRepoBranch, path)
        return invokeRet
    }
    /**
     * 执行删除操作
     * @param repos 
     * @returns 
     */
    @ErrorDialog
    delRepo(repo: AbstractRepoItem){
        console.log('执行删除操作')
        const invokeRet = this.invoke(window.repoAPI.delRepo, repo.path)
        return invokeRet
    }
    /**
     * 获取仓库贡献者
     * @param path 
     * @param branch 
     */
    @ErrorDialog
    getContributors (path:string , branch: string) {
        console.log('执行获取贡献者操作')
        const param = {path: path, branch}
        const invokeRet = this.invoke(window.repoAPI.getContributors, param)
        return invokeRet
    }
    /**
     * 获取仓库贡献者
     * @param path 
     * @param branch 
     */
    @ErrorDialog
    getBranchCreatorInfo (path:string , branch: string) {
        console.log('执行获取贡献者操作')
        const param = {path: path, branch}
        const invokeRet = this.invoke(window.repoAPI.getBranchCreatorInfo, param)
        return invokeRet
    }
    /**
     * 获取仓库基本信息
     * @param path 
     * @param branch 
     */
    @ErrorDialog
    getRepositoryInfo (path:string ) {
        console.log('执行获取贡献者操作')
        const param = {path}
        const invokeRet = this.invoke(window.repoAPI.getRepositoryInfo, param)
        return invokeRet
    }
    /**
     * 获取所有标签
     * @param path 
     * @returns 
     */
    @ErrorDialog
    getTags (path: string) {
        console.log('执行获取标签操作')
        const param = {path}
        const invokeRet = this.invoke(window.repoAPI.getTags, param)
        return invokeRet
    }
    /**
     * 获取贡献者，按照提交次数排名
     * @param path 
     * @param branch 
     * @returns 
     */
    @ErrorDialog
    getBranchContributorsRank (path: string, branch: string) {
        console.log('执行获取当前分支贡献者排名')
        const param = {path, branch}
        const invokeRet = this.invoke(window.repoAPI.getBranchContributorsRank, param)
        return invokeRet
    }
    /**
     * 获取贡献次数统计
     * @param path 
     * @param branch 
     * @returns 
     */
    @ErrorDialog
    getContributeStat (path: string, branch: string) {
        console.log('执行获取当前分支贡献数据')
        const param = {path, branch}
        const invokeRet = this.invoke(window.repoAPI.getContributeStat, param)
        return invokeRet
    }
    
    /**
     * 判断当前路径下的仓库是否已经提交
     * @param path 仓库路径
     * @param obj ref依赖
     */

    @ErrorDialog
    isCommitedFn (repos: RepoItem) {
        return this.invoke(window.repoAPI.isCommited, repos.path).then( (res: boolean) => {
            if (!res) this.repoStore.switchRepoStatus(repos, RepoStatus.UNCOMMIT)
            return Promise.resolve()
        })
    }

    @ErrorDialog
    isPushedFn (repos: RepoItem) {
        return this.invoke(window.repoAPI.isPushed, repos.path).then((res: boolean) => {
            if (!res) this.repoStore.switchRepoStatus(repos, RepoStatus.UNPUSH)
            return Promise.resolve()
        })
    }

    @ErrorDialog
    openProject (path: string, ext: string) {
        return this.invoke(window.repoAPI.openProject, {path, ext})
    }

    @ErrorDialog
    getReposFileList(path: string, branch: string) {
        const invokeRet = this.invoke(window.repoAPI.getRepoFileList, {path, branch})
        return invokeRet
    }

    @ErrorDialog
    getFileContent(path: string, fileHash: string) {
        const invokeRet = this.invoke(window.repoAPI.getFileContent, {path, fileHash})
        return invokeRet
    }

    @ErrorDialog
    getCommitFileInfo(path: string, commitHash: string) {
        const invokeRet = this.invoke(window.repoAPI.getCommitFileInfo, {path, hash: commitHash})
        return invokeRet
    }

    @ErrorDialog
    getBranchListContainCommit(path: string, commitHash: string) {
        const invokeRet = this.invoke(window.repoAPI.getBranchListContainCommit, {path, hash: commitHash})
        return invokeRet
    }

    @ErrorDialog
    updateRepo(repos: RepoItem) {
        return this.invoke(window.repoAPI.updateRepo, repos)
    }

    @ErrorDialog
    getFileListByCommit(hashOrBranch: string, repoPath: string) {
        return this.invoke(window.repoAPI.getFileListByCommit, {hashOrBranch, path: repoPath})
    }

    updateMainWindowRepoInfo(repo: RepoItem) {
        window.repoAPI.updateMainWindowRepoInfo(repo)
    }
    @ErrorDialog
    checkRepoStatus(repo: RepoItem) {
        return this.invoke(window.repoAPI.getRepoStaus, repo.path).then(res => {
            this.repoStore.switchRepoStatus(repo, res)
        })
    }
    @ErrorDialog
    getCurrentBranch(path: string) {
        return this.invoke(window.repoAPI.getCurrentBranch, path)
    }
    @ErrorDialog
    isLocalRepoExist(path: string) {
        return this.invoke(window.repoAPI.isLocalRepoExist, path)
    }

    @ErrorDialog
    getBranchCommtiCount(path: string, branch: string) {
        return this.invoke(window.repoAPI.getBranchCommtiCount, {path, branch})
    }
}