/**
 * 窗口管理类
 */

import { BrowserWindow } from "electron"
import { logger } from "@/electron/logger/init"

class WindowActivityList {

    private _buf: Array<number>

    constructor () {
        // Oldest             Newest
        //  <number>, ... , <number>
        this._buf = []
    }
  
    // 获取最新的窗口
    getNewest () {
        const { _buf } = this
            if (_buf.length) {
                return _buf[_buf.length - 1]
            }
        return null
    }
    // 获取第二新的窗口
    getSecondNewest () {
        const { _buf } = this
        if (_buf.length >= 2) {
            return _buf[_buf.length - 2]
        }
        return null
    }
  
    setNewest (id: number) {
        // I think we do not need a linked list for only a few windows.
        const { _buf } = this
        const index = _buf.indexOf(id)  // 拿到要设置的窗口id在活动窗口列表中的位置
        if (index !== -1) { // 如果存在于窗口列表之中的话
            const lastIndex = _buf.length - 1   // 获取应该放置的id位置
            if (index === lastIndex) {  // 如果已经是最后的话，就直接结束
                return
            }
            _buf.splice(index, 1)   // 将其从原有原有位置中删去
        }
        _buf.push(id)   // 将其放到最后
    }
  
    delete (id: number) {
        const { _buf } = this
        const index = _buf.indexOf(id)
        if (index !== -1) {
            _buf.splice(index, 1)
        }
    }
  }

export class WindowsManager{

    private _windows = new Map<number, BrowserWindow>()
    private _activeList = new WindowActivityList()

    private _main_window?: BrowserWindow

    private static _instance: WindowsManager
    private constructor(){
    }

    static getInstance(mainWin?: BrowserWindow): WindowsManager {
        if (!WindowsManager._instance) {
            WindowsManager._instance = new WindowsManager()
        }
        if (mainWin) {
            if (this._instance._main_window) {
                throw new Error('main window has been set')
            } else {
                this._instance.setMainWindow(mainWin)
            }
        } else {
            if (!this._instance._main_window) {
                throw new Error('main window has not been set')
            }
        }
        return WindowsManager._instance
    }

    /**
     * 设置主窗体
     * @param window 
     * @param setNews 是否将窗口设为置顶
     */
    setMainWindow(window: BrowserWindow, setTop: boolean = true){
        if(setTop){
            this.setNewest(window)
        }
        if(!this._windows.has(window.id)){
            this.add(window)
        }
        this._main_window = window
    }

    /**
     * 设置最新的窗口并置顶
     * @param window 
     */
    setNewest(window: BrowserWindow){
        const wid = window.id
        if (!this._windows.has(wid)){
            this._windows.set(wid, window)
        }
        this._activeList.setNewest(wid)
        window.moveTop()    // 设置窗口置顶
    }

    /**
     * 添加窗体
     * @param window 
     */
    add(window: BrowserWindow) {
        let wid = window.id
        this._windows.set(wid, window)
        window.on('focus', () => {
            this._activeList.setNewest(wid)
        })

        window.on('close', () => {
            this._activeList.delete(wid)
            this._windows.delete(wid)
        })
    }
    
    /**
     * 关闭并移除窗体
     * @param wid 
     */
    remove(wid: number){
        this._windows.get(wid)?.close()
        this._windows.delete(wid)
        this._activeList.delete(wid)
    }
    /**
     * 获取窗体
     * @param wid 
     * @returns 
     */
    get(wid: number): BrowserWindow | undefined{
        return this._windows.get(wid)
    }

    /**
     * 获取主窗体
     * @returns 
     */
    getMain(): BrowserWindow {
        // @ts-ignore
        return this._main_window
    }

    /**
     * 判断窗体是不是最近点击过的
     * @param wid 
     * @returns 
     */
    isNewest(wid: number): boolean {
        return this._activeList.getNewest() == wid 
    }
    

}
