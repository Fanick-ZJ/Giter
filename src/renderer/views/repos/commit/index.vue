<template>
    <div class="grap-container" v-loading="loading">
        <el-row class="top-bar">
            <el-text class="mx-1 select-label" size="large">{{ $t('commitGraph.current_branch') }}</el-text>
            <el-col :span="8" class="select-box">
                <branch-select-bar :repo-info="respoItem" size="small" @change="branchChange"/>
            </el-col>
        </el-row>
        <el-row v-auto-animate class="commit-container">
            <template v-for="item in commitList.slice((currentPage - 1) * pageSize, (currentPage) * pageSize)" :key="item.hash">
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
                :total="commitList.length"
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
import { CommitDetail } from '@/renderer/types';
import { Branchs } from '@/types';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode } from '@/renderer/common/util/tools';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import { onRouteChangeUpdate } from '@/renderer/common/hook/useRouter';

defineOptions({ name: 'commitGraph' })
const route = useRoute();
const path = computed(() => decode(route.params.path as string)) // 对编码的路径解码
const respoStore = useRepoStore()
// 根据路径获取仓库对象
let respoItem = computed(() => respoStore.getRepoByPath(path.value))
const branchs = ref<Array<string>>([])
const curBranch = ref()
const loading = ref(true)
const commitList = ref<CommitDetail[]>([])
const repoTaskService = new RepoTaskService()

const mountedFn = () => {
    if (respoItem.value) {
        repoTaskService.getRepoBranch(respoItem.value.path).then((res: Branchs) => {
            branchs.value = res.all
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
        resp.then( (res: CommitDetail[]) => {
            commitList.value = res
            loading.value = false
        })
    }
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
        top: 0;
        z-index: 2;
        background-color: $right_part_background;
        position: absolute;
        height: $top_bottom_height;
        padding: 0 10px;
    }
    .top-bar::before{
        content: "";
        height: calc($top_bottom_height + 10px);
        width: 100%;
        background-color: $right_part_background;
        position: absolute;
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
        flex-direction: column;
        justify-content: center;
    }
    .commit-container {
        display: block;
        height: calc(100% - 2 * $top_bottom_height);
        margin-top: $top_bottom_height;
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