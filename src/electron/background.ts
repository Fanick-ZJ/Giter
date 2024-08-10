
import { initEnv } from "./common/const/envvar"
import { DialogType } from "@/types"
import { TipDialog } from "./app/tipDialog"
import Giter from "./app/giter"
import { tr } from "./app/lang/translate"
import { app } from "electron"
import { WindowsManager } from "./win/windowManager"
import { actionInit } from "./app/actionInit"
import { hasGit } from "lib/git"
// 建立全局事件总线
// electron主进程文件
// 初始化log
initEnv()
// 如果还没安装git的话，就提示安装
if (hasGit()) {
    const giter = new Giter()
    giter.init()
} else {
    app.whenReady().then(() => {
        const dlg = new TipDialog(undefined, DialogType.ERROR, 'dialog.theGitHaveNotInstall', tr('warn'))
        dlg.init()
        const windowsManager = WindowsManager.getInstance(dlg.win)
        windowsManager.setMainWindow(dlg.win, true)
        // IPC事件初始化
        actionInit(windowsManager)
    })
}
