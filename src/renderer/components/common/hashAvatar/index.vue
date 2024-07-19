<template>
    <div class="avatar" v-html="avatar" :style="{width: width+'px', height: width + 'px',borderRadius: borderRadius+'px'}">
    </div>
</template>

<script setup lang="ts">
import { Author } from '@/types'
import { getAvatar } from '@/renderer/common/util/gitUtil';
import { onBeforeMount, onMounted, ref } from 'vue';
const { author, width, borderRadius } = defineProps<{
    author: Author
    width: number
    borderRadius: number
}>()
const avatar = ref<string>()
onMounted(() => {
    avatar.value = getAvatar(author.name, author.email, width, width)
})
</script>

<style scoped lang="scss">
.avatar{
    overflow: hidden;
}
</style>