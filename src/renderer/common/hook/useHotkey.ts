import { Ref, unref } from "vue";
import useEventListener from "./useEventListener";

export interface HotKeyOptions {
    key: string | string[]
    target: Ref<EventTarget | null> | EventTarget | null
    shiftKey: string
    directions: string
    ctrlKey: boolean
    exact: boolean // 当exact设置为true时，表示在判断快捷键是否匹配时，不仅需要考虑按下的按钮是否匹配，还需要考虑是否同时满足ctrl和shift的匹配
}

export interface HotKeyFunction {
    (...args: any[]): any
    hotKey?: (string | string[])[]
    directions?: string
    pause?: () => void
    unpause?: () => void
    removeListener?: () => void
}


export const useHotKey = (hotKeyFunction: HotKeyFunction, opts?: Partial<HotKeyOptions>) : HotKeyFunction => {
    const target = opts?.target ?? window   // 有对象就挂载到对象上，没有就挂载到windows上
    let paused: boolean = false
    let key = opts?.key
    
    const getHotKey = (): (string | string[])[] => {
        const options = opts || {}
        const keyCombination: string[] = []
        if (options.ctrlKey) keyCombination.push('ctrl')
        if (options.shiftKey) keyCombination.push('shift')
        if (key) {
            // @ts-ignore
            keyCombination.push(key)
        }
        return keyCombination
    }

    const handleKeydownEvent = (event: KeyboardEvent) => {
        event.stopPropagation()
        const options = opts || {}
        if (paused || !key) return 
        // 将快捷键都放到数组中，已经是数组的不变
        key = typeof key === 'string' ? [key] : key
        if (key.includes(event.key.toLowerCase()) && matchKeyScheme(options, event)) {
            event.preventDefault()
            const result = hotKeyFunction()
            if (typeof result !== 'function') return
            const targetElement: EventTarget = unref(target) ?? window
            const handleKeyup = (event: Event) => {
                event.preventDefault()
                result()
                targetElement.removeEventListener('keyup', handleKeyup)
            }
            targetElement.addEventListener('keyup', handleKeyup)
        }
    }
    const removeLIstener = useEventListener(target, 'keydown', handleKeydownEvent);
    hotKeyFunction.hotKey = getHotKey()
    hotKeyFunction.directions = opts?.directions ?? ''
    hotKeyFunction.removeListener = removeLIstener
    hotKeyFunction.pause = () => (paused = true)
    hotKeyFunction.unpause = () => (paused = false)
    return hotKeyFunction
}

const matchKeyScheme = (
    opts: Pick<Partial<HotKeyOptions>, 'shiftKey' | 'ctrlKey' | 'exact'>,
    event: KeyboardEvent
): boolean => {
    const ctrlKey = opts.ctrlKey ?? false
    const shiftKey = opts.shiftKey ?? false
    if (opts.exact) {
        return (ctrlKey === event.metaKey || ctrlKey === event.ctrlKey) && shiftKey === event.shiftKey
    }
    const statifiedKeys: boolean[] = []
    statifiedKeys.push(ctrlKey === event.metaKey || ctrlKey === event.ctrlKey)
    statifiedKeys.push(shiftKey === event.shiftKey)
    return statifiedKeys.every((v) => v)
}