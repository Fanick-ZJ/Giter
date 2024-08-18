<template>
  <div class="size-full flex relative overflow-hidden" ref="wrapperRef">
      <OpenWith/>
      <LeftPart :width="size1"/>
      <div ref="draBarRef" class="absolute w-[5px] h-full" :style="{left: size1+'px'}"></div>
      <RightPart :width="size2" />
      <draggable-bag/>
  </div>
</template>

<script setup lang="ts">
import LeftPart from '@/renderer/components/leftPart/index.vue'
import { useMainRoute } from '@/renderer/store/modules/route';
import { useRepoStore } from '@/renderer/store/modules/repository';
import RightPart from '@/renderer/components/rightPart/index.vue'
import OpenWith from '@/renderer/components/common/openWith/index.vue'
import draggableBag from '@/renderer/components/common/fileBag/draggableBag.vue';
import { ConfigTaskService } from '@/renderer/common/entity/configTaskService';
import { onMounted, ref } from 'vue';
import { useDragBar } from '@/renderer/common/hook/useDragBar';

const mainRouter = useMainRoute()
const configService = new ConfigTaskService()
configService.getLanguage().then(res => {
    console.log(res)
})

const size1 = ref(200)
const size2 = ref(window.innerWidth - size1.value)
window.onresize = () => {
    size2.value = window.innerWidth - size1.value
}
const draBarRef = ref<HTMLElement>()
const wrapperRef = ref<HTMLElement>()
onMounted(() => {
  if (draBarRef.value && wrapperRef.value) {
    const cancel = useDragBar(draBarRef.value, wrapperRef.value, size1, size2, 100, 'horizontal')
  }

})
// 注册全局IPC通信事件
mainRouter.routeTo()  // 监控路由信息
const repoStore = useRepoStore()
repoStore.renderAddRepo() // 添加仓库新建事件
repoStore.receiveUpdateRepoInfo() // 监控仓库信息更新
repoStore.receiveSwitchRepoStatus() // 监控仓库状态
repoStore.getAllRepos() // 获取仓库列表
</script>


<style scoped lang="scss">
</style>
