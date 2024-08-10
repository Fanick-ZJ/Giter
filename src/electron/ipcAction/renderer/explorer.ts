import { ipcRenderer } from "electron";

export const explorerSender = {
    open: (path: string) => ipcRenderer.send('explorer::open', path),
    showOpenDialog: (
        params: {
            title: string,
            filters: Electron.FileFilter[],
            properties?:(   'openFile'
                            |'openDirectory'
                            | 'multiSelections'
                            | 'showHiddenFiles'
                            | 'promptToCreate'
                            | 'dontAddToRecent'
                        )[],
            buttonLabel?: string,
            defaultPath?: string
        },
        taskId: string
    ) => {
        return ipcRenderer.invoke('explorer::showOpenDialog', params, taskId)
    },
    isPathExist: (path: string, taskId: string) => ipcRenderer.invoke('explorer::isPathExist', path, taskId),
    extractIcon: (ext: string, taskId: string) => ipcRenderer.invoke('explorer::extractIcon', ext, taskId),
    readImage: (path: string, taskId: string) => ipcRenderer.invoke('explorer::readImage', path, taskId),
    // 关于打开方式相关的
    getAllOpenWithApps: () => ipcRenderer.invoke('explorer::getAllOpenWithApps'),
    getOpenWithApp: (
        path: string
    ) => ipcRenderer.invoke('explorer::getOpenWithApp', path),
    delOpenWithApp: (
        path: string,
        taskId: string
    ) => ipcRenderer.invoke('explorer::delOpenWithApp', path, taskId),
    addOpenWithApp: (
        param: {
            path: string, 
            name: string, 
            icon: string, 
            groups: string[]
        }
    ) => ipcRenderer.invoke('explorer::addOpenWithApp', param),
    getApp: (path: string, taskId: string) => ipcRenderer.invoke('explorer::getApp', path),
}