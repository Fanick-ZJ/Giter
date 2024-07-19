<template>
    <el-container class="__setting">
        <el-header class="__setting__page__bar__wraper">
            <div class="__setting__page__bar">
            <div
                class="__setting__page__bar-item"
                v-for="item in settingPage"
                :class="route.name === 'setting.' + item.name ? '__setting__page__bar__item-active' : ''"
                @click="routeTo(item.name)">
                {{$t('setting.'+item.name)}}
            </div>
            </div>
        </el-header>
        <el-main>
            <router-view  v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component"/>
                </keep-alive>
            </router-view>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import settingPage from './settingPage.json'

const router = useRouter()
const route = useRoute()

const routeTo = (name: string) => {
    router.push(`/setting/${name}`)
}


</script>

<style lang="scss" scoped>
.__setting{
    width: 100vw;
    height: 100vh;
    background-color: $right_part_background;
    .__setting__page__bar__wraper{
        width: 100%;
        height: 50px;
        .__setting__page__bar {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            column-gap: 20px;
            border-bottom: #eaedf1 1px solid;
            font-weight: 600;
            font-size: 18px;
            color: gray;
            .__setting__page__bar__item-active{
                color: rgb(235, 103, 103);
                position: relative;
            }
            .__setting__page__bar__item-active::after{
                content: '';
                display: block;
                position: absolute;
                bottom: -5px;
                background-color: rgb(235, 103, 103);
                width: 100%;
                height: 3px;
                border-radius: 10px;
            }
        }
    }
}
</style>