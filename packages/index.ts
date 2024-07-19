import fs from 'fs'
import path from 'path'
import { dependencies } from './dependencies.lib'
import others from './extra.res.json'
import { OUT_DIR } from './const'

const externalModel = ['electron', 'better-sqlite3']


function traverseFolder(folderPath: string, relavitePath: string) {
    const files = new Array<string>()
    const items = fs.readdirSync(folderPath);
    items.forEach(item => {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
            files.push(...traverseFolder(itemPath, relavitePath))
        } else if (stats.isFile()) {
            let target = itemPath.slice(relavitePath.length + 1)
            files.push(target);
        }
    })
    return files
}

//获取preload中的文件
const preload = traverseFolder(path.join(path.dirname(__dirname), 'src', 'electron', 'app', 'preload'), path.join(path.dirname(__dirname)))
//打包预加载文件
const buildBackground = () => {
    // 使用esbuild将ts文件编译为js文件
    require('esbuild').buildSync({
        entryPoints: ['src/electron/background.ts', ...preload],
        bundle: true,
        outdir: `${OUT_DIR}/electron/`,
        platform: 'node',
        target: 'node12',
        external: externalModel,
        loader: {'.node':'copy'} 
    })
}

// 获取工作线程文件列表
const workThreads = traverseFolder(path.join(path.dirname(__dirname), 'src', 'electron', 'workers'), path.join(path.dirname(__dirname)))
// 打包获取工作线程文件
const buildWorkThreads = () => {
    require('esbuild').buildSync({
        entryPoints: workThreads,
        bundle: true,
        outdir: `${OUT_DIR}/electron/workers`,
        platform: 'node',
        target: 'node12',
        external: externalModel
    })
}


// 获取子进程文件列表
const childProcess = traverseFolder(path.join(path.dirname(__dirname), 'src', 'electron', 'process'), path.join(path.dirname(__dirname)))
// 打包获取工作线程文件
const subProcess = () => {
    require('esbuild').buildSync({
        entryPoints: childProcess,
        bundle: true,
        outdir: `${OUT_DIR}/electron/process`,
        platform: 'node',
        target: 'node12',
        external: externalModel
    })
}

/**
 * 拷贝数据库文件
 */
const copyExtraResource = () => {
    for (const f of others) {
        const libPath = path.join(path.dirname(__dirname), ...f.origin)
        const distPath = path.join(path.dirname(__dirname), OUT_DIR, ...( process.env.NODE_ENV === 'development' ? f.dev : f.build))
        if (!fs.existsSync(distPath)) {
            if (!fs.existsSync(path.dirname(distPath))) {
                fs.mkdirSync(path.dirname(distPath), { recursive: true })
            }
            fs.copyFileSync(libPath,distPath)
        }
    }
}

const copyDependenciesLib = () => {
    for (const dep of dependencies) {
        const libPath = path.join(path.dirname(__dirname), ...dep.origin)
        const distPath = path.join(path.dirname(__dirname), OUT_DIR, ...( process.env.NODE_ENV === 'development' ? dep.dev : dep.build))
        if (!fs.existsSync(distPath)) {
            if (!fs.existsSync(path.dirname(distPath))) {
                fs.mkdirSync(path.dirname(distPath), { recursive: true })
            }
            fs.copyFileSync(libPath,distPath)
        }
    }
}


export const build = () => {
    buildBackground()
    buildWorkThreads()
    subProcess()
    copyExtraResource()
    // copyDependenciesLib()
}