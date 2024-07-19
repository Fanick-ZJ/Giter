
import { watch } from "vue"
import { useRoute } from "vue-router"

const execFun = (funs: (()=>any)[] | (() => any)) => {
    if (Array.isArray(funs)){
        funs.forEach(fun => {
            fun()
        })
    }else{
        funs()
    }
}
export const onRouteChangeUpdate = (funs: (()=>any)[] | (() => any)) => {
    const route = useRoute()
    watch( () => route.fullPath, () => {
        execFun(funs)
    })
}