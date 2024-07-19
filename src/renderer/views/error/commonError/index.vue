<template>
    <div class="error-page">
        <div class="error-page-title">
            <div class="error-page-title-content">{{ title }}</div>
        </div>
        <div class="error-page-content">

            <div>{{ content }}</div>
        </div>
        <div class="error-page-font">
            <div class="error-page-font-content" data-text="ERROR">ERROR</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { decode } from '@/renderer/common/util/tools';
import { useRoute } from 'vue-router';

let {title, content}  = useRoute().params
title = decode(title as string)
content = decode(content as string)
</script>

<style lang="scss" scoped>
    @mixin three-color-text-shadow{
        text-shadow: 0px 0px 1px black, 
                        4px 4px 0px #bf67c8,
                        8px 8px 0px #688ec4;
    }
    .error-page{
        font-family: $font;
        width: 100%;
        height: 100vh;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 20px;
        .error-page-title{
            .error-page-title-content{
                font-size: 40px;
                font-weight: 600;
                font-style: italic;
                text-wrap: nowrap;
                padding: 5px;
                text-shadow: 2px 0px 1px #e7c3c3, 
                            4px -2px 0px #e2cece;
                background-color: white;
            }
        }
        .error-page-title::after{
            content: "";
            height: 140%;
            width: 85%;
            display: block;
            position: relative;
            border: 2px solid rgb(52, 50, 50);
            box-shadow: 4px -4px 0 0 black;
            transform: translate(20%, -85%);
            z-index:-1;
        }
        .error-page-content{
            font-size: 20px;
            font-weight: 600;
        }
        .error-page-font-content{
            font-size: 40px;
            font-weight: 600;
            color: white;
            -webkit-text-stroke:1px transparent;
            background:black;
            position: relative;
            -webkit-background-clip: text;
            @include three-color-text-shadow;
        }
        .error-page-font-content::before{
            content:attr(data-text);
            width: 100%;
            height: 100%;
            position: absolute;
            text-shadow: 2px 0 red;
            left: -2px;
            animation: ani1 2s infinite linear alternate-reverse;
            @include three-color-text-shadow;
        }
        .error-page-font-content::after{
            content:attr(data-text);
            width: 100%;
            height: 100%;
            position: absolute;
            text-shadow: 2px 0 blue;
            left: 2px;
            animation: ani2 2s infinite linear alternate-reverse;
            @include three-color-text-shadow;
        }
    }

    @keyframes ani1{
        $steps: 20;
        @for $i from 0 through $steps {
            #{percentage($i * calc(1 / $steps))}{
                clip-path: inset(random(100) + px 0 random(100) + px 0);
            }
        }
    }
    @keyframes ani2{
        $steps: 20;
        @for $i from 0 through $steps {
            #{percentage($i * calc(1 / $steps))}{
                clip-path: inset(random(100) + px 0 random(100) + px 0);
            }
        }
    }
</style>