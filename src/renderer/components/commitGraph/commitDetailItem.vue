<template>
    <!-- container -->
    <div class="h-[var(--item-height)] w-full
                px-[10px] min-w-[630px]
                grid grid-cols-[var(--avatar-width)_1fr]
                gap-x-[10px] drop-shadow-md
                shadow-[0_2px_5px_1px_rgba(140,138,140,0.52)]
                rounded-[10px] transition-all
                bg-white"
        v-context-menu="menuOption"
        >
        <!-- avatar -->
        <div class="float-left h-[var(--item-height)]
                    flex items-center
                    box-border">
            <avatar :author="{name: detail.author_name, email: detail.author_email}" :width="70" :border-radius="10"></avatar>
        </div>
        <!-- commit detail -->
        <div class="min-w-[460px] text-black
                    float-right">
            <!-- author email time -->
            <div class="flex h-[var(--name-email-height)]
                        items-end justify-between
                        mb-[5px]">
                <div class="flex">
                    <b class="font-bold mr-[3px]">{{ detail.author_name }}</b>
                    <sub ref="email" class="h-[15px] text-gray-600
                                            leading-[15px] font-bold"> {{ detail.author_email }}</sub>
                </div>
                <div class="float-right text-end
                            text-sm font-bold">
                    <span class="time">{{ dayjs(detail.date).format('YYYY-MM-DD HH:mm') }}</span>
                </div>
            </div>
            <div class="text-sm leading-[17px]
                         line-clamp-2" size="large" truncated>
                {{ detail.message }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import avatar from '@/renderer/components/common/hashAvatar/index.vue'
import { CustomMouseMenuOptions } from "../common/contextMenu/types";
import { createMenuItem } from "@/renderer/common/util/contextMenuUtil";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { decode, encode } from "@/renderer/common/util/tools";
import { RepoTaskService } from "@/renderer/common/entity/repoTaskService";
import { CommitLogFields, RepoItem } from "@/types";
import dayjs from "dayjs";

const { detail, repo } = defineProps<{
    detail: CommitLogFields
    repo:  RepoItem
}>()

const i18n = useI18n()
const route = useRoute()
const router = useRouter()
const repoTaskService = new RepoTaskService()
const menuOption: CustomMouseMenuOptions = {
    menuItemCss: {
        arrowSize: '8px'
    },
    menuList: [
        createMenuItem(i18n.t('commitDetailItemContextMenu.viewThisCommit'), [], ()=>{
            router.push(`/repos/commitDetail/${route.params.path}/${detail.hash}`)
        }),
        createMenuItem(i18n.t('commitDetailItemContextMenu.viewThisCommitFileTree'), [], ()=>{
            router.push(`/repos/files/${encode(repo.path)}/${encode(detail.hash)}`)
            // console.log(repoTaskService.getFileListByCommit(detail.hash, decode(route.params.path as string)))
        })
    ]
}

// 判断文本是否溢出
const email = ref<HTMLElement>()
const isOverFlow = () => {
    if (email.value){
        return email.value?.scrollWidth > email.value?.clientWidth
    }
    return false
}
</script>


<style lang="scss">
$item-height: 100px;
$avatar-width: 70px;


* {
    --avatar-width: 70px;
    --item-height: 100px;
    --name-email-height: 35px;
}
.detail-item{
    height: $item-height;
    margin: 10px 0;
    padding: 0 10px;
    min-width: 630px;
    display: grid;
    grid-template-columns: $avatar-width 1fr;    // 限制两个的宽度， 只有两列
    grid-template-rows: $item-height;   // 限制高度
    grid-column-gap: 10px;
    box-shadow: 0px 2px 5px 1px rgba(140, 138, 140, 0.52);
    border-radius: 10px;
    transition-duration: 0.3s;
    background-color: #fff;
    user-select:none;
}
.detail-item::after{
    content: '';
    position: absolute;
    z-index: -1;
    width: calc(100% + 2px);
    height: calc($item-height + 2px);
    top: -1px;
    left: -1px;
    border-radius: 10px;
    opacity: 0;
}
.detail-item:hover::after {
    opacity: 1;
}
.detail-item:hover {
    scale: 1.01;
}
.avatar-box {
    float: left;
    height: $item-height;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}
.commit-detail {
    min-width: 450px;
    color: #2c3e50;
    float: left;
    .commit-detail-box {
        .detail-info-header{
            height: 30px;
            display: flex;
            align-items: end;
            justify-content: space-between;
            margin-bottom: 5px;
            .user-email{
                display: flex;
                .user {
                    display: block;
                    font-weight: bold;
                    margin-right: 3px;
                }
                .email{
                    height: 15px;
                    color: #686b6f;
                    line-height: 15px;
                    font-weight: bold;
                }
            }
            .time{
                display: block;
                float: right;
                font-size: 15px;
                font-weight: bold;
                text-align: end;
            }
        }
        .message{
            display: block;
            font-size: 14px;
            line-height: 17px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

}
</style>