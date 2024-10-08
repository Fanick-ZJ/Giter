<template>
    <el-tooltip
        class="box-item"
        effect="light"
        :disabled="!isOverFlow()"
        :content="repos.name"
        trigger="hover"
        :virtual-ref="titleRef"
        placement="right"
    >
        <!-- 仓库项主体 -->
        <div @click="itemClick"
            v-context-menu="menuOption"
            :data-path="repos.path"
            :class="[repos.isTop 
                    ? 'bg-gradient-to-r from-gray-50 to-indigo-500'
                    : '', 
                    !isChosed
                    ? 'text-gray-500 transition-all hover:bg-gray-300'
                    : 'bg-red-500 text-white']"
            class="mt-[5px]
                   h-[var(--repo-item-height)] relative
                   overflow-visible rounded-md">
            <!-- 远程仓库图标 -->
            <remote-repo-site-icon-card
                style="margin-right: 5px; flex: 0.2;"
                v-if="siteIcons.length > 0"
                :siteIcons="siteIcons"
                :size="{width: 20, height: 20}"/>
            <!-- 仓库名称 -->
            <div
                ref="titleRef"
                class="text-base font-bold
                       leading-[var(--repo-item-height)] px-3
                       max-w-[var(--repo-bar-item-title-width)] truncate">
                {{ repos.name }}
            </div>
            <!-- 删除线 -->
            <div class="w-[90%] h-[2px]
                        absolute rounded-full
                        bg-rose-600 opacity-50
                        left-[5px] top-[calc(var(--repo-item-height)/2)]" 
                        v-if="!repos.isExist"></div>
            <!-- 仓库状态灯 -->
            <div 
                ref="status_light"
                class="w-[10px] h-[10px] 
                       rounded-full absolute 
                       right-5 top-[calc(var(--repo-item-height)/2-5px)]
                       transition-all"
                :class="repos.status == RepoStatus.UNCOMMIT?'bg-yellow-300'
                        :repos.status == RepoStatus.UNPUSH? 'bg-rose-400'
                        :'normal'">
            </div>
            <status-message-box
                ref="status_message_box"
                :repo="repos"
                :pos="tipMessagePos"
                :showing="statues_bar_show">
            </status-message-box>
        </div>
    </el-tooltip>
</template>

<script setup lang="ts">
import { TwoDimensionPos } from '@/renderer/types'
import { RepoItem, RepoStatus } from '@/types'
import {RepoStoreItem, useRepoStore} from '@/renderer/store/modules/repository'
import { getRemoteSiteIcon} from '@/renderer/common/util/gitUtil'
import {ref, watch, onMounted, reactive, toRaw, onUnmounted, computed, h} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFloatTipMessageBoxPos } from '@/renderer/common/util/posUtil'
import { useIpcAction } from '@/renderer/store/modules/ipcAction'
import { ElLoading, ElMessageBox  } from 'element-plus'
import StatusMessageBox from './statusMessageBox.vue'
import RemoteRepoSiteIconCard from './remoteRepoSiteIconCard.vue'
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService'
import { CustomMouseMenuOptions, createMenuItem } from '@/renderer/common/util/contextMenuUtil'
import { useI18n } from 'vue-i18n'
import { OpenWithOption } from '../common/openWith/types'
import { useOpenWith } from '@/renderer/store/modules/openWith'
import { decode, encode } from '@/renderer/common/util/tools'
import repoInfoEditDialog from '../dialog/repoInfoEditDialog/index'
import { Remote } from 'lib/git'
    const i18n = useI18n()
    const openWithStore = useOpenWith()
    const {repos} = defineProps<{
        repos: RepoStoreItem
    }>()
    const menuOption: CustomMouseMenuOptions = {
        menuItemCss: {
            arrowSize: '8px'
        },
        menuList: [
            createMenuItem(i18n.t('RepoItemContextMenu.edit'), [], ()=>{
                repoInfoEditDialog(repos).then(() => {
                })
            }),
            createMenuItem(i18n.t('RepoItemContextMenu.openDir'), [], ()=>{ipcAction.revealExplore(repos.path)}),
            createMenuItem(i18n.t('RepoItemContextMenu.del'), [], ()=>{ delRepo()}),
            createMenuItem(i18n.t('RepoItemContextMenu.openProject'), [], ()=> {
                openWithStore.setOption(openWithOption)
                openWithStore.show()
            }),
            createMenuItem(i18n.t('RepoItemContextMenu.fileView'), [], ()=> {turnToFileView()}),
            createMenuItem(i18n.t('RepoItemContextMenu.detail'), [], ()=> {turnToDetail()}),
        ]
    }
    const openWithOption: OpenWithOption = {
        filePath: repos.path,
        group: 'Project',
        attachTo: 'body',
        dialogStyle: {
            width: 500,
            height: 200,
            iconHeight: 40,
            iconWidth: 40,
            iconGap: 10
        }
    }
    const ipcAction = useIpcAction()
    // 获取记录中的仓库对象
    const repoStore = useRepoStore()
    const repoTaskService = new RepoTaskService()
    // 鼠标移入后提示栏要出现的位置
    const tipMessagePos = reactive(new TwoDimensionPos(0, 0))
    // 鼠标移入指示灯提示
    const statues_bar_show = ref(false)
    const status_light = ref<HTMLElement>()
    const status_message_box = ref<HTMLElement>()
    let status_light_timer: NodeJS.Timeout

    // 远程仓库图标
    const remoteSiteInfo = ref<Remote[]>([])
    const siteIcons = ref<string[]> ([])
    onMounted(async () => {
        status_light.value?.addEventListener('mouseenter', e => {
            // 设置提示窗位置
            if (status_message_box.value){
                const pos = getFloatTipMessageBoxPos(new TwoDimensionPos(e.clientX + 10, e.clientY), toRaw(status_message_box.value), 'right')
                tipMessagePos.x = pos.x
                tipMessagePos.y = pos.y
                status_light_timer = setTimeout(() => {
                    // TODO 显示提示界面
                    statues_bar_show.value = true
                }, 500)
            }
        })
        status_light.value?.addEventListener('mouseout', e => {
                clearTimeout(status_light_timer)
                statues_bar_show.value = false
        })

        if (repos.isExist && repos.watchable){
            // 检查仓库文件提交状态
            repoTaskService.checkRepoStatus(repos)
            
        }
        repos.isExist && repoTaskService.getRemote(repos.path).then(res => {
            remoteSiteInfo.value = [...res]
            remoteSiteInfo.value.forEach(item => {
                if ("fetch" in item.operate) {
                    let icon = getRemoteSiteIcon(item.url)
                    icon && siteIcons.value.push(icon)
                }
            })
        })
    })
    // 当前元素是否被选中
    const router = useRouter()

    const isChosed = computed(() => repoStore.curChosedRepo?.path == repos.path)
    
    const itemClick = () => {
        if(isChosed.value) return
        if (!repos.isExist){
            ipcAction.showWarnDialiog('warn', 'dialog.repoisNotExist')
            return
        }
        const curItem = repoStore.curChosedRepo
        if (curItem?.name != repos.name) {
            router.push(`/repos/commit/${encode(repos.path)}`)
        }
    }
    /**
     * 删除仓库
     */
    const delRepo = () => {
        const loadingInstance = ElLoading.service({ fullscreen: true })
            repoTaskService.delRepo(repos).then( () => {
                repoStore.remove(repos)
                if (isChosed.value){
                    if(repoStore.curChosedRepo == repos){  // 如果删除的仓库时对当前打开的仓库的话，就导航到空白页
                        router.push('/empty')
                    }
                }
                loadingInstance.close()
            })
    }
    /**
     * 停止监控
     */
    watch(() => repos.watchable, (newVal: boolean, oldVal: boolean) => {
        if(newVal){
            repoTaskService.addRepoWatcher(repos)
        }
        else {
            repoTaskService.removeRepoWatcher(repos)
        }
    })
    /**
     * 跳转到详情界面
     */
    const turnToDetail = () => {
        router.push(`/repos/detail/${encode(repos.path)}`)
    }

    const turnToFileView = () => {
        router.push(`/repos/files/${encode(repos.path)}/${encode(repos.curBranch)}`)
    }
    
    // 判断文本是否溢出
    const titleRef = ref()
    const isOverFlow = () => {
        if (titleRef.value){
            return titleRef.value?.scrollWidth > titleRef.value?.clientWidth
        }
        return false
    }

</script>

<style scoped lang="scss">
    * {
        --repo-item-height: 30px;
        --repo-bar-item-title-width: calc(100% - 20px);
    }
    // 标题溢出之后鼠标移上去的提示
    // .title-tip{
    //     position: relative;
    // }
    // .title-tip::after{
    //     content: attr(data-title);
    //     pointer-events: none;   // 取消鼠标事件
    //     padding: 5px 5px;
    //     font-size: 15px;
    //     border: 1px solid #ddd;
    //     border-radius: 5px;
    //     background-color: #BDBDBD;
    //     color: white;
    //     position: fixed;
    //     line-height:18px;
    //     font-family: $font;
    //     opacity: 0;
    //     white-space: pre-wrap;
    //     transition: all .2s 0.5s;
    //     z-index: 9999;
    // }
    // .title-tip:hover::after{
    //     opacity: 1;
    // }
</style>