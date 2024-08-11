<template>
  <div class="right-body" :style="width ? {width: width+'px'} : {flex: '1 1 auto'}">
    <div class="nav-bar">
      <div class="page-title" v-if="pageName"> {{ pageName }}</div>
      <div class="router-arrow">
        <Icon icon="ic:round-arrow-left" 
        @click="back"
        width="30" height="30" 
        :style="{color: hasBack ? enabledColor : unenabledColor}" />
      </div>
      <div class="router-arrow">
        <Icon icon="ic:round-arrow-right" 
        @click="forward"
        width="30" height="30"
        :style="{color: hasForward ? enabledColor : unenabledColor}"
        /></div>
    </div>
    <router-view v-slot="{ Component }">
        <div class="page-content">
          <keep-alive :include="keepAliveList">
            <component :is="Component"/>
          </keep-alive>
        </div>
    </router-view>
  </div>
</template>


<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

/**
 * 同一路由连接不同参数页面不刷新解决办法：
 * 修改router-view，在app.vue页面给标签加key，当key不同时，就会刷新。
 * 完整代码片段如下
 */

defineProps({
    width: {
        type: Number,
        required: false,
    },
})


const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const pageName = ref('')

const hasBack = ref<boolean>()
const hasForward = ref<boolean>()

const keepAliveList = ['commitGraph']

watch(() => route.fullPath, () => {
  hasBack.value = history.state.position != null
  hasForward.value = history.state.forward != null
  pageName.value = i18n.t(route.meta.pageName ? route.meta.pageName as string: "")
})
const enabledColor = '#282828'
const unenabledColor = '#9aa0a6'
const back = () => {
  if (hasBack.value){
    router.back()
  }
}

const forward = () => {
  if (hasForward.value){
    router.forward()
  }
}


</script>

<style lang="scss" scoped>
  $__nav-bra_height: 30px;
.right-body{
  // flex: 1 1 auto;
  height: 100vh;
  display: flex;
  width: calc(100vw - var(--left-bar-width));
  background-color: $right_part_background;
  flex-direction: column;

  .nav-bar{
    height: $__nav-bra_height;
    font-size: $__nav-bra_height;
    font-family: $font;
    font-weight: 600;
    padding: 5px 20px;
    color: #737b89;
    display: flex;
    
    .router-arrow{
      width: $__nav-bra_height;
      height: $__nav-bra_height;
    }
  }
  .page-content{
    flex-grow: 1;
    height: calc(100vh - $__nav-bra_height);
    padding: 10px 20px 10px 20px;
  }
}
</style>


