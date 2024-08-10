<template>
    <div>
        <el-select v-model="curBranch" placeholder="Select" :size="size" @change="emit('change', curBranch)">
            <el-option
                v-for="item in branches"
                :key="item"
                :label="item"
                :value="item"
                />
            <template #prefix>
                <Icon icon="pajamas:branch"  style="color: #a3a3a3" :width="iconSize(size)"/>
            </template>
        </el-select>
    </div>
</template>

<script lang="ts" setup>
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService';
import { Branches, RepoItem } from '@/types';
import { PropType, onMounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';


const props = defineProps({
    repoInfo: {
        type: Object as PropType<RepoItem | undefined>,
        reqired: false
    },
    repoPath: {
        type: String,
        reqired: false
    },
    size: {
        type: String as PropType<"" | "default" | "small" | "large">,
        default: 'small'
    },
    branch: {
        type: String,
        required: false
    }
})

const iconSize = (size: string) => {
    switch (size) {
        case 'small':
            return 15
        case 'normal':
            return 30
        default:
            return 25
    }
}

const emit = defineEmits<{
    (e: 'change', branch: string): void
}>()
const repoTaskService = new RepoTaskService()
const branches = ref<string[]>([])
const curBranch = ref()
const getBranches = async () => {
    branches.value = []
    let _path = props.repoInfo ? props.repoInfo.path : props.repoPath
    if (props.branch) {
        branches.value.push(props.branch)
    }
    else if (!_path) {
        // console.error('path is not defined')
    }
    else {
        await repoTaskService.getRepoBranch(_path).then((res: Branches) => {
            branches.value.push(...res.all)
            // 如果有传入的分支则使用此份之，没有就使用当前分支
            if (props.branch) {
                curBranch.value = branches.value[0]
            } else {
                curBranch.value = res.current
            }
        })
    }
}
onMounted(() => {
    getBranches()
})

watch(() => props.repoInfo, async () => {
    await getBranches()
})

watch(() => props.repoPath, async () => {
    await getBranches()
})
</script>

<style lang="scss" scoped>
</style>