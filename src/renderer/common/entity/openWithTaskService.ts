import { OpenWithApp } from "@/types";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";

export class OpenWithTaskService extends IpcRendererBasicTaskService{
    getAllApp() {
        return this.invoke(window.explorerAPI.getAllOpenWithApps)
    }

    delApp(path: string) {
        return this.invoke(window.explorerAPI.delOpenWithApp, path)
    }

    getApp(path: string) {
        return this.invoke(window.explorerAPI.getOpenWithApp, path)
    }

    async addApp(path: string): Promise<OpenWithApp| undefined> {
        const has = await this.getApp(path) != null
        if (has) {
            window.dialogAPI.showWarnDialog('error', 'The app has appended')
            return
        }
        const icon = await this.invoke(window.explorerAPI.extractIcon, path)
        if (typeof icon === 'string') {
            const invokeRet = this.invoke(window.explorerAPI.addOpenWithApp, {
                path,
                icon,
                name: path.split('\\').pop() || '',
                groups: []
            })
            return invokeRet.then(() => {
                return {
                    path,
                    icon,
                    name: path.split('\\').pop() || '',
                    groups: []
                }
            })
        } else {
            window.dialogAPI.showWarnDialog('error', 'extract icon error')
        }
    }
}