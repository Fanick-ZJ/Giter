import { ExplorerProperties } from "@/types/fileExplorerType";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";

export class ConfigTaskService extends IpcRendererBasicTaskService{
    async setLanguage(lang: string): Promise<boolean> {
        return this.enqueue(window.configAPI.setLanguage, lang)
    }

    async getLanguage(): Promise<string> {
        return this.enqueue(window.configAPI.getLanguage)
    }
}