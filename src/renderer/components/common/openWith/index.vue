<template>
    <teleport :to="store.attachTo">
        <div class="absolute size-full 
                    flex justify-center 
                    items-center 
                    top-0 left-0 
                    z-top bg-mask-color" 
                    v-if="store.visible">
            <div class="min-w-[200px] flex 
                        flex-col max-w-[var(--open-with-content-max-width)]
                        max-h-[var(--open-with-content-max-height)]
                        w-[var(--open-with-content-width)]
                        h-[var(--open-with-content-height)]
                        bg-white rounded-md 
                        overflow-hidden">
                <!-- 打开方式头部 -->
                <div class="h-[var(--open-with-header-height)]
                            border-b-stone-300 border-b-[1px] border-solid
                            p-[var(--open-with-padding)]
                            flex justify-between">
                    <div class="text-xl font-semibold 
                                text-title-color">
                        <span>{{$t('openWith.title')}}</span>
                    </div>
                    <div class="text-xl font-semibold" @click="close">
                        <Icon icon="iconamoon:close" width="24" height="24"  style="color: #474747" />
                    </div>
                </div>
                <!-- 打开方式主体 -->
                <div class="flex  justify-center
                            grow  overflow-hidden 
                            px-1.5 p-1" ref="bodyRef">
                    <!-- 分页左箭头 -->
                    <div class="w-5 flex-shrink-0
                                flex flex-col
                                justify-center self-center" 
                        v-if="isMultPage" @click="prePage">
                        <Icon icon="ic:round-arrow-left" width="20" height="20" />
                    </div>
                    <div class="grow-1 flex 
                                flex-col justify-between">
                        <div class="flex flex-wrap
                                    justify-center" v-auto-animate>
                            <div
                                v-for="item in store.appList.slice(activeIndex * pageLineNum * curLineContent, (activeIndex + 1) * pageLineNum * curLineContent)">
                                <!-- @vue-ignore -->
                                <AppItem :appItem="item"
                                    :width="store.dialogStyle.iconWidth"
                                    :height="store.dialogStyle.iconHeight"
                                ></AppItem>
                            </div>
                            <!-- 第一页不满或最后一页显示添加 -->
                            <div
                                v-if="pageLineNum * curLineContent > store.appList.length
                                    || pageNum - 1 == activeIndex">
                                    <!-- @vue-ignore -->
                                <Icon icon="basil:add-outline" 
                                    :width="store.dialogStyle.iconWidth" :height="store.dialogStyle.iconHeight" 
                                    :style="{color: handle.curColor.value}" 
                                    @click="clickAddApp"
                                    @mouseenter="handle.start()"
                                    @mouseleave="handle.reverse()">
                                </Icon>
                            </div>
                        </div>
                    </div>
                    <!-- 分页右箭头 -->
                    <div class="w-5 flex-shrink-0
                                flex flex-col
                                justify-center self-center" 
                        v-if="isMultPage" @click="nextPage">
                        <Icon icon="ic:round-arrow-right" width="20" height="20" />
                    </div>
                </div>
                <div class="flex items-center
                            h-5 justify-center" v-if="isMultPage">
                    <ul class="flex gap-3">
                        <li v-for="index in pageNum"
                            @click="toPage(index)"
                            class="w-3 h-3
                                  bg-[var(--open-with-carousel-item-background)] rounded-full
                                  hover:bg-[var(--open-with-carousel-item-hover-background)] transition-all"
                            :class="{'bg-[var(--open-with-carousel-item-active-background)]'
                            :index - 1 === activeIndex}"
                            >
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup lang='ts'>
import { add, get, getStoreObject, put } from '@/renderer/common/util/dbUtil';
import { gsap } from 'gsap'
import { Icon } from '@iconify/vue';
import { ref, reactive, watch, onBeforeMount, onMounted, onUnmounted } from 'vue';
import AppItem from './appItem.vue'
import { ExplorerTaskService } from '@/renderer/common/entity/explorerTaskService';
import { useI18n } from 'vue-i18n';
import { Base64Icon, FileGroup, OpenWithApp } from '@/types';
import { useOpenWith } from '@/renderer/store/modules/openWith';
import { useHotKey} from '@/renderer/common/hook/useHotkey'
import { useColorGradient } from '@/renderer/common/hook/useColorGradient';
import { OpenWithTaskService } from '@/renderer/common/entity/openWithTaskService';

    const bodyRef = ref<HTMLElement>()
    type Color = {value: string}
    type Tween = gsap.core.Tween
    const explorerTaskService = new ExplorerTaskService()
    const openWithTaskService = new OpenWithTaskService()
    const i18n = useI18n()
    const store = useOpenWith()
    const handle = useColorGradient({
        startColor: 'rgb(212, 212, 212)',
        endColor: 'rgb(144, 144, 144)',
        duration: 0.3,
    })
    // 窗口关闭
    const close = () => {
        store.visible = false
    }
    // 窗口显示
    const show = () => {
        store.visible = true
    }
    defineExpose({
        show,
        close
    })
    // 添加应用
    const clickAddApp = () => {
        const params = {
            title: i18n.t('openWith.addTitle'), 
            filters: [{name: 'app', extensions: ['exe']}],
            properties: ['openFile']
        }
        explorerTaskService.showOpenDialog(params)
        .then((paths: string[]) => {
            if (paths.length === 0) return
            openWithTaskService.addApp(paths[0]).then((app: OpenWithApp | undefined) => {
                if (app) {
                    store.appList.push(app)
                }
            })
        })
    }
    /**
     * 根据分组获取应用
     * @param group 
     */
    const getOpenWithApps = async (group: FileGroup) => {
        openWithTaskService.getAllApp().then((res: OpenWithApp[]) => {
            store.appList = res
        })
    }

    /**
     * 通过路径查找已记录的应用
     * @param path 
     */
    const getAppByPath = async (path: string) => {
        let db = await getStoreObject(['openWith'])
        return get(db).then((res: OpenWithApp[]) => {
            let app = res.find((item: OpenWithApp) => item.path === path)
            return Promise.resolve(app)
        })
    }
    // 多页模式
    const isMultPage = ref<Boolean>(false)
    const arrowPageButtonWidth = ref(20)
    const carouselHeight = ref(20)
    const activeIndex = ref(0)      // 当前激活页面
    const curLineContent = ref(0)   // 当前一行有多少个
    const pageLineNum = ref(0)      // 一页有多少行
    const pageNum = ref(0)          // 总页数
    /**
     * 计算内容大小
     */
    const calcContentSize = () => {
        if (bodyRef.value) {
            const bodyStyle = getComputedStyle(bodyRef.value)
            const width = bodyRef.value.clientWidth - Number.parseInt(bodyStyle.paddingLeft.slice(0, -2)) - Number.parseInt(bodyStyle.paddingRight.slice(0, -2))
            const height = bodyRef.value.clientHeight - Number.parseInt(bodyStyle.paddingTop.slice(0, -2)) - Number.parseInt(bodyStyle.paddingBottom.slice(0, -2))
            const iconNum = store.appList.length + 1
            // 判断一页有多少个
            // @ts-ignore
            const aWidth = store.dialogStyle.iconWidth + store.dialogStyle.iconGap
            // @ts-ignore
            const aHeight = store.dialogStyle.iconHeight + store.dialogStyle.iconGap
            const aLineContent = Math.floor(isMultPage ? (width - (arrowPageButtonWidth.value * 2)) / aWidth : width / aWidth)
            const contentHeight = isMultPage ? height - carouselHeight.value : height
            const numLine = Math.ceil(iconNum / aLineContent)

            curLineContent.value = aLineContent
            pageLineNum.value = Math.floor(height / aHeight)
            pageNum.value = Math.ceil(store.appList.length / (pageLineNum.value * curLineContent.value))
            // 如果最后一页沾满了，那么要将添加按钮放到后一页
            if (store.appList.length % (pageLineNum.value * curLineContent.value) == 0) {
                pageNum.value++
            }
            // 判断是否越界
            if (activeIndex.value > pageNum.value - 1) activeIndex.value = pageNum.value - 1
            if (pageNum.value > 1) {
                isMultPage.value = true
            }else {
                isMultPage.value = false
            }
        }
    }

    const paramInit = () => {
        pageNum.value = 1
        activeIndex.value = 0
        curLineContent.value = 0
        pageLineNum.value = 0
    }

    const nextPage = () => {
        const preAppNum = activeIndex.value * curLineContent.value * pageLineNum.value
        if (store.appList.length - preAppNum >= pageLineNum.value * curLineContent.value){
            activeIndex.value++
        }
    }

    const prePage = () => {
        if (activeIndex.value > 0) {
            activeIndex.value--
        }
    }

    const toPage = (index: number) => {
        if (index - 1 == activeIndex.value)return 
        if (index > pageNum.value - 1) {
            activeIndex.value = pageNum.value - 1
        }else {
            activeIndex.value = index - 1
        }
    }

    const closeOpenWith = useHotKey(
        () => {
            close()
        },
        {
            key: 'escape',
            ctrlKey: false,
        }
    )

    onBeforeMount(() => getOpenWithApps(store.group))
    // 添加页面元素观察者
    const resizeObserver = new ResizeObserver( entries => {
        calcContentSize()
    })
    onMounted(() => {
        if (bodyRef.value){
            resizeObserver.observe(bodyRef.value)
        }
    })
    onUnmounted(() => {
        if (bodyRef.value) {
            resizeObserver.unobserve(bodyRef.value)
        }
    })
    watch(() => store.group, (newVal: FileGroup) => getOpenWithApps(newVal))
    watch(() => bodyRef.value, ()=> {
        resizeObserver.disconnect()
        if (bodyRef.value){
            paramInit()
            resizeObserver.observe(bodyRef.value)
        }
    })
</script>

<style lang="scss" scoped>
*{
    --open-with-content-max-width: 600px;
    --open-with-content-max-height: 350px;
    --open-with-content-width: 40%;
    --open-with-content-height: 30%;
    --open-with-content-background: #ffffff;
    --open-with-content-border-radius: 10px;
    --open-with-content-box-shadow: #a1a0a0 0px 0px 15px 7px;;
    --open-with-header-height: fit-content;
    --open-with-header-border-bottom: #e2e2e2 1px solid;
    --open-with-padding: 10px 15px;
    --open-with-header-title-color: #474747;
    --open-with-carousel-item-background: #c0bfbfa6;
    --open-with-carousel-item-hover-background: #9e9b9ba6;
    --open-with-carousel-item-active-background: #8b8b8ba6;
}
</style>