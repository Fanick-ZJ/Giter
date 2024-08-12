<template>
    <div class="header">
        <div class="timeAndSelect">
            <div class="time">{{ chartStore.start }} – {{ chartStore.end }}</div>
            <div class="select-box">
                <!-- 当绑定的值位对象时，要使用value-key来指定key -->
                <el-select v-model="chartStore.curShowData" size="large" placeholder="Select" value-key="value" @change="onSelectChange">
                    <template #prefix>
                        {{ $t('chart.selectPrefix') }}
                    </template>
                    <el-option v-for="item in optionList" :label="$t(item.name)" :value="item.value"/>
                </el-select>
            </div>
        </div>
        <div class="title">
            <span v-if="chartStore.curShowData == 'commits'">{{ $t('chart.contributeMasterChartCommitTitle') }}</span>
            <span v-else-if="chartStore.curShowData == 'deletions'">{{ $t('chart.contributeMasterChartDeleteTitle') }}</span>
            <span v-else-if="chartStore.curShowData == 'insertions'">{{ $t('chart.contributeMasterChartInsertTitle') }}</span>
        </div>
        <div class="w-full h-[400px]" ref="masterChartDOM">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, markRaw, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useDetailChartStore } from '@/renderer/store/modules/detailChart';
import { CurShowData } from '@/renderer/types';
import dayjs from 'dayjs';

type TableOptionItem = {
    name: string,
    value: string
}
const optionList: TableOptionItem[] = [
    {
        name: 'chart.commitsOption',
        value: 'commits'
    },
    {
        name: 'chart.insertionsOption',
        value: 'insertions'
    },
    {
        name: 'chart.deletionsOption',
        value: 'deletions'
    }
]
type EChartsOption = echarts.EChartsOption;
const chartStore = useDetailChartStore()
const masterChartDOM = ref<HTMLElement>()
// 在vue3中，第三方库的类型在不必要的时候不要使用响应式来表示
let masterChart: echarts.ECharts
// 月份数据统计对象，在选择的时候自动计算并存进去
const options = reactive<EChartsOption>({})
// 界面挂在完成之后开始初始化表格
onMounted(() => {
    window.addEventListener('resize', () => {
        // 页面中存在多个表格的时候，使用resize要带上宽高
        masterChart?.resize({height: 400})
    })
    // 初始化表格对象
    nextTick(() => {
        if (masterChartDOM.value){
            masterChart = echarts.init(masterChartDOM.value, null, {renderer: 'svg'})
            flashChartData()
        }
    })

})
/**
 * 刷新数据
 */
const flashChartData = () => {
    // 图例部分
    options.visualMap = {
        show: false ,
        type: 'continuous',
        seriesIndex: 0,
        textGap: 5
    },
    // 标题
    options.title = {
        left: 'center'
    };
    // 鼠标移入图标的图例
    options.tooltip = {
        trigger: 'axis',
        formatter: chartOverShowDailyData,
        triggerOn: 'click'
    };
    // x轴
    options.xAxis = {
        data: chartStore.dateList.map(item => dayjs(item).format('YYYY-MM-DD')),
    };
    // y轴
    options.yAxis = {};
    // 图标方位
    options.grid = {top: '10%', left: '5%'};
    // 图表数据
    options.series = {
        type: 'line',
        showSymbol: true,
        data: chartStore.curDataList,
        smooth: true,
        areaStyle: {}
    }
    // 渐变颜色
    options.gradientColor = ['#9FE286', '#37D527']
    // 数据数量到达一定程度，加入下方的滑动条
    if (chartStore.curDataList.length > 100){
        options.dataZoom = [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 0,
                end: 10
            }
        ];
    }
    if(masterChart){
        masterChart.setOption(options);
    }
}

/**
 * 显示一天中的提交细节
 * @param params 
 * @param asyncTicket 
 */
const chartOverShowDailyData = (params: any, asyncTicket: string): HTMLElement[] => {
    const res: HTMLElement[] = []
    let arr:any[] = []
    chartStore.authorMap.forEach(item => {
        for(let i = 0 ; i < item.stat.dateList.length; i++){
            if(dayjs(item.stat.dateList[i]).format("YYYY-MM-DD") == params[0].name){
                arr.push([item.author.name, chartStore.curAuthorDataList(item.author.name)[i]])
                return
            }
        }
    })
    // tooltip 标题
    const header = document.createElement('div')
    header.style.display = 'flex'
    header.style.gap = '10px'
    header.style.justifyContent = 'space-between'
    header.innerHTML = `<div style='font-size:12px; font-weight: 600;'>${params[0].name }</div><div style='font-size:12px;'>${params[0].value}</div>`
    res.push(header)
    arr = arr.sort((a:any, b:any) => {return a[1] - b[1]})
    arr.forEach(item => {
        // 每一项都两端对其
        const div = document.createElement('div')
        div.style.display = 'flex'
        div.style.gap = '10px'
        div.style.justifyContent = 'space-between'
        div.innerHTML = `<div style='font-size:12px;'>${item[0]}</div><div style='font-size:12px;'>${item[1]}</div>`
        res.push(div)
    })
    return res
}

const onSelectChange = (value: CurShowData) => {
    chartStore.curShowData = value
    flashChartData();
}
watch(() =>chartStore.commitCount, (newVal, oldVal) => {
    flashChartData();
})
</script>

<style scoped lang="scss">
.header{
    .timeAndSelect{
        display: flex;
        justify-content: space-between;
        border-bottom: 1px rgb(205, 204, 204) solid;
        padding-bottom: 10px;
        margin-bottom: 20px;
        .time{
            font-family: $font;
            font-weight: 600;
            font-size: 20px;
            // 文字底部对齐
            display: flex;
            align-items: end;
        }
        .select-box {
            width: 200px;
        }
    }
    .title{
        font-family: $font;
        text-align: center;
        font-weight: 600;
        font-size: 30px;
    }
}
</style>