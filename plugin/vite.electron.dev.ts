// 开发环境的electron插件
import type {Plugin} from 'vite'
import type { AddressInfo } from 'net'
import chokidar from 'chokidar'
import {spawn} from 'child_process' //spawn可以返回一个进程的信息
import fs from 'fs'
import {build} from '../packages'


// vite 插件必须导出一个对象，必须要现有name
// 这个对象有很多的钩子
export const ElectronDevPlugin = (): Plugin => {
    return {
        name: 'electron-dev',
        //配置vite钩子
        configureServer (server) {
            build()
            server.httpServer?.once('listening', () => {
                // 读取vite服务的信息
                const addressInfo = server.httpServer?.address() as AddressInfo
                // 拼接ip地址, 给electron启动服务的时候要用
                const ip = `http://localhost:${addressInfo.port}`
                // 第一个参数是electron的入口文件，返回是一个路径
                //electron 不认识ts文件，编译成js文件
                // spawn请求了默认的electron包，执行了默认的窗体（猜想）
                // 进程传参发送给electron
                /*
                 *require('electron') => 返回
                    'E:\\workSpace\\JavaScript\\Giter\\node_modules\\electron\\build\\electron.exe 
                    是一个可执行对象，它可以接收一个js对象并执行他
                    在electron进程中，读到的第一个参数是electron, 以此类推
                 */ 
                let ElectronProcess = spawn(require('electron'), ['build/electron/background.js',ip])
                //开发模式下热更新防止出现多个窗口
                const watcher = chokidar.watch('src/electron/', {
                    persistent: true,   // 在监听任务执行期间继续执行
                    ignoreInitial: true, // 忽略初始化事件监听器时的加载操作
                    awaitWriteFinish: true,
                    ignorePermissionErrors: true,
                    atomic: true
                  })
                watcher.on('all', () => {
                    // 杀死之前的进程
                    ElectronProcess.kill()
                    build()
                    //重启进程
                    ElectronProcess = spawn(require('electron'), ['build/electron/background.js',ip])
                })
                ElectronProcess.stderr.on('data', data => {
                    console.log('日志', data.toString()) 
                })
                ElectronProcess.stderr.on('error', data => {
                    console.error('错误', data.toString()) 
                })
            })
        }
    }
}