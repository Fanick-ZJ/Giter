import { RepoTaskService } from '../../common/entity/repoTaskService';
<template>
    <div class="__setting__container">
        <repo-setting />
    </div>
</template>

<script setup lang="ts">
import RepoSetting from './repoSetting.vue'

</script>

<style lang="scss" scoped>
.__setting__container {
    display: flex;
}

</style>