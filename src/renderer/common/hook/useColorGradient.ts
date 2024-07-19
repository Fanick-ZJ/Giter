import { Ref, isRef, onUnmounted, reactive, watch, WatchStopHandle } from "vue";
import { gsap } from 'gsap'
type rgb = `rgb(${number}, ${number}, ${number})`
type rgba = `rgb(${number}, ${number}, ${number}, ${number})`
type Tween = gsap.core.Tween
type EaseString = gsap.EaseString
type Color = {value: rgb | rgba}

export interface ColorGradientOptions {
    startColor: Ref<rgb | rgba> | rgb | rgba
    endColor: Ref<rgb | rgba> | rgb | rgba
    duration: Ref<number> | number
    ease?: EaseString
    startFn?: () => void
    endFn?: () => void
}

export interface ColorGradientFunction {
    // 当前渐变的颜色
    curColor: Color
    // 从当前位置往终点渐变
    start: () => void
    // 从头开始渐变
    startAnew: () => void
    // 反转渐变
    reverse: () => void
    // 反转渐变到当前位置
    reverseToCurColor: () => void
    // 重置起点
    restore: () => void
    // 暂停
    pause: () => void
    // 取消暂停
    unpause: () => void
    // 移除渐变
    removeGradient: () => void
}
export const useColorGradient = (opts: ColorGradientOptions) : ColorGradientFunction=> {
    let toTimeLine: Tween
    let _pause = false
    let removed = false
    
    const curColor= reactive<Color>({value: isRef(opts.startColor) ? opts.startColor.value : opts.startColor })
    const colorList: Color[] =[
        {value: isRef(opts.startColor) ? opts.startColor.value : opts.startColor },
        {value: isRef(opts.endColor) ? opts.endColor.value : opts.endColor },
    ]

    let unwatch1: WatchStopHandle
    if (isRef(opts.startColor)) {
        unwatch1 = watch(opts.startColor, (val) => {
            curColor.value = val
        })
    }
    let unwatch2: WatchStopHandle
    if (isRef(opts.endColor)) {
        unwatch2 = watch(opts.endColor, (val) => {
            colorList[1].value = val
        })
    }

    const start = () => {
        if (_pause || removed) return
        if (opts.startFn) opts.startFn()
        toTimeLine && toTimeLine.kill()
        toTimeLine = colorGradient(curColor, colorList[1], opts.ease, isRef(opts.duration) ? opts.duration.value : opts.duration)
    }

    const startAnew = () => {
        if (_pause || removed) return
        if (opts.startFn) opts.startFn()
        curColor.value = colorList[0].value
        start()
    }

    const reverse = () => {
        if (_pause || removed) return
        if (opts.endFn) opts.endFn()
        toTimeLine && toTimeLine.kill()
        curColor.value = colorList[1].value
        toTimeLine = colorGradient(curColor, colorList[0], opts.ease, isRef(opts.duration) ? opts.duration.value : opts.duration)
    }

    const reverseToCurColor = () => {
        if (_pause || removed) return
        if (opts.endFn) opts.endFn()
        toTimeLine && toTimeLine.kill()
        toTimeLine = colorGradient(colorList[1], curColor, opts.ease, isRef(opts.duration) ? opts.duration.value : opts.duration)
    }

    const restore = () => { curColor.value = colorList[0].value}

    const pause = () => { _pause = true}
    const unpause = () => { _pause = false}
    const removeGradient = () => { 
        removed = true
        unwatch1 && unwatch1()
        unwatch2 && unwatch2()
    }

    onUnmounted(() => {
        unwatch1 && unwatch1()
        unwatch2 && unwatch2()
        toTimeLine && toTimeLine.kill()
    })

    return  {
        curColor,
        start,
        startAnew,
        reverse,
        reverseToCurColor,
        restore,
        pause,
        unpause,
        removeGradient
    }
}

const colorGradient = (target: Color, end: Color, ease?: EaseString, duration?: number): Tween => {
    return gsap.to(target, {
        value: end.value,
        duration
    })
}