<template>
    <loading-page :loading="loading">
        <!-- grap-container -->
        <div class="w-full h-full
                    box-border relative
                    overflow-x-hidden">
            <!-- tool bar -->
            <el-row class="w-full z-[2]
                            bg-right-color h-[var(--tool-bar-height)]
                            py-[1] relative
                            after:content-[''] after:h-[calc(var(--tool-bar-height)+10px)]
                            after:w-full after:bg-right-color
                            after:absolute after:bottom-[-20px]
                            after:blur-sm after:z-[-1]" justify="space-between">
                <!-- branch select bar -->
                <el-col :span="10" class="flex items-center
                                          gap-2">
                    <!-- select label -->
                    <el-text class="font-semibold mr-[10px]
                                    leading-[38px] box-border
                                    after:content-['']" size="default">{{ $t('commitGraph.current_branch') }}</el-text>
                    <branch-select-bar
                    :repo-path="path" 
                    size="small"
                    @change="branchChange"
                    style="width: 200px"/>
                </el-col>
                <!-- filter -->
                <el-col :span="4" class="px-[10px] rounded-[10px]
                                        border-solid border-1
                                        border-slate-400 text-align-center">
                    <el-text class="mx-1 font-semibold 
                                    mr-[10px] leading-[38px] 
                                    box-border" size="large">{{ $t('commitGraph.filter') }} </el-text>
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
            <el-row v-auto-animate 
                class="block h-[calc(100%-2*var(--tool-bar-height))]
                       overflow-y-scroll overflow-x-hidden
                       px-[10px] py-[10px]
                       gap-[10px] flex-row
                       content-start">
                <commit-detail-item
                    class="hover:scale-[1.01]"
                    :detail="item" 
                    :repo="respoItem!"
                    v-for="item in filteredCommitList.slice((currentPage - 1) * pageSize, (currentPage) * pageSize)"
                    :key="item.hash"/>
            </el-row>
            <el-row class="w-full justify-center
                           overflow-x-clip overflow-y-visible
                           absolute bottom-0 
                           content-center z-2 h-[var(--tool-bar-height)]
                           after:content-[''] after:absolute
                           after:h-[20px] after:w-full
                           after:bg-right-color after:blur-sm 
                           after:top-[-5px] after:z-[1]">
                <el-pagination
                    class="z-[2]"
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
    </loading-page>
    
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { RepoStoreItem, useRepoStore } from '@/renderer/store/modules/repository';
import { ref, onMounted, computed, watch } from 'vue';
import CommitDetailItem from "@/renderer/components/commitGraph/commitDetailItem.vue";
import { CommitLogFields, RepoItem } from '@/types';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode } from '@/renderer/common/util/tools';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import { onRouteChangeUpdate } from '@/renderer/common/hook/useRouter';
import commitFilter from '@/renderer/components/commitGraph/commitFilter.vue'
import LoadingPage from '@/renderer/components/common/LoadingPage/index.vue';

defineOptions({ name: 'commitGraph' })
const route = useRoute();
const path = ref<string>('')
const respoStore = useRepoStore()
// 根据路径获取仓库对象
let respoItem = ref<RepoStoreItem>()
watch(() => route.fullPath, (newVal, oldVal) => {
    if (newVal.startsWith('/repos/commit')) {
        path.value = decode(route.params.path as string)
        respoItem.value = respoStore.getRepoByPath(path.value)
    }
}, {immediate: true})
const branches = ref<string[]>([])
const curBranch = ref()
const loading = ref(true)
const commitList = ref<CommitLogFields[]>([])
const repoTaskService = new RepoTaskService()

const contributorsList = computed(() => Array.from(new Set(commitList.value.map((item) => item.author_name))))

const mountedFn = () => {
    if (respoItem.value) {
        branches.value = respoItem.value.branches
        curBranch.value = respoItem.value.curBranch   // 默认选中第一个
        branchChange(respoItem.value.curBranch)
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
* {
    --tool-bar-height: 40px;
}
</style>