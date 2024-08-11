import { Ref } from "vue";
import { get } from '../util/dbUtil';

/**
 * 
 * @param bar dragbar element
 * @param size1 if the direction is horizontal, size1 is the left element width and size2 is the right, if the direction is vertical, size1 is the top element height and size2 is the bottom
 * @param size2 
 * @param direction horizontal or vertical
 */
export const useDragBar = (
    bar: HTMLElement,
    wrapper: HTMLElement,
    size1: Ref<number>,
    size2: Ref<number>, 
    min: number,
    direction: 'horizontal' | 'vertical'
) => {
    let dragEnable = true 
    let isDragging = false
    let start = 0
    if (direction === 'horizontal') {
        bar.style.cursor = 'ew-resize'
    } else if (direction === 'vertical') {
        bar.style.cursor = 'ns-resize'
    } else {
        bar.style.cursor = 'not-allowed'
        dragEnable = true
    }
    bar.onmousedown = (e) => {
        start = e.clientX
        isDragging = true
    }
    document.onmousemove = (e) => {
        if (isDragging && dragEnable) {
            let wrapperSize
            let old = size1.value
            let delta
            let isEdge = false
            if (direction === 'horizontal') {
                // 在获取偏移值
                if (e.clientX < wrapper.getBoundingClientRect().left || e.clientX > wrapper.getBoundingClientRect().right) {
                    isDragging = false
                    return
                }
                delta = e.clientX - start
                start = e.clientX
                wrapperSize = wrapper.getBoundingClientRect().width
            } else if (direction === 'vertical') {
                if (e.clientY < wrapper.getBoundingClientRect().top || e.clientY > wrapper.getBoundingClientRect().bottom) {
                    isDragging = false
                    return
                }
                delta = e.clientY - start
                start = e.clientY
                wrapperSize = wrapper.getBoundingClientRect().height
            }
            if (size1.value + delta <= min) {
                // size1.value = min
                size1.value = wrapperSize - size2.value
                isEdge = true
            } else if (size2.value - delta <= min) {
                size2.value = wrapperSize - size1.value
                isEdge = true
            } else {
                size1.value += delta
                size2.value -= delta
            }
            if (isEdge) {
                direction === 'horizontal'
                ? bar.style.left = `${size1.value}px`
                : bar.style.top = `${size1.value}px`
            } else {
                direction === 'horizontal'
                ? bar.style.left = `${old + delta}px`
                : bar.style.top = `${old + delta}px`
            }
        }
    }
    document.onmouseup = () => {
        isDragging = false
    }

    const cancel = () => {
        dragEnable = false
    }

    return {
        cancel
    }
    
}