import { ExplorerProperties } from "@/types/fileExplorerType";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";

export class ExplorerTaskService extends IpcRendererBasicTaskService{
    async showOpenDialog(params: {
        title: string;
        filters: Electron.FileFilter[];
        properties?: any;
        buttonLabel?: string | undefined;
        defaultPath?: string | undefined;
    }): Promise<string[]>{
        return this.enqueue(window.explorerAPI.showOpenDialog, params)
    }
    async isPathExist(path: string) {
        return this.enqueue(window.explorerAPI.isPathExist, path)
    }
    async extractIcon (ext: string){
        return this.enqueue(window.explorerAPI.extractIcon, ext)
    }

    async readImage(path: string) {
        return this.enqueue(window.explorerAPI.readImage, path)
    }
}