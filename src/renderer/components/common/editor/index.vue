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
        <div ref="editorRef" class="__editor__content" >
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
            if (editorRef.value) {
                const editor = monaco.editor.create(editorRef.value, {
                    accessibilityPageSize: 10, // 辅助功能页面大小 Number 说明：控制编辑器中可由屏幕阅读器读出的行数。警告：这对大于默认值的数字具有性能含义。
                    accessibilitySupport: 'on', // 辅助功能支持 控制编辑器是否应在为屏幕阅读器优化的模式下运行。
                    automaticLayout: true, // 自动布局
                    codeLens: false, // 是否显示codeLens 通过 CodeLens，你可以在专注于工作的同时了解代码所发生的情况 – 而无需离开编辑器。 可以查找代码引用、代码更改、关联的 Bug、工作项、代码评审和单元测试。
                    codeLensFontFamily: '', // codeLens的字体样式
                    codeLensFontSize: 14, // codeLens的字体大小
                    colorDecorators: false, // 呈现内联色彩装饰器和颜色选择器
                    contextmenu: true, // 启用上下文菜单
                    autoSurround: 'never', // 是否应自动环绕选择
                    copyWithSyntaxHighlighting: true, // 是否应将语法突出显示复制到剪贴板中 即 当你复制到word中是否保持文字高亮颜色
                    cursorSurroundingLines: 0, // 光标环绕行数 当文字输入超过屏幕时 可以看见右侧滚动条中光标所处位置是在滚动条中间还是顶部还是底部 即光标环绕行数 环绕行数越大 光标在滚动条中位置越居中
                    cursorSurroundingLinesStyle: 'all', // "default" | "all" 光标环绕样式
                    cursorWidth: 2, // <=25 光标宽度
                    minimap: {
                        enabled: false // 是否启用预览图
                    }, // 预览图设置
                    folding: true, // 是否启用代码折叠
                    links: true, // 是否点击链接
                    overviewRulerBorder: false, // 是否应围绕概览标尺绘制边框
                    renderLineHighlight: 'gutter', // 当前行突出显示方式
                    roundedSelection: false, // 选区是否有圆角
                    scrollBeyondLastLine: false, // 设置编辑器是否可以滚动到最后一行之后
                    readOnly: props.readOnly, // 是否为只读模式
                    theme: 'vs',// vs, hc-black, or vs-dark,
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
            wrapper?.classList.add('delete')
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
        height: 100%
    }
    &::-webkit-resizer {
        background-color: transparent;
    }
}

</style>