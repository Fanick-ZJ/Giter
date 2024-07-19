/**
 * 专门用于处理仓库数据的耗时操作。
 */
// 线程收集环境变量
import { workerThreadEnvInit } from "../common/utils/tools"
workerThreadEnvInit()

import {RepoItem, WorkTask} from "@/types"
import { workerData, parentPort  } from 'worker_threads'
import {getBranchCreatorInfo, getContributors, getLog, getRepositoryInfo, getContributorsRank, getContributeStat, getRepoFileList, getRepoBranch, isGitRepo, getFileContent, getFileListByHash} from "@/electron/common/utils/gitUtil.ts"
import { logger } from "@/electron/logger/init"
import { isPathExist } from "../common/utils/fileUtil"
import { getCommitFileInfo } from '../common/utils/gitUtil'

interface PathAndBranch {
    path: string,
    branch: string
}


const _readCommitLog = async (param: PathAndBranch) => {
    const { path, branch } = param
    const res = await getLog(path, branch)
    parentPort?.postMessage(res)
}

const _getContributors = (param: PathAndBranch) => {
    const { path, branch } = param
    const contributors = getContributors(path, branch)
    parentPort?.postMessage(contributors)
}

const _getBranchCreator = (param: PathAndBranch) => {
    const { path, branch } = param
    const contributors = getBranchCreatorInfo(path, branch)
    parentPort?.postMessage(contributors)
}
const _getRepositoryInfo = async (param: {path: string}) => {
    const repoInfo = await getRepositoryInfo(param.path)
    parentPort?.postMessage(repoInfo)

}
const _getContributorsRank = async (param: PathAndBranch) => {
    const rank = await getContributorsRank(param.path, param.branch)
    parentPort?.postMessage(rank)

}
const _getContributeStat = async (param: PathAndBranch) => {
    const res = await getContributeStat(param.path, param.branch)
    parentPort?.postMessage(res)
}

const _getRepoFileList = async (param: PathAndBranch) => {
    const res = await getRepoFileList(param.path, param.branch)
    parentPort?.postMessage(res)
}

const _getRepoBranch = async (path: string) => {
    const res = await getRepoBranch(path)
    parentPort?.postMessage(res)
}

const _getFileContent =  (param: {path: string, fileHash: string}) => {
    const res = getFileContent(param.path, param.fileHash)
    parentPort?.postMessage(res)
}

const _getCommitFileInfo = (param: {path: string, hash: string}) => {
    const res = getCommitFileInfo(param.path, param.hash)
    parentPort?.postMessage(res)
}

const _getFileListByHash = (param: {path: string, hashOrBranch: string}) => {
    const res = getFileListByHash(param.path, param.hashOrBranch)
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
                res.push(await isGitRepo(path[i]))
            }else{
                res.push(false)
            }
        }
    }else{
        const exist = isPathExist(path)
        if (exist) {
            // 如果存在就检查是否为仓库
            res =  await isGitRepo(path)
        }
        res =  false
    }
    parentPort?.postMessage(res)
}
const ACTION_MAP = new Map<string, (...args: any[]) => void>([
    ['getLog', _readCommitLog],
    ['getContributors', _getContributors],
    ['getBranchCreatorInfo', _getBranchCreator],
    ['getRepositoryInfo', _getRepositoryInfo],
    ['getContributorsRank', _getContributorsRank],
    ['getContributeStat', _getContributeStat],
    ['getRepoFileList', _getRepoFileList],
    ['getRepoBranch', _getRepoBranch],
    ['getFileContent', _getFileContent],
    ['isRepoExist', _isRepoExist],
    ['getCommitFileInfo', _getCommitFileInfo],
    ['getFileListByHash', _getFileListByHash],
])
const message = (e: WorkTask<any>) => {
    // 根据名字来执行不同的任务
    if (ACTION_MAP.has(e.name)) {
        ACTION_MAP.get(e.name)!(e.params)
    }else {
        logger.error(`${e.name} is not exist`)
    }
    // 如果有回调函数的话就执行回调函数
    if (e.callback) e.callback()
}
parentPort?.on('message', message)