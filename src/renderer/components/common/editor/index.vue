<template>
    <div class="__editor__wrapper" 
        :data-objhash="objhash"
        ref="wrapperRef">
        <div class="__editor__tabbar" 
            draggable="true"
            @dragstart="onDragStart"
            @dragend="onDragEnd"
            @drag="onDrag"
            ref="tabbarRef">
            <div class="__editor__tabbar__name">
                {{ fileName }}
            </div>
            <div class="__editor__tabbar__icons">
                <div class="__editor__tabbar__icons-minimize" @click="minimize">
                    <Icon icon="fluent:minimize-16-filled" width="20" height="20" style="color: #a3a3a3" />
                </div>
                <div class="__editor__tabbar__icons-close" @click="destory">
                    <Icon icon="material-symbols:close-rounded" width="20" height="20"  style="color: #474747" />
                </div>
            </div>
        </div>
        <div ref="editorRef" class="__editor__content">
        </div>
    </div>
</template>

<script lang="ts">
import { Icon } from '@iconify/vue';
import * as monaco from 'monaco-editor'
import { PropType, defineComponent, onMounted, ref } from 'vue';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useFileStore } from '@/renderer/store/modules/files';

export default defineComponent({
    name: 'Editor',
    components: {
        Icon
    },
    props: {
        fileName: {
            type: String,
            default: ''
        },
        fileSize: {
            type: Number,
            default: 0
        },
        fileType: {
            type: String as PropType<string>,
            default: ''
        },
        fileContent: {
            type: String,
            default: ''
        },
        readOnly: {
            type: Boolean,
            default: true
        },
        teleport: {
            type: String,
            default: 'body'
        },
        objhash: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const editorRef = ref()
        const wrapperRef = ref()
        const tabbarRef = ref()

        self.MonacoEnvironment = {
        getWorker(_, label) {
            if (label === 'json') {
                return new jsonWorker()
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return new cssWorker()
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return new htmlWorker()
                }
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker()
                }
                return new editorWorker()
            }
        }

        onMounted(() => {
            console.log(props.fileContent.split('\n').length * 20)
            if (editorRef.value) {
                const editor = monaco.editor.create(editorRef.value, {
                    lineHeight: 20,
                    scrollBeyondLastLine: true, // 设置编辑器是否可以滚动到最后一行之后
                    readOnly: true, // 是否为只读模式
                    automaticLayout: true,
                    language: props.fileType,
                    value: props.fileContent
                    
                })
            }
        })

        const minimize = () => {
            const wrapper = document.querySelector(`div.__editor__wrapper[data-objhash='${props.objhash}']`)
            wrapper?.classList.remove('active')
        }

        const fileStore = useFileStore()
        const destory = () => {
            const wrapper = document.querySelector(`div.__editor__wrapper[data-objhash='${props.objhash}']`)
            wrapper?.classList.add('deleted')
            fileStore.removeOpenedFile(props.objhash)
        }
        let beginX = 0
        let beginY = 0
        const dragging = ref(false)
        const onDragStart = (e: DragEvent) => {
            const img = new Image();
            img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' %3E%3Cpath /%3E%3C/svg%3E";
            // DataTransfer 对象用于保存拖动并放下（drag and drop）
            // 过程中的数据。它可以保存一项或多项数据，这些数据项可以
            // 是一种或者多种数据类型。关于拖放的更多信息
            // @ts-ignore
            e.dataTransfer.setDragImage(img, 0, 0);
            // 获取鼠标的位置
            beginX = e.clientX - wrapperRef.value!.offsetLeft
            beginY = e.clientY - wrapperRef.value!.offsetTop
            dragging.value = true
        }

        const onDrag = (e: DragEvent) => {
            if (e.clientX === 0 && e.clientY === 0) return
            const height = wrapperRef.value!.clientHeight
            const width = wrapperRef.value!.clientWidth
            const clientX = wrapperRef.value!.offsetLeft
            const clientY = wrapperRef.value!.offsetTop
            let x = e.clientX - beginX >= window.innerWidth ? window.innerWidth - 10 : e.clientX - beginX
            x = x <= -width ? -width + 10 : e.clientX - beginX
            let y = e.clientY - beginY < 0 ? 0 : e.clientY - beginY
            y = y >= height ? height - 10 : e.clientY - beginY
            wrapperRef.value!.style.top = y + 'px'
            wrapperRef.value!.style.left = x + 'px'
        }
        const onDragEnd = (e: DragEvent) => {
            if (e.clientX === 0 && e.clientY === 0) return
            const height = wrapperRef.value!.clientHeight
            const width = wrapperRef.value!.clientWidth
            const clientX = wrapperRef.value!.offsetLeft
            const clientY = wrapperRef.value!.offsetTop
            let x = e.clientX - beginX >= window.innerWidth ? window.innerWidth - 10 : e.clientX - beginX
            x = x <= -width ? -width + 10 : e.clientX - beginX
            let y = e.clientY - beginY < 0 ? 0 : e.clientY - beginY
            y = y >= height ? height - 10 : e.clientY - beginY
            wrapperRef.value!.style.top = y + 'px'
            wrapperRef.value!.style.left = x + 'px'
            dragging.value = false
        }
        return {
            editorRef,
            minimize,
            wrapperRef,
            tabbarRef,
            onDragStart,
            onDrag,
            onDragEnd,
            destory
        }
    }
})
</script>

<style lang="scss" scoped>
.__editor__wrapper {
    position: absolute;
    top: 50px;
    left: 50px;
    resize: both;
    overflow: visible;
    overflow-y: hidden;
    border-radius: 10px;
    width: 80%;
    height: 80%;
    min-width: 300px;
    min-height: 300px;
    max-width: 100vw;
    max-height: 100vh;
    border: 1px solid #c1b1b1;
    background-color: white;

    .__editor__tabbar{
        width: 100%;
        height: 50px;
        display: flex;
        background-color: white;
        justify-content: space-between;
        padding: 5px 10px;
        .__editor__tabbar__icons{
            display: flex;
        }
        .__editor__tabbar__name{
            font-family: $font;
            font-size: 25px;
        }
    }
    .__editor__content{
        width: 100%;
        height: 100%;
        // 暂时不知道为什么，设置了这个后宽度就可以自定义了，配合automaticLayout: true,设置
        display: grid;
        grid-template-columns: minmax(0px, auto);
    }
    &::-webkit-resizer {
        background-color: transparent;
    }
}

</style>