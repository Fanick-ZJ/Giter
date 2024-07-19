import { BrowserWindow, globalShortcut } from "electron"
import { EventBus } from "@/electron/event/EventBus"

const bus = EventBus.getInstance()
let win: BrowserWindow
/**
 * 注册快捷键函数
 * @param shortcut 需要快捷键 
 * @param func 按下后执行的函数
 * @returns 是否注册成功
 */
const register = (shortcut: string, func: Function) => {
    let flag = false
    try{
        flag = globalShortcut.isRegistered(shortcut)
        if (flag) return true
        flag = globalShortcut.register(shortcut, () => {
            func()
        })
    }catch (e) {
        console.log(e)
    }finally {
        return flag
    }
}

export const registerBasicShortCut = () => {

}
