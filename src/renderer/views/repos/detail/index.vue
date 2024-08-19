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
            <!-- <AuthorWall :contributors-rank-list="contributorsRankList" :repo-info="repo" style="margin-bottom: 10px;"></AuthorWall> -->
            <ContributeMaseterChart></ContributeMaseterChart>
            <div class='w-full h-[400px]'>
                <virtual-list :data-source="getAuthorMapGroup()"
                    direction="vertical" 
                    :gap="10" 
                    :estimate-height="200" 
                    :loading="false">
                    <template #item="{ item }">
                        <div class="grid grid-cols-2 gap-[10px]">
                            <authorContributeChart 
                                v-for="authorContribute in item.data" 
                                :author-stat="authorContribute"
                                :cur-show-data="curShowData"
                                :key="authorContribute.author.name + curBranch + authorContribute.author.email"
                            ></authorContributeChart>
                        </div>
                    </template>
                </virtual-list>
            </div>
        </div>
    </loading-page>
</template>

<script setup lang="ts">
import { useRepoStore } from '@/renderer/store/modules/repository';
import { useRoute, useRouter } from 'vue-router';
import {computed, nextTick, onBeforeMount, onMounted, onUnmounted, ref, watch} from 'vue'
import { RepoItem} from '@/types';
import InfoBar from '@/renderer/components/detail/infoBar.vue'
import AuthorWall from '@/renderer/components/detail/authorWall.vue'
import ContributeMaseterChart  from '@/renderer/components/detail/contributeMasterChart.vue'
import authorContributeChart from '@/renderer/components/detail/authorContributeChart.vue';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode, encode, uuid } from '@/renderer/common/util/tools';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import _ from 'lodash';
import { Author, AuthorStatDailyContribute, Branch, BranchStatDailyContribute, StatDailyContribute } from 'lib/git';
import LoadingPage from '@/renderer/components/common/LoadingPage/index.vue';
import { IdAuthor } from '@/renderer/components/detail/type';
import VirtualList from '@/renderer/components/common/virtualList/index.vue';
import { CurShowData } from './type';
import dayjs from 'dayjs';
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
const contributorsRankList = ref<IdAuthor[]>([])  // 当前分支贡献者列表
const loading = ref<boolean>(true)
const repoTaskService = new RepoTaskService()

const containerRef = ref<HTMLElement>()

type AuthorContributeGroup = {
    id: number,
    data: AuthorStatDailyContribute[]
}

type DetailChartStoreType = StatDailyContribute
                            & Record<'authorMap', AuthorStatDailyContribute[]> 
                            & Record<'start', Date> 
                            & Record<'end', Date> 
                            & Record<'path', string>
                            & Record<'branch', string>


const repoStatInfo = ref<DetailChartStoreType>()
const curShowData = ref<CurShowData>('commits')
const getAuthorMapGroup = () => {
    const group: AuthorContributeGroup[] = []
    if (repoStatInfo.value) {
        for (let i = 0, j = 0; i < repoStatInfo.value!.authorMap.length; i += 2) {
            const g = {
                id: j++,
                data: repoStatInfo.value!.authorMap.slice(i, i + 2)
            }
            group.push(g)
        }
        return group
    } else return []
}


onMounted(async () => {
    await nextTick()
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
        contributorsRankList.value = res.map((item: Author, index: number) => Object.defineProperty(item, 'id', {value: index})) as IdAuthor[]
        // 获取仓库统计信息
        return repoTaskService.getContributeStat(repo.path, branch)
    }).then((res: BranchStatDailyContribute) => {
        console.log("获取贡献数据完成")
        repoStatInfo.value = {
            start: new Date(res.totalStat.dateList[0]),
            end: new Date(res.totalStat.dateList[res.totalStat.dateList.length - 1] || res.totalStat.dateList[0]),
            changeFiles: res.totalStat.changeFiles,
            deletions: res.totalStat.deletions,
            insertion: res.totalStat.insertion,
            dateList: res.totalStat.dateList,
            authorMap: res.authorsStat,
            path: repo.path,
            branch: curBranch.value,
            commitCount: res.totalStat.commitCount,
        }
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