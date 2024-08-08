/**
 * git工具类, 要在工作者线程中使用，不能出现、间接引用electron中的对象
 */

import {CheckRepoActions, simpleGit, StatusResult, DefaultLogFields, SimpleGitOptions, LogOptions} from 'simple-git'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process';
import {tr} from '@/electron/app/lang/translate'
import { Author, RepoStatus, BranchCreatedInfo, Repository, ContributorsRankItem, StatDailyContribute, AuthorStatDailyContributeMap, RemoteItem, Branchs, RepoFileInfo, FileStatusList, CommitFileStatus, CommitFileInfo} from '@/types'
import { logger } from "@/electron/logger/init"
import { Optional } from '../types'
import { RepositoryError } from '@/types/errorType'
import { uuid } from '@/renderer/common/util/tools'
import { execOutputStr } from './command';
import { inferFileTypeFromName } from './fileUtil';
import { getBranches, getCurrentBranch, getRemote, isCommited, isPushed } from '@/electron/lib/gitUtil';

/**
 * 获取当前仓库的提交状态
 * @param path 
 * @returns 
 */
export const getStatus = (path: string): RepoStatus => {
    // 判断是不是已提交
    if (!isCommited(path)) return RepoStatus.UNCOMMIT
    const branch = getCurrentBranch(path)
    if (!isPushed(path, branch.name)) return RepoStatus.UNPUSH
    return RepoStatus.OK
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


export const getBranchListContainCommit = (repo: string, commitHash: string): string[] => {
    const command = `git branch --contains ${commitHash}`
    let cmdRes = execOutputStr(command, repo)
    return cmdRes.split('\n').map(item => item.slice(1).trim())
}