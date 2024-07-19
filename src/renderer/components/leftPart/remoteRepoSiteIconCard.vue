<template>
    <div class="site-icon-group">
        <div class="group">
            <div class="site-icon"
                v-for="icon in siteIcons"
                :style="{width: Math.max(size.width, size.height) + 'px', height: Math.max(size.width, size.height) + 'px'}">
                <Icon :icon="icon" :width="size.width" :height="size.height"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps<{
    siteIcons: Array<string>
    size:{
        width: number
        height: number
    }
}>();
</script>

<style lang='scss' scoped>
.site-icon-group{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    .group{
        display: flex;
        .site-icon{
            background-color: white;
            border-radius: 10000px;
            transition: .2s;
            color: black;
        }
        .site-icon:not(:first-child){
            margin-left: -10px;
        }
        .site-icon:focus-within, .site-icon:hover{
            transform: translateY(-3px) rotate(30deg)
        }
        .site-icon:hover~.site-icon{
            transform: translateX(5px);
        }
    }
}
</style>