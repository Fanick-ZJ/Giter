import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import './style/index.scss'
import 'element-plus/dist/index.css'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import router from './router'
import pinia from './store/index'
import App from './App.vue'
import i18n  from './lang'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { MouseMenuDirective } from './components/common/contextMenu'
import { EditorDirective } from './components/common/editor'
import { apiMap } from './common/util/apiUtil'

// 给windows中挂在的函数都添加上name属性，方便调试
if (process.env.NODE_ENV === 'development') {
    Reflect.ownKeys(window).forEach(key => {
        if (typeof key == 'string' && key.endsWith('API')) {
            const api = window[key]
            Reflect.ownKeys(api).forEach(apiKey => {
                if (typeof apiKey == 'string') {
                    apiMap.set(api[apiKey], `${key}.${apiKey}`)
                }
            })
        }
    })
}

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router)
app.use(i18n)
app.use(ElementPlus)
app.use(pinia)
app.use(autoAnimatePlugin)
app.directive('contextMenu', MouseMenuDirective)
app.directive('editor', EditorDirective)
app.mount('#app')

