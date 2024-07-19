<template>
    <div class="__setting__item"  :style="{width: `${width}px`, height: height ? `${height}px`: 'auto'}">
        <div class="__setting__item__header">
            {{ title }}
        </div>
        <div class="__setting__item__content">
            <slot name="content"></slot>
        </div>
        <div class="__setting__item__footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
const { title, width, height } = defineProps({
    title: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: false
    }
})
</script>

<style scoped lang="scss">
.__setting__item {
    border-radius: 10px;
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 10px;
    background-color: #fff;
    box-shadow: 0 0 15px rgb(0 0 0 / 10%);
}
.__setting__item__header{
    font-size: 24px;
    font-weight: 600;
    color: #929393;
    padding-left: 10px;
}

.__setting__item__body {
    padding-top: 10px;
}

.__setting__item__footer {
    font-size: 10px;
    color: rgb(0, 0, 0, 0.5);
}
</style>