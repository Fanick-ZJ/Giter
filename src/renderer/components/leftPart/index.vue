<template>
    <div class="bg-[#f0f3f6] h-screen
                overflow-y-scroll overflow-x-hidden
                 flex
                flex-col px-2 py-2" 
        :style="{width: width+'px'}"
        ref="leftBar">
        <template 
            v-for="item in repoStore.list"
            :key="item.path">
            <ReposItem 
                v-if="!item.isHidden"
                :repos="item"/>
        </template>
    </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref, watch} from 'vue';
import ReposItem from './reposItem.vue'
import {useRepoStore} from '@/renderer/store/modules/repository'
import { useRoute } from 'vue-router';
import { decode } from '@/renderer/common/util/tools';
const leftBar = ref<HTMLElement>()
// 获取记录中的仓库对象
const repoStore = useRepoStore()
defineProps({
    width: {
        type: Number,
        required: false,
        default: 200
    },
})

const route = useRoute()
watch(() => route.fullPath, (newVal, oldVal) => {
    if (newVal.startsWith('/repos') && route.params.path) {
        const repoItem = repoStore.getRepoByPath(decode(route.params.path as string))
        repoItem ? repoStore.chooseRepos(repoItem) : repoStore.cancelChosedRepos()
    } else {
        repoStore.cancelChosedRepos()
    }
})
    
</script>

<style scoped lang="scss">
</style>