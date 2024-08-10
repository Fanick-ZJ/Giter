/**
 * git工具类, 要在工作者线程中使用，不能出现、间接引用electron中的对象
 */

import {simpleGit, DefaultLogFields} from 'simple-git'
import {tr} from '@/electron/app/lang/translate'
import { RepoStatus } from '@/types'
import { logger } from "@/electron/logger/init"
import { RepositoryError } from '@/types/errorType'
import { execOutputStr } from './command';
import { getCurrentBranch, isCommited, isPushed } from 'lib/git'

/**
 * 获取当前仓库的提交状态
 * @param path 
 * @returns 
 */
export const getStatus = (path: string): RepoStatus => {
    // 判断是不是已提交
    const branch = getCurrentBranch(path)
    if (!isCommited(path)) return RepoStatus.UNCOMMIT
    if (!isPushed(path, branch)) return RepoStatus.UNPUSH
    return RepoStatus.OK
}