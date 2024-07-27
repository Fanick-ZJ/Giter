import { basename } from "@/renderer/common/util/file";
import { uuid } from "@/renderer/common/util/tools";
import { RepoFileInfo } from "@/types";
import { defineStore } from "pinia";
import _ from 'lodash'
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { RepoTaskService } from "@/renderer/common/entity/repoTaskService";
import { openedFile } from "@/renderer/types";

type PathId = string
export type FilePath = {
    path: string;   // 文件路径
    repo: string;   // 仓库路径
}

export type fileNaivgationItem = {
    id: string;   // 文件路径ID
    name: string;   // 文件名
}

export const useFileStore = defineStore('files', () => {
    const router = useRouter()
    const route = useRoute()
    const pathMap = new Map<PathId, FilePath>()
    const fileList = ref<RepoFileInfo[]>([])
    let fileNaivgation = ref<fileNaivgationItem[]>([])
    const openedFileList = ref<openedFile[]>([])
    const taskService = new RepoTaskService()
    // 添加文件路径
    const addFilePath = (repoPath: FilePath) => {
        const entries = pathMap.entries()
        for (const entiry of entries) {
            const value = entiry[1]
            if (value.repo === repoPath.repo
                && value.path === repoPath.path) {
                return entiry[0]
            }
        }
        const id = uuid()   // 生成唯一id
        pathMap.set(id, repoPath)
        return id
    }
    // 根据路径ID获取文件路径信息
    const getFilePath = (pathId: PathId) => {
        if (pathMap.get(pathId)) {
            return pathMap.get(pathId)!.path
        }else {
            return ''
        }
    }
    // 删除文件路径
    const removeFilePath = (pathId: PathId) => {
        pathMap.delete(pathId)
    }
    // 删除仓库对应的文件路径
    const removeFileByRepoPath = (repoPath: string) => {
        const entries = pathMap.entries()
        for (const entiry of entries) {
            const value = entiry[1]
            if (value.repo === repoPath) {
                pathMap.delete(entiry[0])
            }
        }
    }
    // 添加文件列表
    const resetFileList = (_fileList: RepoFileInfo[]) => {
        // 清空文件列表
        fileList.value.splice(0, fileList.value.length)
        fileList.value.push(..._fileList)
        fileNaivgation.value.splice(0, fileNaivgation.value.length)
    }
    // 获取文件列表
    const getFileList = () => {
        return fileList
    }
    const toPath = (filePath: FilePath) => {
        // 指定到一级菜单
        const fid = addFilePath(filePath)
        // 使用替换来更新，避免多次出现这个页面的历史记录
        const name = basename(filePath.path) == '' ? '/' : basename(filePath.path)
        fileNaivgation.value.push({id: fid, name})
        router.replace({
            path: spellPath(fid),
            replace: true
        })
    }
    const spellPath = (fid: string) => {
        return `/repos/files/${route.params.path}/${route.params.tag}/folder/${fid}`
    }
    // 删除文件列表
    const clearFileList = () => {
        fileList.value.splice(0, fileList.value.length)
    }
    const getFileByPath = (filePath: string) => {
        if (filePath == '') return []
        if (filePath == '/') return fileList.value
        const pathList = filePath.split('/')
        let tmpList = fileList.value
        for (const i in pathList){
            const found = tmpList.find(item => item.name === pathList[i])
            if (found) {
                if (found.isDir){
                    found.children && (tmpList = found.children)
                }else{
                    return found
                }
            } else {
                return []
            }
        }
        return tmpList
    }
    // 面包屑导航去除传入id之后的记录
   const fileNaviTo = (id: string) => {
        toPath({path: getFilePath(id), repo: route.params.path as string})
        const index = fileNaivgation.value.findIndex((value, index) => {
            if (value.id == id) return true
        })
        if (index == -1) return
        fileNaivgation.value = _.slice(fileNaivgation.value, 0, index + 1)
   }

   const addOpenedFile = (fileInfo: RepoFileInfo, repo: string, branch: string) => {
        if (openedFileList.value.find((item) => item.objectName === fileInfo.objectName)) return
        if (fileInfo.objectName){
            taskService.getFileContent(repo, fileInfo.objectName).then(content => {
                openedFileList.value.push({
                    ...fileInfo,
                    content,
                    repo,
                    branch
                })
            })
        }
   }

   const removeOpenedFile = (objectName: string) => {
        openedFileList.value = openedFileList.value.filter(item => item.objectName !== objectName)
   }

   const getOpenedFile = (objectName: string) => {
        return openedFileList.value.find(item => item.objectName === objectName)
   }

   return {
        pathMap,
        fileList,
        fileNaivgation,
        openedFileList,
        addFilePath,
        getFilePath,
        removeFilePath,
        spellPath,
        removeFileByRepoPath,
        resetFileList,
        getFileList,
        toPath,
        clearFileList,
        getFileByPath,
        fileNaviTo,
        addOpenedFile,
        removeOpenedFile,
        getOpenedFile,
   }
})