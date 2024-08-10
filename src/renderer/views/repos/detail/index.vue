<template>
    <div class="detail-container" v-loading="loading">
        <div class="head">
            <!-- 当绑定的值位对象时，要使用value-key来指定key -->
            <el-col :span="8" class="select-box">
                <branch-select-bar :repo-path="repoInfo?.path" size="small" @change="getRepoStatData"/>
            </el-col>
        </div>
        <InfoBar :commit-count="commitCount" :tags="tags" :repo-info="repoInfo"></InfoBar>
        <AuthorWall :contributors-rank-list="contributorsRankList" style="margin-bottom: 10px;"></AuthorWall>
        <ContributeMaseterChart></ContributeMaseterChart>
        <div class="author-charts">
            <authorContributeChart v-for="item in chartStore.authorMap" :author="item[1].author" :key="item[1].key"></authorContributeChart>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/renderer/store/modules/repository';
import { useRoute, useRouter } from 'vue-router';
import {computed, onBeforeMount, onMounted, onUnmounted, ref, watch} from 'vue'
import { Branch, ContributorsRankItem, RepoItem, Repository} from '@/types';
import InfoBar from '@/renderer/components/detail/infoBar.vue'
import AuthorWall from '@/renderer/components/detail/authorWall.vue'
import ContributeMaseterChart  from '@/renderer/components/detail/contributeMasterChart.vue'
import authorContributeChart from '@/renderer/components/detail/authorContributeChart.vue';
import { useDetailChartStore } from '@/renderer/store/modules/detailChart';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { useI18n } from 'vue-i18n';
import { decode, encode } from '@/renderer/common/util/tools';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import _ from 'lodash';

const route = useRoute()
const router = useRouter()
const path = computed(() => decode(route.params.path as string)) // 对编码的路径解码
const repoStore = useRepoStore()
let repo = repoStore.getRepoByPath(path.value) as RepoItem
// 如果仓库不在的话就跳转到错误页面
onBeforeMount( () => {
    if (!repo){
        // 导航到错误页面
        router.push('/error/common/no_repo_found_title/no_repo_found_content/no_repo_found_tip')
    }
})
const curBranch = ref<Branch | undefined>()     // 当前分支
const i18n = useI18n()
const repoInfo = ref<Repository>()  // 仓库信息
const commitCount = ref<Number>(0)              // 当前分支提交次数
const contributorsRankList = ref<ContributorsRankItem[]>()  // 当前分支贡献者列表
const tags = ref<String[]>()
const loading = ref<boolean>(true)
const repoTaskService = new RepoTaskService()
const chartStore = useDetailChartStore()

const mountedFn = () => {
    // 获取仓库基本信息
    repoTaskService.getRepositoryInfo(repo.path).then ((res: Repository) => {
        repoInfo.value = res
        curBranch.value = res.curBranch
        getRepoStatData()
    }, error => {
        // 出现错误拦截
        console.log('连接超时', error)
        router.push(`/error/common/${encode(i18n.t('errorTitle.networkError'))}/${encode(i18n.t('errorContent.canNotLinkToRemote', {repoName: repo.name}))}`)
        loading.value = false
        // 中断promise链:
        return new Promise(() => {})
    })
}
onMounted(() => {
    mountedFn()
})
/**
 * 获取仓库当前分支统计信息信息
 */
const getRepoStatData = () => {
    loading.value = true
    // 获取日志
    repoTaskService.getTags(repo.path)
    .then(res => {
        tags.value = res
        // 获取仓库贡献排名
        return repoTaskService.getContributorsRank(repo.path, curBranch.value!.name)
    }).then((res) => {
        contributorsRankList.value?.splice(0, contributorsRankList.value.length)
        contributorsRankList.value = res
        // 获取仓库统计信息
        return repoTaskService.getContributeStat(repoInfo.value!.path, curBranch.value!.name)
    }).then(res => {
        chartStore.start = res.totalStat.dateList[0]
        chartStore.end = _.last(res.totalStat.dateList) || res.totalStat.dateList[0]
        chartStore.changeFiles = res.totalStat.changeFiles
        chartStore.commitCount = res.totalStat.commitCount
        chartStore.deletions = res.totalStat.deletions
        chartStore.insertion = res  .totalStat.insertion
        chartStore.dateList = res.totalStat.dateList
        chartStore.authorMap = res.authorsStat
        loading.value = false
        commitCount.value = chartStore.commitCount.reduce((acc, cur)=>{return acc+cur})
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
            mountedFn()
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