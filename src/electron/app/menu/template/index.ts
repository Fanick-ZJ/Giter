// 主进程页面菜单

import {tr} from "@/electron/app/lang/translate";
import { MenuItemConstructorOptions} from "electron";
import file from './file'
import setting from "./setting";

// 引入翻译'
export const mainMenu:MenuItemConstructorOptions[] =[
    file,
    setting,
    {
        label: tr('select')     // 搜索
    }
]
