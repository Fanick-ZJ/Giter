// 这个文件用于声明渲染进程与主进程沟通的方法
import { RouteInfo } from '@/types/routeParamType'
import { IpcRendererEvent } from 'electron'
import {defineStore} from 'pinia'
import { useRouter } from 'vue-router'



export const useMainRoute = defineStore('mainRoute', () => {
    // 这个形式的router这能在setup形式中使用
    const router = useRouter()
    // 指定去那个地方
    const routeTo = () => {
        window.routeAPI.routeTo((event: IpcRendererEvent, routeInfo: RouteInfo<any>) => {
            const path = `${routeInfo.path}/${[...Object.values(routeInfo)].reduce((acc, val) => acc += `/${val}`)}`
            router.push(routeInfo.path)
        })
    }

    return {routeTo}
})