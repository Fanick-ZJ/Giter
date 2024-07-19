// dialog的窗口文件
import { DialogType } from "@/types";
import { BrowserWindow } from "electron";
import { logger } from "@/electron/logger/init";
import path from 'path'
import { encode } from "@/electron/common/utils/tools";
import { tr } from "../lang/translate";

export class SettingDialog {
    public win: BrowserWindow
    private parent: BrowserWindow | undefined

    constructor(parent: BrowserWindow | undefined){
        this.parent = parent

        this.win = new BrowserWindow({
            parent,
            modal: true,
            width: 800,
            height: 600,
            minWidth: 400,
            minHeight: 300,
            webPreferences: {
                nodeIntegration: false,  // 可以在渲染进程中使用node的api，默认是false
                contextIsolation: true, //  是否用隔离沙箱
                webSecurity: false, //关闭浏览器的跨域检查
                sandbox: false,
                preload: path.join(__dirname, 'app/preload/preload.js')
            }
        })
        this.win.webContents.openDevTools()

    }

    public init() {
        this.win.setTitle(tr('setting_dialog_title'))
        this.win.removeMenu()
        const loaderUrl = process.argv[2] ?
            process.argv[2]+'/' // 开发模式
            :`file://${__dirname}/`    // 生产模式
        this.win?.loadURL(`${loaderUrl}../index.html#/setting`)
    }

    public getWindow(): BrowserWindow{
        return this.win
    }
}