<template>
    <setting-item :title="$t('langSetting.langSelect')" :width="300">
        <template #content>
            <el-select
                v-model="curLang"
                placeholder="Select"
                size="large"
                style="width: 240px"
                @change="changeLang"
                >
                <el-option
                    v-for="item in langList"
                    :key="item.code"
                    :label="item.title"
                    :value="item.code"
                />
            </el-select>
        </template>
    </setting-item>
</template>

<script setup lang="ts">
import settingItem from '@/renderer/components/setting/settingItem.vue';
import { onMounted, ref } from 'vue';
import langList from '@/renderer/views/setting/language/lang.json';
import { ConfigTaskService } from '@/renderer/common/entity/configTaskService';
import { Action, ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';

const curLang = ref<string>('')
const configService = new ConfigTaskService();
const i18n = useI18n()
onMounted(() => {
    configService.getLanguage().then(lang => {
        curLang.value = lang;
    })
})

const changeLang = () => {
    configService.setLanguage(curLang.value).then(res => {
        ElMessageBox.alert(i18n.t('langSetting.changeDialogContent'), i18n.t('langSetting.changeDialogTitle'), {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: 'OK'
    })
    })
}
</script>

<style scoped>

</style>