<template>
    <!-- container -->
    <div class="w-full h-full" v-loading="props.loading">
        <!-- content -->
        <div class="w-full h-full"
             :class="props.direction === 'vertical' ? 'overflow-y-scroll' : 'overflow-x-scroll'"
             ref="contentRef">
            <!-- list -->
            <div ref="listRef" class="flex"
                :style="scrollStyle"
                :class="props.direction === 'vertical' ? 'flex-col' : 'flex-row'">
                <!-- list item -->
                <div class="box-border"
                    v-for="item in renderList" 
                    :key="item.id" 
                    :data-id="String(item.id)">
                    <slot name="item" :item="item"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends {id: number}">
import { computed, CSSProperties, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { IEstimatedListProps, IPosInfo } from './type'
import { rafThrottle } from '@/renderer/common/util/tools';

const emit = defineEmits<{
    (e: 'getMoreData'): void
}>()

const props = defineProps<IEstimatedListProps<T>>()

const contentRef = ref<HTMLDivElement>()

const listRef = ref<HTMLDivElement>()

const positions = ref<IPosInfo[]>([])

const state = reactive({
    viewHeight: 0,
    listHeight: 0,
    startIndex: 0,
    maxCount: 0,
    prelen: 0
})

// 当前可见的结束节点索引
const endIndex = computed(() => Math.min(props.dataSource.length, state.startIndex + state.maxCount))

const renderList = computed(() => props.dataSource.slice(state.startIndex, endIndex.value))

const offsetDist = computed(() => state.startIndex > 0 ? positions.value[state.startIndex - 1].bottom : 0)

const scrollStyle = computed(() => {
    const style = props.direction === 'vertical'
                 ? {
                        height: `${state.listHeight - offsetDist.value}px`,
                        transform: `translate3d(0, ${offsetDist.value}px, 0)`,
                        rowGap: `${props.gap}px`
                    }
                : {
                        width: `${state.listHeight - offsetDist.value}px`,
                        transform: `translate3d(${offsetDist.value}px, 0, 0)`,
                        columnGap: `${props.gap}px`
                    }
    return style as CSSProperties
})
watch([() => listRef.value, () => props.dataSource.length], () => {
    props.dataSource.length && initpositions()
    nextTick(() => {
        setPositions()
    })
})

watch(() => state.startIndex, () => {
    nextTick(() => {
        setPositions()
    })
})

// 拿到数据源，初始化pos数组
const initpositions = () => {
    const pos: IPosInfo[] = []
    const disLen = props.dataSource.length - state.prelen
    const preTop = positions.value[state.prelen - 1]?.top || 0
    const preBottom = positions.value[state.prelen - 1]?.bottom || 0
    for(let i = 0; i < disLen; i++) {
        const item = props.dataSource[state.prelen + i]
        pos.push({
            index: i,
            height: props.estimateHeight,
            top: preTop ? preTop + i * props.estimateHeight : item.id * props.estimateHeight,
            bottom: preBottom ? preBottom + (item.id + 1) * props.estimateHeight : (item.id + 1) * props.estimateHeight,
            dHeight: 0
        })
    }
    positions.value = [...positions.value, ...pos]
    state.prelen = props.dataSource.length
}

// 数据 item 渲染完成后，更新数据item的真是高度
const setPositions = () => {
    const nodes = listRef.value?.children
    // console.log(nodes, nodes?.length)
    if (!nodes || !nodes.length) return
    // 获取当前视口中的渲染数据，来修正positions中记录的值
    [...nodes].forEach(element => {
        const rect = element.getBoundingClientRect()
        const id = +element.getAttribute('data-id')!
        const item = positions.value[id]
        const dHeight = props.direction === 'vertical' 
                        ? item.height - rect.height 
                        : props.direction === 'horizontal'
                        ? item.height - rect.width
                        :0
        // console.log(rect, id, item, dHeight)

        if (dHeight) {
            item.height = props.direction === 'vertical' 
                        ? rect.height 
                        : props.direction === 'horizontal'
                        ? rect.width
                        :0
            item.bottom = item.bottom - dHeight
            item.dHeight = dHeight
        }
    })
    // 更新positions中剩下的元素信息
    const startId = +nodes[0].getAttribute('data-id')!
    let startHeight = positions.value[startId].dHeight
    positions.value[startId].dHeight = 0
    for  (let i = startId + 1; i < positions.value.length ; i++) {
        const item = positions.value[i]
        // 更新剩余item的top和bottom位置
        item.top = positions.value[i - 1].bottom
        item.bottom = item.bottom - startHeight
        if (item.dHeight !== 0) {
            startHeight += item.dHeight
            item.dHeight = 0
        }
    }

    state.listHeight = positions.value[positions.value.length - 1].bottom
}

const init = () => {
    if (contentRef.value) {
        if (props.direction === 'vertical') {
            state.viewHeight = contentRef.value.offsetHeight
        } else {
            state.viewHeight = contentRef.value.offsetWidth
        }
    } else {
        state.viewHeight = 0
    }
    state.maxCount = Math.ceil(state.viewHeight / props.estimateHeight) + 1
    contentRef.value && contentRef.value.addEventListener('scroll', handleScroll)
}

const handleScroll = rafThrottle(() => {
    const {scrollTop, clientHeight, scrollHeight, scrollLeft} = contentRef.value!
    const curScroll = props.direction === 'vertical' ? scrollTop : scrollLeft
    state.startIndex = binarySearch(positions.value, curScroll)
    const bottom = scrollHeight - clientHeight - scrollTop
    if (bottom <= 20) {
        !props.loading && emit("getMoreData")
    }
})

const destory = () => {
    contentRef.value && contentRef.value.removeEventListener('scroll', handleScroll)
}

const binarySearch = (list: IPosInfo[], value: number) => {
    let left = 0
    let right = list.length - 1
    let templateIndex = -1
    while (left < right) {
        const midIndex = Math.floor((left + right) / 2)
        const midValue = list[midIndex].bottom
        if (midValue === value) return midIndex
        else if (midValue < value) left = midIndex + 1
        else if (midValue > value) {
            if (templateIndex === -1 || templateIndex > midIndex) templateIndex = midIndex
            right = midIndex
        }
    }

    return templateIndex
}

onMounted(() => {
    nextTick(() => {
        init()
    })
})

onUnmounted(() => {
    destory()
})
</script>

<style scoped>

</style>