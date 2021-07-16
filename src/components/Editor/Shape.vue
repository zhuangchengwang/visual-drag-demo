/* eslint-disable */
<template>
    <div class="shape" :class="{ active: this.active }"  @click="selectCurComponent" @mousedown="handleMouseDownOnShape">
        <!-- 暂时关闭旋转 -->
        <!-- <i class="el-icon-refresh-right" v-show="active" @mousedown="handleRotate"></i> -->
        <div
            class="shape-point"
            v-for="(item, index) in (active? pointList : [])"
            @mousedown="handleMouseDownOnPoint(item, $event)"
            :key="index"
            :style="getPointStyle(item)">
        </div>
        <div v-show="isresize" class="resize" :style="resizeStyle">{{element.style.width}} x {{element.style.height}}</div>
        <div v-show="element === curComponent && xyLineStyle.width  " class="shape-x-line" :style="getXyLineStyle('x')">
            {{xyLineStyle.width}}px
             <div class="content" ></div>
        </div>
        <div v-show="element === curComponent  && xyLineStyle.height " class="shap-y-line" :style="getXyLineStyle('y')">
            {{xyLineStyle.height}}px
            <div class="content" ></div>
        </div>
        <div v-show="element === curComponent  && xyLineStyle2.width  " class="shape-x2-line" :style="getXyLineStyle2('x')">
            {{xyLineStyle2.width}}px
            <div class="content" ></div>
        </div>
        <div v-show="element === curComponent  && xyLineStyle2.height" class="shap-y2-line" :style="getXyLineStyle2('y')">
            {{xyLineStyle2.height}}px
            <div class="content" ></div>
        </div>
        <slot></slot>
    </div>
</template>

<script>
import eventBus from '@/utils/eventBus'
import * as utils from '@/utils/utils'
import runAnimation from '@/utils/runAnimation'
import { mapState } from 'vuex'
import calculateComponentPositonAndSize from '@/utils/calculateComponentPositonAndSize'
import * as NodeElment from '@/utils/NodeElment'
import { calculateRotatedPointCoordinate, getCenterPoint } from '@/utils/translate'
export default {
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        element: {
            require: true,
            type: Object,
        },
        defaultStyle: {
            require: true,
            type: Object,
        },
        index: {
            require: true,
            type: [Number, String],
        },
    },
    data() {
        return {
            isMouseDownOnShape:false,
            pointList: ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'], // 八个方向
            initialAngle: { // 每个点对应的初始角度
                lt: 0,
                t: 45,
                rt: 90,
                r: 135,
                rb: 180,
                b: 225,
                lb: 270,
                l: 315,
            },
            angleToCursor: [ // 每个范围的角度对应的光标
                { start: 338, end: 23, cursor: 'nw' },
                { start: 23, end: 68, cursor: 'n' },
                { start: 68, end: 113, cursor: 'ne' },
                { start: 113, end: 158, cursor: 'e' },
                { start: 158, end: 203, cursor: 'se' },
                { start: 203, end: 248, cursor: 's' },
                { start: 248, end: 293, cursor: 'sw' },
                { start: 293, end: 338, cursor: 'w' },
            ],
            cursors: {},
            xyLineStyle:{width:"",height:""},
            xyLineStyle2:{width:"",height:""},
            isresize:false,
            resizeStyle:{top:"0px",left:"0px"}
        }
    },
    computed: mapState([
        'curComponent',
        'curComponentList',
        'componentData',
        'canvasStyleData',
        'openCustomRectangleStatus',
        'openSelectMoreStatus'
    ]),
    mounted() {
        eventBus.$on('runAnimation', () => {
            if (this.element == this.curComponent) {
                runAnimation(this.$el, this.curComponent.animations)
            }
        })

    },
    methods: {

        // 处理旋转
        handleRotate(e) {
            e.stopPropagation()
            // 初始坐标和初始角度
            const pos = { ...this.defaultStyle }
            utils.changeJsonValue(pos)
            const startY = e.clientY
            const startX = e.clientX
            const startRotate = pos.rotate

            // 获取元素中心点位置
            const rect = this.$el.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            // 旋转前的角度
            const rotateDegreeBefore = Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180)

            // 如果元素没有移动，则不保存快照
            let hasMove = false
            const move = (moveEvent) => {
                hasMove = true
                const curX = moveEvent.clientX
                const curY = moveEvent.clientY
                // 旋转后的角度
                const rotateDegreeAfter = Math.atan2(curY - centerY, curX - centerX) / (Math.PI / 180)
                // 获取旋转的角度值
                pos.rotate = startRotate + rotateDegreeAfter - rotateDegreeBefore
                // 修改当前组件样式
                this.$store.commit('setShapeStyle', pos)
            }

            const up = () => {
                hasMove && this.$store.commit('recordSnapshot')
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
                this.cursors = this.getCursor() // 根据旋转角度获取光标位置
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        },

        getPointStyle(point) {
            const { width, height } = this.defaultStyle
            const hasT = /t/.test(point)
            const hasB = /b/.test(point)
            const hasL = /l/.test(point)
            const hasR = /r/.test(point)
            let newLeft = 0
            let newTop = 0

            // 四个角的点
            if (point.length === 2) {
                newLeft = hasL? 0 : width
                newTop = hasT? 0 : height
            } else {
                // 上下两点的点，宽度居中
                if (hasT || hasB) {
                    newLeft = width / 2
                    newTop = hasT? 0 : height
                }

                // 左右两边的点，高度居中
                if (hasL || hasR) {
                    newLeft = hasL? 0 : width
                    newTop = Math.floor(height / 2)
                }
            }

            const style = {
                marginLeft: hasR? '-4px' : '-4px',
                marginTop: '-4px',
                left: `${newLeft}px`,
                top: `${newTop}px`,
                cursor: this.cursors[point],
            }

            return style
        },
        getXyLineStyle(type){
            let componentData = this.componentData;
            utils.changeJsonValue(this.defaultStyle) ;
            let curstyle =this.defaultStyle;
            let dis = 100000;
            let curcom = null;
            let mindis = 0;
            if(type=='x'){
                for(let i in componentData){
                    curcom = componentData[i];
                    utils.changeJsonValue(curcom.style)
                    let dd1 = curstyle.left-curcom.style.left;
                    let dd2 = curstyle.left-curcom.style.left-curcom.style.width;
                    //对于x方向的距离线条 ，如果不在同一行的，就过滤掉，
                    if(curcom.style.top>curstyle.top+curstyle.height || curcom.style.top+curcom.style.height<curstyle.top){
                        continue;
                    }
                    if(dd1>mindis  && dd1 <dis){
                        dis = dd1;
                    }
                    if(dd2>mindis && dd2 <dis){
                        dis = dd2;
                    }
                }
                if(dis==100000){
                    dis = curstyle.left;
                }
                dis = utils.changeValue(dis);
                this.xyLineStyle.width = dis
                return {left: `-${dis}px`,width: `${dis}px`}
            }else{
                for(let i in componentData){
                    curcom = componentData[i];
                    utils.changeJsonValue(curcom.style)
                    let dd1 = curstyle.top - curcom.style.top;
                    let dd2 = curstyle.top-curcom.style.top-curcom.style.height;
                    //对于y方向的距离线条 ，如果不在同一列的，就过滤掉，
                    if(curcom.style.left>curstyle.left+curstyle.width || curcom.style.left+curcom.style.width<curstyle.left){
                        continue;
                    }
                    if(dd1>mindis && dd1 <dis){
                        dis = dd1;
                    }
                    if(dd2>mindis && dd2 <dis){
                        dis = dd2;
                    }
                }
                if(dis==100000){
                    dis = curstyle.top;
                }
                dis = utils.changeValue(dis);
                this.xyLineStyle.height = dis
                return {top: `-${dis}px`,height: `${dis}px`,lineHeight: `${dis}px`,textIndent:"5px"}
            }
        },

        getXyLineStyle2(type){
            let componentData = this.componentData;
            utils.changeJsonValue(this.defaultStyle) ;
            let curstyle =this.defaultStyle;
            let dis = 100000;
            let curcom = null;
            let mindis = 0;
            if(type=='x'){
                for(let i in componentData){
                    curcom = componentData[i];
                    utils.changeJsonValue(curcom.style)
                    let dd1 = (curcom.style.left+curcom.style.width)-(curstyle.left+curstyle.width);
                    let dd2 = curcom.style.left-(curstyle.left+curstyle.width);
                    //对于x方向的距离线条 ，如果不在同一行的，就过滤掉，y方向的暂时不考虑
                    if(curcom.style.top>curstyle.top+curstyle.height || curcom.style.top+curcom.style.height<curstyle.top){
                        continue;
                    }
                    if(dd1>mindis  && dd1 <dis){
                        dis = dd1;
                    }
                    if(dd2>mindis && dd2 <dis){
                        dis = dd2;
                    }
                }
                if(dis==100000){
                    dis = this.canvasStyleData.left+this.canvasStyleData.width - (curstyle.left+curstyle.width);
                }
                dis = utils.changeValue(dis);
                this.xyLineStyle2.width = dis
                return {right: `-${dis}px`,width: `${dis}px`}
            }else{
                for(let i in componentData){
                    curcom = componentData[i];
                    utils.changeJsonValue(curcom.style)
                    let dd1 = curcom.style.top-(curstyle.top +curstyle.height);
                    let dd2 = (curcom.style.top+curcom.style.height)-(curstyle.top +curstyle.height);
                    //对于y方向的距离线条 ，如果不在同一列的，就过滤掉，
                    if(curcom.style.left>curstyle.left+curstyle.width || curcom.style.left+curcom.style.width<curstyle.left){
                        continue;
                    }
                    if(dd1>mindis && dd1 <dis){
                        dis = dd1;
                    }
                    if(dd2>mindis && dd2 <dis){
                        dis = dd2;
                    }
                }
                if(dis==100000){
                    dis = this.canvasStyleData.top+this.canvasStyleData.height - (curstyle.top +curstyle.height);
                }
                dis = utils.changeValue(dis);
                this.xyLineStyle2.height = dis
                return {bottom: `-${dis}px`,height: `${dis}px`,lineHeight: `${dis}px`,textIndent:"5px"}
            }
        },
        getCursor() {
            const { angleToCursor, initialAngle, pointList, curComponent } = this
            const rotate = (curComponent.style.rotate + 360) % 360 // 防止角度有负数，所以 + 360
            const result = {}
            let lastMatchIndex = -1 // 从上一个命中的角度的索引开始匹配下一个，降低时间复杂度
            pointList.forEach(point => {
                const angle = (initialAngle[point] + rotate) % 360
                const len = angleToCursor.length
                while (true) {
                    lastMatchIndex = (lastMatchIndex + 1) % len
                    const angleLimit = angleToCursor[lastMatchIndex]
                    if (angle < 23 || angle >= 338) {
                        result[point] = 'nw-resize'
                        return
                    }

                    if (angleLimit.start <= angle && angle < angleLimit.end) {
                        result[point] = angleLimit.cursor + '-resize'
                        return
                    }
                }
            })

            return result
        },
        _debounce(func, wait = 500) {
        			      // 这个定时器一定不能是这个函数私有的，一定是要放在Data中，如果
        			      // 没有放在data中则会出现点击几次就触发几次，虽然说点击后确实会延迟执行，但是没有起到节流应该有的效果
        			      // let timer = this.timer
        			      // debugger
        			      // 这里返回的函数是每次用户实际调用的防抖函数
        			      // 如果已经设定过定时器了就清空上一次的定时器
        			      // 开始一个新的定时器，延迟执行用户传入的方法
        			      // 这里的this一定要保存副本！！！！！！
        			      var _this = this
        			      return function(...args) {
        			        if (_this.timer) clearTimeout(_this.timer)
        			        // console.log('77')
        			        _this.timer = setTimeout(() => {
        			          func.apply(_this, args)
        			        }, wait)
        			      }
        },
        containerScoll(xdiff,ydiff,pos){
            //判断是否在编辑器滚动条区域内
            let centerSectionRect = document.querySelector('#centerSection').getBoundingClientRect();
            let centerSectionPos = {
                left:0+document.querySelector('#shadowcontent').scrollLeft+(xdiff>0?-50:0),//xdiff 判断是为了能让滚动条股东到最右边
                top:0+document.querySelector('#shadowcontent').scrollTop,
                width:centerSectionRect.width,
                height:centerSectionRect.height,
            }
            let containInfo ={x:false,y:false};
            if(!NodeElment.isAContainB(centerSectionPos, pos,null,containInfo)){
                if(!containInfo.x){
                    document.querySelector('#shadowcontent').scrollLeft+=xdiff>0?10:-10;
                }
                if(!containInfo.y){
                    document.querySelector('#centerSection').scrollTop+=ydiff>0?10:-10;
                }
            }
        },
        //移动元素
        handleMouseDownOnShape(e) {
            //该元素 不能被选中
            if(!this.element.isCanBeSelect){
                return;
            }

            //开启自定义矩形功能，
            if(this.openCustomRectangleStatus){
                e.preventDefault()
                return;
            }
            if (this.element.component != 'v-text') {
                e.preventDefault()
            }
            // console.log("handleMouseDownOnShape",e);
            // e.stopPropagation()
            let isclear = false;
            this.isMouseDownOnShape = true;
            //开启多选功能
            if(this.openSelectMoreStatus){
                if(this.curComponent){
                    //追加最近一个选中元素（这样的话，当前有一个选中元素，然后你再按住ctrl键，可以把当前的选中，给添加进来，体验更好）
                  this.$store.commit('setCurComponentList', { component: this.curComponent})
                }

            }else{
                //如果是多选，并且点击其他非选择元素，则重置为单选
                if(this.$store.state.isSelectMore && !utils.isInCurComponentList(this.element)){
                    this.$store.commit('setCurComponentList', { component: this.element,isclear:true})
                }
                //清空(如果是多选，可以不用再按住ctrl，进行整体移动操作)
                if(!this.$store.state.isSelectMore)
                    isclear = true;
            }
            this.$store.commit('setCurComponentList', { component: this.element,isclear:isclear})
            //设置当前选中元素
            this.$store.commit('setCurComponent', { component: this.element, index: this.index })
            if(this.openSelectMoreStatus){
                return;
            }


            this.cursors = this.getCursor() // 根据旋转角度获取光标位置
            const curstyle = { ...this.defaultStyle }
            utils.changeJsonValue(curstyle)
            // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
            let minRec = {};
            if(this.curComponentList.length>0){
                for(let i in this.curComponentList){
                    this.curComponentList[i].drag.startTop =  Number(this.curComponentList[i].style.top)
                    this.curComponentList[i].drag.startLeft =  Number(this.curComponentList[i].style.left)
                }
                minRec = NodeElment.getMinimumRec2(this.curComponentList);
            }
            minRec.startTop = Number(minRec.top);
            minRec.startLeft = Number(minRec.left);
            // 如果元素没有移动，则不保存快照
            let hasMove = false
            const startY = e.clientY
            const startX = e.clientX
            const move = (moveEvent) => {
                const curX = moveEvent.clientX
                const curY = moveEvent.clientY
                // curY - startY > 0 true 表示向下移动 false 表示向上移动
                // curX - startX > 0 true 表示向右移动 false 表示向左移动
                let xdiff = curX - startX
                let ydiff = curY - startY
                this.containerScoll(xdiff,ydiff,curstyle)
                // if(Math.abs(ydiff)<3&&Math.abs(xdiff)<3){
                //     return false;
                // }
                hasMove = true
                minRec.top = ydiff +  minRec.startTop;
                minRec.left = xdiff + minRec.startLeft;
                //判断是否越界，多个元素一起拖拽时
                if(!NodeElment.isAContainB(this.$store.state.canvasStyleData,minRec,minRec)){
                    //重新计算横纵坐标间隔，防止元素被移除画布之外
                    ydiff = minRec.top - minRec.startTop;
                    xdiff = minRec.left - minRec.startLeft;
                    // return;
                }

                if(this.curComponentList.length>0){
                    for(let i in this.curComponentList){
                        this.curComponentList[i].style.top = ydiff + this.curComponentList[i].drag.startTop
                        this.curComponentList[i].style.left = xdiff + this.curComponentList[i].drag.startLeft
                    }
                }

                // 等更新完当前组件的样式并绘制到屏幕后再判断是否需要吸附
                // 如果不使用 $nextTick，吸附后将无法移动
                this.$nextTick(() => {
                    // 触发元素移动事件，用于显示标线、吸附功能
                    // 后面两个参数代表鼠标移动方向

                    eventBus.$emit('move', ydiff > 0, xdiff > 0)
                })
            }

            const up = () => {
                this.isMouseDownOnShape = false;
                hasMove && this.$store.commit('recordSnapshot')
                // 触发元素停止移动事件，用于隐藏标线
                eventBus.$emit('unmove')
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)


        },

        selectCurComponent(e) {
            // 阻止向父组件冒泡
            //(看情况而定,注释掉的话,layui-tab就可以直接切换,和预览效果差不多)
            // e.stopPropagation()
            e.preventDefault()
            //置顶
            // this.$store.commit('topComponent')
            this.$store.commit('hideContexeMenu')
        },

        handleMouseDownOnPoint(point, e) {
            //开启自定义矩形功能，
            if(this.openCustomRectangleStatus){
                e.preventDefault()
                return;
            }
            const downEvent = window.event
            downEvent.stopPropagation()
            downEvent.preventDefault()

            const style = { ...this.defaultStyle }
            //如果不经过处理,点击属性面板改变宽高xy等值是会变成字符串,导致下方 +法变成字符串相加
            utils.changeJsonValue(style)
            // console.log("handleMouseDownOnPoint",point,e);
            const center = {
                x: style.left + style.width / 2,
                y: style.top + style.height / 2,
            }

			let curX = e.clientX;
            let curY = e.clientY;

            // 获取画布位移信息
            const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()
            let curPoint = {};
            // 当前点击的拖拽点坐标(相对于编辑器的坐标)
            // curPoint = {
            //         x: curX - editorRectInfo.left,
            //         y: curY - editorRectInfo.top,
            // }
            switch(point){
                case 'r':
                    curPoint = {
                        x: style.left+style.width,
                        y: center.y,
                    };
                    break;
                case 'rt':
                    curPoint = {
                        x: style.left+style.width,
                        y: style.top,
                    };
                    break;
                case 'rb':
                    curPoint = {
                        x: style.left+style.width,
                        y: style.top+style.height,
                    };
                    break;
                case 'l':
                    curPoint = {
                        x: style.left,
                        y: center.y,
                    };
                    break;
                case 'lt':
                    curPoint = {
                        x: style.left,
                        y: style.top,
                    };
                    break;
                case 'lb':
                    curPoint = {
                        x: style.left,
                        y: style.top+style.height,
                    };
                    break;
                case 't':
                    curPoint = {
                        x: center.x,
                        y: style.top,
                    };
                    break;
                case 'b':
                    curPoint = {
                        x: center.x,
                        y: style.top+style.height,
                    };
                    break;
            }
            //style里面的top left width heigt 都是没有经过旋转的坐标
            //center 是中心点，绕中心点旋转，中心的坐标是不会改变的
            //坐标运算，计算当前点击点的实际坐标
            curPoint = calculateRotatedPointCoordinate(curPoint, center, style.rotate)
            // curPoint = {
            //     x:Math.round(curPoint.x),
            //     y:Math.round(curPoint.y),
            // }
            // 获取对称点的坐标
            let symmetricPoint = {
                x: center.x - (curPoint.x - center.x),
                y: center.y - (curPoint.y - center.y),
            }

            // 是否需要保存快照
            let needSave = false
            let isFirst = true
            const move = (moveEvent) => {

                // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
                // 因此第一次点击时不触发 move 事件
                if (isFirst) {
                    isFirst = false
                    return
                }
				let curX = moveEvent.clientX
                let curY = moveEvent.clientY

                needSave = true
                // 当前移动坐标(相对于编辑器的坐标)
                let curPositon = {
                    x: Math.round(curX - editorRectInfo.left),
                    y: Math.round(curY - editorRectInfo.top),
                }
                this.isresize = true;
                let r_top=curPositon.y-this.defaultStyle.top+10
                let r_left = curPositon.x-this.defaultStyle.left+20
                this.resizeStyle={top:`${r_top}px`,left:`${r_left}px`}
                //zcw 将curPositon换成curPoint 试一下 会导致无法改变大小
                // curPositon = curPoint;
                calculateComponentPositonAndSize(point, style, curPositon, {
                    center,
                    curPoint,
                    symmetricPoint,
                })
                NodeElment.isAContainBResize(this.$store.state.canvasStyleData,style,style)
                this.$store.commit('setShapeStyle', style)
                const startY = curPoint.y
                const startX = curPoint.x
                const xdiff = curX - startX
                const ydiff = curY - startY
                this.containerScoll(xdiff,ydiff,style)
                // 如果不使用 $nextTick，吸附后将无法移动
                this.$nextTick(() => {
                    // 触发元素移动事件，用于显示标线、吸附功能
                    // 后面两个参数代表鼠标移动方向
                    // curY - startY > 0 true 表示向下移动 false 表示向上移动
                    // curX - startX > 0 true 表示向右移动 false 表示向左移动
                    eventBus.$emit('resize', curY - startY > 0, curX - startX > 0)
                    this.$store.commit('sort');
                })
            }

            const up = () => {
                this.isresize = false;
                document.removeEventListener('mousemove', move)
                eventBus.$emit('unresize')
                document.removeEventListener('mouseup', up)
                needSave && this.$store.commit('recordSnapshot')
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        },
    },
}
</script>

<style lang="scss" scoped>
.shape {
    position: absolute;

    &.active {
        cursor: move;
    }
}
.active {
    outline: 1px solid #70c0ff;
    user-select: none;
}
.resize{
    position: absolute;
    background: black;
    width: 80px;
    padding: 10px;
    text-align: center;
    color: white;
    border-radius: 10px;
}

.shape-point {
    position: absolute;
    background: #fff;
    border: 1px solid #59c7f9;
    width: 8px;
    height: 8px;
    border-radius: 50%;

}
.shape-x-line{
    position: absolute;
    background: #fff;
    border: 1px solid #ff0000;
    height: 0px;
    left:0px;
    text-align: center;
    color: red;
    font-size: 12px;
    top:10px;
    .content
    {
            position: absolute;
            left: -2px;
            top: -6px;
            border: 1px solid #ff0000;
            height: 12px;

    }
}
.shap-y-line{
    position: absolute;
    background: #fff;
    border: 1px solid #ff0000;
    width: 0px;
    top:0px;
    text-align: center;
    color: red;
    font-size: 12px;
    left:10px;
    .content
    {
            position: absolute;
            top: -2px;
            left: -6px;
            border: 1px solid #ff0000;
            width: 12px;

    }
}

.shape-x2-line{
    position: absolute;
    background: #fff;
    border: 1px solid #ff0000;
    height: 0px;
    right:0px;
    text-align: center;
    color: red;
    font-size: 12px;
    bottom:10px;
    .content
    {
            position: absolute;
            right: -2px;
            top: -6px;
            border: 1px solid #ff0000;
            height: 12px;

    }
}
.shap-y2-line{
    position: absolute;
    background: #fff;
    border: 1px solid #ff0000;
    width: 0px;
    bottom:0px;
    text-align: center;
    color: red;
    font-size: 12px;
    right:10px;
    .content
    {
            position: absolute;
            bottom: -2px;
            left: -6px;
            border: 1px solid #ff0000;
            width: 12px;

    }
}
.el-icon-refresh-right {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
    font-weight: 600;
    cursor: grab;
    color: #59c7f9;
    font-size: 22px;
    font-weight: normal;

    &:active {
        cursor: grabbing;
    }
}
</style>
