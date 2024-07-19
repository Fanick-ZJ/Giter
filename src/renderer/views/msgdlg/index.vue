<template>
    <div class="dialog">
        <el-row justify="center">
            <el-col :span="8">
                <div class="icon">
                    <object width="50px" height="50px" :data="icon" type="image/svg+xml"></object>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24" class="message">
                <el-text class="mx-1">{{$t(message)}}</el-text>
            </el-col>
        </el-row>
        <el-row class="btn-group">
            <el-col :span="7"></el-col>
            <el-col :span="13">
                <el-button type="primary" @click="closeDialog">OK</el-button>
                <el-button @click="closeDialog">Canncel</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router';
import infoSvg from '@/renderer/assets/info.svg' 
import warnSvg from '@/renderer/assets/warning.svg' 
import errorSvg from '@/renderer/assets/error.svg' 
import { DialogType } from '@/types';
import { decode } from '@/renderer/common/util/tools';
const { params } = useRoute();
const type = ref(parseInt(params.type as string))
const message = ref(decode(params.message as string))
const icon = ref(infoSvg)
const wid = parseInt(params.wid as string)
// 根据类型切换图标
switch(type.value){
    case DialogType.INFO:
        icon.value = infoSvg
        break
    case DialogType.WARNING:
        icon.value = warnSvg
        break
    case DialogType.ERROR:
        icon.value = errorSvg
        break
    default:
        icon.value = infoSvg
}

const closeDialog = () => {
    window.dialogAPI.closeDialog(wid)
}
</script>

<style scoped lang="scss">
    .dialog{
        padding: 20px;
    }
    .icon{
        user-select: none;
        display:flex;
        align-items:center;
        justify-content:center;
        height: 100%;
    }
    .message{
        margin-top: 20px;
        text-align: center;
    }
    .message span{
        user-select: none;
        font-size: 14px;
        font-weight: 600;
        word-break: break-word;
        font-family: "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
    }
    .btn-group{
        margin-top: 20px;
    }
</style>