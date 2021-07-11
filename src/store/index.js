import Vue from 'vue'
import Vuex from 'vuex'
import { deepCopy, swap } from '@/utils/utils'
import toast from '@/utils/toast'
import generateID from '@/utils/generateID'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        editMode: 'edit', // 编辑器模式 edit read
        canvasStyleData: { // 页面全局数据
            left:0,
            top:0,
            width: 1000,
            height: 740,
        },
        componentData: [], // 画布组件数据
        curComponent: null,
        curComponentIndex: null,
        curComponentList:[],
        snapshotData: [], // 编辑器快照数据
        snapshotIndex: -1, // 快照索引
        menuTop: 0, // 右击菜单数据
        menuLeft: 0,
        menuShow: false,
        copyData: null, // 复制粘贴剪切
    },
    mutations: {
        getBoundingClientRect(state){
            for(let i in state.componentData){
                let cod = state.componentData[i];
                cod.boundingClientRect.left = cod.style.left;
                cod.boundingClientRect.right = cod.style.left+cod.style.width;
                cod.boundingClientRect.top = cod.style.top;
                cod.boundingClientRect.bottom = cod.style.top+cod.style.height;
            }
        },
        copy(state) {
            state.copyData = {
                data: deepCopy(state.curComponent),
                index: state.curComponentIndex,
            }
        },

        paste(state, isMouse) {
            if (!state.copyData) {
                toast('请选择组件')
                return
            }

            let data = deepCopy(state.copyData.data)

            if (isMouse) {
                data.style.top = state.menuTop
                data.style.left = state.menuLeft
            } else {
                data.style.top += 10
                data.style.left += 10
            }

            data.id = generateID()
            store.commit('addComponent', { component: data })
            store.commit('recordSnapshot')
            // state.copyData = null
            state.copyData = {
                data: deepCopy(data),
                index: data.id,
            }

        },

        cut(state) {
            if (!state.curComponent) {
                toast('请选择组件')
                return
            }

            if (state.copyData) {
                store.commit('addComponent', { component: state.copyData.data, index: state.copyData.index })
                if (state.curComponentIndex >= state.copyData.index) {
                    // 如果当前组件索引大于等于插入索引，需要加一，因为当前组件往后移了一位
                    state.curComponentIndex++
                }
            }

            store.commit('copy')
            store.commit('deleteComponent')
        },

        setEditMode(state, mode) {
            state.editMode = mode
        },

        setCanvasStyle(state, style) {
            state.canvasStyleData = style;


        },

        addComponent(state, { component, index }) {
            if (index !== undefined) {
                state.componentData.splice(index, 0, component)
            } else {
                state.componentData.push(component)
            }
			store.commit('sort');
        },

        setCurComponent(state, { component, index }) {
            state.curComponent = component
            state.curComponentIndex = index
        },

        setCurComponentList(state, { component, isclear }) {
            if(isclear){
                Vue.set(state, 'curComponentList', [])
            }
            for(let c in state.curComponentList){
                if(component.id === state.curComponentList[c].id){
                    return;
                }
            }
            state.curComponentList.push(component)
        },
        clearCurComponentList(state) {
            // state.curComponentList.splice(0,state.curComponentList.length);
             Vue.set(state, 'curComponentList', [])
        },

        setShapeStyle({ curComponent }, { top, left, width, height, rotate }) {
            if (!isNaN(top)) curComponent.style.top = Number(Math.round(top))
            if (!isNaN(left)) curComponent.style.left = Number(Math.round(left))
            if (width) curComponent.style.width = Number(Math.round(width))
            if (height) curComponent.style.height = Number(Math.round(height))
            if (rotate) curComponent.style.rotate = Number(Math.round(rotate))
        },

        setShapePosStyle({ curComponent }, { key, value }) {
            value = Math.round(value);
            if(key=='top'){
                value = value>store.state.canvasStyleData.height?store.state.canvasStyleData.height:value;
            }
            if(key=='left'){
                value = value>store.state.canvasStyleData.width?store.state.canvasStyleData.width:value;
            }
            curComponent.style[key] = Number(value)
        },

        undo(state) {
            if (state.snapshotIndex >= 0) {
                state.snapshotIndex--
                store.commit('setComponentData', deepCopy(state.snapshotData[state.snapshotIndex]))
            }
        },

        redo(state) {
            if (state.snapshotIndex < state.snapshotData.length - 1) {
                state.snapshotIndex++
                store.commit('setComponentData', deepCopy(state.snapshotData[state.snapshotIndex]))
            }
        },

        setComponentData(state, componentData = []) {
            Vue.set(state, 'componentData', componentData)
        },
        sort(state){
             state.componentData.sort(function(a,b){
                 //b能包含a 那么b 就
                 if(b.style.width<a.style.width && b.style.height<a.style.height){
                     return -5;
                 }
                 // return 0;
                 return  b.style.width*b.style.height - a.style.width*a.style.height
             })
             // Vue.set(state, 'componentData', state.componentData)
        },
        recordSnapshot(state) {
            // 添加新的快照
            state.snapshotData[++state.snapshotIndex] = deepCopy(state.componentData)
            // 在 undo 过程中，添加新的快照时，要将它后面的快照清理掉
            if (state.snapshotIndex < state.snapshotData.length - 1) {
                state.snapshotData = state.snapshotData.slice(0, state.snapshotIndex + 1)
            }
        },

        showContexeMenu(state, { top, left }) {
            state.menuShow = true
            state.menuTop = top
            state.menuLeft = left
        },

        hideContexeMenu(state) {
            state.menuShow = false
        },

        deleteComponent(state, index = state.curComponentIndex) {
            state.componentData.splice(index, 1)
        },

        upComponent({ componentData, curComponentIndex }) {
            // 上移图层 index，表示元素在数组中越往后
            if (curComponentIndex < componentData.length - 1) {
                swap(componentData, curComponentIndex, curComponentIndex + 1)
            } else {
                toast('已经到顶了')
            }
        },

        downComponent({ componentData, curComponentIndex }) {
            // 下移图层 index，表示元素在数组中越往前
            if (curComponentIndex > 0) {
                swap(componentData, curComponentIndex, curComponentIndex - 1)
            } else {
                toast('已经到底了')
            }
        },

        topComponent({ componentData, curComponentIndex }) {
            // 置顶
            if (curComponentIndex < componentData.length - 1) {
                swap(componentData, curComponentIndex, componentData.length - 1)
            } else {
                toast('已经到顶了')
            }
        },

        bottomComponent({ componentData, curComponentIndex }) {
            // 置底
            if (curComponentIndex > 0) {
                swap(componentData, curComponentIndex, 0)
            } else {
                toast('已经到底了')
            }
        },

        addAnimation({ curComponent }, animation) {
            curComponent.animations.push(animation)
        },

        removeAnimation({ curComponent }, index) {
            curComponent.animations.splice(index, 1)
        },

        addEvent({ curComponent }, { event, param }) {
            curComponent.events[event] = param
        },

        removeEvent({ curComponent }, event) {
            delete curComponent.events[event]
        },
    },
})

export default store
