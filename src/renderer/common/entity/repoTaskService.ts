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
        this.enqueue(window.repoAPI.getAllRepos, false).then(async (repos) => {
            this.repoStore.set(await repos)
        })
    }

    @ErrorDialog
    async getAllRepos() {
        console.log('开始获取仓库列表')
        return await this.enqueue(window.repoAPI.getAllRepos)
    }

    

    /**
     * 添加仓库监听器
     * @param item 
     */
    @ErrorDialog
    async addRepoWatcher(item: RepoItem){
        const invokeRet = await this.enqueue(window.repoAPI.addRepoWatcher, toRaw(item))
        return invokeRet
    }

    @ErrorDialog
    async repoExist(repo: RepoItem) {
        const invokeRet = await this.enqueue(window.repoAPI.isRepoExist, repo.path)

    }

    @ErrorDialog
    async removeRepoWatcher(item: RepoItem){
        const invokeRet = await this.enqueue(window.repoAPI.stopWatching, toRaw(item))
        return invokeRet
    }

    /**
     * 根据路径获取仓库对象
     * @param name 
     * @returns 
     */
    @ErrorDialog
    async getRemote(path: string) {
        return this.enqueue(window.repoAPI.getRemote, path)
    }
    /**
     * 获取提交日志
     * @param path 
     * @param branch 
     * @returns 
     */
    @ErrorDialog
    async getLog(path: string, branch: string){
        const invokeRet = this.enqueue(window.repoAPI.getLog, {path, branch})
        return invokeRet
    }
    /**
     * 获取仓库分支
     * @param path 
     * @returns 
     */
    @ErrorDialog
    async getBrancheses(path: string){
        const invokeRet = this.enqueue(window.repoAPI.getBrancheses, path)
        return invokeRet
    }
    /**
     * 获取仓库分支
     * @param path 
     * @returns 
     */
    @ErrorDialog
    async getRepoBranch(path: string){
        const invokeRet = this.enqueue(window.repoAPI.getRepoBranch, path)
        return invokeRet
    }
    /**
     * 执行删除操作
     * @param repos 
     * @returns 
     */
    @ErrorDialog
    async delRepo(repo: AbstractRepoItem){
        console.log('执行删除操作')
        const invokeRet = this.enqueue(window.repoAPI.delRepo, repo.path)
        return invokeRet
    }
    /**
     * 获取仓库贡献者
     * @param path 
     * @param branch 
     */
    @ErrorDialog
    async getContributors (path:string , branch: string) {
        console.log('执行获取贡献者操作')
        const param = {path: path, branch}
        const invokeRet = this.enqueue(window.repoAPI.getContributors, param)
        return invokeRet
    }
    /**
     * 获取仓库贡献者
     * @param path 
     * @param branch 
     */
    @ErrorDialog
    async getBranchCreatorInfo (path:string , branch: string) {
        console.log('执行获取贡献者操作')
        const param = {path: path, branch}
        const invokeRet = this.enqueue(window.repoAPI.getBranchCreatorInfo, param)
        return invokeRet
    }
    /**
     * 获取仓库基本信息
     * @param path 
     * @param branch 
     */
    @ErrorDialog
    async getRepositoryInfo (path:string ) {
        console.log('执行获取贡献者操作')
        const param = {path}
        const invokeRet = this.enqueue(window.repoAPI.getRepositoryInfo, param)
        return invokeRet
    }
    /**
     * 获取所有标签
     * @param path 
     * @returns 
     */
    @ErrorDialog
    async getTags (path: string) {
        console.log('执行获取标签操作')
        const param = {path}
        const invokeRet = this.enqueue(window.repoAPI.getTags, param)
        return invokeRet
    }
    /**
     * 获取贡献者，按照提交次数排名
     * @param path 
     * @param branch 
     * @returns 
     */
    @ErrorDialog
    async getBranchContributorsRank (path: string, branch: string) {
        console.log('执行获取当前分支贡献者排名')
        const param = {path, branch}
        const invokeRet = this.enqueue(window.repoAPI.getBranchContributorsRank, param)
        return invokeRet
    }
    /**
     * 获取贡献次数统计
     * @param path 
     * @param branch 
     * @returns 
     */
    @ErrorDialog
    async getContributeStat (path: string, branch: string) {
        console.log('执行获取当前分支贡献数据')
        const param = {path, branch}
        const invokeRet = this.enqueue(window.repoAPI.getContributeStat, param)
        return invokeRet
    }
    
    /**
     * 判断当前路径下的仓库是否已经提交
     * @param path 仓库路径
     * @param obj ref依赖
     */

    @ErrorDialog
    async isCommitedFn (repos: RepoItem) {
        return this.enqueue(window.repoAPI.isCommited, repos.path).then( async (res: Promise<boolean>) => {
            if (!await res) this.repoStore.switchRepoStatus(repos, RepoStatus.UNCOMMIT)
            return Promise.resolve()
        })
    }

    @ErrorDialog
    async isPushedFn (repos: RepoItem) {
        return this.enqueue(window.repoAPI.isPushed, repos.path).then(async (res: Promise<boolean>) => {
            if (!await res) this.repoStore.switchRepoStatus(repos, RepoStatus.UNPUSH)
            return Promise.resolve()
        })
    }

    @ErrorDialog
    async openProject (path: string, ext: string) {
        return this.enqueue(window.repoAPI.openProject, {path, ext})
    }

    @ErrorDialog
    async getReposFileList(path: string, branch: string) {
        const invokeRet = this.enqueue(window.repoAPI.getRepoFileList, {path, branch})
        return invokeRet
    }

    @ErrorDialog
    async getFileContent(path: string, fileHash: string) {
        const invokeRet = this.enqueue(window.repoAPI.getFileContent, {path, fileHash})
        return invokeRet
    }

    @ErrorDialog
    async getCommitFileInfo(path: string, commitHash: string) {
        const invokeRet = this.enqueue(window.repoAPI.getCommitFileInfo, {path, hash: commitHash})
        return invokeRet
    }

    @ErrorDialog
    async getBranchListContainCommit(path: string, commitHash: string) {
        const invokeRet = this.enqueue(window.repoAPI.getBranchListContainCommit, {path, hash: commitHash})
        return invokeRet
    }

    @ErrorDialog
    async updateRepo(repos: RepoItem) {
        return this.enqueue(window.repoAPI.updateRepo, repos)
    }

    @ErrorDialog
    async getFileListByCommit(hashOrBranch: string, repoPath: string) {
        return this.enqueue(window.repoAPI.getFileListByCommit, {hashOrBranch, path: repoPath})
    }

    updateMainWindowRepoInfo(repo: RepoItem) {
        window.repoAPI.updateMainWindowRepoInfo(repo)
    }
    @ErrorDialog
    async checkRepoStatus(repo: RepoItem) {
        return this.enqueue(window.repoAPI.getRepoStaus, repo.path).then(async (res) => {
            this.repoStore.switchRepoStatus(repo, await res)
        })
    }
    @ErrorDialog
    async getCurrentBranch(path: string) {
        return this.enqueue(window.repoAPI.getCurrentBranch, path)
    }
    @ErrorDialog
    async isLocalRepoExist(path: string) {
        return this.enqueue(window.repoAPI.isLocalRepoExist, path)
    }

    @ErrorDialog
    async getBranchCommtiCount(path: string, branch: string) {
        return this.enqueue(window.repoAPI.getBranchCommtiCount, {path, branch})
    }
}