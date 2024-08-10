// 渲染进程到主进程的通信，关于仓库的方法
import { RepoItem } from "@/types"
import { ipcRenderer } from "electron"


// 渲染线程可以进行请求的方法
export const reposRenderSender = {
    isRepoExist: ( // 检查系统中的仓库是否还存在
        path: string | string[],
        taskId: string
    ) => ipcRenderer.invoke('repos::reposExist', path, taskId),
    isCommited: ( // 检查仓库是否已经提交
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::isCommited', path, taskId),
    isPushed: (   // 检查仓库是否已经推送
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::isPushed', path, taskId),
    hasRemote: (   // 检查仓库是由原远程仓库
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::hasRemote', path, taskId),
    addRepoWatcher: (  // 给仓库添加监听
        repos: RepoItem,
        taskId: string
    ) => ipcRenderer.invoke('repos::addWatcher', repos, taskId),
    getBrancheses: (  // 获取分支
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::getBrancheses', path, taskId),
    getRepoBranch: (  // 获取分支
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::getRepoBranch', path, taskId),
    getLog: (   // 根据分支获取日志
        params: {
            path: string,
            branch: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getLog', params, taskId),
    stopWatching: ( // 停止监听某个仓库
        repo: RepoItem,
        taskId: string
    ) => ipcRenderer.invoke('repos::stopWatching', repo, taskId),
    getContributors: (  // 获取贡献者
        params: {
            path: string,
            branch: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getContributors', params, taskId),
    getBranchCreatorInfo: ( // 获取分支创建者和时间
        params: {
            path: string,
            branch: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getBranchCreatorInfo', params, taskId),
    getRepositoryInfo: ( // 获取仓库基本信息
        params: {
            path: string,
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getRepositoryInfo', params, taskId),
    getRemote: ( // 获取远程仓库地址信息
        params: {
            path: string,
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getRemote', params, taskId),
    getTags: ( // 获取仓库基本信息
        params: {
            path: string,
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getTags', params, taskId),
    getContributorsRank: ( // 获取分支创建者和时间
        params: {
            path: string,
            branch: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getContributorsRank', params, taskId),
    getContributeStat: ( // 获取分支创建者和时间
        params: {
            path: string,
            branch: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getContributeStat', params, taskId),
    openProject: (
        params: {
            path: string,
            ext: string
        },
        taskId: string
    ) => ipcRenderer.send('repos::openProject', params, taskId),
    getRepoFileList: ( // 获取分支创建者和时间
        params: {
            path: string,
            branch: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getRepoFileList', params, taskId),
    getFileContent: ( // 获取指定hash文件的内容
        params: {
            path: string,
            fileHash: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getFileContent', params, taskId),
    hasGit: () => ipcRenderer.invoke('repos::hasGit'),  // 检查是否安装了git
    getCommitFileInfo: (
        params: {
            path: string,
            hash: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getCommitFileInfo', params, taskId),
    getBranchListContainCommit: (
        params: {
            path: string,
            hash: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getBranchListContainCommit', params, taskId),
    // 关于仓库相关的
    getAllRepos: (taskId: string) => ipcRenderer.invoke('repos::getAllRepos', taskId),
    updateRepo: (repo: RepoItem, taskId: string) => ipcRenderer.invoke('repos::updateRepo', repo, taskId),
    delRepo: (        
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::delRepo', path, taskId),
    getFileListByCommit: (
        params: {
            hashOrBranch: string,
            path: string
        },
        taskId: string
    ) => ipcRenderer.invoke('repos::getFileListByCommit', params, taskId),

    updateMainWindowRepoInfo: (
        repo: RepoItem
    ) => ipcRenderer.send('repos::updateMainWindowRepoInfo', repo),
    getRepoStaus: (
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('repos::getRepoStaus', path, taskId),
}