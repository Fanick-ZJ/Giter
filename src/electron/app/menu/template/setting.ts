
import {tr} from "@/electron/app/lang/translate";
import { MenuItemConstructorOptions, BrowserWindow, dialog} from "electron";
import {importRespo, addMoreRepos} from '../actions/repository'
import { logger } from "@/electron/logger/init";
import { SettingDialog } from "@/electron/app/settingDialog/index";
import { EventBus } from "@/electron/event/EventBus";
import { WindowsManager } from "@/electron/win/windowManager";
const setting: MenuItemConstructorOptions = {
    label: tr('setting'),  // 文件
    accelerator: 'Ctrl+Shift+S',
    click: (menuItem, browserWindow: BrowserWindow|undefined, event) => {
        const bus = EventBus.getInstance()
        const dlg = new SettingDialog(browserWindow)
        const wm = WindowsManager.getInstance()
        wm.add(dlg.getWindow())
        dlg.init()
    }
}

export default setting