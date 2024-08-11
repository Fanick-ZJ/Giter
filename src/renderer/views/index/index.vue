<template>
  <div class="container">
      <OpenWith/>
      <LeftPart/>
      <RightPart/>
      <draggable-bag/>
  </div>
</template>

<script setup lang="ts">
import LeftPart from '@/renderer/components/leftPart/index.vue'
import { useMainRoute } from '@/renderer/store/modules/route';
import { useRepoStore } from '@/renderer/store/modules/repository';
import RightPart from '@/renderer/components/rightPart/index.vue'
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import OpenWith from '@/renderer/components/common/openWith/index.vue'
import draggableBag from '@/renderer/components/common/fileBag/draggableBag.vue';
import { ConfigTaskService } from '@/renderer/common/entity/configTaskService';
const mainRouter = useMainRoute()
const repoTaskService = new RepoTaskService()
const configService = new ConfigTaskService()
configService.getLanguage().then(res => {
    console.log(res)
})

// 注册全局IPC通信事件
mainRouter.routeTo()  // 监控路由信息
const repoStore = useRepoStore()
repoStore.renderAddRepo() // 添加仓库新建事件
repoStore.receiveUpdateRepoInfo() // 监控仓库信息更新
repoStore.receiveSwitchRepoStatus() // 监控仓库状态
repoTaskService.storeGetAllRepos()  // 获取仓库列表
</script>


<style scoped lang="scss">
.container{
  width: 100vw;
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
}
</style>
