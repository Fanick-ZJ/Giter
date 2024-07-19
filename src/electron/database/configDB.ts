import path from "path"
import { AutoInsertDB } from "./decorators/autoInsertDB"
import _ from "lodash"
import { Database } from "better-sqlite3"
import { supportLang } from "../common/const/supportLang"
import { logger } from "@/electron/logger/init"
import { buildDbInstance } from "../common/utils/dbUtil"
import { BaseDB } from "./baseDB"

// 配置项设置器，如果在设置时没有，就添加默认值

type ConfigItem = {
    key: string,
    value: any
}

export class ConfigDB extends BaseDB{
    insertOrUpdate(key: string, value: any) {
        try{
            const configItem = this.db.prepare('select key from config where key= ?').get(key)
            if (typeof configItem === 'undefined') {
                // 执行插入语句
                this.db.prepare('insert into config (key,value) values (?,?)').run(key, value)
            } else {
                this.db.prepare('update config set value=? where key=?').run(value, key)
            }
            return true
        } catch (e) {
            logger.error(`insert or update config error: ${e}`)
            return false
        }
    }

    setLanguage(lang: string) {
        lang = supportLang.has(lang) ? lang : "zh-CN"
        return this.insertOrUpdate('language', lang)
    }

    getLanguage(): string {
        const row = this.db.prepare('select value from config where key= ?').get('language') as ConfigItem
        return typeof row != 'undefined' ? row.value : "zh-CN"
    }
}
