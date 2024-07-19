// 生产环境的electron 插件
import type {Plugin} from 'vite'
import fs from 'node:fs'
import * as electronBuilder from 'electron-builder'
import path from 'path'
import {build} from '../packages'
import extraRes from '../packages/extra.res.json'
import dependenciesLib from '../packages/dependencies.lib.json'
import { OUT_DIR } from '../packages/const'

function getExtraResources() {
    const resList = extraRes.map(res => {
        return {
            from: path.join(path.dirname(__dirname), ...res.origin),
            to: res.build.join('/')
        }
    })
    return resList
}

// 打包 需要先等vite打包完成之后就有index.html, 在执行electron-builder打包
export const ElectronBuildPlugin = (): Plugin => {
    return {
        name: 'electron-build',
        buildStart() {
            if (process.env.NODE_ENV === 'production') {
                fs.rmSync(OUT_DIR, { recursive: true, force: true })
            }
        },
        closeBundle() {
            build()
            // electron-build打包 需要制定package.json.main
            const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
            json.main = 'electron/background.js'
            fs.writeFileSync(`${OUT_DIR}/package.json`, JSON.stringify(json, null, 4))
            //bug electron-builder 它会给你下载垃圾文件
            fs.mkdirSync(`${OUT_DIR}/node_modules`, {recursive: true})
            
            electronBuilder.build({
                config: {
                    directories: {
                        output: path.resolve(process.cwd(), 'release'),
                        app: path.resolve(process.cwd(), OUT_DIR)
                    },
                    asar: false,  // 帮我们打成一个压缩包
                    appId: 'com.fanick.app',
                    productName: 'Giter',
                    nsis: {
                        oneClick: false, // 取消一键安装
                        allowToChangeInstallationDirectory: true,   // 允许选择目录安装
                    },
                    extraResources: getExtraResources()
                }
            })
        }
    }
}