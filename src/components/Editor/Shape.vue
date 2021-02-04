/* eslint-disable */
<template>
    <div class="shape" :class="{ active: this.active }" @click="selectCurComponent" @mousedown="handleMouseDownOnShape">
        <!-- 暂时关闭旋转 -->
        <i class="el-icon-refresh-right" v-show="active" @mousedown="handleRotate"></i>
        <div
            class="shape-point"
            v-for="(item, index) in (active? pointList : [])"
            @mousedown="handleMouseDownOnPoint(item, $event)"
            :key="index"
            :style="getPointStyle(item)">
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
        }
    },
    computed: mapState([
        'curComponent',
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
        handleMouseDownOnShape(e) {
            if (this.element.component != 'v-text') {
                e.preventDefault()
            }
            // console.log("handleMouseDownOnShape",e);
            // e.stopPropagation()
            this.$store.commit('setCurComponent', { component: this.element, index: this.index })
            this.cursors = this.getCursor() // 根据旋转角度获取光标位置

            const pos = { ...this.defaultStyle }

            utils.changeJsonValue(pos)
            const startY = e.clientY
            const startX = e.clientX
            // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
            const startTop = Number(pos.top)
            const startLeft = Number(pos.left)

            // 如果元素没有移动，则不保存快照
            let hasMove = false
            const move = (moveEvent) => {

                const curX = moveEvent.clientX
                const curY = moveEvent.clientY
                if(Math.abs(curY - startY)<3&&Math.abs(curX - startX)<3){
                    return false;
                }
                hasMove = true
                pos.top = curY - startY + startTop
                pos.left = curX - startX + startLeft
                if(!NodeElment.isAContainB(this.$store.state.stage,pos)){
                    this._debounce(()=>{
                        this.$message.error('越界啦!,元素移动时不可以超出画布大小哦!');
                    },200)()
                    return;
                }
                // 修改当前组件样式
                this.$store.commit('setShapeStyle', pos)
                // 等更新完当前组件的样式并绘制到屏幕后再判断是否需要吸附
                // 如果不使用 $nextTick，吸附后将无法移动
                this.$nextTick(() => {
                    // 触发元素移动事件，用于显示标线、吸附功能
                    // 后面两个参数代表鼠标移动方向
                    // curY - startY > 0 true 表示向下移动 false 表示向上移动
                    // curX - startX > 0 true 表示向右移动 false 表示向左移动
                    eventBus.$emit('move', curY - startY > 0, curX - startX > 0)
                })
            }

            const up = () => {
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
                const curPositon = {
                    x: curX - editorRectInfo.left,
                    y: curY - editorRectInfo.top,
                }
                calculateComponentPositonAndSize(point, style, curPositon, {
                    center,
                    curPoint,
                    symmetricPoint,
                })
                if(!NodeElment.isAContainB(this.$store.state.stage,style)){
                    this._debounce(()=>{
                        this.$message.error('越界啦!,伸缩元素时不可以超出画布大小哦!');
                    },200)()
                    return;
                }
                this.$store.commit('setShapeStyle', style)
                const startY = curPoint.y
                const startX = curPoint.x
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

    &:hover {
        cursor: move;
    }
}
.active {
    outline: 1px solid #70c0ff;
    user-select: none;
}
.shape-point {
    position: absolute;
    background: #fff;
    border: 1px solid #59c7f9;
    width: 8px;
    height: 8px;
    border-radius: 50%;
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
