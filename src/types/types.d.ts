import {IpcRendererEvent} from "electron";
import {ContributorsRankItem, RepoItem, Repository,
        StatDailyContribute, AuthorStatDailyContributeMap, RemoteItem,
        Base64Icon, Success,
        AbstractRepoItem, CommitFileInfo, BranchStatDailyContribute,
        Remote,
        CommitLogFields} from "@/types/index.ts";
import {DefaultLogFields} from "simple-git/dist/src/lib/tasks/log";
import { BranchCreatedInfo } from "@/electron/common/utils/gitUtil";
import { RouteInfo } from "./routeParamType";
import 'reflect-metadata'
import { Callback } from "element-plus";
declare global {
    interface Window {
        globalAPI: {
            logRecoder(title: string,level: string, content: string): void
        },
        repoAPI: {
            renderAddRepo: (callback: (event: IpcRendererEvent, repo: AbstractRepoItem) => void)=> Electron.IpcRenderer,
            switchRepoStatus: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => Electron.IpcRenderer,
            receiveUpdateRepoInfo: (Callback: (event: IpcRendererEvent, repo: RepoItem) => void) => Electron.IpcRenderer
            isCommited: (path: string) => Promise<boolean>,
            addRepoWatcher: (repos: RepoItem) => Promise<any>,
            isRepoExist: (path: string | string[]) => Promise<boolean | boolean[]>,
            isPushed: (path: string) => Promise<boolean>,
            getBranches: (path: string) => Promise<string[]>,
            getRepoBranch: (path: string) => Promise<Branches>,
            getLog: (params: {path: string, branch: string}) => Promise<CommitLogFields[]>
            stopWatching: (repo: RepoItem) => Promise<any>,
            getRemote: (path: string) => Promise<Remote[]>,
            getContributors: (params: {path: string, branch: string}) => Promise<string[]>
            getBranchCreatorInfo: (params: {path: string, branch: string}) => Promise<BranchCreatedInfo>
            getBranchContributorsRank: (params: {path: string, branch: string}) => Promise<ContributorsRankItem[]>
            getRepositoryInfo: (params: {path: string}) => Promise<Repository>
            getTags: (params: {path: string}) => Promise<string[]>
            getContributeStat: (params: {path: string, branch: string}) => Promise<BranchStatDailyContribute>
            openProject: (params: {path: string, ext: string}) => Promise<void>
            getRepoFileList: (params: {path: string, branch: string}) => Promise<FileInfo[]>
            getFileContent: (params: {path: string, fileHash: string}) => Promise<string>
            hasGit: () => Promise<boolean>
            getCommitFileInfo: (params: {path: string, hash: string}) => Promise<CommitFileInfo>
            getBranchListContainCommit: (params: {path: string, hash: string}) => Promise<string[]>
            getRepoStaus: (path: String) => Promise<RepoStatus>
            getAllRepos: (full: boolean = false) => Promise<RepoItem[]>
            delRepo: (path: string) => Promise<void>
            updateRepo: (repo: RepoItem) => Promise<void>
            getFileListByCommit: (params: {path: string, hashOrBranch: string}) => Promise<FileInfo[]>
            updateMainWindowRepoInfo: (repo: RepoItem) => void
            getCurrentBranch: (path: string) => Promise<string>
            isLocalRepoExist: (path: string) => Promise<boolean>
            getBranchCommtiCount: (params: {path: string, branch: string}) => Promise<number>
        },
        dialogAPI: {
            closeDialog: (wid: number)=> void,
            showWarnDialog: (title: string, content: string) => void
            showTipDialog: (title: string, content: string) => void
        },
        routeAPI: {
            routeTo: (callback: (event: IpcRendererEvent, routeInfo: RouteInfo<any>) => void)=> Electron.IpcRenderer
        },
        taskAPI: {
            clear: (taskId: TaskID | Array<TaskID> | undefined) => boolean
        },
        explorerAPI: {
            open: (path: string) => void,
            showOpenDialog: (
                params: {
                    title: string,
                    filters: Electron.FileFilter[],
                    properties?:ExplorerProperties,
                    buttonLabel?: string,
                    defaultPath?: string
                }
            ) => Promise<string[]>,
            extractIcon: (ext: string) => Promise<Base64Icon | Success>,
            readImage: (path: string) => Promise<Base64Image>
            isPathExist: (path: string) => Promise<boolean>
            // 打开方式相关函数
            getAllOpenWithApps: () => Promise<OpenWithAppItem[]>
            delOpenWithApp: (path: string) => Promise<void>
            addOpenWithApp: (param: {path: string, name: string, icon: string, groups: string[]}) => Promise<void>
            getOpenWithApp: (path: string) => Promise<OpenWithAppItem | undefined>
        },
        configAPI: {
            setLanguage: (lang: string) => Promise<boolean>,
            getLanguage: () => Promise<string>,
        }
    }
    declare interface ImportMetaEnv{
        VITE_DB_VERSION: number
    }
    
    namespace NodeJS {
        interface   ProcessEnv {
          DB_PATH: string
          TMP_PATH: string
          LOG_PATH: string
        }
    }
}
