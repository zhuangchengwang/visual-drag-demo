/* eslint-disable */
<template>
    <div class="contentEditor">
        <div class="editor" id="editor"
            @mousedown="handleMouseDownOnEditor"
            :class="{ edit: isEdit,crosshair:ctrlclick }" :style="{ width: canvasStyleData.width + 'px', height: canvasStyleData.height + 'px' }"
            @contextmenu="handleContextMenu"
        >
            <!--页面组件列表展示-->
            <Shape v-for="(item, index) in componentData"
                :defaultStyle="item.style"
                :style="getShapeStyle(item.style)"
                :key="item.id"
                :active="item === curComponent"
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
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Shape from './Shape'
import getStyle from '@/utils/style'
import ContextMenu from './ContextMenu'
import MarkLine from './MarkLine'
import { deepCopy,getPositionByEditor } from '@/utils/utils'
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
            ctrlclick:false
        }
    },
    components: { Shape, ContextMenu, MarkLine },
    computed: mapState([
        'componentData',
        'curComponent',
        'canvasStyleData',
    ]),
    mounted() {
      //
      eventBus.$on('clickCtrlKey', () => {
         this.ctrlclick = true;

      })
      eventBus.$on('releaseCtrlKey', () => {
         this.ctrlclick = false;
      })
    },
    methods: {
        //使用ctrl 画矩形 功能
        handleMouseDownOnEditor(e){
            e.stopPropagation();
            if(!e.ctrlKey){
                return;
            }

            this.$store.commit('setCurComponent', { component: null, index: null })
            const startY = e.clientY
            const startX = e.clientX
            const component = deepCopy(componentList[3])//div
            const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()
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
                 this.ctrlclick = false;
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
.contentEditor{
    padding: 10px;
    min-width: 1000px;
}
.crosshair{
    cursor: crosshair;
}
.crosshair .shape:hover{
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
