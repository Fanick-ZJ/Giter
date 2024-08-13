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
import { PropType, onMounted, ref, toRaw, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useRepoStore } from '@/renderer/store/modules/repository';


const props = defineProps({
    repoPath: {
        type: String,
        reqired: true
    },
    size: {
        type: String as PropType<"" | "default" | "small" | "large">,
        default: 'small'
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
const repoStore = useRepoStore()
const branches = ref<string[]>([])
const curBranch = ref()
const getBranches = async () => {
    if (props.repoPath){
        const repo = repoStore.getRepoByPath(props.repoPath)
        if (repo) {
            branches.value = repo.branches
            curBranch.value = repo.curBranch
        }
    }
}
onMounted(() => {
    getBranches()
})

watch(() => props.repoPath, async () => {
    await getBranches()
})
</script>

<style lang="scss" scoped>
</style>