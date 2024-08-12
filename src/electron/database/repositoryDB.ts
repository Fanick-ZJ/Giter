// 需求：基本的写入、修改数据库之传入字符串一个参数，不需要指定数据库
// 它需要自动开启，自动关闭，第二个参数没有给就是用默认数据库，给了就用指定的数据库/内存数据库，内存数据库需要全局唯一(暂不考虑)
import path from "path"
import { RepoStatus, type RepoItem } from "@/types"
import { AutoInsertDB } from "./decorators/autoInsertDB"
import _ from "lodash"
import { buildDbInstance } from "../common/utils/dbUtil"
import { BaseDB } from "./baseDB"
import { logger } from "../logger/init"

export class RepositoryDB  extends BaseDB{

    /**
     * 获取所有仓库
     * @param dbPath 
     * @returns 
     */
    public getAllRepository(dbPath?: string): Promise<RepoItem[]> {
        return new Promise((resolve, reject) => {
            const repos = this.db.prepare<unknown[], any>('select * from repository').all().map(item => {
                return {
                    path: item.path,
                    name: item.name,
                    watchable: Boolean(item.watchable),
                    isTop: Boolean(item.isTop),
                    isHidden: Boolean(item.isHidden),
                    isExist: Boolean(item.isExist),
                    avatar: item.avatar,
                    status: RepoStatus.UNKNOW,
                    curBranch: ''
                }
            })
            resolve(repos)
        })
    }

    /**
     * 添加仓库
     * @param repository 
     * @param dbPath 
     * @returns 
     */
    public addRepository(_path: string, watchable: boolean, dbPath?: string): void {
        const newRepo = this.db.prepare('insert into repository values (?, ?, ?, ?, ?, ?, ?)')
        const name = path.basename(_path)
        newRepo.run(_path, name, 1, '', 0, 0, _.toInteger(watchable))
    }

    /**
     * 更新仓库
     * @param repository 
     * @param dbPath 
     * @returns 
     */
    public updateRepository(repository: RepoItem, dbPath?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const update = this.db.prepare('update repository set name = ?, isExist = ?, avatar = ?, isTop = ?, isHidden = ?, watchable = ? where path = ?')
            const transaction = this.db.transaction((repository: RepoItem) => {
                update.run(repository.name, _.toInteger(repository.isExist), repository.avatar, _.toInteger(repository.isTop), _.toInteger(repository.isHidden), _.toInteger(repository.watchable), repository.path)
            })
            transaction(repository)
            resolve()
        })
    }

    /**
     * 删除仓库
     * @param repository 
     * @param dbPath 
     * @returns 
     */
    public deleteRepository(repoPath: string, dbPath?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const del = this.db.prepare('delete from repository where path = ?')
            const delRepo = this.db.transaction((_path) => {
                del.run(_path)
            })
            delRepo(repoPath)
            resolve()
        })
    }
}