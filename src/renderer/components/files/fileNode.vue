<template>
    <div :class="['__file__node', '__file__node-'+size]">
        <div class="__file__node_icon">
            <template v-if="file.isDir">
                <Icon icon="flat-color-icons:folder" 
                    :height="currentSize.iconHeight"
                    :width="currentSize.iconWidth"/>
            </template>
            <template v-else>
                <Icon :icon="getIconByExt(file.name)"
                :height="currentSize.iconHeight"
                :width="currentSize.iconWidth"/>
            </template>
        </div>
        <div class="__file__node_name" :style="{ fontSize: currentSize.fontSize +'px'}">
            {{ file.name }}
        </div>
    </div>
</template>


<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { RepoFileInfo } from '@/types';
import { PropType, ref, computed } from 'vue';
import { getExt, getIconByExt } from '@/renderer/common/util/file';
import { useFileStore } from '@/renderer/store/modules/files';
import { useRoute } from 'vue-router';

type NodeSize = 'large' | 'small' | 'medium' | never

type NodeBoxInfo = {
    size: NodeSize
    iconHeight: number
    iconWidth: number
    titleHeight: number
    fontSize: number
}

const props = defineProps({
    size: {
        type: String as PropType<NodeSize>,
        default: 'medium'
    },
    file: {
        type: Object as PropType<RepoFileInfo> ,
        required: true
    }
})

/**
 * 根据NodeSize计算节点的大小
 * @param size
 * @returns
 */
const getNodeBoxInfo = (size: NodeSize): NodeBoxInfo => {
    switch (size) {
        case 'large':
            return {
                size: 'large',
                iconHeight: 140,
                iconWidth: 140,
                titleHeight: 50,
                fontSize: 20
            }
        case 'small':
            return {
                size: 'small',
                iconHeight: 50,
                iconWidth: 50,
                titleHeight: 10,
                fontSize: 8
            }
        case 'medium':
            return {
                size: 'medium',
                iconHeight: 70,
                iconWidth: 70,
                titleHeight: 30,
                fontSize: 12
            }
        default:
            return {
                size: 'medium',
                iconHeight: 80,
                iconWidth: 80,
                titleHeight: 30,
                fontSize: 12
            }
    }
}


const currentSize = computed(() => getNodeBoxInfo(props.size))
</script>

<style lang="scss" scoped>
.__file__node {
    box-sizing: border-box;
    padding: 10px;
    display: flex;
    flex-direction: column;
    text-align: center;
    .__file__node_name {
        text-align: center;
        max-width: 100%;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        overflow-wrap: break-word;
        overflow: hidden;
        margin-bottom: 2px;
        font-family: $font;
    }
    &:hover {
        background-color: #ffffff;
        // box-shadow: 1px 1px 3px 0px #00000045;
        border-radius: 10px;
    }
}
.__file__node-small {
    width: 70px;
    height: 110px;
}
.__file__node-medium {
    width: 100px;
    height: 130px;
}
.__file__node-large {
    width: 160px;
    height: 160px;
}
</style>