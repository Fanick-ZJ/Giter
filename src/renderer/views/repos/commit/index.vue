<template>
    <div class="grap-container" v-loading="loading">
        <el-row class="top-bar" justify="space-between">
            <el-col :span="10" class="select-box">
                <el-text class="select-label" size="default">{{ $t('commitGraph.current_branch') }}</el-text>
                <branch-select-bar
                 :repo-info="respoItem" 
                 size="small"
                @change="branchChange"
                style="width: 200px"/>
            </el-col>
            <el-col :span="4" class="filter-box" data-size-small>
                <el-text class="mx-1 select-label" size="large">{{ $t('commitGraph.filter') }} </el-text>
                <el-popover placement="bottom" :width="400" :visible="filterVisible">
                <template #reference>
                    <el-text size="large" @click="() => filterVisible= true">⬇️ </el-text>
                </template>
                <div>
                    <commit-filter 
                        @filter-result="filterResult"
                        :contributors="contributorsList"></commit-filter>
                </div>
                </el-popover>
            </el-col>
        </el-row>
        <el-row v-auto-animate class="commit-container">
            <template v-for="item in filteredCommitList.slice((currentPage - 1) * pageSize, (currentPage) * pageSize)" :key="item.hash">
                <commit-detail-item :detail="item" :repo="respoItem!"/>
            </template>
        </el-row>
        <el-row class="pagination">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30, 40]"
                :small="true"
                :background="true"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredCommitList.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useRepoStore } from '@/renderer/store/modules/repository';
import { ref, onMounted, computed } from 'vue';
import CommitDetailItem from "@/renderer/components/commitGraph/commitDetailItem.vue";
import { Branches, CommitLogFields } from '@/types';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode } from '@/renderer/common/util/tools';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import { onRouteChangeUpdate } from '@/renderer/common/hook/useRouter';
import commitFilter from '@/renderer/components/commitGraph/commitFilter.vue'

defineOptions({ name: 'commitGraph' })
const route = useRoute();
const path = computed(() => decode(route.params.path as string)) // 对编码的路径解码
const respoStore = useRepoStore()
// 根据路径获取仓库对象
let respoItem = computed(() => respoStore.getRepoByPath(path.value))
const branches = ref<Array<String>>([])
const curBranch = ref()
const loading = ref(true)
const commitList = ref<CommitLogFields[]>([])
const repoTaskService = new RepoTaskService()

const contributorsList = computed(() => Array.from(new Set(commitList.value.map((item) => item.author_name))))

const mountedFn = () => {
    if (respoItem.value) {
        repoTaskService.getRepoBranch(respoItem.value.path).then((res: Branches) => {
            branches.value = res.all
            curBranch.value = res.current   // 默认选中第一个
            branchChange(curBranch.value)
        })
    }
}

onRouteChangeUpdate(() => {
    mountedFn()
})

onMounted(() => {
    mountedFn()
})

const branchChange = (value: string) => {
    if (respoItem.value){
        loading.value = true
        const resp = repoTaskService.getLog(respoItem.value.path, value)
        resp.then( (res: CommitLogFields[]) => {
            commitList.value = res
            loading.value = false
        })
    }
}

const filterVisible = ref(false)
const filteredContributor = ref<string>()
const filteredTimeRange = ref<[Date, Date]>()
const filteredMessage = ref<string>()

// 过滤结果
/**
 * @param success 是否过滤成功
 * @param author 过滤的作者
 * @param time 过滤的时间范围
 * @param message 过滤的提交信息
 */
const filterResult = (success: boolean, author?: string, time?: [Date, Date], message?: string) => {
    filterVisible.value = false
    if (success) {
        filteredContributor.value = author
        filteredTimeRange.value = time
        filteredMessage.value = message
    }
}

onRouteChangeUpdate(() => {
    clearFilter()
    filterVisible.value = false
})

// 过滤后的提交列表
const filteredCommitList = computed(() => {
    let _commitList: CommitLogFields[] = commitList.value
    if (commitList.value) {
        if (filteredContributor.value) {
            _commitList = _commitList.filter((item) => item.author_name === filteredContributor.value)
        }
        if (filteredTimeRange.value) {
            _commitList = _commitList.filter((item) => {
                const date = new Date(item.date)
                return date >= filteredTimeRange.value![0] && date <= filteredTimeRange.value![1]
            })
        }
        if (filteredMessage.value) {
            _commitList = _commitList.filter((item) => item.message.includes(filteredMessage.value!))
        }
    }
    return _commitList
})

const clearFilter = () => {
    filteredContributor.value = undefined
    filteredTimeRange.value = undefined
    filteredMessage.value = undefined
}

const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
/**
 * 页面大小变化
 * @param val
 */
const handleSizeChange = (val: number) => {
}

const handleCurrentChange = (val: number) => {

}
</script>

<style lang="scss" scoped>
@import "element-plus/theme-chalk/display.css";
    $top_bottom_height: 30px;
    * {
        font-family: $font;
    }
    .grap-container{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .top-bar{
        width: 100%;
        z-index: 2;
        background-color: $right_part_background;
        height: $top_bottom_height;
        padding: 0 10px;
        margin-bottom: 10px;
        position: relative;
    }
    .top-bar::after{
        content: "";
        height: calc($top_bottom_height + 10px);
        width: 100%;
        background-color: $right_part_background;
        position: absolute;
        bottom: -20px;
        filter: blur(5px);
        z-index: -1;
    }
    .select-label {
        font-weight: 600;
        margin-right: 10px;
        line-height: 38px;
        box-sizing: border-box;
    }
    .select-label::after {
        content: ":";
    }
    .select-box{
        display: flex;
        align-items: center;
    }
    .filter-box{
        padding: 0px 10px;
        border-radius: 10px;
        border: #bdbdbd86 solid 1px;
        display: grid;
        grid-template-columns: 60px 1fr;
        &[data-size-small]{
            &:nth-child(2) {
                text-align: center;
            }
        }
    }
    .commit-container {
        display: block;
        height: calc(100% - 2 * $top_bottom_height);
        overflow-y: scroll;
        overflow-x: hidden;
        padding: 0 10px;
    }
    .pagination{
        display: flex;
        width: 100%;
        overflow-x: clip;
        overflow-y: visible;
        position: absolute;
        bottom: 0px;
        height: $top_bottom_height;
        justify-content: center;
        align-content: center;
        z-index: 2;
    }
    .pagination::before{
        content: "";
        position: absolute;
        height: calc($top_bottom_height + 10px);
        width: 100%;
        background-color: $right_part_background;
        filter: blur(5px);
        top: -10px;
        z-index: -1;
    }
::-webkit-scrollbar
{
    width:5px;
    height:10px;
    background-color:rgba(255, 255, 255, 0.271)
}
/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track
{
    background-color:#f0ebeb00;
}
/*定义滑块
rgb(255, 255, 255) 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
    border-radius:10px;
    -webkit-box-shadow:inset 0 0 6px rgba(0,0,0,.3);
    background-color:#bdbdbd86;
}
</style>