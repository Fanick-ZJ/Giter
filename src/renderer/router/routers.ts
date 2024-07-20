import { RouteComponent, RouteLocationNormalized, RouterOptions, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useDetailChartStore } from '../store/modules/detailChart'
import { KeepAlive } from 'vue'
import { flattedChildren } from 'element-plus/es/utils/index.mjs'

// 对外暴露的配置路由
export const constantRoute = [
    {
        // 主页
        path: '/',
        component:() =>import ('@/renderer/views/index/index.vue'),
        redirect: '/empty',     // 重定向到空页面，如果空页面在子路由里面，则页面内的router-view将会跳转到，否则的将会跳转到其他路由中
        name: 'index',
        children: [
            {
                // 空白页
                path: '/empty',
                component: () => import ('@/renderer/views/empty/index.vue'),
                name: 'empty'
            }
        ]
    },
    {
        path:'/repos',
        component:() =>import ('@/renderer/views/index/index.vue'),
        meta: {
            rawPath: '/repos'
        },
        children: [
            {   // 仓库细节
                path: 'detail/:path',
                component: () => import('@/renderer/views/repos/detail/index.vue'),
                name: 'repos-detail',
                meta: {
                    rawPath: '/repos/detail/:path',
                    pageName: 'pageName.detail',
                }
            },
            {
                // 提交历史图
                path: 'commit/:path',
                component: () => import('@/renderer/views/repos/commit/index.vue'),
                name: 'repos-graph',
                meta: {
                    KeepAlive: true,
                    rawPath: '/repos/commit/:path',
                    pageName: 'pageName.commit',
                }
            },
            {
                path: 'commitDetail/:path/:commitHash',
                component: () => import('@/renderer/views/repos/commit/commitDetail.vue'),
                name: 'repos-commit-detail',
                meta: {
                    rawPath: '/repos/commitdetail:/path/:commitHash',
                    pageName: 'pageName.commitDetail',
                }
            },
            {
                // 文件视图
                path: 'files/:path/:tag',
                component: () => import('@/renderer/views/repos/files/index.vue'),
                name: 'repos-file',
                meta: {
                    rawPath: '/repos/files/:path/:tag',
                    pageName: 'pageName.files',
                },
                children: [
                    {
                        path: 'folder/:fid?',
                        component: () => import('@/renderer/views/repos/files/page/index.vue'),
                        name: 'repos-file-page',
                        meta: {
                            rawPath: '/repos/files/:path/:tag/folder/:fid',
                            pageName: 'pageName.files',
                        }
                    }

                ]
            }
        ]
    },
    {
        // 错误界面
        path: '/error',
        component:() =>import ('@/renderer/views/index/index.vue'),
        name: 'error',
        children: [
            {
                // 通用错误界面
                path: '/error/common/:title/:content',
                component: () =>import('@/renderer/views/error/commonError/index.vue'),
                name: 'common-error',
            }
        ]
    },
    {
        //项目文件夹
        path: '/reposFolder',
        component: () => import('@/renderer/views/reposFolder/index.vue'),
        name: 'reposFolder'
    },
    {
        // dilaog界面
        path: '/msgdlg/:type/:message/:wid',
        component: () => import('@/renderer/views/msgdlg/index.vue'),
        name: 'msgdlg'
    },
    {
        // 设置界面
        path: '/setting',
        component: () => import('@/renderer/views/setting/index.vue'),
        name: 'setting',
        redirect: '/setting/general',
        children: [
            {
                // 一般界面
                path: '/setting/general',
                component: () => import('@/renderer/views/setting/general/index.vue'),
                name: 'setting.general',
            },
            {
                // 关于界面
                path: '/setting/about',
                component: () => import('@/renderer/views/setting/about/index.vue'),
                name: 'setting.about',
            },
            {
                // 更多设置界面
                path: '/setting/advanced',
                component: () => import('@/renderer/views/setting/advanced.vue'),
                name: 'setting.advanced',
            },
            {
                // 帮助界面
                path: '/setting/help',
                component: () => import('@/renderer/views/setting/help.vue'),
                name: 'setting.help',
            },
            {
                // 帮助界面
                path: '/setting/language',
                component: () => import('@/renderer/views/setting/language/index.vue'),
                name: 'setting.language',
            },
        ]
    }
]