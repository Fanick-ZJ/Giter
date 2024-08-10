<template>
    <div class="__file__page-container"
        ref="nodeContainer"
        v-auto-animate>
        <FileNode v-for="node in pageContent.files" 
            :file="node"
            size="medium"
            class="__file__page-node"
            @click="onClick(node)">

        </FileNode>
    </div>
</template>

<script lang="ts" setup>
import { useFileStore } from '@/renderer/store/modules/files';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, toRaw, watch } from 'vue';
import debounce from 'lodash/debounce'
import { useRouter, useRoute } from 'vue-router'
import FileNode  from '@/renderer/components/files/fileNode.vue'
import { build_path } from '@/renderer/common/util/file';
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode } from '@/renderer/common/util/tools';
import { RepoFileInfo } from 'lib/git';


type RepoPageContent = {
    id: string
    path: string
    files: RepoFileInfo[] | RepoFileInfo
}
const router = useRouter()
const route = useRoute()
const fileStore = useFileStore()
const nodeContainer = ref<HTMLElement>()
let observer: ResizeObserver
onMounted(() => {
    if (nodeContainer.value){
        observer = new ResizeObserver(debounce(nodeSort, 10))
        observer.observe(nodeContainer.value)
    }
})
onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
})
const nodeSort = async () => {
    // 等待页面渲染完成在执行
    await nextTick()
    if (nodeContainer.value) {
        const containerWidth = nodeContainer.value.clientWidth
        const nodeSet = nodeContainer.value.children
        if (nodeSet.length > 0) {
            const nodeWidth = nodeSet[0].clientWidth
            const nodeHeight = nodeSet[0].clientHeight
            const minWidthMargin = 30
            const minHeightMargin = 20
            let lineNums = 0
            // 一个都容不下的时候
            if (nodeWidth > containerWidth) {
                for (let i = 0; i < nodeSet.length; i++) {
                    nodeSet[i].setAttribute('hidden', 'hidden')
                }
            }
            // 只能容得下一个
            else if (nodeWidth * 2 + minWidthMargin > containerWidth) {
                lineNums = nodeSet.length
                const left = containerWidth/2 - nodeWidth/2
                for (let i = 0; i < nodeSet.length; i++) {
                    nodeSet[i].removeAttribute('hidden')
                    const node = nodeSet[i] as HTMLElement
                    const top = i * nodeHeight + minHeightMargin
                    node.style.top = top + 'px'
                    node.style.left = left + 'px'
                }
            }
            // 能有多个的情况
            else {
                const lineSize = Math.floor(containerWidth / (nodeWidth + minWidthMargin))
                lineNums = Math.ceil(nodeSet.length / lineSize)
                for (let i = 0; i < lineNums ; i++) {

                    // 每个对象分到空间大小
                    const space = containerWidth / lineSize
                    for (let j = i * lineSize;  j < nodeSet.length && j < (i + 1) * lineSize; j++){
                        const node = nodeSet[j] as HTMLElement
                        const inLineIndex = (j - i * lineSize)
                        node.style.removeProperty('left')
                        node.style.removeProperty('right')
                        const top = i * (nodeHeight + minHeightMargin)
                        const left = inLineIndex * space
                        node.style.left = left + 'px'
                        node.style.top = top + 'px'
                    }
                }
            }
        }
    }
}

const pageContent = reactive<RepoPageContent>({
    id: '',
    path: '',
    files: []
})

const fid = computed(() => route.params.fid as string)
const filePath = computed(() => fileStore.getFilePath(fid.value))
const repoPath = computed(() => decode(route.params.path as string))
const tag = computed(() => decode(route.params.tag as string))
const taskService = new RepoTaskService()
const onClick = (node: RepoFileInfo) => {
    if (!node.isDir && node.objectName) {
        fileStore.addOpenedFile(node, repoPath.value, tag.value)
    }
    if (node.isDir) {
        fileStore.toPath({path: build_path(node.dir, node.name), repo: repoPath.value})
    }
}
watch(fid, (newVal, oldVal) => {
    pageContent.id = route.params.fid as string,
    pageContent.path = fileStore.getFilePath(fid.value)
    pageContent.files = fileStore.getFileByPath(filePath.value)
    nodeSort()
}, { immediate: true })

</script>

<style lang="scss" scoped>
.__file__page-container {
    position: relative;
    height: 100%;
    overflow-y: scroll;
    .__file__page-node{
        position: absolute;
    }
}
</style>