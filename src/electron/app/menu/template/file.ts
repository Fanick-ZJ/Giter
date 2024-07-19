
import {tr} from "@/electron/app/lang/translate";
import { MenuItemConstructorOptions, BrowserWindow, dialog} from "electron";
import {importRespo, addMoreRepos} from '../actions/repository'
const file: MenuItemConstructorOptions = {
    label: tr('file'),  // 文件
    submenu: [
        {
            label: tr('add_repo'),    // 添加项目
            accelerator: 'Ctrl+I',
            click: (menuItem, browserWindow: BrowserWindow|undefined, event) => {
                importRespo(browserWindow as BrowserWindow)
            }
        },
        {
            label: tr('add_more_repos'),     // 添加文件夹
            accelerator: 'Ctrl+M',
            click: (menuItem: Electron.MenuItem, browserWindow: BrowserWindow | undefined, event: Electron.KeyboardEvent) => {
                addMoreRepos(browserWindow as BrowserWindow)
            }
        },
        {
            label: tr('build_new_repository')  // 新建仓库
        }
    ]
}

export default file