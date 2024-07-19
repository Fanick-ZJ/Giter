import { ExplorerProperties } from "@/types/fileExplorerType";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";

export class ConfigTaskService extends IpcRendererBasicTaskService{
    setLanguage(lang: string): Promise<boolean> {
        return this.invoke(window.configAPI.setLanguage, lang)
    }

    getLanguage(): Promise<string> {
        return this.invoke(window.configAPI.getLanguage)
    }
}