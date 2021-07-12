<template>
    <div id="mark-line" class="mark-line" @mousedown="deselectCurComponent"  tabindex="0">

        <div
            v-for="line in lines"
            :key="line"
            class="line"
            :class="line.includes('x')? 'xline' : 'yline'"
            :ref="line"
            v-show="lineStatus[line] || false"
        ></div>
    </div>
</template>

<script>
import eventBus from '@/utils/eventBus'
import {copyObject,deepCopy,getComponentConfigByName} from '@/utils/utils'
import { mapState } from 'vuex'
import { sin, cos } from '@/utils/translate'
import * as NodeElment from '@/utils/NodeElment'
import generateID from '@/utils/generateID'
const defaultDiff = 4;
export default {
    data() {
        return {
            lines: ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'], // 分别对应三条横线和三条竖线
            diff: defaultDiff, // 相距 dff 像素将自动吸附
            lineStatus: {
                xt: false,
                xc: false,
                xb: false,
                yl: false,
                yc: false,
                yr: false,
            },
        }
    },
    computed: mapState([
        'curComponent',
        'componentData',
        'curComponentList'
    ]),
    mounted() {
        // 监听元素移动和不移动的事件
        eventBus.$on('move', (isDownward, isRightward) => {
            // console.log('move event');
            this.showLine(isDownward, isRightward)
        })

        eventBus.$on('unmove', () => {
            this.hideLine()
        })
        // 监听元素伸缩事件
        eventBus.$on('resize', (isDownward, isRightward) => {
            // console.log('resize event');
            //dragdiff 设置为0,只是个人感觉 禁止吸附体验更好而已
            this.showLine(isDownward, isRightward,0)
        })

        eventBus.$on('unresize', () => {
            this.hideLine()
        })
        // 监听元素移动和不移动的事件
        eventBus.$on('keymove', (isDownward, isRightward) => {
            // console.log('resize event');
            //禁用自动吸附，不然会无法微调，因为微调距离是1px 而吸附距离是4px 至少大于1px 导致当两元素已经对齐的时候 每次微调，都会被吸附，微调失败
            this.showLine(isDownward, isRightward,0)
        })

        eventBus.$on('unkeymove', () => {
            this.hideLine()
        })
    },
    created() {
      this.$nextTick(()=>{
          const EventContiner = document.querySelector('#mark-line');
          const shiftKey = 16,ctrlKey = 17,altKey=18, vKey = 86, cKey = 67, xKey = 88,leftKey = 37,topKey = 38,rightKey = 39,downKey = 40
          EventContiner.addEventListener('keydown', (e) => {
             e.preventDefault();
             e.stopPropagation()
             console.log("keydown",e)
             if(e.keyCode == altKey){
                 this.$store.commit("setOpenCustomRectangleStatus",1)
                 // eventBus.$emit('openCustomRectangle');
             }
             if (e.ctrlKey && e.keyCode == cKey) {
                 this.$store.commit('copy')
             } else if (e.ctrlKey  && e.keyCode == vKey) {
                 this.$store.commit('paste')
             } else if (e.ctrlKey  && e.keyCode == xKey) {
                 this.$store.commit('cut')
             }else if([leftKey,rightKey,topKey,downKey].includes(e.keyCode)){



                 if(this.curComponentList.length>0){
                     // let newpos = JSON.parse(JSON.stringify(this.$store.state.curComponent.style));
                     // this.$message.error('越界啦!,元素移动时不可以超出画布大小哦!');
                     let minRec = NodeElment.getMinimumRec2(this.curComponentList);

                     switch(e.keyCode){
                         case 37:
                             //左
                             minRec.left--;
                             if(!NodeElment.isAContainB(this.$store.state.canvasStyleData,minRec)){
                                 break;
                             }
                             for(let i in this.curComponentList){
                                 this.curComponentList[i].style.left--;
                             }
                             break;
                         case 38:
                             //上
                             minRec.top--;
                             if(!NodeElment.isAContainB(this.$store.state.canvasStyleData,minRec)){
                                 break;
                             }
                             for(let i in this.curComponentList){
                                 this.curComponentList[i].style.top--;
                             }
                             break;
                         case 39:
                             //右
                             minRec.left++;
                             if(!NodeElment.isAContainB(this.$store.state.canvasStyleData,minRec)){
                                 break;
                             }
                             for(let i in this.curComponentList){
                                 this.curComponentList[i].style.left++;
                             }
                             break;
                         case 40:
                             //下
                             minRec.top++;
                             if(!NodeElment.isAContainB(this.$store.state.canvasStyleData,minRec)){
                                 break;
                             }
                             for(let i in this.curComponentList){
                                 this.curComponentList[i].style.top++;
                             }
                             break;

                     }
                     // this.$store.commit('setShapeStyle', newpos)
                     eventBus.$emit('keymove', e.keyCode==40, e.keyCode==39)

                 }
             }
          });
          EventContiner.addEventListener('keyup', (e) => {
             // console.log("keyup",e)
             if(e.keyCode == altKey){
                 // eventBus.$emit('closeCustomRectangle');
                 this.$store.commit("setOpenCustomRectangleStatus",0)
             }
             if([leftKey,rightKey,topKey,downKey].includes(e.keyCode)){
                 setTimeout(()=>{
                      eventBus.$emit('unmove')
                 },400)
             }
          });
      })
    },
    methods: {

        deselectCurComponent(e) {
                console.log("markline.vue deselectCurComponent",e);
                // document.querySelector('#mark-line').focus()
                //加上这个if是因为(先前为了使用layuitab可以被点击切换,允许事件冒泡,结果导致,组件选中后马上被取消,因为冒泡会到这里来)
                //然而,也因此导致了一个问题:右键菜单置顶置地功能无法及时响应,因为要想及时响应就必须取消选中
                this.$store.commit('setCurComponent', { component: null, index: null })
                this.$store.commit('clearCurComponentList')
                this.$store.commit('hideContexeMenu')
        },

        hideLine() {
            Object.keys(this.lineStatus).forEach(line => {
                this.lineStatus[line] = false
            })
        },

        translateComponentStyle(style) {
            style = { ...style }
            if (style.rotate != 0 ||style.rotate != '') {
                const newWidth = style.width * cos(style.rotate) + style.height * sin(style.rotate)
                const diffX = (style.width - newWidth) / 2
                style.left += diffX
                style.right = style.left + newWidth

                const newHeight = style.height * cos(style.rotate) + style.width * sin(style.rotate)
                const diffY = (newHeight - style.height) / 2
                style.top -= diffY
                style.bottom = style.top + newHeight

                style.width = newWidth
                style.height = newHeight
            } else {
                style.bottom = style.top + style.height
                style.right = style.left + style.width
            }

            return style
        },
        /**
         * dragdiff 重新设置吸附距离 0等价于禁用吸附
         */
        showLine(isDownward, isRightward,dragdiff=null) {
            const lines = this.$refs
            let components = deepCopy(this.componentData)
            //临时生成一个和画布全等的div,作用1：方便元素居中对齐
            let component = deepCopy(getComponentConfigByName("VDiv"))//div
            component.style=this.$store.state.canvasStyleData
            component.style.rotate=''
            component.id = generateID()
            components.push(component)


            let curComponentStyle = this.translateComponentStyle(this.curComponent.style)
             // console.log('this.curComponent.style',copyObject(this.curComponent.style),copyObject(curComponentStyle));
            const curComponentHalfwidth = curComponentStyle.width / 2
            const curComponentHalfHeight = curComponentStyle.height / 2
            this.diff = dragdiff !== null?dragdiff:defaultDiff;
            this.hideLine()
            //吸附功能
            if(dragdiff===null){

                components.forEach(component => {
                    if (component.id == this.curComponent.id) return;
                // console.log('components',components,component.style);
                    const componentStyle = this.translateComponentStyle(component.style)
                    const { top, left, bottom, right } = componentStyle
                    const componentHalfwidth = componentStyle.width / 2
                    const componentHalfHeight = componentStyle.height / 2

                    const conditions = {
                        top: [
                            {
                                isNearly: this.isNearly(curComponentStyle.top, top),
                                iseq: curComponentStyle.top==top,
                                lineNode: lines.xt[0], // xt
                                line: 'xt',
                                dragShift: top,
                                lineShift: top,
                            },
                            {
                                isNearly: this.isNearly(curComponentStyle.bottom, top),
                                iseq: curComponentStyle.bottom==top,
                                lineNode: lines.xt[0], // xt
                                line: 'xt',
                                dragShift: top - curComponentStyle.height,
                                lineShift: top,
                            },
                            {
                                // 组件与拖拽节点的中间是否对齐
                                isNearly: this.isNearly(curComponentStyle.top + curComponentHalfHeight, top + componentHalfHeight),
                                iseq: (curComponentStyle.top + curComponentHalfHeight)==(top + componentHalfHeight),
                                lineNode: lines.xc[0], // xc
                                line: 'xc',
                                dragShift: top + componentHalfHeight - curComponentHalfHeight,
                                lineShift: top + componentHalfHeight,
                            },
                            {
                                isNearly: this.isNearly(curComponentStyle.top, bottom),
                                iseq: curComponentStyle.top==bottom,
                                lineNode: lines.xb[0], // xb
                                line: 'xb',
                                dragShift: bottom,
                                lineShift: bottom,
                            },
                            {
                                isNearly: this.isNearly(curComponentStyle.bottom, bottom),
                                iseq: curComponentStyle.bottom==bottom,
                                lineNode: lines.xb[0], // xb
                                line: 'xb',
                                dragShift: bottom - curComponentStyle.height,
                                lineShift: bottom,
                            },
                        ],
                        left: [
                            {
                                isNearly: this.isNearly(curComponentStyle.left, left),
                                iseq: curComponentStyle.left==left,
                                lineNode: lines.yl[0], // yl
                                line: 'yl',
                                dragShift: left,
                                lineShift: left,
                            },
                            {
                                isNearly: this.isNearly(curComponentStyle.right, left),
                                iseq: curComponentStyle.right==left,
                                lineNode: lines.yl[0], // yl
                                line: 'yl',
                                dragShift: left - curComponentStyle.width,
                                lineShift: left,
                            },
                            {
                                // 组件与拖拽节点的中间是否对齐
                                isNearly: this.isNearly(curComponentStyle.left + curComponentHalfwidth, left + componentHalfwidth),
                                iseq: (curComponentStyle.left + curComponentHalfwidth)==(left + componentHalfwidth),
                                lineNode: lines.yc[0], // yc
                                line: 'yc',
                                dragShift: left + componentHalfwidth - curComponentHalfwidth,
                                lineShift: left + componentHalfwidth,
                            },
                            {
                                isNearly: this.isNearly(curComponentStyle.left, right),
                                iseq:curComponentStyle.left == right,
                                lineNode: lines.yr[0], // yr
                                line: 'yr',
                                dragShift: right,
                                lineShift: right,
                            },
                            {
                                isNearly: this.isNearly(curComponentStyle.right, right),
                                iseq:curComponentStyle.right == right,
                                lineNode: lines.yr[0], // yr
                                line: 'yr',
                                dragShift: right - curComponentStyle.width,
                                lineShift: right,
                            },
                        ],
                    }
                    const { rotate } = this.curComponent.style
                    Object.keys(conditions).forEach(key => {
                        // 遍历符合的条件并处理
                        conditions[key].forEach((condition) => {
                            if (!condition.isNearly||!condition.lineNode){
                                return;
                            }
                                //resize时不可以使用吸附功能
                                // 修改当前组件位移(吸附功能)
                                console.log('setShapePosStyle',condition,rotate != 0,{
                                    key,
                                    value: rotate != 0? this.translatecurComponentShift(key, condition, curComponentStyle) : condition.dragShift,
                                },copyObject(this.curComponent.style));
                                this.$store.commit('setShapePosStyle', {
                                    key,
                                    value: rotate != 0? this.translatecurComponentShift(key, condition, curComponentStyle) : condition.dragShift,
                                })
                                //设置其他选中元素的坐标
                                this.$store.commit('setCurComponentListPostion');
                        })
                    })

                })
            }


            // console.log('重新获取this.curComponent.style',copyObject(this.curComponent.style));
            //重新获取
            curComponentStyle = this.translateComponentStyle(this.curComponent.style)

            components.forEach(component => {
                console.log("needToShow componentStyle1",component.style)
                if (component.id == this.curComponent.id) return;
            // console.log('components',components,component.style);

                const componentStyle = this.translateComponentStyle(component.style)
                const { top, left, bottom, right } = componentStyle
                const componentHalfwidth = componentStyle.width / 2
                const componentHalfHeight = componentStyle.height / 2
                console.log("needToShow componentStyle",componentStyle)
                const conditions = {
                    top: [
                        {
                            isNearly: this.isNearly(curComponentStyle.top, top),
                            iseq: curComponentStyle.top==top,
                            lineNode: lines.xt[0], // xt
                            line: 'xt',
                            dragShift: top,
                            lineShift: top,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.bottom, top),
                            iseq: curComponentStyle.bottom==top,
                            lineNode: lines.xt[0], // xt
                            line: 'xt',
                            dragShift: top - curComponentStyle.height,
                            lineShift: top,
                        },
                        {
                            // 组件与拖拽节点的中间是否对齐
                            isNearly: this.isNearly(curComponentStyle.top + curComponentHalfHeight, top + componentHalfHeight),
                            iseq: (curComponentStyle.top + curComponentHalfHeight)==(top + componentHalfHeight),
                            lineNode: lines.xc[0], // xc
                            line: 'xc',
                            dragShift: top + componentHalfHeight - curComponentHalfHeight,
                            lineShift: top + componentHalfHeight,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.top, bottom),
                            iseq: curComponentStyle.top==bottom,
                            lineNode: lines.xb[0], // xb
                            line: 'xb',
                            dragShift: bottom,
                            lineShift: bottom,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.bottom, bottom),
                            iseq: curComponentStyle.bottom==bottom,
                            lineNode: lines.xb[0], // xb
                            line: 'xb',
                            dragShift: bottom - curComponentStyle.height,
                            lineShift: bottom,
                        },
                    ],
                    left: [
                        {
                            isNearly: this.isNearly(curComponentStyle.left, left),
                            iseq: curComponentStyle.left==left,
                            lineNode: lines.yl[0], // yl
                            line: 'yl',
                            dragShift: left,
                            lineShift: left,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.right, left),
                            iseq: curComponentStyle.right==left,
                            lineNode: lines.yl[0], // yl
                            line: 'yl',
                            dragShift: left - curComponentStyle.width,
                            lineShift: left,
                        },
                        {
                            // 组件与拖拽节点的中间是否对齐
                            isNearly: this.isNearly(curComponentStyle.left + curComponentHalfwidth, left + componentHalfwidth),
                            iseq: (curComponentStyle.left + curComponentHalfwidth)==(left + componentHalfwidth),
                            lineNode: lines.yc[0], // yc
                            line: 'yc',
                            dragShift: left + componentHalfwidth - curComponentHalfwidth,
                            lineShift: left + componentHalfwidth,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.left, right),
                            iseq:curComponentStyle.left == right,
                            lineNode: lines.yr[0], // yr
                            line: 'yr',
                            dragShift: right,
                            lineShift: right,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.right, right),
                            iseq:curComponentStyle.right == right,
                            lineNode: lines.yr[0], // yr
                            line: 'yr',
                            dragShift: right - curComponentStyle.width,
                            lineShift: right,
                        },
                    ],
                }

                const needToShow = []
                const { rotate } = this.curComponent.style

                Object.keys(conditions).forEach(key => {
                    // 遍历符合的条件并处理
                    conditions[key].forEach((condition) => {
                        if (!condition.isNearly||!condition.lineNode){
                            return;
                        }
                        //全等才显示对齐参考线,相近表现为吸附
                        condition.lineNode.style[key] = `${condition.lineShift}px`
                        needToShow.push(condition.line)
                    })
                })
                console.log('needToShow',components,needToShow,conditions);
                if (needToShow.length) {
                    // 同一方向上同时显示三条线可能不太美观，因此才有了这个解决方案
                    // 同一方向上的线只显示一条，例如多条横条只显示一条横线
                    // this.chooseTheTureLine(needToShow, isDownward, isRightward)
                    //方案2,同时显示
                    for(let li in needToShow){
                        this.lineStatus[needToShow[li]] = true;
                    }
                    // console.log(needToShow,JSON.parse(JSON.stringify(this.lineStatus)))
                }
            })
        },

        translatecurComponentShift(key, condition, curComponentStyle) {
            const { width, height } = this.curComponent.style
            if (key == 'top') {
                return Math.round(condition.dragShift - (height - curComponentStyle.height) / 2)
            }

            return Math.round(condition.dragShift - (width - curComponentStyle.width) / 2)
        },

        chooseTheTureLine(needToShow, isDownward, isRightward) {
            // 如果鼠标向右移动 则按从右到左的顺序显示竖线 否则按相反顺序显示
            // 如果鼠标向下移动 则按从下到上的顺序显示横线 否则按相反顺序显示
            if (isRightward) {
                if (needToShow.includes('yr')) {
                    this.lineStatus.yr = true
                } else if (needToShow.includes('yc')) {
                    this.lineStatus.yc = true
                } else if (needToShow.includes('yl')) {
                    this.lineStatus.yl = true
                }
            } else {
                // eslint-disable-next-line no-lonely-if
                if (needToShow.includes('yl')) {
                    this.lineStatus.yl = true
                } else if (needToShow.includes('yc')) {
                    this.lineStatus.yc = true
                } else if (needToShow.includes('yr')) {
                    this.lineStatus.yr = true
                }
            }

            if (isDownward) {
                if (needToShow.includes('xb')) {
                    this.lineStatus.xb = true
                } else if (needToShow.includes('xc')) {
                    this.lineStatus.xc = true
                } else if (needToShow.includes('xt')) {
                    this.lineStatus.xt = true
                }
            } else {
                // eslint-disable-next-line no-lonely-if
                if (needToShow.includes('xt')) {
                    this.lineStatus.xt = true
                } else if (needToShow.includes('xc')) {
                    this.lineStatus.xc = true
                } else if (needToShow.includes('xb')) {
                    this.lineStatus.xb = true
                }
            }
        },

        isNearly(dragValue, targetValue) {
            return Math.abs(dragValue - targetValue) <=this.diff
        },
    },
}
</script>

<style lang="scss" scoped>
.mark-line {
    height: 100%;
    outline: none;
}
.line {
    background: #59c7f9;
    position: absolute;
    z-index: 1000;
}
.xline {
    width: 100%;
    height: 1px;
}
.yline {
    width: 1px;
    height: 100%;
}
</style>
