// 通过Vue-router插件实现路有模板的配置
import { createRouter, createWebHashHistory } from "vue-router";
import { constantRoute } from "./routers"

// 创建路由
const router = createRouter({
    // 设置路由模式
    history: createWebHashHistory(),
    routes: constantRoute
})
export default router