<template>
    <loading-page :loading="loading">
        <div class="w-full h-screen 
                    p-[10px] flex
                    flex-col gap-[10px]
                    overflow-scroll overflow-x-hidden"
            ref="containerRef">
            <div class="box-border flex gap-[10px]">
                <!-- 当绑定的值位对象时，要使用value-key来指定key -->
                <el-col :span="8">
                    <branch-select-bar :repo-path="path" size="small" @change="getRepoStatData"/>
                </el-col>
            </div>
            <InfoBar :path="path" :branch="curBranch"></InfoBar>
            <AuthorWall :contributors-rank-list="contributorsRankList" :repo-info="repo" style="margin-bottom: 10px;"></AuthorWall>
            <ContributeMaseterChart></ContributeMaseterChart>
            <div class="flex justify-center">
                <div class="grid grid-cols-[330px,330px] w-[750px]">
                    <authorContributeChart 
                        v-for="item in chartStore.authorMap" 
                        :author="item.author" 
                        :key="item.author.name + curBranch + item.author.email"
                        ></authorContributeChart>
                </div>
            </div>
        </div>
    </loading-page>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/renderer/store/modules/repository';
import { useRoute, useRouter } from 'vue-router';
import {computed, nextTick, onBeforeMount, onMounted, ref, watch} from 'vue'
import { RepoItem} from '@/types';
import InfoBar from '@/renderer/components/detail/infoBar.vue'
import AuthorWall from '@/renderer/components/detail/authorWall.vue'
import ContributeMaseterChart  from '@/renderer/components/detail/contributeMasterChart.vue'
import authorContributeChart from '@/renderer/components/detail/authorContributeChart.vue';
import { useDetailChartStore } from '@/renderer/store/modules/detailChart';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode, encode } from '@/renderer/common/util/tools';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import _ from 'lodash';
import { Author, Branch } from 'lib/git';
import LoadingPage from '@/renderer/components/common/LoadingPage/index.vue';

const route = useRoute()
const router = useRouter()
const path = computed(() => decode(route.params.path as string)) // 对编码的路径解码
const repoStore = useRepoStore()
let repo = repoStore.getRepoByPath(path.value) as RepoItem
// 如果仓库不在的话就跳转到错误页面
onBeforeMount(async () => {
    if (!repo){
        // 导航到错误页面
        router.push('/error/common/no_repo_found_title/no_repo_found_content/no_repo_found_tip')
    }
})

const curBranch = ref<string>(repo.curBranch)     // 当前分支
const commitCount = ref<number>(0)              // 当前分支提交次数
const contributorsRankList = ref<Author[]>([])  // 当前分支贡献者列表
const loading = ref<boolean>(true)
const repoTaskService = new RepoTaskService()
const chartStore = useDetailChartStore()

const width = ref(750)
const containerRef = ref<HTMLElement>()
const observer = new ResizeObserver(() => {
    if (containerRef.value) {
        width.value = containerRef.value.offsetWidth
    }
})

onMounted(async () => {
    await nextTick()
    containerRef.value && observer.observe(containerRef.value)
    getRepoStatData(repo.curBranch)
})
/**
 * 获取仓库当前分支统计信息信息
 */
const getRepoStatData = (branch: string) => {
    loading.value = true
    curBranch.value = branch
    // 获取日志
    repoTaskService.getBranchContributorsRank(repo.path, branch)
    .then((res) => {
        contributorsRankList.value = res
        // 获取仓库统计信息
        return repoTaskService.getContributeStat(repo.path, branch)
    }).then(res => {
        console.log("获取贡献数据完成")
        chartStore.start = res.totalStat.dateList[0]
        chartStore.end = _.last(res.totalStat.dateList) || res.totalStat.dateList[0]
        chartStore.changeFiles = res.totalStat.changeFiles
        chartStore.commitCount = res.totalStat.commitCount
        chartStore.deletions = res.totalStat.deletions
        chartStore.insertion = res  .totalStat.insertion
        chartStore.dateList = res.totalStat.dateList
        chartStore.authorMap = res.authorsStat
        commitCount.value = chartStore.commitCount.reduce((acc, cur)=>{return acc+cur})
        chartStore.path = repo.path
        chartStore.branch = curBranch.value
        loading.value = false
    })
}
watch(
    // 指定要观察哪个属性
    () => route.fullPath,
    (newRoute, oldRoute) => {
        console.log('路由参数变化，开始清除任务列表');
        // 在这里进行你的处理逻辑
        repoTaskService.interrupt()
        if (newRoute.startsWith('/repos/detail/')){
            repo = repoStore.getRepoByPath(path.value) as RepoItem
            getRepoStatData(repo.curBranch)
        }
    }
);
</script>

<style lang="scss" scoped>
.detail-container{
    width: 100%;
    height: 100vh;
    padding: 10px;
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    user-select: none;
    overflow: scroll;
    overflow-x: hidden;
    .head{
        box-sizing: border-box;
        user-select: none;
        display: flex;
        gap: 10px;
        .title{
            font-family: $font;
            font-size: 40px;
            height: 40px;
            line-height: 40px;
            font-weight: 600;
            color: #585252;
        }
    }

    .select-box{
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }
    .info-bar{
        .info-bar-container{
            border: #585252 1px solid;
            height: 50px;
            align-items: center;
            box-sizing: border-box;
            border-radius: 10px;
            overflow: hidden;
            .info-bar-item{
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: center;
                gap: 5px;
                .info-bar-content{
                    font-family: $font;
                    color: #000000;
                }
            }
        }
    }

    .contributors{
        .contributors-title{
            display: flex;
            flex-direction: row;
            gap: 5px;
            .contributors-title{
                font-family: $font;
                font-weight: 600;
            }
            .contributors-num{
                font-family: $font;
                color: white;
                font-size: 12px;
                font-weight: 600;
                border-radius: 40px;
                background-color: #7e8082;
                padding: 2px 10px;
            }
        }
        .contributors-list{
            display: flex;
            flex-wrap: wrap;
            flex-direction: row;
            margin-top: 5px;
            gap: 10px;
            .contributors-box{
                padding-left: 5px;
                display: flex;
                flex-direction: column;
                gap: 5px;
                .contributor{
                    width: 50px;
                    height: 50px;
                    background-color: #585252;
                }
            }
        }
    }
    .author-charts{
        display: grid;
        grid-template-columns: 50% 50%;
        grid-template-rows: 200px 200px;
    }
}
</style>