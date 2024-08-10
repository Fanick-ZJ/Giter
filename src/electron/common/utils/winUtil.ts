import path from 'path'
import fs from 'fs'
import { getIconFromPe } from 'lib/giterNative/index'
import { isPathExist } from './fileUtil'
import { logger } from "@/electron/logger/init"
import { Base64Icon, Success } from '@/types'
import { BrowserWindow } from 'electron'
import { WindowsManager } from '@/electron/win/windowManager'

export const extractIcon = (ext: string): Base64Icon | Success  => {
    if(!isPathExist(process.env.TMP_PATH)){
        fs.mkdirSync(process.env.TMP_PATH, {recursive: true})
    }
    const tmp_pth = path.join(process.cwd(), 'cache', 'tmp', `tmp-${Date.parse(new Date().toString())}.png`)
    if (getIconFromPe(ext, tmp_pth)){
        const base64 = fs.readFileSync(tmp_pth).toString('base64')
        fs.unlinkSync(tmp_pth)  // 删除临时文件
        return "data:image/png;base64," + base64
    }
    return false
}