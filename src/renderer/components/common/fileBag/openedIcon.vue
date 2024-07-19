<template>
    <div>
        <el-tooltip
            class="box-item"
            effect="dark"
            :content="file.name"
            placement="left-start">
            <Icon 
                class='__draggable__bag__tabbar__item'
                :key="file.objectName"
                :width="width"
                :height="height"
                v-context-menu="menuOption"
                :icon="getIconByExt(file.name)">
            </Icon>
        </el-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { createMenuItem } from '@/renderer/common/util/contextMenuUtil';
import { getExt, getIconByExt } from '@/renderer/common/util/file';
import { CustomMouseMenuOptions } from '@/renderer/components/common/contextMenu/types';
import { useI18n } from 'vue-i18n'
const props = defineProps({
    file: {
        type: Object,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    }
})

const i18n = useI18n()
const menuOption: CustomMouseMenuOptions = {
        menuItemCss: {
            arrowSize: '8px',
            labelFontSize: '12px'
        },
        menuList: [
            createMenuItem(i18n.t('openedFile.close'), [], ()=>{console.log('close')}),
        ],
        menuWidth: 100,
    }
</script>

<style lang="scss" scoped>

.__draggable__bag__tabbar__item{
    margin: 5px 5px;
}
</style>