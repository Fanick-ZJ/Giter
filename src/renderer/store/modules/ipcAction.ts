// 这个文件用于声明渲染进程与主进程沟通的方法
import {defineStore} from 'pinia'
export const useIpcAction = defineStore('ipcAction', {
    actions: {
        /**
         * 在浏览器中打开仓库
         * @param path 
         */
        revealExplore(path: string) {
            window.explorerAPI.open(path)
        },
        showWarnDialiog(title: string, content: string) {
            window.dialogAPI.showWarnDialog(title, content)
        }
    }
})