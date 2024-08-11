<template>
    <div class="bg-[#f0f3f6] h-screen
                overflow-y-scroll overflow-x-hidden
                 flex
                flex-col px-2 py-2" 
        :style="{width: width+'px'}"
        ref="leftBar">
        <template 
            v-for="item in respoStore.list"
            :key="item.path">
            <ReposItem 
                v-if="!item.isHidden"
                :repos="item"/>
        </template>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import ReposItem from './reposItem.vue'
import {useRepoStore} from '@/renderer/store/modules/repository'
const leftBar = ref<HTMLElement>()
// 获取记录中的仓库对象
const respoStore = useRepoStore()
defineProps({
    width: {
        type: Number,
        required: false,
        default: 200
    },
})
    
</script>

<style scoped lang="scss">
</style>