<template>
    <el-form :model="repoData" label-width="auto" style="max-width: 600px">
        <div class="dialog">
            <el-form-item :label="$t('dialog.alias')">
                <el-input v-model="repoData.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('dialog.avatar')">
                <div class="dialog__image">
                <el-image class="dialog__image__data"
                    :src="repoData.avatar" 
                    fit="contain">
                    <template #error>
                        <div class="dialog__image-empty_tip">
                            <el-icon><icon-picture /></el-icon>
                        </div>
                    </template>
                </el-image>
                <el-button class="dialog__image__button" @click="select_image">{{ $t('dialog.select') }}</el-button>
            </div>
            </el-form-item>
            <el-form-item :label="$t('dialog.realtime')">
                <el-switch v-model="repoData.watchable" />
            </el-form-item>
            <el-form-item :label="$t('dialog.isTop')">
                <el-switch v-model="repoData.isTop" />
            </el-form-item>
            <el-form-item :label="$t('dialog.isHidden')">
                <el-switch v-model="repoData.isHidden" />
            </el-form-item>
        </div>
    </el-form>
</template>

<script lang="ts" setup>
import { ExplorerTaskService } from '@/renderer/common/entity/explorerTaskService';
import { AbstractRepoItem, RepoItem } from '@/types';
import { Picture as IconPicture } from '@element-plus/icons-vue'
import { ref, onMounted, PropType, reactive, toRaw, toRefs } from 'vue'
import { useI18n } from 'vue-i18n';

export type Expose = {
    repo: RepoItem
}
type _P = {
    repo: RepoItem,
    expose: (data: Expose) => void
}
const props = defineProps<_P>()
const repoData = reactive(JSON.parse(JSON.stringify(props.repo)) as RepoItem)
const explorService = new ExplorerTaskService()
const i18n = useI18n()

onMounted(() => {
    props.expose({repo: repoData})
})

const select_image = () => {
    explorService.showOpenDialog({
        title: i18n.t('dialog.selectImage'),
        filters: [
            { name: 'image', extensions: ['jpg', 'png', 'jpeg'] }
        ],
        properties: ['openFile'],
        buttonLabel: i18n.t('dialog.select'),
        defaultPath: '.'
    }).then( path => {
        explorService.readImage(path[0]).then(res => {
            repoData.avatar = res
        })
    })
}
</script>

<style lang="scss" scoped>
.dialog {
    font-family: $font;
    .dialog__image{
        display: flex;
        gap: 10px;
        align-items: flex-end;
        .dialog__image__data{
            width: 100px; 
            height: 100px;
            border-radius: 10%;
            .dialog__image-empty_tip {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: var(--el-fill-color-light);
            }
        }
    }
}

</style>