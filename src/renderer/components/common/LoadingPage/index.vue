<template>
    <div class="__loading_page__wrapper">
        <div class="__loading_container__" v-if="loading">
            <div class="cubes">
            <div class="sk-cube sk-cube1"></div>
            <div class="sk-cube sk-cube2"></div>
            <div class="sk-cube sk-cube3"></div>
            <div class="sk-cube sk-cube4"></div>
            <div class="sk-cube sk-cube5"></div>
            <div class="sk-cube sk-cube6"></div>
            <div class="sk-cube sk-cube7"></div>
            <div class="sk-cube sk-cube8"></div>
            <div class="sk-cube sk-cube9"></div>
            </div>
        </div>
        <div class="__loading__slot__container" v-show="!loading">
            <slot>

            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">

    const props = defineProps({
      loading: {
        type: Boolean,
        default: false
      }  
    })
</script>

<style scoped lang="scss">
 /*  begin cubes css */
 .__loading_page__wrapper {
    width: 100%;
    height: 100%;
    .__loading__slot__container {
        width: 100%;
        height: 100%;
    }
    .__loading_container__{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        .cubes {
            width: 40px;
            height: 40px;
            margin: 100px auto;
        }
        
        .cubes .sk-cube {
            width: 33%;
            height: 33%;
            background-color: #333;
            float: left;
            animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
        }
        
        .cubes .sk-cube1 {
        animation-delay: 0.2s;
        }
        
        .cubes .sk-cube2 {
        animation-delay: 0.3s;
        }
        
        .cubes .sk-cube3 {
        animation-delay: 0.4s;
        }
        
        .cubes .sk-cube4 {
        animation-delay: 0.1s;
        }
        
        .cubes .sk-cube5 {
        animation-delay: 0.2s;
        }
        
        .cubes .sk-cube6 {
        animation-delay: 0.3s;
        }
        
        .cubes .sk-cube7 {
        animation-delay: 0s;
        }
        
        .cubes .sk-cube8 {
        animation-delay: 0.1s;
        }
        
        .cubes .sk-cube9 {
        animation-delay: 0.2s;
        }
        
        @keyframes sk-cubeGridScaleDelay {
            0%,
            70%,
            100% {
                transform: scale3D(1, 1, 1);
            }
            35% {
                transform: scale3D(0, 0, 1);
            }
        }
    }
 }
 
</style>