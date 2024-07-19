// 需求：基本的写入、修改数据库之传入字符串一个参数，不需要指定数据库
// 它需要自动开启，自动关闭，第二个参数没有给就是用默认数据库，给了就用指定的数据库/内存数据库，内存数据库需要全局唯一(暂不考虑)
import _ from "lodash"
import { OpenWithApp } from "@/types"
import { buildDbInstance } from "../common/utils/dbUtil"
import { BaseDB } from "./baseDB"

export class OpenWithDB extends BaseDB{

    /**
     * 获取所有打开方式app
     * @param dbPath 
     * @returns 
     */
    public getAllApp(dbPath?: string): Promise<OpenWithApp[]> {
        return new Promise((resolve, reject) => {
            resolve(this.db.prepare<unknown[], any>('select * from openWith').all().map(item => {
                return {
                    name: item.name,
                    path: item.path,
                    icon: item.icon,
                    groups: item.groups.split(','),
                }
            }))
        })
    }

    /**
     * 添加打开方式app
     * @param repository 
     * @param dbPath 
     * @returns 
     */
    public addApp(_path: string, name: string, icon: string, groups: string[], dbPath?: string): void {
        const newRepo = this.db.prepare('insert into openWith values (?, ?, ?, ?)')
        newRepo.run(name, _path, icon, groups.join(','))
    }

    /**
     * 更新仓库
     * @param repository 
     * @param dbPath 
     * @returns 
     */
    public updateApp(_path: string, name: string, icon: string, groups: string[], dbPath?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const update = this.db.prepare('update openWith where path = ? set name = ?, path = ?, icon = ?, groups = ?')
            const transaction = this.db.transaction(() => {
                update.run(_path, name, icon, groups)
            })
            resolve()
        })
    }

    /**
     * 删除仓库
     * @param repository 
     * @param dbPath 
     * @returns 
     */
    public deleteApp(repoPath: string, dbPath?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const del = this.db.prepare('delete from openWith where path = ?')
            const delRepo = this.db.transaction((_path) => {
                del.run(_path)
            })
            delRepo(repoPath)
            resolve()
        })
    }

    public getApp(repoPath: string, dbPath?: string): Promise<OpenWithApp | undefined> {
        return new Promise((resolve, reject) => {
            resolve(this.db.prepare<string, any>('select * from openWith where path = ?').get(repoPath))
        })
    }
}
