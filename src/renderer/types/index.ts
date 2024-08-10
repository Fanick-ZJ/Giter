import { RepoFileInfo } from "lib/git"
import { ComponentPublicInstance, VNode } from "vue"

/**
 * 二维坐标
 */
export interface TwoDPoint{
    x: number,
    y: number
}

export class TwoDimensionPos implements TwoDPoint {
    x: number = -1
    y: number = -1
    constructor(x: number=0, y: number=0){
        this.x = x
        this.y = y
    }
}
export interface CommitDetail {
    author_email: string,
    author_name: string,
    body: string,
    date: Date,
    hash: string,
    message: string,
    refs: string
 }
 
export type CurShowData = 'commits' | 'insertions' | 'deletions'

export type remoteRepoSiteIcon = 'mdi:github' | 'simple-icons:gitee' | undefined

export type StoreType = 'Repos' | 'ipcAction' | 'detailChartStore' | 'mainRoute' | never

// ------------------------------------------------- 右键菜单相关类型---------------------------------
export enum KeyMap {
    Tab = 'Tab',
    Clear = 'Clear',
    Enter = 'Enter',
    Shift = 'Shift',
    Ctrl = 'Ctrl',
    Alt = 'Alt',
    Pause = 'Pause',
    Capsock = 'Capsock',
    Escape = 'Escape',
    space = 'space',
    Prior = 'Prior',
    Next = 'Next',
    End = 'End',
    Home = 'Home',
    Left = 'Left',
    Up = 'Up',
    Right = 'Right',
    Down = 'Down',
    Select = 'Select',
    Print = 'Print',
    Execute = 'Execute',
    Insert = 'Insert',
    Delete = 'Delete',
    Help = 'Help',
    equa = 'equa',
    excla = 'excla',
    quotedb = 'quotedb',
    sectio = 'sectio',
    dollar = 'dollar',
    percent = 'percent',
    ampersand = 'ampersand',
    slas = 'slas',
    parenlef = 'parenlef',
    parenrigh = 'parenrigh',
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    H = 'H',
    I = 'I',
    J = 'J',
    K = 'K',
    L = 'L',
    M = 'M',
    N = 'N',
    O = 'O',
    P = 'P',
    Q = 'Q',
    R = 'R',
    S = 'S',
    T = 'T',
    U = 'U',
    V = 'V',
    W = 'W',
    X = 'X',
    Y = 'Y',
    Z = 'Z',
    KP_0 = 'KP_0',
    KP_1 = 'KP_1',
    KP_2 = 'KP_2',
    KP_3 = 'KP_3',
    KP_4 = 'KP_4',
    KP_5 = 'KP_5',
    KP_6 = 'KP_6',
    KP_7 = 'KP_7',
    KP_8 = 'KP_8',
    KP_9 = 'KP_9',
    KP_Multiply = 'KP_Multiply',
    KP_Add = 'KP_Add',
    KP_Separator = 'KP_Separator',
    KP_Subtract = 'KP_Subtract',
    KP_Decimal = 'KP_Decimal',
    KP_Divide = 'KP_Divide',
    F1 = 'F1',
    F2 = 'F2',
    F3 = 'F3',
    F4 = 'F4',
    F5 = 'F5',
    F6 = 'F6',
    F7 = 'F7',
    F8 = 'F8',
    F9 = 'F9',
    F10 = 'F10',
    F11 = 'F11',
    F12 = 'F12',
    F13 = 'F13',
    F14 = 'F14',
    F15 = 'F15',
    F16 = 'F16',
    F17 = 'F17',
    F18 = 'F18',
    F19 = 'F19',
    F20 = 'F20',
    F21 = 'F21',
    F22 = 'F22',
    F23 = 'F23',
    F24 = 'F24',
    Num_Lock = 'Num_Lock',
    Scroll_Lock = 'Scroll_Lock',
    acute_grave = 'acute_grave',
    semicolon = 'semicolon',
    underscore = 'underscore',
    colon = 'colon',
    apostrophe = 'apostrophe',
    hyphen_macron = 'hyphen_macron',
    registered = 'registered',
    guillemotright = 'guillemotright',
    ordfeminine = 'ordfeminine',
    AE = 'AE',
    yen = 'yen',
    exclamdown = 'exclamdown',
    onehalf_threequarters = 'onehalf_threequarters',
    greater_bar = 'greater_bar',
    asterisk_asciitilde = 'asterisk_asciitilde',
    division = 'division',
    Acircumflex = 'Acircumflex',
    Ecircumflex = 'Ecircumflex',
    Icircumflex = 'Icircumflex',
    Ocircumflex = 'Ocircumflex',
    Ucircumflex = 'Ucircumflex',
    Ntilde = 'Ntilde',
    Yacute = 'Yacute',
    Ooblique = 'Ooblique',
    Aring = 'Aring',
    Ccedilla = 'Ccedilla',
    THORN = 'THORN',
    ETH = 'ETH',
    cedilla_currency = 'cedilla_currency',
    Agrave_atilde_Atilde = 'Agrave_atilde_Atilde',
    Egrave = 'Egrave',
    Igrave = 'Igrave',
    Ograve_otilde_Otilde = 'Ograve_otilde_Otilde',
    Ugrave = 'Ugrave',
    Adiaeresis = 'Adiaeresis',
    Ediaeresis = 'Ediaeresis',
    Idiaeresis = 'Idiaeresis',
    Odiaeresis = 'Odiaeresis',
    Udiaeresis = 'Udiaeresis',
    question_backslash = 'question_backslash',
    degree = 'degree',
    sterling = 'sterling',
    Mode_switch = 'Mode_switch',
}

// 使用回调是是为了在某些情况下想要动态生成一些东西
export type MenuCallback<T = any> = (arg0?: any, arg1?: HTMLElement | null, arg2?: HTMLElement | null, arg3?: MouseEvent) => T
export type MenuSetting = {
    fn ?: MenuCallback
    label?: string | MenuCallback<string>
    hotKey?: KeyMap | KeyMap[] | MenuCallback<KeyMap | KeyMap[]>
    hidden?: boolean | MenuCallback<boolean>
    disabled?: boolean | MenuCallback<boolean>
    icon?: string | MenuCallback | VNode
    line?: boolean
    children?: MenuSetting[]
    customClass?: string | MenuCallback<string>
}

export type ContextMenuListenFn = (e: MouseEvent) => void
export type PreventCheckFn = (e?: TouchEvent, el?: HTMLElement) => boolean


// 打开的文件
export type openedFile = RepoFileInfo
            & Record<'content', string>
            & Record<'repo', string>
            & Record<'branch', string>
