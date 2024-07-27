import { ComponentPublicInstance, Directive, DirectiveBinding, ObjectDirective, VNode, createVNode, render } from 'vue';
import Editor from './index.vue'
import { CustomEditorOptions } from './types'
import { createClassDom } from '@/renderer/common/util/domUtil'
import { contain } from 'echarts/types/src/scale/helper.js'
import { useFileStore } from '@/renderer/store/modules/files';

// 组件全局安装
Editor.install = (app: any) => {
  app.component(Editor.name, Editor)
}

type CustomEditor = {
    instance: ComponentPublicInstance<typeof Editor>
    container: HTMLElement
}

const containerName = '__editor__container'
const wrapperName = '__editor__wrapper'

let observerMap: Map<string, MutationObserver> = new Map()
function buildCustomEditor (option: CustomEditorOptions): CustomEditor {
    let container = createClassDom('div', containerName)
    container.dataset.objectName = option.objectName
    option.hideHandle = beforeHideHandle(container, option)
    const vm = createVNode(Editor, option)
    render(vm, container)
    document.body.appendChild(container)
    return {
        instance: vm.component?.proxy as ComponentPublicInstance<typeof Editor>,
        container: container
    }
}

const beforeHideHandle = (el: HTMLElement, options: CustomEditorOptions) => {
    // 最小化的时候将active状态去掉，并执行hideHandle
    el.classList.remove('active')
    const func = new Proxy(options.hideHandle, {
        apply: (target, thisArg) => {
            return target.call(thisArg)
        }
    })
    return func
}

const createObserver = (value: CustomEditorOptions) => {
    let observer = new MutationObserver((muationRecords) => {
        muationRecords.forEach( item => {
            if (item.attributeName == 'class') {
                const ele = item.target as HTMLElement
                // 通过判断有没有active类名来进行显示和隐藏
                if (ele.classList.contains('active')){
                    ele.removeAttribute('hidden')
                } else {
                    ele.setAttribute('hidden', '')
                }
                if (ele.classList.contains('deleted')) {
                    // 执行组件卸载操作，通过render函数来实现
                    let container = document.querySelector(`div.${containerName}[data-object-name="${value.objectName}"]`)!
                    render(null, container)
                    const fileStore = useFileStore()
                    fileStore.removeOpenedFile(value.objectName)

                }
            }
        })
    })
    const editorEl = document.querySelector(`div.${wrapperName}[data-object-name="${value.objectName}"]`) as HTMLElement
    observer.observe(editorEl, { 
        attributes: true,
        attributeFilter: ['class'],
    })
    observerMap.set(value.objectName, observer)
}

const mounted = (el: HTMLElement, binding: DirectiveBinding<CustomEditorOptions>) => {
    const { value } = binding
    el.addEventListener('click', () => {
        let container = document.querySelector(`div.${containerName}[data-object-name='${value.objectName}']`)
        // 如果容器不存在，则创建一个
        if (!container) {
            buildCustomEditor(value)
            createObserver(value)
        }
        const editorEl = document.querySelector(`div.${wrapperName}[data-object-name='${value.objectName}']`) as HTMLElement
        editorEl.classList.add('active')
    })
}

const beforeUnmount = (el: HTMLElement, binding: DirectiveBinding<CustomEditorOptions>) => {
    const { value } = binding
    observerMap.get(value.objectName)?.disconnect()
    observerMap.delete(value.objectName)
}

const unmounted = (el: HTMLElement, binding: DirectiveBinding<CustomEditorOptions>, vnode) => {
    const { value } = binding
    const container = document.querySelector(`[data-object-name="${value.objectName}"]`)
    if (container) {
        container.remove()
        observerMap.get(value.objectName)?.disconnect()
        observerMap.delete(value.objectName)
    }

}


// 创建指令对象
const EditorDirective: ObjectDirective = {
    mounted,
    beforeUnmount,
    unmounted
}

export { buildCustomEditor, EditorDirective }
export default Editor