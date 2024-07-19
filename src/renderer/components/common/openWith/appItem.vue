<template>
    <div class="__app__item__wrapper" 
    v-context-menu="menuOption"
    :style="{
        width: props.width + 'px',
        height: props.height + 'px'
    }">
        <div class="__app__item__icon"
            @click="openProj"
        :style="{
            width: props.width + 'px',
            height: props.height + 'px'
        }">
            <img :src="appItem.icon" alt="" srcset="" :width="props.width">
        </div>
        
    </div>
</template>

<script setup lang='ts'>
import { PropType, toRaw } from 'vue';
import { useOpenWith } from '@/renderer/store/modules/openWith';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { KeyMap } from '@/renderer/types';

import { CustomMouseMenuOptions } from '@/renderer/common/util/contextMenuUtil'
import { createMenuItem } from '@/renderer/common/util/contextMenuUtil';
import { useI18n } from 'vue-i18n';
import { get, getStoreObject, put, remove } from '@/renderer/common/util/dbUtil';
import { OpenWithApp } from '@/types';

const props = defineProps({
    appItem: {
        type: Object as PropType<OpenWithApp>,
        required: true
    },
    width: {
        type: Number,
        required: false
    },
    height: {
        type: Number,
        required: false
    }
})
const i18n = useI18n()
const menuOption: CustomMouseMenuOptions = {
        menuWidth: 100,
        menuItemCss: {
            arrowSize: '8px'
        },
        menuList: [
        createMenuItem(i18n.t('openWithDialog.del'), [KeyMap.Ctrl, KeyMap.I], ()=>{delApp()}),
        ]
    }
const store = useOpenWith()
const repoTaskService = new RepoTaskService()
const openProj = () => {
    repoTaskService.openProject(store.filePath, props.appItem.path)
}

const delApp = async () => {
    let db = await getStoreObject(['openWith'])
    if (props.appItem.groups.length == 1){
       remove(db, props.appItem.path)
    }else {
        const tmp = toRaw(props.appItem)
        tmp.groups.filter(item => item != store.group)
        put(db, tmp)
    }
    store.appList = store.appList.filter(item => item.path != props.appItem.path)
}
</script>

<style lang="scss" scoped>
.__app__item__wrapper{
    --app-item-wrapper-backgroun-color-hover: rgba(156, 154, 154, 0.479);
}
.__app__item__wrapper{
    padding: 5px;
    box-sizing: content-box;
    border-radius: 10%;
    &:hover{
        background-color: var(--app-item-wrapper-backgroun-color-hover);
    }
}
</style>