import { OpenWithApp } from "@/types";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";

export class OpenWithTaskService extends IpcRendererBasicTaskService{
    async getAllApp() {
        return this.enqueue(window.explorerAPI.getAllOpenWithApps)
    }

    async delApp(path: string) {
        return this.enqueue(window.explorerAPI.delOpenWithApp, path)
    }

    async getApp(path: string) {
        return this.enqueue(window.explorerAPI.getOpenWithApp, path)
    }

    async addApp(path: string): Promise<OpenWithApp| undefined> {
        const has = await this.getApp(path) != null
        if (has) {
            window.dialogAPI.showWarnDialog('error', 'The app has appended')
            return
        }
        const icon = await this.enqueue(window.explorerAPI.extractIcon, path)
        if (typeof icon === 'string') {
            const invokeRet = this.enqueue(window.explorerAPI.addOpenWithApp, {
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