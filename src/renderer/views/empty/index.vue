<script setup lang="ts">
import {ref} from "vue";
const fault_flag = ref(false)
const container = ref<HTMLElement>()
let player: null| NodeJS.Timeout = null;
const fault = () => {
    if (container.value?.children){
        const children = container.value.children
        if (player)clearInterval(player)
        if (fault_flag.value){
            fault_flag.value = !fault_flag.value
            for (let i = 0 ; i < children.length ; i++) {
                const item = children.item(i)
                if (item){
                    item.classList.remove('fault_text_fault')
                    item.removeAttribute('style')
                }
            }
        }else{
            player = setInterval( () => {
                fault_flag.value = true
                for (let i = 0 ; i < children.length ; i++) {
                    const item = children.item(i)
                    if (item){
                        let x = Math.random() * 100
                        let y = Math.random() * 100
                        let h = Math.random() * 100
                        let w = Math.random() * 100
                        const trans = `transform: translate(${Math.random() * 60 - 30}%, ${Math.random() * 60 - 30}%);
                                clip-path: polygon(${x}% ${y}%, ${x+w}% ${y}%, ${x+w}% ${y+h}%, ${x}% ${y+h}%)`
                        item.classList.add('fault_text_fault')
                        item.setAttribute('style', trans)
                    }
                }
            }, 30)
        }
    }
}
</script>

<template>
<div class="fault-box" @click="fault">
    <div class="container" ref="container">
        <template v-for="i in 5">
            <div class="fault_text">GITER</div>
        </template>
    </div>
</div>
</template>

<style scoped lang="scss">
.fault-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
}
.container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
}
.fault_text {
    position: absolute;
    font-family: Impact, sans-serif;
    font-size: 5rem;
    color: #69e3c3;
    letter-spacing: 0.5rem;
    -webkit-text-stroke: 1px rgba(0,0,0,.6);
    color: rgba(255, 255, 255, 0);
    text-shadow: 5px 0px 0px #afa4a4;
    user-select: none;
    letter-spacing: 15px;
}
.fault_text_fault::after,
.fault_text_fault::before {
    content: 'GITTER';
    position: absolute;
    left: 0;
    top: 0;
    mix-blend-mode: screen;
}
.fault_text_fault::after {
    color: rgba(255, 0, 0, 0.51);
    transform: translateX(2%);
}
.fault_text_fault::before {
    color: rgba(0, 10, 253, 0.44);
    transform: translateX(-2%);
}
</style>