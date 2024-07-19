import fs from 'fs'
import path from 'path'
import { logger } from "@/electron/logger/init"
import { readdir } from 'original-fs'
import { FileInfo, FileTypeMap, GetFileListOption, TextFileTypeMap } from '../types'

export const isPathExist = (path: string):Boolean => {
    try{
        return fs.existsSync(path)
    }catch(error){
        logger.error(error)
        // TODO 界面提示报错结果
        return false
    }
}


const getFileInfo = (name: string, dir: string): FileInfo => {
    const stat = fs.statSync(path.join(dir, name))
    const split = name.split('.')
    return {
        name: name,
        path: dir,
        extension: stat.isDirectory() 
                    ?   'folder'
                    :split.length == 0
                    ? ''
                    : split[split.length - 1],
        size: stat.size,
        modified: new Date(stat.mtimeMs),
        isFolder: stat.isDirectory(),
        children: stat.isDirectory() ? [] : undefined
    }
}

const isIgnore = (dirent: fs.Dirent, ignoreFile: string[], ignoreDir: string[]): boolean => {
    if (dirent.isDirectory()){
        return ignoreDir.find(item => dirent.name == item) != undefined
    }
    else {
        return ignoreFile.find(item => dirent.name == item) != undefined
    }
}
const _getFileList = (fpath: string, list: FileInfo[], opts?: GetFileListOption) => {
    const fileList = fs.readdirSync(fpath, {
        encoding: 'utf-8',
        recursive: false,
        withFileTypes: true
    })
    fileList.forEach(item => {
        const ignoreFile = opts?.ignoreFile ? opts.ignoreFile : []
        const ignoreDir = opts?.ignoreDir ? opts.ignoreDir : []
        if (isIgnore(item, ignoreFile, ignoreDir)) return
        const fileInfo = getFileInfo(item.name, item.path)
        list.push(fileInfo)
        // 如果递归的话
        if (opts?.recursive && opts.recursive){
            if (item.isDirectory()){
                const children: FileInfo[] = []
                _getFileList(path.join(item.path, item.name),children, opts)
                fileInfo.children = children
            }
        }
    })
}

export const getFileList = (path: string, opts?: GetFileListOption) => {
    const fileList: FileInfo[] = []
    if (opts?.sync && opts.sync){
        _getFileList(path, fileList, opts)
        return fileList
    }else{
        return new Promise((resolve, reject) => {
            _getFileList(path, fileList)
            return resolve(fileList)
        })
    }
}

export const fileToList = (fpath: string, list: FileInfo[], from?: string) => {
    const pathSliceList = from && fpath.indexOf(from) == 0 ? fpath.slice(from.length + 1).split('\\') : fpath.split('\\')
    let tmpList = list      // tmpList 为遍历到的额当级目录
    for(let i = 0 ; i < pathSliceList.length; i++) {
        const pathSlice = pathSliceList[i]
        const nextList = tmpList.find(item => item.name == pathSlice)
        if (nextList) {
            if (!nextList.children) nextList.children = []
            tmpList = nextList.children
        } else {
            const dir = from && fpath.indexOf(from) == 0 ? path.join(from, pathSliceList.slice(0, i).join('/')) : pathSliceList.slice(0, i).join('/')
            const fileInfo = getFileInfo(pathSlice, dir)
            tmpList.push(fileInfo)
            if (fileInfo.isFolder){
                if (!fileInfo.children) fileInfo.children = []
                tmpList = fileInfo.children
            }
        }
    }
}

export const inferFileTypeFromName = (fileName: string) => {
    const extension = fileName.split('.').pop();
    if (extension && TextFileTypeMap.hasOwnProperty(extension)) {
        return TextFileTypeMap[extension];
    }
    return 'unknow';
}