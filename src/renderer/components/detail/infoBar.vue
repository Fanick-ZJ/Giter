<template>
    <div class="info-bar">
        <el-row justify="center" class="info-bar-container">
            <el-col :span="8" class="info-bar-item">
                <Icon icon="solar:history-bold" color="black" width="20"/>
                <el-text size="large" class="info-bar-content">{{commitCount}} {{ $t('detailPage.commitCount') }}</el-text>
            </el-col>
            <el-col :span="8" class="info-bar-item">
                <Icon icon="iconoir:git-fork" color="black" width="20"/>
                <el-text size="large" class="info-bar-content">{{repoInfo?.branchs.length}} {{ $t('detailPage.branchCount') }}</el-text>
            </el-col>
            <el-col :span="8" class="info-bar-item">
                <Icon icon="mdi:tag-outline" color="black" width="20"/>
                <el-text size="large" class="info-bar-content">{{tags?.length}} {{ $t('detailPage.tagCount') }}</el-text>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { Repository } from '@/types';
import { Icon } from '@iconify/vue'
const {commitCount, repoInfo, tags} = defineProps<{
    commitCount: Number | undefined
    repoInfo: Repository | undefined
    tags: String[] | undefined
}>()
</script>

<style lang='scss' scoped>
    .info-bar{
        .info-bar-container{
            border: #585252 1px solid;
            height: 50px;
            align-items: center;
            box-sizing: border-box;
            border-radius: 10px;
            overflow: hidden;
            .info-bar-item{
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: center;
                gap: 5px;
                .info-bar-content{
                    font-family: $font;
                    color: #000000;
                }
            }
        }
    }
</style>