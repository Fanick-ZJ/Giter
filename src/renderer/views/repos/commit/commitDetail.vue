<template>
    <div id="__commit_detail_container"
        ref="commitDetailContainer"
        v-loading="loading">
        <div class="__commit_detail_tabbar">
            <div class="__commit_detail_tabbar_title">
                {{ commitFileDetail.title }}
            </div>
            <div class="__commit_detail_tabbar_contain-branch">
                <div class="__commit_detail_tabbar_contain-branch_title">
                    {{ $t('commitGraph.affected_branch') }}:
                </div>
                <el-tag v-for="(branch, index) in containBranch" :key="index">
                    {{ branch }}
                </el-tag>
            </div>
        </div>
        <div class="__commit_detail_content">
            <div class="__commit_detail_file-block" 
                v-for="(file, index) in commitFileDetail.diff">
                <div class="__commit_detail_file-tabbar">
                    <div class="__commit_detail_additions">+{{ file.additions.length }}</div>
                    <div class="__commit_detail_deletions">-{{ file.deletions.length }}</div>
                    <div class="__commit_detail_file-name">{{ file.path }}</div>
                </div>
                <div class="__commit_detail_file-content"
                    :id="editorClassPrefix + index"
                    :style="{ height: file.commitContext.length * 20 + 'px' }">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { decode } from '@/renderer/common/util/tools';
import { CommitFileInfo, DiffFile } from '@/types';
import { onMounted, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as monaco from 'monaco-editor';

const route = useRoute();
const router = useRouter();
const editorClassPrefix = '__commit_detail_editor_'
const loading = ref(true)
const commitFileDetail: Ref<CommitFileInfo> = ref({
    title: '',
    hash: '',
    diff: []
})
const containBranch: Ref<string[]> = ref([])
const path = decode(route.params.path as string)
const commitHash = route.params.commitHash as string
const repoService = new RepoTaskService()

onMounted(() => {
    const commitFileInfo =  repoService.getCommitFileInfo(path, commitHash)
    const branchs = repoService.getBranchListContainCommit(path, commitHash)
    const allPromise = Promise.all([commitFileInfo, branchs])
    allPromise.then(res => {
        commitFileDetail.value = res[0]
        containBranch.value = res[1]
    }).then(() => {
        commitFileDetail.value.diff.forEach((file, index) => {
            createEditor(index, file)
        })
        loading.value = false
    })
})

const createEditor = (index: number, file: DiffFile) => {
    const   editorContainer = document.getElementById(editorClassPrefix + index)
    const editor = monaco.editor.createDiffEditor(editorContainer!, {
        lineHeight: 20,
        scrollBeyondLastLine: false, // 设置编辑器是否可以滚动到最后一行之后
        readOnly: true, // 是否为只读模式
        automaticLayout: true,
        lineNumbers: 'off',
        renderOverviewRuler: false,
        scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
            handleMouseWheel: false
        }
    })
    editor.setModel({
        original: getOriginalText(file.commitContext, file.fileType),
        modified: getModifiedText(file.commitContext, file.fileType)
    })
}

const getOriginalText = (content: string[], type: string='plaintext') => {
    const text = content.map(line => {
        return line.startsWith('+')
            ? ''
            : line.startsWith('-')
                ? line.substring(1)
            : line
    }).filter(item => item != '').join('\n')
    return monaco.editor.createModel(text, type)
}

const getModifiedText = (content: string[], type: string='plaintext') => {
    const text = content.map(line => {
        return line.startsWith('+')
            ? line.substring(1)
            : line.startsWith('-')
                ? ''
            : line
    }).filter(item => item != '').join('\n')
    return monaco.editor.createModel(text, type)
}

const getLineheightOption = (content: string, row: number, lineClassName: string): monaco.editor.IModelDeltaDecoration => {
    return {
        range: new monaco.Range(row, 1, row, 1),
        options: {
            isWholeLine: true,
            className: lineClassName
        }
    }
}
</script>

<style lang="scss" scoped>  
#__commit_detail_container {
    display: grid;
    height: 100%;
    grid-template-rows: 80px 1fr;
    row-gap: 10px;
    .__commit_detail_tabbar{
        width: 100%;
        border-radius: 10px;
        border: 1px rgb(202 223 217) solid;
        background-color: rgb(230, 241, 246);
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        .__commit_detail_tabbar_title{
            padding: 5px 0px;
            font-size: 20px;
            border-bottom: 1px #b3b3b3 solid;
            font-weight: 800;
            color: #454545;
        }
        .__commit_detail_tabbar_contain-branch{
            display: flex;
            align-items: center;
            column-gap: 10px;
            .__commit_detail_tabbar_contain-branch_title{
                font-size: 15px;    
                font-weight: 600;
                color: #494444;
            }
        }
    }

    .__commit_detail_content {
        display: flex;
        flex-direction: column;
        width: 100%;
        row-gap: 10px;
        overflow-y: scroll;
        overflow-x: hidden;
        border-radius: 5px;
        .__commit_detail_file-block {
            border-radius: 5px;
            border: 1px rgb(160, 179, 173) solid;
            .__commit_detail_file-tabbar {
                padding: 10px 10px;
                display: grid;
                grid-template-columns: 50px 50px 1fr;
                .__commit_detail_additions {
                    color: green;
                }
                .__commit_detail_deletions {
                    color: red;
                }
                .__commit_detail_file-name {
                    color: #494444;
                }
            }
            .__commit_detail_file-content{
                // 暂时不知道为什么，设置了这个后宽度就可以自定义了，配合automaticLayout: true,设置
                display: grid;
                grid-template-columns: minmax(0px, auto);
            }
        }
    }
}
.addLine{
    background-color: rgb(0, 255, 0);
}
.delLine {
    background-color: rgb(255, 0, 0);
}
.test{
    height: 30px;
    border-bottom: 1px solid;
}
</style>