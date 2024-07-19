<script setup lang="ts">
window.onload = ()=>{
    window.addEventListener("contextmenu",(e)=>{
        e.preventDefault() //阻止默认行为
    })
}
</script>

<template>
    <router-view></router-view>
</template>

<style scoped lang="scss">
</style>
