<template>
    <div class="status_message" v-if="showing" :style="{left: pos.x +'px', top: pos.y + 'px'}">
        {{ $t(value) }}
    </div>
</template>

<script setup lang="ts">
import { RepoItem, RepoStatus } from '@/types'
import { TwoDimensionPos } from '@/renderer/types'
import { onMounted, ref, watch } from 'vue'
    const value = ref('')
    const { repo, pos, showing } = defineProps<{
        repo: RepoItem
        pos: TwoDimensionPos
        showing: Boolean
    }>()
    
    watch(
        () => repo.status, 
        newValue => {
            switch (newValue){
                case RepoStatus.UNCOMMIT:
                    value.value = 'statusbar.uncommit'
                    break
                case RepoStatus.UNPUSH:
                    value.value = 'statusbar.unpush'
                    break
                default:
                    value.value = '_'
            }
        },
        {immediate: true}
    )
</script>

<style lang="scss" scoped>
.status_message{
    position: fixed;
    box-sizing: border-box;
    background-color: #BDBDBD;
    color: white;
    border-radius: 3px;
    font-size: 15px;
    font-family: $font;
    height: 25px;
    padding: 5px;
    animation: status_bar .2s;
    border: 0.1px #d6d5d6 solid;
    z-index: 3;
}

@keyframes status_bar {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>