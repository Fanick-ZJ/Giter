import { ipcRenderer } from "electron";

export const TaskRenderSender = {
    clear: (
        path?: string | string[]
    ) => {
        ipcRenderer.send('task::clear', path)
    }
}