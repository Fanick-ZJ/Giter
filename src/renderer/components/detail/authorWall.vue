<template>
    <div>
        <div class="contributors">
            <div class="contributors-title">
                <div class="contributors-title">{{ $t('detailPage.contributors') }}</div>
                <div class="contributors-num">{{ props.contributorsRankList?.length }}</div>
            </div>
            <div class="w-full" :style="{ height: '100%' }">
                <virtual-list 
                    :data-source="sortContributorsToGroup()"
                    :estimate-height="10"
                    :direction="'horizontal'"
                    :gap="8"
                    :loading="false">
                    <!-- {{ item }} -->
                    <template #item="{item}">
                        <div class="flex flex-col gap-2">
                            <Avatar
                            v-for="author in item.data"
                            :author="author" 
                            :width="50" 
                            :border-radius="5"
                            @mouseover="mouseEnterAuthorAvater($event, author)"
                            :key="author.email + props.repoInfo.path">
                        </Avatar>
                        </div>
                    </template>
                </virtual-list>
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
import virtualList from '@/renderer/components/common/virtualList/index.vue'
import { RepoItem } from '@/types';
import { Author } from 'lib/git';
import { ref, watch } from 'vue';
import { IdAuthor } from './type';

type AuthorGroup = {
    id: number,
    data: IdAuthor[]
}
const props = defineProps<{
    contributorsRankList: IdAuthor[],
    repoInfo: RepoItem
}>()

const authorRef = ref() // 鼠标移入记录用户引用
const tooltipRef = ref()    // 提示框引用
const curAuthorInfo = ref<Author>()

const mouseEnterAuthorAvater = (e: MouseEvent, item: Author) => {
    authorRef.value = e.currentTarget
    curAuthorInfo.value = item
}

const sortContributorsToGroup = () => {
    const groupSize = authorGroupSize()
    const groupList: AuthorGroup[] = []
    for (let i = 0, j = 0; i < props.contributorsRankList.length; i += groupSize) {
        groupList.push({
            id: j++,
            data: props.contributorsRankList.slice(i, i + groupSize)
        })
    }
    return groupList
}

const authorGroupSize = () => {
    return props.contributorsRankList.length > 100
            ? 5
            : props.contributorsRankList.length > 50
            ? 4
            : props.contributorsRankList.length > 20
            ? 3
            : props.contributorsRankList.length > 10
            ? 2
            : 1 
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
    }
</style>