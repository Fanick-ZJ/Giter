<template>
    <div class="h-[200px] w-full">
       <div class="flex gap-[10px]">
            <Avatar 
        :author="authorStat.author" 
        :border-radius="5" 
        :width="40"></Avatar>
        <el-text>{{ authorStat.author.name  }}</el-text>
       </div>
        <div class="w-full h-full" ref="authorChartDOM"></div>
    </div>
</template>

<script setup lang="ts">
import Avatar from '@/renderer/components/common/hashAvatar/index.vue'
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { AuthorStatDailyContribute } from 'lib/git';
import { CurShowData } from '@/renderer/views/repos/detail/type';
const props = defineProps<{
    authorStat: AuthorStatDailyContribute,
    curShowData: CurShowData
}>()

type EChartsOption = echarts.EChartsOption;
const authorChartDOM = ref<HTMLElement>()
const options = reactive<EChartsOption>({})
let authorChart: echarts.ECharts

/**
 * 刷新数据
 */
 const flashChartData = () => {
    // 图例部分
    options.visualMap = {
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        min: 0,
        max: 70,
        textGap: 5
    },
    // 标题
    options.title = {
        left: 'center',
    };
    // 鼠标移入图标的图例
    options.tooltip = {
        trigger: 'axis',
        show: true,
    };
    // x轴
    options.xAxis = {
        // show: false,
        data: props.authorStat.stat.dateList.map(item => dayjs(item).format('YYYY-MM-DD')),
    };
    // y轴
    options.yAxis = {};
    // 图标方位
    options.grid = {top: '10%', left: '15%'};
    // 图表数据
    options.series = {
        type: 'line',
        showSymbol: true,
        data: getAuthorData(),
        smooth: true,
        areaStyle: {}
    }
    // 渐变颜色
    options.gradientColor = ['#A4E5A9', '#8AE572']
    if(authorChart){
        authorChart.setOption(options);
    }
}


const getAuthorData = () => {
    const stat = props.authorStat.stat
    return props.curShowData === 'commits'
            ? stat.commitCount
            : props.curShowData === 'deletions'
            ? stat.deletions
            : stat.insertion
}

const observer = new ResizeObserver(() => {
    const width = authorChartDOM.value?.offsetWidth
    const height = authorChartDOM.value?.offsetHeight
    authorChart.resize({width, height})
})

onMounted(() => {
    nextTick(() => {
        if (authorChartDOM.value){
            observer.observe(authorChartDOM.value)
            authorChart = echarts.init(authorChartDOM.value, null, {renderer: 'svg'})
            flashChartData()
        }
    })
})

onUnmounted(() => {
    observer.disconnect()
    authorChart.dispose()
})
</script>

<style scoped lang="scss">
.author-contribute-chart{
    height: 200px;
    width: 100%;
    .author-info{
        font-family: $font;
        display: flex;
        gap: 10px;
    }
    .chart{
        height: 100%;
        width: 100%;
    }
}
</style>