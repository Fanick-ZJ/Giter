import { ExplorerProperties } from "@/types/fileExplorerType";
import { IpcRendererBasicTaskService } from "./ipcRendererBasicTaskService";

export class ExplorerTaskService extends IpcRendererBasicTaskService{
    showOpenDialog(params: {
        title: string;
        filters: Electron.FileFilter[];
        properties?: any;
        buttonLabel?: string | undefined;
        defaultPath?: string | undefined;
    }): Promise<string[]>{
        return this.invoke(window.explorerAPI.showOpenDialog, params)
    }
    isPathExist(path: string) {
        return this.invoke(window.explorerAPI.isPathExist, path)
    }
    extractIcon (ext: string){
        return this.invoke(window.explorerAPI.extractIcon, ext)
    }

    readImage(path: string) {
        return this.invoke(window.explorerAPI.readImage, path)
    }
}