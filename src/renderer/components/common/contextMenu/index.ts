import { App, ComponentPublicInstance, DirectiveBinding, ObjectDirective, createVNode, render } from "vue";
import MouseMenu from './mouse-menu.vue';
import { ContextMenuListenFn } from "@/renderer/types";
import { createClassDom } from "@/renderer/common/util/domUtil";
import { CustomMouseMenuOptions } from "./types";

// 注册全局组件
MouseMenu.install = (app: App): void => {
    app.component(MouseMenu.name, MouseMenu)
}

// 根据传入的选项生成一个全局的鼠标右键菜单实例
function CustomMouseMenu (option: CustomMouseMenuOptions): ComponentPublicInstance<typeof MouseMenu> {
    const className = '__mouse__menu__container'
    let container: HTMLElement
    // 找到已有的菜单节点
    if(document.querySelector(`.${className}`)){
        container = document.querySelector(`.${className}`) as HTMLElement
    }else{
        // 没有就创建一个
        container = createClassDom('div', className)
    }
    // 创建组件虚拟节点
    const vm = createVNode(MouseMenu, option);
    // 将组件渲染到dom节点上
    render(vm, container);
    // 将dom节点添加到body上
    document.body.appendChild(container);
    // 返回组件实例的代理对象
    return vm.component?.proxy as ComponentPublicInstance<typeof MouseMenu>;
}

let MouseMenuCtx: ComponentPublicInstance<typeof MouseMenu>

// 指令封装
let contextMenuEvent: ContextMenuListenFn
const mounted = (el: HTMLElement, binding: DirectiveBinding) => {
    const { value } = binding;
    if (value.menuList.length > 0){
        // 添加右键菜单监听
        contextMenuEvent = (e: MouseEvent) => {
            if ((typeof value.disabled === 'function' && value.disabled(value.params)) || value.disabled === true) return
            // 阻止默认事件
            e.preventDefault()
            // 创建右键菜单实例
            MouseMenuCtx = CustomMouseMenu({
                el,
                ...value
            })
            const { x, y } = e;
            // 显示右键菜单
            MouseMenuCtx.show(x, y);
        }
    // 移除右键菜单监听，重新添加
    el.removeEventListener('contextmenu', contextMenuEvent)
    el.addEventListener('contextmenu', contextMenuEvent)
    }else{
        throw new Error('At least set one menu list!');
    }
}

const unmounted = (el: HTMLElement) => {
    el.removeEventListener('contextmenu', contextMenuEvent);
};

// 指令对象
const MouseMenuDirective: ObjectDirective = {
    mounted,
    unmounted
};

export { MouseMenuDirective, CustomMouseMenu, MouseMenuCtx };
export default MouseMenu;