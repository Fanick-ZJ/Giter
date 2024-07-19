import { DialogType } from "."
type RouteParamType = {}
// 路由参数类
export type RouteInfo<T extends RouteParamType> = {
    path: string,
    param?: T,

}

export interface RouteDialogParam extends RouteParamType{
    info: DialogType,
    content: string,
    wid: number
}