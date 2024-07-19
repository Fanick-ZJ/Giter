<template>
    <setting-item :title="$t('generalSetting.repoSetting')" :width="900" v-loading="reposLoading">
        <template #content>
            <el-table :data="repos" :fit="true" height="350">
            <el-table-column fixed :label="$t('generalSetting.avatar')" width="150"> 
                <template #default="scope">
                    <el-image
                        :src="scope.row.avatar" 
                        fit="contain">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column fixed prop="path" :formatter="repoBaseName" :label="$t('generalSetting.repsitory')" width="100" />
            <el-table-column prop="name" :label="$t('generalSetting.alias')" width="80" />
            <el-table-column prop="path" :label="$t('generalSetting.path')" width="200" />
            <el-table-column :label="$t('generalSetting.watchable')" width="100">
                <template #default="scope">
                    <el-switch v-model="scope.row.watchable" @change="() => updateRepoInfo(scope.row)"/>
                </template>
            </el-table-column>
            <el-table-column :label="$t('generalSetting.top')" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.isTop"  @change="() => updateRepoInfo(scope.row)"/>
                </template>
            </el-table-column>
            <el-table-column :label="$t('generalSetting.hidden')" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.isHidden"  @change="() => updateRepoInfo(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
        </template>
    </setting-item>
</template>

<script setup lang="ts">
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { basename } from '@/renderer/common/util/file';
import { RepoItem } from '@/types';
import { onMounted, ref, toRaw } from 'vue';
import settingItem from '@/renderer/components/setting/settingItem.vue';

const repos = ref<RepoItem[]>()
const repoService = new RepoTaskService()
const reposLoading = ref(false)
onMounted(async () => {
    reposLoading.value = true
    repos.value = await repoService.getAllRepos()
    reposLoading.value = false
})

const repoBaseName = (row: any, column: any, cellValue: string, index: number) => {
    return basename(row.path)
}

const updateRepoInfo = (repo: RepoItem) => {
    repoService.updateMainWindowRepoInfo(toRaw(repo))
}
</script>

<style lang="scss" scoped>

</style>