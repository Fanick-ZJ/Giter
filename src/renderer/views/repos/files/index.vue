<template>
    <div class="__files__wrapper">
        <el-row class="__files__wrapper__header">
            <el-col :span="19">
                <el-breadcrumb :separator-icon="ArrowRight">
                    <el-breadcrumb-item 
                        v-for=" item in filesStore.fileNaivgation"
                        :to="{'path': filesStore.spellPath(item.id)}"
                        @click="filesStore.fileNaviTo(item.id)">
                        {{ item.name }}
                    </el-breadcrumb-item>
                </el-breadcrumb>
            </el-col>
            <el-col :span="5" class="select-box">
                <branch-select-bar :repo-path="path" size="small" :branch="tag" @change="onBranchChange" :key="path"/>
            </el-col>
        </el-row>
        <router-view v-slot="{ Component }" :key="route.fullPath">
            <div class="__files__container">
                <component :is="Component"/>
            </div>
        </router-view>
    </div>
</template>

<script lang="ts" setup>
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode, encode } from '@/renderer/common/util/tools';
import { FilePath, useFileStore } from '@/renderer/store/modules/files';
import { useRepoStore } from '@/renderer/store/modules/repository';
import { RepoItem } from '@/types';
import { ArrowRight } from '@element-plus/icons-vue'
import { Ref, computed, nextTick, onMounted, ref, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import branchSelectBar from '@/renderer/components/common/branchSelectBar/index.vue'
import { RepoFileInfo } from 'lib/git';

const route = useRoute()
const router = useRouter()
const filesStore = useFileStore()
const repoStore = useRepoStore()
const tag = computed(() => decode(route.params.tag as string))
const path = computed(() => decode(route.params.path as string))
const taskService = new RepoTaskService()

let repoItem: Ref<RepoItem | undefined> = ref(repoStore.getRepoByPath(path.value))

const MountedFn = () => {
    // 只在当前路由为此页面是才刷新
    if (route.name === 'repos-file') {
        taskService.getReposFileList(path.value, tag.value)
        .then(async (files:RepoFileInfo[]) => {
            filesStore.resetFileList(files)
            repoItem = ref(repoStore.getRepoByPath(path.value))
            filesStore.toPath({ path: '/', repo: path.value })
        })
    }
}
onMounted(() => {
    MountedFn()
})


onBeforeRouteUpdate((to, from) => {
    if (to.name == 'repos-file'
        && to.params.path == from.params.path
        && to.params.tag == from.params.tag){
            return false
        }
    return true
})

const onBranchChange = (chosed: string) => {
    router.replace(`/repos/files/${encode(path.value)}/${encode(chosed)}`)
}

watch(path, (newVal, oldVal)=>{
    MountedFn()
})

watch(tag, (newVal, oldVal) => {
    MountedFn()
})

</script>

<style lang="scss" scoped>
$__files__wrapper__header__height: 40px;
.__files__wrapper{
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    .__files__wrapper__header {
        height: $__files__wrapper__header__height;
    }
    .__files__container{
        height: calc(100% - $__files__wrapper__header__height)
    }
}

</style>