/**
 * git工具类, 要在工作者线程中使用，不能出现、间接引用electron中的对象
 */

import {CheckRepoActions, simpleGit, StatusResult, DefaultLogFields, SimpleGitOptions, LogOptions} from 'simple-git'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process';
import {tr} from '@/electron/app/lang/translate'
import { Author, RepoStatus, BranchCreatedInfo, Branch, Repository, ContributorsRankItem, StatDailyContribute, AuthorStatDailyContributeMap, RemoteItem, Branchs, RepoFileInfo, FileStatusList, CommitFileStatus, CommitFileInfo, DiffFile} from '@/types'
import { logger } from "@/electron/logger/init"
import { Optional } from '../types'
import { RepositoryError } from '@/types/errorType'
import { uuid } from '@/renderer/common/util/tools'
import { execOutputStr } from './command';
import { inferFileTypeFromName } from './fileUtil';

const INTERVAL = '<INTERVAL>'
const NO_NEW_LINE_TIP = '\\ No newline at end of file'
const CHANGE_LINE_INFO_REG = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@/g
/**
 * 日志输出参数可选项
 */
enum formatOption {
    _H = '%H',      // 提交的hash值（全文）
    _h = '%h',      // 提交的hash值
    _T = '%T',      // 树hash
    _p = '%p',      // 父节点hash，可能有两个，因为冲突
    _P = '%P',      // 父节点hash全文
    _an = '%an',    // 作者名字
    _ae = '%ae',    // 作者邮箱
    _ad = '%ad',    // 作者提交时间，由--date=format格式确定，有默认值
    _aD = '%aD',    // 提交时间，RFC2822格式
    _ar = '%ar',    // 提交相对时间，几天前
    _at = '%at',    // 提交时间的时间戳
    _ai = '%ai',    // ISO8601格式时间
    _aI = '%aI',    // 严格的ISO8601格式时间
    _s = '%s'       // 提交信息的全文
}

/**
 * 日志输出参数可配置内容
 */
interface logOption {
    formatOption: Array<formatOption>
    dateFormat: string
    filter: boolean
    filterFunc: (item: string[], index: number, arr: string[][]) =>boolean;
}

/**
 * 配置可筛选的属性
 */
type logOptional = Optional<logOption, 'dateFormat' | 'filter' | 'filterFunc'>

/**
 * 自定义日志输出内容， 输出顺序按照`options`中的`formatOption`属性决定，例如
 * ```bash
 * git log origin/master --pretty=format:"%an %ad %s" --date=format:"%Y-%m-%S"
 * ```
 * 以上表示在其中就是`options.formatOption[formatOption._an, formatOption._ad, formatOption._s]`
 * 其输出的格式为
 * ```bash
 *  elviss 2023-10-57 修复了标签页关闭按钮错误
    765 PRODUCER 2023-10-39 fix
    shenshihai 2023-10-06 fix
    shenshihai 2023-10-32 fix
    elviss 2023-10-50 Merge branch 'develop' of http://192.168.0.202:3000/lysis3/wizvision3 into develop
    elviss 2023-10-39 fix
    elviss 2023-10-49 fix
    765 PRODUCER 2023-10-23 fix
    elviss 2023-10-11 Merge branch 'develop' of http://192.168.0.202:3000/lysis3/wizvision3 into develop
    elviss 2023-10-00 fix
    765 PRODUCER 2023-10-17 fix
    765 PRODUCER 2023-10-16 fix
    765 PRODUCER 2023-10-37 fix
    elviss 2023-10-49 Merge branch 'develop' of http://192.168.0.202:3000/lysis3/wizvision3 into develop
 * ```
 * @param path 仓库路径
 * @param branch 仓库分支名
 * @param options 可选项
 * @returns 
 */
function getCustomerLogFormat(path: string, branch: string, options?: logOptional){
    let format = ''
    let dateFormat = ''
    let resArr: string[][] = []
    if (options){   // 如果有format的话
        format = `--pretty=format:"${options!.formatOption.join(INTERVAL)}"`
        if (options.dateFormat){    // 如果有时间输出格式化的话
            dateFormat = `--date=format:"${options.dateFormat}"`
        }
    }
    let cmd = `git log ${branch} ${format} ${dateFormat}`
    try{
        const output = execSync(cmd, {cwd: path, encoding: 'utf-8'})
        const arr = output.trim().split('\n')
        arr.forEach( item => {
            resArr.push(item.split(INTERVAL))
        })
        if (options && options.filter && options.filterFunc) {
            // 开始遍历确定筛选位移函数
            const paramLength = options.filterFunc.length
            const filterFunc = options.filterFunc
            return resArr.filter((item, index, arr) => filterFunc(item, index, arr))
        }
        return resArr
    }catch(error){
        logger.error(error)
        return []
    }
}

export const isGitRepo = ( path: string) => {
    fs.statSync(path)
    const repos = simpleGit(path)
    // 只选择根目录进行判断是不是仓库
    return repos.checkIsRepo(CheckRepoActions.IS_REPO_ROOT).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, "", tr('isNotARepo'))
    })
}

/**
 * 仓库是否已提交
 * @param path 
 */
export const isCommited = (path: string): Promise<boolean> => {
    try{
        fs.statSync(path)
        const repos = simpleGit(path)
        // 只选择根目录进行判断是不是仓库
        return repos.status([path]).then((res: StatusResult) =>{
            // 通过记录状态中不同文件的数量来确定是否已经执行commit
            const changedCount = res.not_added.length + 
            res.conflicted.length + 
            res.created.length + 
            res.deleted.length +
            res.modified.length + 
            res.renamed.length
            return new Promise((resolve, reject) => {
                resolve(changedCount == 0)
            })
        })
    }catch(e){
        throw new RepositoryError(path, "", tr('check_is_repo_error'))
    }
}

const getBranchInRemote = (path: string, branch: string): Promise<string> => {
    fs.statSync(path)
    const repos = simpleGit(path)
    return repos.raw(['config', `branch.${branch}.remote`])
}

/**
 * 判断给定路径的仓库是否已提交
 * @param path 
 * @returns 
 */
export const isPushed = (path: string): Promise<boolean> => {
        fs.statSync(path)
        const repos = simpleGit(path)
        return getCurrentBranch(path).then(async (branch) => {
            // 只选择根目录进行判断是不是仓库
            const remote = await (await getBranchInRemote(path, branch)).trim()
            return repos.raw(['cherry', `${remote}/${branch}`]).then( (res: string) => {
                return new Promise(resolve => {
                    resolve(res.length == 0)
                })
            })
        })
}

/**
 * 获取当前仓库的提交状态
 * @param path 
 * @returns 
 */
export const getStatus = (path: string): Promise<RepoStatus> => {
    // 判断是不是已提交
    const result = isCommited(path).then((res: boolean): Promise<RepoStatus> => {
        if(!res)return Promise.resolve(RepoStatus.UNCOMMIT)
        const pushed = isPushed(path)
        return pushed.then(data => {
            if(data)return Promise.resolve(RepoStatus.OK)
            return Promise.resolve(RepoStatus.UNPUSH)
        }).catch(error => {
            logger.error(error)
            return Promise.resolve(RepoStatus.UNKNOW)
        })
    }).catch(error => {
        logger.error(error)
        return Promise.resolve(RepoStatus.UNKNOW)
    })
    return result
}

/**
 * 获取仓库的分支情况
 * @param path 
 */
export const getAllBranch = (path: string) => {
    const repos = simpleGit(path)
    const res = repos.branch(['-r']).then( value => {
        return Promise.resolve(value.all)
    }).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, "", tr('failed_to_get_branches'))
    })
    return res
}

/**
 * 查看仓库是否有远程仓库
 * @param path 
 */
export const hasRemote = (path: string) => {
    const repos = simpleGit(path)
    return repos.listRemote().then(res => {
        return Promise.resolve(res.length > 0)
    }).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, "", tr('repo_havent_remote'))
    })
}

/**
 * git获取远程仓库信息
 * @param path 仓库本地地址
 * @returns Promise<RemoteItem[]>
 */
export const getRemote = (path: string): Promise<RemoteItem[]> => {
    const repos = simpleGit(path)
    return repos.remote(['-v']).then((res: string | void) => {
        if(!res) return []
        const remoteInfo: RemoteItem[] = []
        // 一个本地仓库可能有多个远程仓库
        let lastItem: RemoteItem
        res.split('\n').filter(Boolean).forEach(item => {
            // 最后的一个
            const itemInfo = item.match(/[^\s|(|)]+/g) as Array<string>
            if (!lastItem){
                lastItem = {name: itemInfo[0], push: '', fetch: ''}
                remoteInfo.push(lastItem)
            }
            else if (lastItem.name != itemInfo[0]){
                lastItem = {name: itemInfo[0], push: '', fetch: ''}
                remoteInfo.push(lastItem)
            }
            itemInfo[2] == 'fetch'
            ?lastItem.fetch = itemInfo[1]
            :lastItem.push = itemInfo[1]
        })
        return remoteInfo
    })
}

/**
 * 获取仓库的tag列表
 * @param path 
 * @returns 
 */
export const getTag = (path: string) => {
    const repos = simpleGit(path)
    const res = repos.tags()
    return res.then(value => {
        return Promise.resolve(value.all)
    }).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, "", tr('failed_to_get_tag'))
    })
}

/**
 * 获取git日志
 * @param path 仓库路径
 * @param branch 分支名称
 * @returns 
 */
export const getCommitLog = (path: string, branch:string='') => {
    const repos = simpleGit(path)
    const res = repos.log([branch])
    res.catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, branch, tr('failed_to_get_commit_log'))
    })
    return res
}

/**
 * 获取当前分支
 * @param path 
 */
export const getCurrentBranch = (path: string) => {
    const repos = simpleGit(path)
    const res = repos.branch().then( value => {
        const current = value.current
        return Promise.resolve(current)
    }).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, '', tr('failed_to_current_branch'))
    })
    return res
}

/**
 * 获取仓库分支基本信息
 * @param path 
 * @returns 
 */
export const getRepoBranch = (path: string): Promise<Branchs> => {
    const repos = simpleGit(path)
    const res = repos.branch().then( value => {
        return Promise.resolve({current: value.current, all: value.all})
    }).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, '', tr('failed_to_current_branch'))
    })
    return res
}

export const getLog = (path: string, branch: string): Promise<readonly DefaultLogFields[]> => {

    const repos = simpleGit(path)
    const branches = repos.log([branch]).then( res => {
        return Promise.resolve(res.all)
    }).catch(error => {
        logger.error(error.message)
        throw new RepositoryError(path, branch, tr('failed_to_get_commit_log'))
    })
    return branches
}

/**
 * 获取仓库的贡献者
 * @param path 
 * @param branch 
 * @returns 
 */
export const getContributors = (path: string, branch: string =""): Author[] => {
    //git log --pretty=format:'%an' | sort -u   ：：unix环境下 
    // git log ${branch} --format=%aN           ：：windows环境下
    const arr = getCustomerLogFormat(path, branch,  {
        formatOption: [formatOption._an, formatOption._ae],
        filter: true,
        filterFunc(item: string[], index: number, arr: string[][]){
            return index === arr.findIndex(o => o[0] === item[0])
        }
    })
    const res: Author[] = []
    arr.forEach(item =>{
        res.push({
            name: item[0],
            email: item[1]
        })
    })
    return res
} 

/**
 * 获取分支的创建者信息
 * @param path 
 * @param branch 
 */
export const getBranchCreatorInfo = (path: string, branch: string): BranchCreatedInfo   => {
    const logArr = getCustomerLogFormat(path, branch,  {
        formatOption: [formatOption._an, formatOption._at, formatOption._ae]
    })
    const last = logArr[logArr.length - 1]
    return {name: branch, time: new Date(parseInt(last[1])), author: {name: last[0], email: last[2]}}
}

/**
* 批量获取分支创始数据
* @param path
* @param branchs
 */
export const getBranchsCreateInfo = (path: string, branchs: string[]) => {
    const res: BranchCreatedInfo[] = []
    branchs.forEach( branch => {
        const info = getBranchCreatorInfo(path, branch)
        res.push(info)
    })
    return res
}

/**
 * 获取仓库数据
 * @param path 
 */
export const getRepositoryInfo = (repoPath: string): Promise<Repository> => {
    const r = simpleGit(repoPath)
    const remotePromise = r.listRemote()       // 获取远程地址
    const branchsPromise = getRepoBranch(repoPath) // 获取所有分支
    return remotePromise.then(remote => {
        return branchsPromise.then((res: Branchs) => {
            const branchs: Branch[] = []
            // 获取分支创建数据
            res.all.forEach( bname => {
                const createInfo = getBranchCreatorInfo(repoPath, bname)
                // 获取分支作者信息
                const authors = getContributors(repoPath, bname)
                branchs.push({createInfo, name: bname, authors})
            })
            const authors = getContributors(repoPath)
            const repo: Repository = {
                curBranch: branchs.find(item => item.name == res.current)!,
                branchs,
                name: path.basename(repoPath),
                authors,
                remote,
                path: repoPath
            }
            return Promise.resolve(repo)
        }).catch(error => {
            logger.error(error.message)
            return Promise.reject(new RepositoryError(repoPath, '', tr('failed_to_repository_info')))
        })
    }).catch(error => {
        logger.error(error.message)
        return Promise.reject(new RepositoryError(repoPath, '', tr('remoteRepositoryNotFound')))
    })
    
}

/**
 * 获取仓库贡献者排名
 * @param path 
 * @param branch 
 */
export const getContributorsRank = (path: string, branch: string) => {
    const logArr = getCustomerLogFormat(path, branch,  {
        formatOption: [formatOption._an, formatOption._ae]
    })
    // 对人员信息进行排序，传过来的都是一对用户名，依照出现次数，由高到低排序.
    const rankMap = new Map<string, ContributorsRankItem>()
    logArr.forEach( item => {
        const name = item[0]
        const email = item[1]
        let rankItem = rankMap.get(name)
        if (!rankItem){
            rankMap.set(name, (rankItem = {author: {name, email}, count: 0}))
        }
        rankItem.count++
    })
    return Array.from(rankMap.values()).sort((a, b) => {
        return -(a.count - b.count)
    })
}

/**
 * 提交数量统计，步长值为1天
 * @param path 
 * @param branch 
 */
export const getContributeStat = (path: string, branch: string=''): Promise<StatDailyContribute & Record<'authorMap', AuthorStatDailyContributeMap>> => {
    const repoOption:Partial<SimpleGitOptions> = {
        baseDir: path,
        maxConcurrentProcesses: 3,
        binary: 'git',
        trimmed: false
    }
    const repo = simpleGit(repoOption)
    return repo.log([branch, '--numstat'])
    .then(res => {
        let dateList: Date[] = [];
        let insertion: number[] = [];
        let deletions: number[] = [];
        let commitCount:number[] = [];
        let authorMap = new Map<string, StatDailyContribute & Record<'author', Author> & Record<'key', string>>();
        let changeFiles: number[] = [];
        let count = 0;
        res.all.forEach(item => {
            const tmpDate = new Date(item.date);
            let author = authorMap.get(item.author_name);
            // 如果没有作者查询到的化就新增一个
            if(!author){
                authorMap.set(item.author_name,
                    author = {
                        author: {
                            name: item.author_name,
                            email: item.author_email,
                        },
                        key: uuid(),
                        start: tmpDate,
                        end: tmpDate,
                        commitCount:[0],
                        dateList: [tmpDate],
                        insertion: [0],
                        deletions: [0],
                        changeFiles:[0]
                    });
            }
            if (dateList.length == 0 || 
                dateList[dateList.length - 1].toLocaleDateString() != tmpDate.toLocaleDateString()){
                // 如果日期没有的话就插入新的
                dateList.push(tmpDate);
                insertion.push(0);
                commitCount.push(0);
                deletions.push(0);
                changeFiles.push(0);
            }
            // 如果作者当前日期还没有记录就新建一个记录
            if (author.dateList[author.dateList.length - 1].toLocaleDateString() != tmpDate.toLocaleDateString()){
                author.dateList.push(tmpDate);
                author.insertion.push(0);
                author.commitCount.push(0);
                author.deletions.push(0);
                author.changeFiles.push(0);
            }
            // 没有dif说明是合并的
            if (!item.diff && author){
                commitCount[commitCount.length - 1] ++;
                author.commitCount[author.commitCount.length - 1] ++;
            }
            else if (item.diff && author){
                // 总体记录
                insertion[insertion.length - 1] += item.diff.insertions;
                deletions[deletions.length - 1] += item.diff.deletions;
                commitCount[commitCount.length - 1] ++;
                changeFiles[changeFiles.length - 1] += item.diff.files.length;
                // 作者记录;
                author.insertion[author.insertion.length - 1] += item.diff.insertions;
                author.commitCount[author.commitCount.length - 1] ++;
                author.deletions[author.deletions.length - 1] += item.diff.deletions;
                author.changeFiles[author.changeFiles.length - 1] += item.diff.files.length;
                author.start = tmpDate;
            }
        })
        dateList = dateList.reverse()
        insertion = insertion.reverse()
        deletions = deletions.reverse()
        commitCount = commitCount.reverse()
        changeFiles = changeFiles.reverse()
        // 作者数组倒序
        authorMap.forEach(item => {
            item.changeFiles = item.changeFiles.reverse()
            item.commitCount = item.commitCount.reverse()
            item.dateList = item.dateList.reverse()
            item.deletions = item.deletions.reverse()
            item.insertion = item.insertion.reverse()
        })
        return Promise.resolve({
            start: dateList[0],
            end: dateList[dateList.length - 1],
            dateList,
            insertion,
            deletions,
            commitCount,
            changeFiles,
            authorMap
        })
    })
}

const __getFileList = (hashOrBranch: string, repoPath: string) => {
    const command = `git ls-tree -r ${hashOrBranch} --format="%(objectmode)${INTERVAL}%(objecttype)${INTERVAL}%(objectname)${INTERVAL}%(objectsize:padded)${INTERVAL}%(path)" `
    const cmdRes = execSync(command, {cwd: repoPath, encoding: 'utf8'})
    const fileList: RepoFileInfo[] = []
    const files = cmdRes.trim().split('\n')
    files.forEach(file => {
        const fileInfo = file.split(INTERVAL)
        const objectMode = fileInfo[0]
        const objectType = fileInfo[1]
        const objectName = fileInfo[2]
        const objectSize = fileInfo[3]
        const objectPath = fileInfo[4]
        const repoFileInfo: RepoFileInfo = {
            name: path.basename(objectPath),
            dir: path.dirname(objectPath),
            objectMode,
            objectName,
            objectSize: parseInt(objectSize),
            objectType,
            isDir: false
        }
        fileToList(repoFileInfo, fileList)
    })
    return fileList
}
export const getRepoFileList = (repoPath: string, branch?: string) => {
    const fileList = __getFileList(branch ? branch: 'origin/master', repoPath)
    return fileList
}

export const getFileListByHash = (repoPath: string, hash: string) => {
    const fileList = __getFileList(hash, repoPath)
    return fileList
}

const buildRepoFileInfo = (
                        name: string,
                        dir: string,
                        isDir: boolean,
                        children?: RepoFileInfo[],
                        objectMode?: string,
                        objectType?: string,
                        objectName?: string,
                        objectSize?: number): RepoFileInfo => {
                            return {
                                name,
                                dir,
                                isDir,
                                children,
                                objectMode,
                                objectType,
                                objectName,
                                objectSize
                            }
                        }
const fileToList = (repoFileItem: RepoFileInfo, list: RepoFileInfo[]) => {
    // 绝对路径分割列表
    const pathSliceList = path.join(repoFileItem.dir, repoFileItem.name).split('\\')
    let tmpList = list      // tmpList 为遍历到的额当级目录
    for(let i = 0 ; i < pathSliceList.length - 1; i++) {    // 建立文件夹
        const pathSlice = pathSliceList[i]
        const nextList = tmpList.find(item => item.name == pathSlice)
        if (nextList) {
            if (!nextList.children) nextList.children = []
            tmpList = nextList.children
        } else {
            const dir = pathSliceList.slice(0, i).join('/')
            const fileInfo = buildRepoFileInfo(pathSlice, dir, true, [])
            tmpList.push(fileInfo)
            // @ts-ignore
            tmpList = fileInfo.children
        }
    }
    // 传入文件
    tmpList.push(repoFileItem)
}

/**
 * 获取文件内容
 * @param repo 仓库路径
 * @param fileHash  文件hash
 *
 */
export const getFileContent = (repo: string, fileHash: string) => {
    const command = `git cat-file -p ${fileHash}`
    const cmdRes = execOutputStr(command, repo)
    return cmdRes
}


export const hasGit = () => {
    try {
        const command = `git --version` 
        execSync(command, {encoding: 'utf8'})
        return true
    } catch (error) {
        return false
    }
}

export const isFirstCommit = (repo: string, commitHash: string) => {
    const command = `git log ${commitHash} -2 --format='%H'`
    let cmdRes = execOutputStr(command, repo)
    return cmdRes.trim().split('\n').length == 0
}

/**
 * 获取提交文件状态，分为提交、删除、修改和重命名
 * 
 * 返回文件状态列表和提交标题
 * @param repo 
 * @param commitHash 
 * @returns 
 */
export const getCommitFileStatus = (repo: string, commitHash: string): [FileStatusList, string] => {
    const command = `git show --name-status ${commitHash} --oneline`
    let cmdRes = execOutputStr(command, repo)
    const lines = cmdRes.split('\n')
    const [hash, title] = lines[0].split(' ')
    const fileStatusMap: FileStatusList = []
    lines.slice(1).forEach(item => {
        const fileStatus = item.split('\t')
        if (fileStatus.length == 2) {
            // 添加文件、删除文件、修改文件
            fileStatusMap.push([fileStatus[0] as CommitFileStatus, [fileStatus[1]]])
        }else {
            // 重命名文件、移动文件
            fileStatusMap.push([fileStatus[0] as CommitFileStatus, [fileStatus[1], fileStatus[2]]])
        }
    })
    return [fileStatusMap, title]
}

export const diffFileContext = (repo: string, commitHash1: string, commitHash2: string, file: string): [string[], number[], number[]] => {
    const command = `git diff ${commitHash1} ${commitHash2} -- ${file}`
    let cmdRes = execOutputStr(command, repo)
    let lines = cmdRes.split('\n')
    const fileStatus = lines[1].indexOf('deleted') > -1
                                ? 'deleted'
                                : lines[1].indexOf('new') > -1
                                ? 'new' 
                                : 'modified'
    const diffContext: string[] = []
    let additions: number[] = []
    let deletions: number[] = []
    // 删除文件
    if (fileStatus == 'deleted') {
        diffContext.push(tr('diff_context_delete'))
    } else if(fileStatus == 'new' || fileStatus == 'modified') {
        // 添加文件、修改文件，如果修改的是二进制文件，则不显示内容
        if (fileStatus == 'modified' && lines[2].indexOf('Binary files') > -1) {
            diffContext.push(tr('diff_context_modify_binary_file'))
        } else {
            // 添加文件、修改文件
            const skipLineCnt = fileStatus == 'modified'? 4 : 5
            let offset = 0
            lines = lines.slice(skipLineCnt)
            for (let i = 0; i < lines.length; i++) {
                if (lines[i] === NO_NEW_LINE_TIP) continue
                if (lines[i].startsWith('+')) additions.push(i + offset)
                else if (lines[i].startsWith('-')) deletions.push(i + offset)
                if (CHANGE_LINE_INFO_REG.test(lines[i])) {
                    const changeLineInfo = lines[i].match(CHANGE_LINE_INFO_REG)![0]
                    if (changeLineInfo.length === lines[i].length) {
                        diffContext.push(changeLineInfo)
                    } else {
                        diffContext.push(changeLineInfo, lines[i].slice(changeLineInfo.length))
                        offset ++
                    }
                } else {
                    diffContext.push(lines[i])
                }
            }
        }
    }
    return [diffContext, additions, deletions]
}

/**
 * 获取提交文件信息，包括文件名、提交类型、文件修改内容
 * @param repo 
 * @param commitHash 
 * @returns 
 */
export const getCommitFileInfo = (repo: string, commitHash: string): CommitFileInfo => {
    const diffFiles: DiffFile[] = []
    const [fileStatusMap, title] = getCommitFileStatus(repo, commitHash)
    // 判断是不是第一次提交
    if (isFirstCommit(repo, commitHash)) {
        fileStatusMap.forEach((fileStatus: [CommitFileStatus, string[]]) => {
            diffFiles.push({
                path: fileStatus[1][0],
                changeType: fileStatus[0],
                commitContext: [],
                additions: [],
                deletions: [],
                fileType: inferFileTypeFromName(fileStatus[1][0])
            })
        })
    }
    else {
        // 不是第一次提交就获取文件修改内容
        fileStatusMap.forEach((fileStatus: [CommitFileStatus, string[]]) => {
            const key = fileStatus[0]
            const value = fileStatus[1]
            const fileType = inferFileTypeFromName(value[0])
            if (key == 'A' || key == 'M') {
                const [context, additions, deletions] = diffFileContext(repo, `${commitHash}^`, commitHash, value[0])
                diffFiles.push({
                    path: value[0],
                    changeType: key,
                    commitContext: context,
                    additions,
                    deletions,
                    fileType
                })
            } else if (key == 'D') {
                diffFiles.push({
                    path: value[0],
                    changeType: key,
                    commitContext: [tr('diff_context_delete')],
                    additions: [],
                    deletions: [],
                    fileType
                })
            } else if (key == 'R100') {
                diffFiles.push({
                    path: value[0],
                    changeType: key,
                    commitContext: [value.join(' -> ')],
                    additions: [],
                    deletions: [],
                    fileType
                })
            }
        })
    }

    return {
        hash: commitHash,
        diff: diffFiles,
        title
    }
}

export const getBranchListContainCommit = (repo: string, commitHash: string): string[] => {
    const command = `git branch --contains ${commitHash}`
    let cmdRes = execOutputStr(command, repo)
    return cmdRes.split('\n').map(item => item.slice(1).trim())
}