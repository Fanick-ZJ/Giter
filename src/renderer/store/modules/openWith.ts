// 这个文件用于声明渲染进程与主进程沟通的方法
import { OpenWithOption } from '@/renderer/components/common/openWith/types'
import { OpenWithApp } from '@/types'
import {defineStore} from 'pinia'
export const useOpenWith = defineStore('openWith', {
    state:(): OpenWithOption 
                & Record<'visible', boolean>
                & Record<'appList', OpenWithApp[]> => ({
        filePath: '',
        group: 'All',
        visible: false,
        attachTo: 'body',
        dialogStyle: {
            width: 500,
            height: 200,
            iconHeight: 40,
            iconWidth: 40,
            iconGap: 10
        },
        appList: []
    }),
    actions: {
        show(){
            this.visible = true
        },
        close(){
            this.visible = false
        },
        setOption(option: OpenWithOption){
            this.filePath = option.filePath
            this.group = option.group
            this.customerGroup = option.customerGroup
            this.attachTo = !option.attachTo ? this.attachTo: option.attachTo
            this.dialogStyle = !option.dialogStyle ? this.dialogStyle : option.dialogStyle
            this.afterFn = option.afterFn
        }
    }
})