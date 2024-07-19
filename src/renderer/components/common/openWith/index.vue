<template>
    <teleport :to="store.attachTo">
        <div class="__open__with__wrapper" v-if="store.visible">
            <div class="__open__with__content">
                <!-- 打开方式头部 -->
                <div class="__open__with__header">
                    <div class="__open_with__headr-title">
                        <span>{{$t('openWith.title')}}</span>
                    </div>
                    <div class="__open_with__headr-close" @click="close">
                        <Icon icon="iconamoon:close" width="24" height="24"  style="color: #474747" />
                    </div>
                </div>
                <!-- 打开方式主体 -->
                <div class="__open__with__body" ref="bodyRef">
                    <!-- 分页左箭头 -->
                    <div class="__open_with_arrow" v-if="isMultPage" @click="prePage">
                        <Icon icon="ic:round-arrow-left"
                            width="20" height="20" />
                    </div>
                    <div class="__open_with_body-content">
                        <div class="__open_with_icon_page" v-auto-animate>
                            <div
                                v-for="item in store.appList.slice(activeIndex * pageLineNum * curLineContent, (activeIndex + 1) * pageLineNum * curLineContent)">
                                <!-- @vue-ignore -->
                                <AppItem :appItem="item"
                                    :width="store.dialogStyle.iconWidth"
                                    :height="store.dialogStyle.iconHeight"
                                ></AppItem>
                            </div>
                            <!-- 第一页不满或最后一页显示添加 -->
                            <div class="__open__with-add"
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
                    <div class="__open_with_arrow"  v-if="isMultPage" @click="nextPage">
                        <Icon icon="ic:round-arrow-right" width="20" height="20" />
                    </div>
                </div>
                <div class="__open_with_carousel" v-if="isMultPage">
                    <ul class="__open_with_carousel-list">
                        <li v-for="index in pageNum"
                            @click="toPage(index)"
                            class="__open_with_carousel-item" 
                            :class="{'__open_with_carousel-item--active'
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
    font-family: $font;
}
.__open__with__wrapper{
    --open-with-wrapper-background: rgba(188, 187, 187, 0.71);
    --open-with-wrapper-position: rgba(188, 187, 187, 0.71);
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
}
.__open__with__wrapper{
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--open-with-wrapper-background);
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0px;
    left: 0px;
    z-index: 9999;
}

.__open__with__content{
    min-width: 200px;
    display: flex;
    flex-direction: column;
    max-width: var(--open-with-content-max-width);
    max-height: var(--open-with-content-max-height);
    width: var(--open-with-content-width);
    height: var(--open-with-content-height);
    background-color: var(--open-with-content-background);
    border-radius: var(--open-with-content-border-radius);
    box-shadow: var(--open-with-content-box-shadow);
}
.__open__with__header{
    height: var(--open-with-header-height);
    border-bottom: var(--open-with-header-border-bottom);
    padding: var(--open-with-padding);
    display: flex;
    flex: 0 0 auto;
    justify-content: space-between;

    .__open_with__headr-title{
        font-size: 20px;
        font-weight: 600;
        color: var(--open-with-header-title-color);
    }
    .__open_with__headr-close{
        height: 20px;
        width: 20px;
    }
}
.__open_with_carousel-item{
    --open-with-carousel-item-background: #c0bfbfa6;
    --open-with-carousel-item-hover-background: #9e9b9ba6;
}
.__open_with_carousel-item--active{
    --open-with-carousel-item-active-background: #696969a6;
}
.__open__with__body {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
    padding: 5px 0px;
    .__open_with_arrow{
        width: 20px;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-self: center;
        // background-color: #474747;
    }
    .__open_with_body-content{
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .__open_with_icon_page{
            display: flex;
            flex-wrap: wrap; 
            justify-content: center;
        }
    }
}
.__open_with_carousel{
    display: flex;
    align-items: center;
    height: 20px;
    justify-content: center;
    .__open_with_carousel-list {
        display: flex;
        gap: 10px;
        .__open_with_carousel-item{
            width: 10px;
            height: 10px;
            background-color: var(--open-with-carousel-item-background);
            border-radius: 50%;
            transition: all 0.3s;
            &:hover{
                background-color: var(--open-with-carousel-item-hover-background);
            }
        }
        .__open_with_carousel-item--active{
            background-color: var(--open-with-carousel-item-active-background);
        }
    }
}
</style>