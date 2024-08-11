<template>
    <div class="leftBar" ref="leftBar">
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

    
</script>

<style scoped lang="scss">
.leftBar{
    background-color: #f0f3f6;
    height: 100vh;
    overflow-y: scroll;
    overflow-x: hidden;
    min-width: $left_bar_width;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0px;
}
</style>