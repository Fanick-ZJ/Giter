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
 * 分支创始信息
 */
export type BranchCreatedInfo = {
    name: string
    time: Date
    author: Author
}


/**
 * 分支
 */
export type Branch = {
    createInfo: BranchCreatedInfo   // 分支创建信息
    name: string    // 分支名字
    authors: Author[]   // 分支作者列表
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


export type RepoFileInfo = {
    name: string
    dir: string
    objectMode?: string
    objectType?: string
    objectName?: string
    objectSize?: number
    isDir: boolean
    children?: RepoFileInfo[]
}

/**
 * 贡献作者按照提交次序排名的元素
 */
export type ContributorsRankItem = {
    author: Author
    count: number
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
 * 统计每日贡献的对象，记录开始时间，结束时间，新增数量，删除数量，修改文件数量
 */
export type StatDailyContribute = {
    start: Date
    end: Date
    commitCount: number[]
    dateList: Date[]
    insertion: number[]
    deletions: number[]
    changeFiles: number[]
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
export type AuthorStatDailyContributeMap = Map<string, StatDailyContribute & Record<'author', Author> & Record<'key', string>>


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
 * 文件修改信息
 */
export type DiffFile = {
    path: string,
    fileType: string,
    changeType: CommitFileStatus,
    commitContext: string[],
    additions: number[],
    deletions: number[]
}

/**
 * 提交信息
 */
export type CommitFileInfo = {
    title: string,
    hash: string,
    diff: DiffFile[]
}