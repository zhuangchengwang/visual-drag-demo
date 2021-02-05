<template>
    <div class="mark-line">
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
import { mapState } from 'vuex'
import { sin, cos } from '@/utils/translate'
const defaultDiff = 3;
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
        // 监听元素移动和不移动的事件
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
            
            this.showLine(isDownward, isRightward,0)
        })

        eventBus.$on('unkeymove', () => {
            this.hideLine()
        })
    },
    methods: {
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
            let components = this.componentData
            const curComponentStyle = this.translateComponentStyle(this.curComponent.style)
            const curComponentHalfwidth = curComponentStyle.width / 2
            const curComponentHalfHeight = curComponentStyle.height / 2
            this.diff = dragdiff !== null?dragdiff:defaultDiff;
            this.hideLine()
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
                            lineNode: lines.xt[0], // xt
                            line: 'xt',
                            dragShift: top,
                            lineShift: top,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.bottom, top),
                            lineNode: lines.xt[0], // xt
                            line: 'xt',
                            dragShift: top - curComponentStyle.height,
                            lineShift: top,
                        },
                        {
                            // 组件与拖拽节点的中间是否对齐
                            isNearly: this.isNearly(curComponentStyle.top + curComponentHalfHeight, top + componentHalfHeight),
                            lineNode: lines.xc[0], // xc
                            line: 'xc',
                            dragShift: top + componentHalfHeight - curComponentHalfHeight,
                            lineShift: top + componentHalfHeight,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.top, bottom),
                            lineNode: lines.xb[0], // xb
                            line: 'xb',
                            dragShift: bottom,
                            lineShift: bottom,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.bottom, bottom),
                            lineNode: lines.xb[0], // xb
                            line: 'xb',
                            dragShift: bottom - curComponentStyle.height,
                            lineShift: bottom,
                        },
                    ],
                    left: [
                        {
                            isNearly: this.isNearly(curComponentStyle.left, left),
                            lineNode: lines.yl[0], // yl
                            line: 'yl',
                            dragShift: left,
                            lineShift: left,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.right, left),
                            lineNode: lines.yl[0], // yl
                            line: 'yl',
                            dragShift: left - curComponentStyle.width,
                            lineShift: left,
                        },
                        {
                            // 组件与拖拽节点的中间是否对齐
                            isNearly: this.isNearly(curComponentStyle.left + curComponentHalfwidth, left + componentHalfwidth),
                            lineNode: lines.yc[0], // yc
                            line: 'yc',
                            dragShift: left + componentHalfwidth - curComponentHalfwidth,
                            lineShift: left + componentHalfwidth,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.left, right),
                            lineNode: lines.yr[0], // yr
                            line: 'yr',
                            dragShift: right,
                            lineShift: right,
                        },
                        {
                            isNearly: this.isNearly(curComponentStyle.right, right),
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
                        console.log(condition);

                        if(dragdiff===null){
                            //resize时不可以使用吸附功能
                            // 修改当前组件位移(吸附功能)
                            this.$store.commit('setShapePosStyle', {
                                key,
                                value: rotate != 0? this.translatecurComponentShift(key, condition, curComponentStyle) : condition.dragShift,
                            })
                        }

                        condition.lineNode.style[key] = `${condition.lineShift}px`
                        needToShow.push(condition.line)

                    })
                })


                if (needToShow.length) {
                    // 同一方向上同时显示三条线可能不太美观，因此才有了这个解决方案
                    // 同一方向上的线只显示一条，例如多条横条只显示一条横线
                    // this.chooseTheTureLine(needToShow, isDownward, isRightward)
                    //方案2,同时显示
                    for(let li in needToShow){
                        this.lineStatus[needToShow[li]] = true;
                    }
                    console.log(needToShow,JSON.parse(JSON.stringify(this.lineStatus)))
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
            return Math.abs(dragValue - targetValue) <= this.diff
        },
    },
}
</script>

<style lang="scss" scoped>
.mark-line {
    height: 100%;
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
