<template>
    <div class="__commit__filter__wrapper">
        <el-row justify="start" class="__commit__filter__item">
            <el-col :span="4" class="__commit__filter__label">{{ $t('commitFilter.time') }}</el-col>
            <el-col :span="4">
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    start-placeholder="Start date"
                    end-placeholder="End date"
                    style="width: 312px;"
                />
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="4" class="__commit__filter__label">{{ $t('commitFilter.author') }}</el-col>
            <el-col :span="20">
                <el-select v-model="chosedAuthor" placeholder="Select" :clearable="true">
                    <el-option
                        v-for="item in authors"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </el-select>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="4" class="__commit__filter__label">{{ $t('commitFilter.message') }}</el-col>
            <el-col :span="20">
                <el-input v-model="message" placeholder="Please input" />
            </el-col>
        </el-row>
        <el-row justify="end">
            <el-col :span="12">
                <el-button type="danger" :icon="Close" @click="() => $emit('filterResult', false)">{{ $t('commitFilter.cancel') }}</el-button>
                <el-button type="primary" :icon="Search" @click="clickSuccess">{{ $t('commitFilter.search') }}</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, Close } from '@element-plus/icons-vue'

const emit = defineEmits<{
    (e: 'filterResult', success: boolean, author?: string, time?: [Date, Date], message?: string): void
}>()

const props = defineProps({
    authors: {
        type: Array<string>,
        default: []
    },
    repoPath: {
        type: String,
        required: false
    }
})
const chosedAuthor = ref('')
const time = ref<[Date, Date]>([
    new Date(),
    new Date()
])

const message = ref('')

const clickSuccess = () => {
    emit('filterResult', true, chosedAuthor.value, time.value, message.value)
}


</script>

<style lang="scss" scoped>
.__commit__filter__wrapper{
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    .__commit__filter__item {
        .__commit__filter__label {
            font-weight: 600;
            height: 30px;
            line-height: 30px;
        }
    }
}
</style>