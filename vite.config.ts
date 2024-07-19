import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx' // 添加这一句
import { ElectronDevPlugin} from './plugin/vite.electron.dev'
import { ElectronBuildPlugin} from './plugin/vite.electron.build'
import { OUT_DIR } from './packages/const'
import monacoEditorPlugin from "vite-plugin-monaco-editor"

const prefix = `monaco-editor/esm/vs`
// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [
      `${prefix}/language/json/json.worker`,
      `${prefix}/language/css/css.worker`,
      `${prefix}/language/html/html.worker`,
      `${prefix}/language/typescript/ts.worker`,
      `${prefix}/editor/editor.worker`
    ]
  },
  plugins: [
    vue(),
    vueJsx(), // 添加这一句
    ElectronDevPlugin(),
    ElectronBuildPlugin(),
    monacoEditorPlugin({})
  ],
  /*开发服务器选项*/
  server: {
      // 端口
      port: 3100,
  },
  build: {
    outDir: OUT_DIR,
  },
  base: './', // 默认是绝对路径，改为相对路径 
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  // scss全局变量的配置
  css: {
    preprocessorOptions: {
      scss: {
        javascriptEnabled: true,
        additionalData: '@import "@/renderer/style/variable.scss";'
      }
    }
  }

})
