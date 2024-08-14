/**
 * 专门用于处理仓库数据的耗时操作。
 */
// 线程收集环境变量
import { workerThreadEnvInit } from "../common/utils/tools"
workerThreadEnvInit()

import { CommitFileInfo, CommitLogFields, WorkTask } from "@/types"
import { parentPort  } from 'worker_threads'
import { logger } from "@/electron/logger/init"
import { isPathExist } from "../common/utils/fileUtil"
import { getAllAuthors, getBranchAuthors, getBranchCommitCount, getBranchCreateInfo, getBranches, getCommitLogFormat, getContributeStat, getCurrentBranch, getFileByHash, getFilesDiffContext, getRepoFileList, getRepositoryInfoFull, getStatus, isGitRepository } from "lib/git"

interface PathAndBranch {
    path: string,
    branch: string
}


const _readCommitLog = async (param: PathAndBranch) => {
    const { path, branch } = param
    const res = getCommitLogFormat(path, ['%h', '%ct', '%s', '%d', '%b', '%an', '%ae'], "", branch)
    const logs: CommitLogFields[] = res.map(item => {
        return {
            hash: item.hashS,
            date: parseInt(item.committerDateTimeStamp) * 1000, //转换为毫秒数 
            message: item.message,
            refs: item.refs,
            body: item.body,
            author_name: item.authorName,
            author_email: item.authorEmail,
        }
    })
    parentPort?.postMessage(logs)
}

const _getContributors = (param: PathAndBranch) => {
    const { path, branch } = param
    const contributors = getBranchAuthors(path, branch)
    parentPort?.postMessage(contributors)
}

const _getBranchCreator = (param: PathAndBranch) => {
    const { path, branch } = param
    logger.info(`getBranchCreatorInfo is running, ${param.branch}, ${param.path}`)
    const contributors = getBranchCreateInfo(path, branch)
    parentPort?.postMessage(contributors)
}
const _getRepositoryInfo = async (param: {path: string}) => {
    const repoInfo = getRepositoryInfoFull(param.path)
    parentPort?.postMessage(repoInfo)

}
const _getContributorsRank = async (param: PathAndBranch) => {
    const rank = getBranchAuthors(param.path, param.branch)
    parentPort?.postMessage(rank)

}
const _getContributeStat = async (param: PathAndBranch) => {
    logger.info('==================_getContributeStat========================')
    logger.info(JSON.stringify(param))
    logger.info('==========================================')
    const res = getContributeStat(param.path, param.branch)
    parentPort?.postMessage(res)
}

const _getRepoFileList = async (param: PathAndBranch) => {
    const res = getRepoFileList(param.path, param.branch)
    parentPort?.postMessage(res)
}

const _getRepoBranch = async (path: string) => {
    const branches = getBranches(path)
    const current = getCurrentBranch(path)
    parentPort?.postMessage({
        all: branches,
        current
    })
}

const _getFileContent =  (param: {path: string, fileHash: string}) => {
    const res = getFileByHash(param.path, param.fileHash)
    parentPort?.postMessage(res)
}

const _getCommitFileInfo = (param: {path: string, hash: string}) => {
    const diffs = getFilesDiffContext(param.path, param.hash+'^', param.hash)
    const commit_message = getCommitLogFormat(param.path, ['%s', '%h'], param.hash+'^', param.hash)
    const res: CommitFileInfo = {
        title: commit_message["message"],
        hash: commit_message["hashS"],
        diff: diffs
    }
    parentPort?.postMessage(res)
}

const _getFileListByCommit = (param: {path: string, hashOrBranch: string}) => {
    const res = getRepoFileList(param.path, param.hashOrBranch)
    parentPort?.postMessage(res)
}


const _isRepoExist = async (path: string | string[]) => {
    let res
    if (Array.isArray(path)){
        res = []
        for (let i = 0; i < path.length; i++) {
            const exist = isPathExist(path[i])
            if (exist) {
                // 如果存在就检查是否为仓库
                res.push(isGitRepository(path[i]))
            }else{
                res.push(false)
            }
        }
    }else{
        const exist = isPathExist(path)
        if (exist) {
            // 如果存在就检查是否为仓库
            res =  isGitRepository(path)
        }
        res =  false
    }
    parentPort?.postMessage(res)
}

const _getRepoStaus = (path: string) => {
    const res = getStatus(path)
    parentPort?.postMessage(res)
}

const _getCurrentBranch = (path: string) => {
    const res = getCurrentBranch(path)
    parentPort?.postMessage(res)
}

const _getBranchCommtiCount = (param: {path: string, branch: string}) => {
    const res = getBranchCommitCount(param.path, param.branch)
    parentPort?.postMessage(res)
}


const ACTION_MAP = new Map<string, (...args: any[]) => void>([
    ['getLog', _readCommitLog],
    ['getContributors', _getContributors],
    ['getBranchCreatorInfo', _getBranchCreator],
    ['getRepositoryInfo', _getRepositoryInfo],
    ['getBranchContributorsRank', _getContributorsRank],
    ['getContributeStat', _getContributeStat],
    ['getRepoFileList', _getRepoFileList],
    ['getRepoBranch', _getRepoBranch],
    ['getFileContent', _getFileContent],
    ['isRepoExist', _isRepoExist],
    ['getCommitFileInfo', _getCommitFileInfo],
    ['getFileListByCommit', _getFileListByCommit],
    ['getRepoStaus', _getRepoStaus],
    ['getCurrentBranch', _getCurrentBranch],
    ['getBranchCommtiCount', _getBranchCommtiCount]
])
const message = (e: WorkTask<any>) => {
    // 根据名字来执行不同的任务
    if (ACTION_MAP.has(e.name)) {
        logger.info(`${e.name} is running, ${JSON.stringify(e.params)}`)
        ACTION_MAP.get(e.name)!(e.params)
    }else {
        logger.error(`${e.name} is not exist`)
    }
    // 如果有回调函数的话就执行回调函数
    if (e.callback) e.callback()
}
parentPort?.on('message', message)