<template>
    <div class="home">
        <Toolbar @isOpenShadow="isOpenShadow" />

        <main>
            <!-- 左侧组件列表 -->
            <section class="left">
                <ComponentList />
            </section>
            <!-- 中间画布 -->
            <section class="center" id="centerSection">
                <div id="shadowcontent" :class="{ shadow: isShadow, 'content': true }" @drop="handleDrop" @dragover="handleDragOver" @click="deselectCurComponent">
                    <Editor />
                </div>
            </section>
            <!-- 右侧属性列表 -->
            <section class="right">
                <el-tabs v-model="activeName">
                    <el-tab-pane label="属性" name="attr">
                        <AttrList v-if="curComponent" />
                        <p v-else class="placeholder">请选择组件</p>
                    </el-tab-pane>
               <!--     <el-tab-pane label="动画" name="animation">
                        <AnimationList v-if="curComponent" />
                        <p v-else class="placeholder">请选择组件</p>
                    </el-tab-pane> -->
                    <!-- <el-tab-pane label="事件" name="events">
                        <EventList v-if="curComponent" />
                        <p v-else class="placeholder">请选择组件</p>
                    </el-tab-pane> -->
                </el-tabs>
            </section>
        </main>
    </div>
</template>

<script>
import Editor from '@/components/Editor/index'
import ComponentList from '@/components/ComponentList' // 左侧列表组件
import AttrList from '@/components/AttrList' // 右侧属性列表
import AnimationList from '@/components/AnimationList' // 右侧动画列表
import EventList from '@/components/EventList' // 右侧事件列表
import componentList from '@/custom-component/component-list' // 左侧列表数据
import Toolbar from '@/components/Toolbar'
import { deepCopy,getPositionByEditor } from '@/utils/utils'
import { mapState } from 'vuex'
import generateID from '@/utils/generateID'
import * as NodeElment from '@/utils/NodeElment'
import eventBus from '@/utils/eventBus'
export default {
    components: { Editor, ComponentList, AttrList, AnimationList, EventList, Toolbar },
    data() {
        return {
            isShadow: true,
            activeName: 'attr',
            reSelectAnimateIndex: undefined,
        }
    },
    computed: mapState([
        'componentData',
        'curComponent',
        'curComponentList'
    ]),
    created() {
        this.restore()
        // 监听复制粘贴
        this.listenCopyAndPaste()
    },
    methods: {
        isOpenShadow(v){
            this.isShadow = v;
        },
        listenCopyAndPaste() {
            const shiftKey = 16,ctrlKey = 17,altKey=18, vKey = 86, cKey = 67, xKey = 88,leftKey = 37,topKey = 38,rightKey = 39,downKey = 40


            window.onkeydown = (e) => {
				console.log("home.vue ",e.keyCode)
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
                    e.preventDefault();

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

            }

            window.onkeyup = (e) => {

                if(e.keyCode == altKey){
                    // eventBus.$emit('closeCustomRectangle');
                    this.$store.commit("setOpenCustomRectangleStatus",0)
                }
                if([leftKey,rightKey,topKey,downKey].includes(e.keyCode)){
                    setTimeout(()=>{
                         eventBus.$emit('unmove')
                    },400)
                }
            }
        },

        restore() {
            // 用保存的数据恢复画布
            if (localStorage.getItem('canvasData')) {
                this.$store.commit('setComponentData', this.resetID(JSON.parse(localStorage.getItem('canvasData'))))
            }

            if (localStorage.getItem('canvasStyle')) {
                this.$store.commit('setCanvasStyle', JSON.parse(localStorage.getItem('canvasStyle')))
            }
        },

        resetID(data) {
            data.forEach(item => {
                item.id = generateID()
            })

            return data
        },

        handleDrop(e) {
            e.preventDefault()
            e.stopPropagation()
            const component = deepCopy(componentList[e.dataTransfer.getData('index')])
            let lefttop = getPositionByEditor(e.clientX,e.clientY)
            component.style.top = lefttop.top
            component.style.left = lefttop.left
            component.id = generateID()
            NodeElment.isAContainBResize(this.$store.state.canvasStyleData,component.style,component.style)
            this.$store.commit('addComponent', { component })
            this.$store.commit('recordSnapshot')
        },

        handleDragOver(e) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
        },

        deselectCurComponent(e) {
            //代码移入markline.vue文件中了
            // console.log("home.vue deselectCurComponent",e);
            //加上这个if是因为(先前为了使用layuitab可以被点击切换,允许事件冒泡,结果导致,组件选中后马上被取消,因为冒泡会到这里来)
            //然而,也因此导致了一个问题:右键菜单置顶置地功能无法及时响应,因为要想及时响应就必须取消选中
            
            // if(e.target.className==='mark-line'||e.target.className==='lic'){

            //    this.$store.commit('setCurComponent', { component: null, index: null })
            //    this.$store.commit('clearCurComponentList')
            // }
            // this.$store.commit('hideContexeMenu')
        },
    },
}
</script>

<style lang="scss">
.home {
    height: 100vh;
    background: #fff;

    main {
        height: calc(100% - 64px);
        position: relative;

        .left {
            position: absolute;
            height: 100%;
            width: 200px;
            left: 0;
            top: 0;
            padding-top: 10px;
        }

        .right {
            position: absolute;
            height: 100%;
            width: 262px;
            right: 0;
            top: 0;
            padding-bottom: 67px;
        }

        .center {
            margin-left: 200px;
            margin-right: 262px;
            background: #f5f5f5;
            height: 100%;
            overflow: auto;
            padding-bottom: 5vh;
            // padding: 20px;

            .content {
                // height: 100%;
                overflow: auto;
                // display: flex;
                // align-items: center;
                // justify-content: center;
            }
        }
    }

    .placeholder {
        text-align: center;
        color: #333;
    }
}
</style>
