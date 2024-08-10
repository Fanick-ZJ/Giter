<template>
    <div>
        <div class="contributors">
            <div class="contributors-title">
                <div class="contributors-title">{{ $t('detailPage.contributors') }}</div>
                <div class="contributors-num">{{ props.contributorsRankList?.length }}</div>
            </div>
            <div class="contributors-list">
                <div class="contributor" 
                    v-for="item in props.contributorsRankList" 
                    @mouseover="mouseEnterAuthorAvater($event, item)">
                    <!-- {{ item }} -->
                    <Avatar :author="item" :width="50" :border-radius="5"></Avatar>
                </div>
            </div>
        </div>
        <!-- 用户信息提示弹窗 -->
        <el-tooltip
            placement="top-start"
            ref="tooltipRef"
            :virtual-ref="authorRef"
            popper-class="singleton-tooltip"
            :popper-options="{
                modifiers: [
                    {
                    name: 'computeStyles',
                    options: {
                        adaptive: false,
                        enabled: false,
                    },
                    },
                ],
            }"
            virtual-triggering> 
            <template #content> {{ $t('author.name') }}: {{ curAuthorInfo?.name }}<br />
                {{ $t('author.email') }}: {{ curAuthorInfo?.email }}<br />
                <!-- {{ $t('author.commits') }}: {{ curAuthorInfo?.count }}<br /> -->
            </template>
        </el-tooltip>
    </div>
</template>

<script setup lang="ts">
import Avatar from '@/renderer/components/common/hashAvatar/index.vue'
import { Author } from 'lib/git';
import { ref, watch } from 'vue';

const props = defineProps<{
    contributorsRankList: Author[]
}>()

const authorRef = ref() // 鼠标移入记录用户引用
const tooltipRef = ref()    // 提示框引用
const curAuthorInfo = ref<Author>()

const mouseEnterAuthorAvater = (e: MouseEvent, item: Author) => {
    authorRef.value = e.currentTarget
    curAuthorInfo.value = item
}
</script>

<style scoped lang="scss">

.contributors{
        .contributors-title{
            display: flex;
            flex-direction: row;
            gap: 5px;
            .contributors-title{
                font-family: $font;
                font-weight: 600;
            }
            .contributors-num{
                font-family: $font;
                color: white;
                font-size: 12px;
                font-weight: 600;
                border-radius: 40px;
                background-color: #7e8082;
                padding: 2px 10px;
            }
        }
        .contributors-list{
            display: flex;
            flex-wrap: wrap;
            flex-direction: row;
            margin-top: 5px;
            gap: 10px;
        }
    }
</style>