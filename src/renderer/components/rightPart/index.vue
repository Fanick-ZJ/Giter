<template>
  <!-- right body -->
  <div class="h-srceen flex 
              w-[calc(100vw-var(--left-bar-width))] bg-right-color
              flex-col" :style="width ? {width: width+'px'} : {flex: '1 1 auto'}">
    <!-- nav bar -->
    <div class="h-[var(--nav-bar-height)] text-2xl
                font-default font-semibold
               text-slate-600 flex">
      <!-- title -->
      <div v-if="pageName"> {{ pageName }}</div>
      <!-- arrow icon -->
      <div class="w-[var(--nav-bar-height)] h-[var(--nav-bar-height)]">
        <Icon icon="ic:round-arrow-left" 
        @click="back"
        width="30" height="30" 
        :style="{color: hasBack ? enabledColor : unenabledColor}" />
      </div>
      <div class="w-[var(--nav-bar-height)] h-[var(--nav-bar-height)]">
        <Icon icon="ic:round-arrow-right" 
        @click="forward"
        width="30" height="30"
        :style="{color: hasForward ? enabledColor : unenabledColor}"
        />
      </div>
    </div>
    <!-- body -->
    <router-view v-slot="{ Component }">
        <div class="flex-grow-1 h-[calc(100vh-var(--nav-bar-height))]">
          <keep-alive :include="keepAliveList">
            <component :is="Component"/>
          </keep-alive>
        </div>
    </router-view>
  </div>
</template>


<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';

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
* {
  --nav-bar-height: 30px;
}
</style>


