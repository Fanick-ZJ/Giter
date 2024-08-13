<template>
    <div class="author-contribute-chart">
       <div class="author-info">
            <Avatar 
        :author="author" 
        :border-radius="5" 
        :width="40"></Avatar>
        <el-text>{{ author.name  }}</el-text>
       </div>
        <div class="chart" ref="authorChartDOM"></div>
    </div>
</template>

<script setup lang="ts">
import { Author } from '@/types';
import Avatar from '@/renderer/components/common/hashAvatar/index.vue'
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { useDetailChartStore } from '@/renderer/store/modules/detailChart';
import dayjs from 'dayjs';
const props = defineProps<{
    author: Author
}>()

type EChartsOption = echarts.EChartsOption;
const chartStore = useDetailChartStore()
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
        data: chartStore.getUserDateList(props.author.name).map(item => dayjs(item).format('YYYY-MM-DD')),
    };
    // y轴
    options.yAxis = {};
    // 图标方位
    options.grid = {top: '10%', left: '15%'};
    // 图表数据
    options.series = {
        type: 'line',
        showSymbol: true,
        data: chartStore.curAuthorDataList(props.author.name),
        smooth: true,
        areaStyle: {}
    }
    // 渐变颜色
    options.gradientColor = ['#A4E5A9', '#8AE572']
    if(authorChart){
        authorChart.setOption(options);
    }
}
const observer = new ResizeObserver(() => {
    const width = authorChartDOM.value?.offsetWidth
    const height = authorChartDOM.value?.offsetHeight
    authorChart.resize({width, height})
})
onMounted(async () => {
    if (authorChartDOM.value){
        observer.observe(authorChartDOM.value)
        await nextTick()
        authorChart = echarts.init(authorChartDOM.value, null, {renderer: 'svg'})
        flashChartData()
    }
})

onUnmounted(() => {
    observer.disconnect()
    authorChart.dispose()
})

watch(() => chartStore.curShowData, (newVal, oldVal) => {
    flashChartData()
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