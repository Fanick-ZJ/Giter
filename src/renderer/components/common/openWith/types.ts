import { Base64Icon, FileGroup, VoidFunc } from "@/types"
import { ComponentPublicInstance, Ref } from "vue"
import OpenWith from './index.vue';

//----------------------------------------打开方式相关类型-----------------------------------------
export type DialogStyle = {
    width: number
    height: number,
    iconWidth: number,
    iconHeight: number,
    iconGap: number,
}

export interface OpenWithOption {
    filePath: string,
    group: FileGroup,
    customerGroup?: string,
    attachTo?: string,
    dialogStyle?: DialogStyle,
    afterFn?: (...args: any) => void,
}

export type OpenWithController = {
    ctx: ComponentPublicInstance<typeof OpenWith>
    show: VoidFunc
    close: VoidFunc
}