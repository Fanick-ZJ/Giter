import { BrowserWindow, Menu, app, contentTracing, session } from "electron"
import path from 'path'
import { mainMenu } from "./menu/template"
import { actionInit } from "./actionInit"
import { WindowsManager } from "../win/windowManager"
export default class Giter{

    public win: BrowserWindow | undefined
    private _windowsManager: WindowsManager | undefined

    constructor(){
    }

    init(){
        app.whenReady().then(() => {
            this.win = new BrowserWindow({
                height: 800,
                width: 1000,
                minHeight: 700,
                minWidth: 800,
                webPreferences: {
                    nodeIntegration: true,  // 可以在渲染进程中使用node的api，默认是false
                    contextIsolation: true, //  不启用隔离沙箱
                    webSecurity: false, //关闭浏览器的跨域检查
                    sandbox: false,
                    preload: path.join(__dirname, 'app/preload/preload.js')
                }
            })

            
            if(process.env.NODE_ENV === 'development'){
                this.win.webContents.openDevTools()
                this.win.loadURL(process.argv[2])    // 开发环境
            }else{
                this.win.loadFile('index.html')  //生产环境
            }
            const menu = Menu.buildFromTemplate(mainMenu)
            // 初始化菜单
            Menu.setApplicationMenu(menu)
            
            this.functionPartInit() // 初始化功能部件
            // 如果是开发模式就加载插件
            if(process.env.NODE_ENV === 'development'){
                session.defaultSession.loadExtension(
                    path.resolve(__dirname, '../../_devtools/vue_dev_tool_6.5.0_0')
                )
            }
        })
    }

    /**
     * 功能部件初始化
     */
    private functionPartInit(){
        if (this.win){
            // 窗口管理初始化
            this._windowsManager = WindowsManager.getInstance(this.win)
            this._windowsManager.setMainWindow(this.win, true)
            // IPC事件初始化
            actionInit(this._windowsManager)
        }

    }
}