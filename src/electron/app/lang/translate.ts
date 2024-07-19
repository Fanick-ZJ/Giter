import {zh} from './zh'
import {en} from './en'
import { ConfigDB } from '@/electron/database/configDB'
import { logger } from "@/electron/logger/init"


// let lang = ((process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || process.env.LC_MESSAGES) || 'en').split('_')[0]

let lang: string

export const tr = (value: string): string => {
    if (!lang) {
        const db = new ConfigDB()
        lang = db.getLanguage()
        logger.info(`lang: ${lang}`)
    }
    let res: string
    if (lang == 'en-US'){
        res = en[value]
    }else if (lang == 'zh-CN'){
        res = zh[value]
    }else return value
    if (typeof res === 'undefined') return value
    return res
}
