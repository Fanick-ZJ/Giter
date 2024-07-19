// dialog的窗口文件
import { DialogType } from "@/types";
import { BrowserWindow } from "electron";
import { logger } from "@/electron/logger/init";
import path from 'path'
import { encode } from "@/electron/common/utils/tools";

export class TipDialog {
    public win: BrowserWindow
    private parent: BrowserWindow | undefined
    private type: DialogType
    private message: string
    private title: string

    constructor(parent: BrowserWindow | undefined, type: DialogType, message: string, title: string){
        this.parent = parent
        this.type = type
        this.message = message
        this.title = title

        this.win = new BrowserWindow({
            parent,
            modal: true,
            width: 400,
            height: 250,
            // resizable: true,
            webPreferences: {
                nodeIntegration: false,  // 可以在渲染进程中使用node的api，默认是false
                contextIsolation: true, //  是否用隔离沙箱
                webSecurity: false, //关闭浏览器的跨域检查
                sandbox: false,
                preload: path.join(__dirname, 'app/preload/preload.js')
            }
        })
        if (process.env.NODE_ENV === 'development') {
            this.win.webContents.openDevTools()
        }

    }

    public init() {
        this.win.setTitle(this.title)
        this.win.removeMenu()
        const loaderUrl = process.argv[2] ?
            process.argv[2]+'/' // 开发模式
            :`file://${__dirname}/`    // 生产模式
        this.win?.loadURL(`${loaderUrl}../index.html#/msgdlg/${this.type}/${encode(this.message)}/${this.win.id}`)
    }

    public getWindow(): BrowserWindow{
        return this.win
    }
}