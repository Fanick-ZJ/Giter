import {IpcRendererEvent} from "electron";
import {ContributorsRankItem, RepoItem, Repository,
        StatDailyContribute, AuthorStatDailyContributeMap, RemoteItem,
        Base64Icon, Success,
        AbstractRepoItem, CommitFileInfo} from "@/types/index.ts";
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
            isCommited: (path: string) => Promise<any>,
            addRepoWatcher: (repos: RepoItem) => Promise<any>,
            isRepoExist: (path: string | string[]) => Promise<boolean | boolean[]>,
            isPushed: (path: string) => Promise<any>,
            getAllBranches: (path: string) => Promise<any>,
            getRepoBranch: (path: string) => Promise<Branchs>,
            getLog: (params: {path: string, branch: string}) => Promise<DefaultLogFields[]>
            stopWatching: (repo: RepoItem) => Promise<any>,
            getRemote: (path: string) => Promise<RemoteItem[]>,
            getContributors: (params: {path: string, branch: string}) => Promise<string[]>
            getBranchCreatorInfo: (params: {path: string, branch: string}) => Promise<BranchCreatedInfo>
            getContributorsRank: (params: {path: string, branch: string}) => Promise<ContributorsRankItem[]>
            getRepositoryInfo: (params: {path: string}) => Promise<Repository>
            getTags: (params: {path: string}) => Promise<string[]>
            getContributeStat: (params: {path: string, branch: string}) => Promise<StatDailyContribute & Record<'authorMap', AuthorStatDailyContributeMap>>
            openProject: (params: {path: string, ext: string}) => Promise<void>
            getRepoFileList: (params: {path: string, branch: string}) => Promise<FileInfo[]>
            getFileContent: (params: {path: string, fileHash: string}) => Promise<string>
            hasGit: () => Promise<boolean>
            getCommitFileInfo: (params: {path: string, hash: string}) => Promise<CommitFileInfo>
            getBranchListContainCommit: (params: {path: string, hash: string}) => Promise<string[]>
            // 仓库相关函数
            getAllRepos: () => Promise<RepoItem[]>
            delRepo: (path: string) => Promise<void>
            updateRepo: (repo: RepoItem) => Promise<void>
            getFileListByHash: (params: {path: string, hashOrBranch: string}) => Promise<FileInfo[]>
            updateMainWindowRepoInfo: (repo: RepoItem) => void
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
            extractIcon: (ext: string) => Prmise<Base64Icon | Success>,
            readImage: (path: string) => Promise<Base64Image>
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
