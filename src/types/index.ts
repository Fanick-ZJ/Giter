import { Branch, FileDiffContext, StatDailyContribute } from "lib/git";

export type Branches = {
  current: string,
  all: string[]
}

export type CommitLogFields = {
    hash: string;
    date: number;
    message: string;
    refs: string;
    body: string;
    author_name: string;
    author_email: string;
}

export function unknown(x: never): never {
    throw new Error('unknown color');
}

export type VoidFunc = () => void

export type Path = string

export type key = string

/**
 * 抽象仓库类，有仓库的基本属性, 主进程和渲染进程都在用
 */
export interface AbstractRepoItem {
    // 路径
    path: Path,
    // 仓库名
    name: string,
    // 是否在监控中
    watchable: boolean,
    // 是否置顶
    isTop: boolean,
    // 是否隐藏
    isHidden: boolean,
    // 仓库是否存在
    isExist: boolean
}

/**
 * 仓库当前状态, 主进程渲染进程都要用
 */
export enum RepoStatus {
    // 所有工作已提交
    OK,
    // 有文件未提交
    UNCOMMIT,
    // 文件已提交未推送
    UNPUSH,
    // 未知状态
    UNKNOW
}

/**
 * 页面交互的仓库类型, 主进程渲染进程都要用
 */
export interface RepoItem extends AbstractRepoItem{
    status: RepoStatus
    curBranch: string
    // 仓库头像路径
    avatar: string
}

/**
 * Dialog窗口的类型, 主进程渲染进程都要用
 */
export enum DialogType{
    INFO,
    ERROR,
    WARNING
}

/**
 * 作者信息
 */
export interface Author {
    name: string,
    email: string
}

/**
 * 仓库基本信息
*/
export type Repository = {
    curBranch: Branch
    branchs: Branch[]
    authors: Author[]
    name: string
    remote: string
    path: Path
}
/**
 * 工作线程任务类型
 */
export interface WorkTask<T> {
    // 工作类型
    name: string,
    // 参数，传入泛型
    params: T,
    // 执行完毕的回调函数
    callback?: Function
}

/**
 * 远程地址详情项
 */
export type RemoteItem = {
    name: string,
    fetch: string,
    push: string
}

export type Branchs = {
    current: string,
    all: string[]
}

/**
 * 作者贡献日常贡献统计集合
 */

export type authorMapItme = StatDailyContribute & Record<'author', Author>
export type AuthorStatDailyContributeMap = Map<string, authorMapItme>


/**
 * 应用图标内容
 */
export type Base64Icon = string
export type Base64Image = string
/**
 * 成功
 */
export type Success = boolean

export type FileGroup = 'Project' | 'Text' | 'binary' | 'Customer' | 'All'

export type OpenWithApp = {
    name: string
    path: string
    groups: FileGroup[]
    icon?: Base64Icon
    param?: string[]
}


/**
 * 文件状态
 */
export type CommitFileStatus = 'M' | 'A' | 'D' | 'R100';

type FileStatusValue<R extends CommitFileStatus> = R extends 'R100' ? [string, string] : [string]

type _FileStatusList<T extends CommitFileStatus> = Array<[T , FileStatusValue<T>]>

export type FileStatusList = _FileStatusList<CommitFileStatus>

/**
 * 提交信息
 */
export type CommitFileInfo = {
    title: string,
    hash: string,
    diff: FileDiffContext[]
}