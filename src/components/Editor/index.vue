/* eslint-disable */
<template>
    <div class="contentEditor">
        <div class="editor" id="editor"
            @mousedown="handleMouseDownOnEditor"
            :class="{ edit: isEdit,crosshair:openCustomRectangleStatus,pointer:openSelectMoreStatus }" :style="{ width: canvasStyleData.width + 'px', height: canvasStyleData.height + 'px' }"
            @contextmenu="handleContextMenu"
            @mouseover="onmouseover"

        >
            <!--页面组件列表展示-->
            <Shape v-for="(item, index) in componentData"
                :defaultStyle="item.style"
                :style="getShapeStyle(item.style)"
                :key="item.id"
                :active="item === curComponent ||curComponentList.includes(item)"
                :element="item"
                :index="index"
            >
                <component
                    v-if="item.component != 'v-text'"
                    class="component"
                    :is="item.component"
                    :style="getComponentStyle(item.style)"
                    :propValue="item.propValue"
                />

                <component
                    v-else
                    class="component"
                    :is="item.component"
                    :style="getComponentStyle(item.style)"
                    :propValue="item.propValue"
                    @input="handleInput"
                    :element="item"
                />
            </Shape>
            <!-- 右击菜单 -->
            <ContextMenu />
            <!-- 标线 -->
            <MarkLine />
            <div class="selectSome" :style="selectSomeStyle"></div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Shape from './Shape'
import getStyle from '@/utils/style'
import ContextMenu from './ContextMenu'
import MarkLine from './MarkLine'
import { deepCopy,getPositionByEditor,getComponentConfigByName } from '@/utils/utils'
import componentList from '@/custom-component/component-list' // 左侧列表数据
import generateID from '@/utils/generateID'
import * as NodeElment from '@/utils/NodeElment'
import eventBus from '@/utils/eventBus'
export default {
    props: {
        isEdit: {
            type: Boolean,
            default: true,
        },
    },
    data(){
        return {

            selectSomeStyle:{left:"-0px",top:"-0px",width:"0px",height:"0px",borderWidth:"0px"}
        }
    },
    components: { Shape, ContextMenu, MarkLine },
    computed: mapState([
        'openCustomRectangleStatus',
        'componentData',
        'curComponent',
        'curComponentList',
        'canvasStyleData',
        'openSelectMoreStatus'
    ]),
    mounted() {

      //
      // eventBus.$on('openCustomRectangle', () => {
      //    this.isOpenCustomRectangle = true;

      // })
      // eventBus.$on('closeCustomRectangle', () => {
      //    this.isOpenCustomRectangle = false;
      // })
    },
    methods: {
        onmouseover(e){
            console.log("index.vue onmouseover mark-line focus",e);
            document.querySelector('#mark-line').focus()
        },
        selectSomeHandle(e){

            const startY = e.clientY
            const startX = e.clientX
            let {left,top} = getPositionByEditor(e.clientX,e.clientY)
            let left2 = left;
            let top2 = top;
            let xdiff = 0;
            let ydiff = 0;
            this.selectSomeStyle.left = `${left}px`
            this.selectSomeStyle.top = `${top}px`
            this.selectSomeStyle.borderWidth="1px"
            const move = (moveEvent) => {

                const curX = moveEvent.clientX
                const curY = moveEvent.clientY
                // curY - startY > 0 true 表示向下移动 false 表示向上移动
                // curX - startX > 0 true 表示向右移动 false 表示向左移动
                xdiff = curX - startX
                ydiff = curY - startY
                if(xdiff<0){

                    left2 = left+xdiff;
                    this.selectSomeStyle.left = `${left2}px`
                }
                if(ydiff<0){
                    top2 =top+ydiff;
                    this.selectSomeStyle.top = `${top2}px`
                }
                xdiff = Math.abs(xdiff)
                ydiff = Math.abs(ydiff)


                this.selectSomeStyle.width = `${xdiff}px`;
                this.selectSomeStyle.height = `${ydiff}px`;

            }

            const up = () => {
                if(xdiff>10 || ydiff >10){
                    this.$store.commit('clearCurComponentList')
                }

                for(let i in this.componentData){
                    let comp = this.componentData[i].style;
                    console.log("ydiff,xdiff",ydiff,xdiff)
                    if(comp.top+comp.height<=top2 || comp.left+comp.width<=left2 ||comp.top >= top2+ydiff || comp.left >= left2+xdiff){

                        continue;
                    }
                    if(NodeElment.isAContainB(comp,{top:top2,left:left2,width:xdiff,height:ydiff})){
                        continue;
                    }

                    this.$store.commit('setCurComponentList', { component: this.componentData[i]})
                }
                this.selectSomeStyle={left:"-0px",top:"-0px",width:"0px",height:"0px"}
                // 触发元素停止移动事件，用于隐藏标线
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)

            }
            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        },
        //自定义画矩形 功能
        handleMouseDownOnEditor(e){
            console.log("index.vue handleMouseDownOnEditor e.stopPropagation e.preventDefault")
            e.stopPropagation();
            e.preventDefault()
            if(this.openSelectMoreStatus){
                this.selectSomeHandle(e);
                return;
            }
            if(!this.openCustomRectangleStatus){
                return;
            }

            // this.$store.commit('setCurComponent', { component: null, index: null })
            const startY = e.clientY
            const startX = e.clientX
            const component = deepCopy(getComponentConfigByName("VDiv"))//div
            // const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()
            let lefttop = getPositionByEditor(e.clientX,e.clientY)
            component.style.left = lefttop.left
            component.style.top = lefttop.top
            component.style.width = 0
            component.style.height = 0
            component.id = generateID()
            let addCount = 0;

            const move = (moveEvent) => {

                const curX = moveEvent.clientX
                const curY = moveEvent.clientY
                // curY - startY > 0 true 表示向下移动 false 表示向上移动
                // curX - startX > 0 true 表示向右移动 false 表示向左移动
                const xdiff = curX - startX
                const ydiff = curY - startY
                component.style.width = Math.abs(xdiff);
                component.style.height = Math.abs(ydiff);
                //只要长宽不等于0 就是已经画了一个矩形
                if(!addCount && component.style.width && component.style.height){
                    this.$store.commit('addComponent', { component })
                    // this.$store.commit('setCurComponent', { component: component})
                    addCount++;
                }
                // 等更新完当前组件的样式并绘制到屏幕后再判断是否需要吸附
                // 如果不使用 $nextTick，吸附后将无法移动
                NodeElment.isAContainBResize(this.$store.state.canvasStyleData,component.style,component.style)
            }

            const up = () => {
                // 触发元素停止移动事件，用于隐藏标线
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
                 this.$store.commit('sort')

            }
            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        },
        handleContextMenu(e) {
            e.stopPropagation()
            e.preventDefault()

            // 计算菜单相对于编辑器的位移
            let target = e.target
            let top = e.offsetY
            let left = e.offsetX
            while (!target.className.includes('editor')) {
                left += target.offsetLeft
                top += target.offsetTop
                target = target.parentNode
            }

            this.$store.commit('showContexeMenu', { top, left })
        },

        getShapeStyle(style) {
            const result = {};
            ['width', 'height', 'top', 'left', 'rotate'].forEach(attr => {
                if (attr != 'rotate') {
                    result[attr] = style[attr] + 'px'
                } else {
                    result.transform = 'rotate(' + style[attr] + 'deg)'
                }
            })

            return result
        },

        getComponentStyle(style) {
            return getStyle(style, ['top', 'left', 'width', 'height', 'rotate'])
        },

        handleInput(element, value) {
            element.propValue = value
            // 根据文本组件高度调整 shape 高度
            this.$store.commit('setShapeStyle', { height: this.getTextareaHeight(element, value) })
        },

        getTextareaHeight(element, text) {
            let { lineHeight, fontSize, height } = element.style
            if (lineHeight === '') {
                lineHeight = 1.5
            }

            const newHeight = text.split('\n').length * lineHeight * fontSize
            return height > newHeight? height : newHeight
        },
    },
}
</script>

<style lang="scss" scoped>
.selectSome{
    position: absolute;
    width: 0px;
    height: 0px;
    top:0px;
    left: 0px;
    border-width: 0px;
    border-style: dashed;
    border-color: #999;
}
.contentEditor{
    padding: 10px;
    min-width: 1000px;
}

.pointer *:hover{
    cursor: pointer !important;
}
.crosshair {
    cursor: crosshair;
}
.crosshair *:hover{
    cursor: crosshair !important;
}
.editor {
    position: relative;
    background: #ebeef5;
    flex-shrink: 0;
    box-shadow: #3a8ee6 0px 0px 4px;
}
.edit {
    .component {
        outline: none;
        width: 100%;
        height: 100%;
    }
}
</style>
