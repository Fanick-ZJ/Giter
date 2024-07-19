import { TwoDimensionPos } from '@/renderer/types'
/**
 * 消息窗体出现的方向
 */
type FloatMessageBoxDirection = 'top'|'left'|'right'|'bottom'

interface isAvailabe{
    is: Boolean,
    pos?: TwoDimensionPos
}

/**
 * 尝试上边是否可以
 * @param relPos 
 * @param messageBox 
 */
function TopPos<T extends Element>(relPos: TwoDimensionPos, messageBox: T): isAvailabe{
    // 获取视窗大小
    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight
    // 获取消息窗体DOM元素的大小
    const boxWidth = messageBox.clientWidth
    const boxHeight = messageBox.clientHeight
    // 判断上边高度是否够
    if (relPos.y - boxHeight < 0) return {is: false}
    // 判断左上角
    if (relPos.x - boxWidth >= 0) return {is: true, pos: new TwoDimensionPos(relPos.x - boxWidth, relPos.y - boxHeight)}
    // 左边不行就默认有右边
    return  {is: true, pos: new TwoDimensionPos(relPos.x,  relPos.y - boxHeight)}
}

/**
 * 尝试下面位置
 * @param relPos 
 * @param messageBox 
 */
function BottomPos<T extends Element>(relPos: TwoDimensionPos, messageBox: T): isAvailabe{
    // 获取视窗大小
    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight
    // 获取消息窗体DOM元素的大小
    const boxWidth = messageBox.clientWidth
    const boxHeight = messageBox.clientHeight
    if (relPos.y + boxHeight > windowHeight) return {is: false}
    // 判断右边
    if (relPos.x + boxWidth <= windowWidth) return {is: true, pos: new TwoDimensionPos(relPos.x, relPos.y)}
    // 右边不行就左边
    return  {is: true, pos: new TwoDimensionPos(relPos.x - boxWidth, relPos.y)}
}

/**
 * 尝试左边是否可以
 * @param relPos 
 * @param messageBox 
 */
function LeftPos<T extends Element>(relPos: TwoDimensionPos, messageBox: T): isAvailabe {
    // 获取视窗大小
    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight
    // 获取消息窗体DOM元素的大小
    const boxWidth = messageBox.clientWidth
    const boxHeight = messageBox.clientHeight
    if (relPos.x - boxWidth < 0) return {is: false}
    // 如果到顶的话，就不除2了
    if (relPos.y - (boxHeight/2) < 0 ) return {is: true, pos: new TwoDimensionPos(relPos.x - boxWidth, relPos.y)}
    // 如果弹窗的高度在那个地方会超出界面，就折中显示，不已指定位置为开头
    if(relPos.y + (boxHeight/2) < windowHeight) return {is: true, pos: new TwoDimensionPos(relPos.x - boxWidth, relPos.y-(boxHeight/2))}
    // 如果可以容得下的话，就以当前位置为y轴起始
    return {is: true, pos: new TwoDimensionPos(relPos.x - boxWidth, relPos.y-boxHeight)}
}

/**
 * 尝试右边是否可以
 * @param relPos 
 * @param messageBox 
 */
function RightPos<T extends Element>(relPos: TwoDimensionPos, messageBox: T): isAvailabe{
    // 获取视窗大小
    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight
    // 获取消息窗体DOM元素的大小
    const boxWidth = messageBox.clientWidth
    const boxHeight = messageBox.clientHeight
    if (relPos.x + boxWidth > windowWidth) return {is: false}
    // 如果到顶的话，就不除2了
    if (relPos.y - (boxHeight/2) < 0 ) return {is: true, pos: new TwoDimensionPos(relPos.x, relPos.y)}
    // 如果弹窗的高度在那个地方会超出界面，就折中显示，不已指定位置为开头
    if(relPos.y + (boxHeight/2) < windowHeight)return {is: true, pos: new TwoDimensionPos(relPos.x, relPos.y-(boxHeight/2))}
    // 如果可以容得下的话，就以当前位置为y轴起始
    return {is: true, pos: new TwoDimensionPos(relPos.x, windowHeight - boxHeight)}
    
}

/**
 * 计算浮动消息提示窗体在界面中要出现的位置
 * @param relPos 相对于哪个坐标弹出窗体，传入窗体中的坐标
 * @param messageBox 消息窗体的DOM元素
 * @param direction 消息提出现在这个坐标的什么方向
 * @param autoChange 在窗体大小容不下时是否自适应找位置
 */
export const getFloatTipMessageBoxPos = <T extends Element>(relPos: TwoDimensionPos, 
    messageBox: T, 
    direction: FloatMessageBoxDirection = 'left'
    ) => {
    if (direction == 'left'){
        const res = LeftPos(relPos, messageBox)
        if (res.is) {
            if (res.pos) return res.pos
        }
        else {  // 反方向尝试
            const res2 = RightPos(relPos, messageBox)
            if (res2.is) if (res2.pos) return res2.pos
        }
    }
    else if (direction == 'right') {
        const res = RightPos(relPos, messageBox)
        if (res.is){
            if (res.pos) return res.pos
        }
        else {  // 反方向尝试
            const res2 = LeftPos(relPos, messageBox)
            if (res2.is) if (res2.pos) return res2.pos
        }
    }
    else if (direction == 'top') {
        const res = TopPos(relPos, messageBox)
        if (res.is){
            if (res.pos) return res.pos
        }
        else {  // 反方向尝试
            const res2 = BottomPos(relPos, messageBox)
            if (res2.is) if (res2.pos) return res2.pos
        }
    }
    else if (direction == 'bottom') {
        const res = BottomPos(relPos, messageBox)
        if (res.is){
            if (res.pos) return res.pos
        }
        else {  // 反方向尝试
            const res2 = TopPos(relPos, messageBox)
            if (res2.is) if (res2.pos) return res2.pos
        }
    }
    return relPos   // 都不行就直接返回给的那个位置
}