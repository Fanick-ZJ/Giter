import { MenuCallback, MenuSetting } from "@/renderer/types"

export enum KeyMap {
    Tab,
    Clear,
    Enter,
    Shift,
    Control,
    Alt,
    Pause,
    Capsock,
    Escape,
    space,
    Prior,
    Next,
    End,
    Home,
    Left,
    Up,
    Right,
    Down,
    Select,
    Print,
    Execute,
    Insert,
    Delete,
    Help,
    equa,
    excla,
    quotedb,
    sectio,
    dollar,
    percent,
    ampersand,
    slas,
    parenlef,
    parenrigh,
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    i,
    j,
    k,
    l,
    m,
    n,
    o,
    p,
    q,
    r,
    s,
    t,
    u,
    v,
    w,
    x,
    y,
    z,
    KP_0,
    KP_1,
    KP_2,
    KP_3,
    KP_4,
    KP_5,
    KP_6,
    KP_7,
    KP_8,
    KP_9,
    KP_Multiply,
    KP_Add,
    KP_Separator,
    KP_Subtract,
    KP_Decimal,
    KP_Divide,
    F1,
    F2,
    F3,
    F4,
    F5,
    F6,
    F7,
    F8,
    F9,
    F10,
    F11,
    F12,
    F13,
    F14,
    F15,
    F16,
    F17,
    F18,
    F19,
    F20,
    F21,
    F22,
    F23,
    F24,
    Num_Lock,
    Scroll_Lock,
    acute_grave,
    semicolon,
    underscore,
    colon,
    apostrophe,
    hyphen_macron,
    registered,
    guillemotright,
    ordfeminine,
    AE,
    yen,
    exclamdown,
    onehalf_threequarters,
    greater_bar,
    asterisk_asciitilde,
    division,
    Acircumflex,
    Ecircumflex,
    Icircumflex,
    Ocircumflex,
    Ucircumflex,
    Ntilde,
    Yacute,
    Ooblique,
    Aring,
    Ccedilla,
    THORN,
    ETH,
    cedilla_currency,
    Agrave_atilde_Atilde,
    Egrave,
    Igrave,
    Ograve_otilde_Otilde,
    Ugrave,
    Adiaeresis,
    Ediaeresis,
    Idiaeresis,
    Odiaeresis,
    Udiaeresis,
    question_backslash,
    degree,
    sterling,
    Mode_switch,
}

// 菜单项类型
export enum ContextMenuItemType {
    Action,
    SubMenu,
    Separator,
}


export type CustomMouseMenuOptions = {
    menuList: MenuSetting[]
    menuWidth?: number
    hasIcon?: boolean
    iconType?: string
    menuWrapperCss?: Record<string, string>
    menuItemCss?: Record<string, string>
    params?: any
    appendToBody?: boolean
    menuHiddenFn?: MenuCallback
    el?: HTMLElement
    customClass?: string
    disabled?: MenuCallback<boolean>
    injectCloseListener?: boolean;
    onOpen?: MenuCallback;
    onClose?: MenuCallback;
}