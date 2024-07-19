<template>
    <div class="__draggable__bag__wrapper" 
        v-show="fileStore.openedFileList.length > 0"
        draggable="true" 
        ref="draggableBag"
        @dragstart="onDragStart"
        @drag="onDrag"
        @dragend="onDragEnd"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseExit">
        <div class="__draggable__bag__float-bag">
            <Icon icon="fluent-emoji:baggage-claim"  width="30" height="30"/>
        </div>
        <div class="__draggable__bag__tabbar"
            ref="tabbar">
            <div  v-show="showing">
                <template v-for="item in fileStore.openedFileList" >
                    <openedIcon :file="item"
                    :width="20"
                    :height="20"
                    v-editor="createOpenEditorProps(item)">
                    </openedIcon>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useFileStore } from '@/renderer/store/modules/files';
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';
import openedIcon from './openedIcon.vue';
import {CustomEditorOptions} from '@/renderer/components/common/editor/types';
import { RepoFileInfo } from '@/types';
import { getFileType } from '@/renderer/common/util/file';
import { openedFile } from '@/renderer/types';
import { uuid } from '@/renderer/common/util/tools';

const fileStore = useFileStore()

// 拖拽相关
const draggableBag = ref<HTMLElement>();
let beginX = 0
let beginY = 0
let posX = 0
let posY = 0
const dragging = ref(false)
onMounted(() => {
    draggableBag.value!.style.removeProperty('left')
    draggableBag.value!.style.removeProperty('top')
    draggableBag.value!.style.right = '10px'
    draggableBag.value!.style.bottom = '10px'
})
const onDragStart = (e: DragEvent) => {
    const img = new Image();
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' %3E%3Cpath /%3E%3C/svg%3E";
    // DataTransfer 对象用于保存拖动并放下（drag and drop）
    // 过程中的数据。它可以保存一项或多项数据，这些数据项可以
    // 是一种或者多种数据类型。关于拖放的更多信息
    // @ts-ignore
    e.dataTransfer.setDragImage(img, 0, 0);
    // 获取鼠标的位置
    beginX = e.clientX - draggableBag.value!.offsetLeft
    beginY = e.clientY - draggableBag.value!.offsetTop
    dragging.value = true
}

const onDrag = (e: DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return
    const height = draggableBag.value!.clientHeight
    const width = draggableBag.value!.clientWidth
    const clientX = draggableBag.value!.offsetLeft
    const clientY = draggableBag.value!.offsetTop
    const x = e.clientX - beginX
    const y = e.clientY - beginY
    if (clientX >= 0 && clientX + width <= window.innerWidth){
        posX = x
    } else {
        posX = x <= 0 ? 0 : window.innerWidth - width
    }
    if (clientY >= 0 && clientY + height <= window.innerHeight ){
        posY = y
    } else {
        posY = y <= 0 ? 0 : window.innerHeight - height
    }
    draggableBag.value!.style.top = posY + 'px'
    draggableBag.value!.style.left = posX + 'px'
}

const onDragEnd = (e: DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return
    const height = draggableBag.value!.clientHeight
    const width = draggableBag.value!.clientWidth
    const clientX = draggableBag.value!.offsetLeft
    const clientY = draggableBag.value!.offsetTop
    const x = e.clientX - beginX
    const y = e.clientY - beginY
    if (clientX <= 0 || clientX + width >= window.innerWidth){
        posX = x <= 0 ? 0 : window.innerWidth - width
    }
    if (clientY <= 0 || clientY + height >= window.innerHeight ){
        posY = y <= 0 ? 0 : window.innerHeight - height
    }
    draggableBag.value!.style.top = posY + 'px'
    draggableBag.value!.style.left = posX + 'px'
    dragging.value = false
}

// 文件tabbar相关
let wrapperPadding = 10
let iconMargin = 5
const tabbar = ref<HTMLElement>();
const showing = ref(false)
let enterFn: number = -1
let exitFn: number = -1

const onMouseEnter = (e: MouseEvent) => {
    if (dragging.value) return
    clearTimeout(exitFn)
    // console.log(rect)
    // 如果高度过了屏幕的一半的话
    // @ts-ignore
    enterFn = setTimeout(() => {
        showing.value = true
        const rect = draggableBag.value!.getBoundingClientRect()
        if (rect.height / 2 + rect.top > window.innerHeight / 2) {
            // 在下半区的时候，tabbar在上方
            const maxHeight = rect.bottom - wrapperPadding - rect.height
            const height = fileStore.openedFileList.length  * (30 + iconMargin)
            tabbar.value!.style.bottom = rect.height + 'px'
            tabbar.value!.style.height = height + 'px'
            tabbar.value!.style.maxHeight = maxHeight + 'px'
            tabbar.value!.style.borderTopLeftRadius = '10px'
            tabbar.value!.style.borderTopRightRadius = '10px'
            tabbar.value!.style.borderBottomLeftRadius = '5px'
            tabbar.value!.style.borderBottomRightRadius = '5px'
        }else {
            const maxHeight = window.innerHeight - rect.top - wrapperPadding
            const height = fileStore.openedFileList.length * (30 + iconMargin)
            tabbar.value!.style.height = height + 'px'
            tabbar.value!.style.maxHeight = maxHeight + 'px'
            tabbar.value!.style.top = '30px'
            tabbar.value!.style.borderTopLeftRadius = '5px'
            tabbar.value!.style.borderTopRightRadius = '5px'
            tabbar.value!.style.borderBottomLeftRadius = '10px'
            tabbar.value!.style.borderBottomRightRadius = '10px'
        }
        // 设置打开文件图标的位置
         
    }, 500)
    
}

const createOpenEditorProps = (item: openedFile): CustomEditorOptions => {
    return {
        fileName: item.name,
        fileSize: item.objectSize || 0,
        fileType: getFileType(item.name),
        fileContent: item.content,
        readOnly: true,
        objhash: item.objectName || '',
        hideHandle: () => {},
    }
}

const tabbarPosReset = () => {
    tabbar.value!.style.height = '30px'
    tabbar.value!.style.removeProperty('top')
    tabbar.value!.style.removeProperty('left')
    tabbar.value!.style.removeProperty('right')
    tabbar.value!.style.removeProperty('bottom')
}
const onMouseExit = (e: MouseEvent) => {
    clearTimeout(enterFn)
    // @ts-ignore
    exitFn = setTimeout(() => {
        showing.value = false
        tabbarPosReset()
        tabbar.value!.style.height = '0px'
    }, 500)
}
</script>

<style lang="scss" scoped>
.__draggable__bag__wrapper{
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 30px;
    height: 30px;
    .__draggable__bag__float-bag{
        opacity: 0.5;
    }

    .__draggable__bag__tabbar {
        position: absolute;
        width: 30px;
        height: 0px;
        right: 0px;
        bottom: 30px;
        opacity: 0.5;
        transition: height 0.2s;
        background-color: #cfcfcf;
        overflow-y: scroll;
        &::-webkit-scrollbar{
            width: 0px;
        }
    }
}
</style>