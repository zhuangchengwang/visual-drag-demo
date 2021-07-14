import Vue from 'vue'
import Vuex from 'vuex'
import { deepCopy, swap,changeValue } from '@/utils/utils'
import toast from '@/utils/toast'
import generateID from '@/utils/generateID'
Vue.use(Vuex)
const stateJson = {
        editMode: 'edit', // 编辑器模式 edit read
        openCustomRectangleStatus:0,//是否开启自定义矩形，即是否按下alt
        openSelectMoreStatus:0,//是否开启自定义矩形，即是否按下ctrl
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
        curAndListComponentDis:null,//当前元素于与其他被选元素的top和left的相对距离
        snapshotData: [], // 编辑器快照数据
        snapshotIndex: -1, // 快照索引
        menuTop: 0, // 右击菜单数据
        menuLeft: 0,
        menuShow: false,
        copyData: {data:[],index:null}, // 复制粘贴剪切
        isSelectMore:false,//当前是否选中多个元素
    };

const store = new Vuex.Store({
    state: deepCopy(stateJson),
    mutations: {
        resetState(state){
            let state2 = deepCopy(stateJson);
            for(let i in state2){
                state[i] = state2[i]
            }
        },
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
            if (state.curComponentList.length==0) {
                return
            }
            let index;
            for( index in state.componentData){
                if(state.componentData[index].id==state.curComponentList[state.curComponentList.length-1].id){

                    break;
                }
            }
            state.copyData = {
                data: deepCopy(state.curComponentList),
                index: index,
            }

        },

        paste(state, isMouse) {
            if (state.copyData.data.length==0) {
                toast('请先复制组件')
                return
            }
            store.commit("clearCurComponentList");
            let data = deepCopy(state.copyData.data)
            let curcom = {};
            let i = 0;
            for(i in data){
                curcom = deepCopy(data[i]);
                if (isMouse) {
                    curcom.style.top = state.menuTop
                    curcom.style.left = state.menuLeft
                } else {
                    curcom.style.top += 10
                    curcom.style.left += 10
                }
                curcom.id = generateID()
                store.commit('addComponent', { component: curcom })
                store.commit('setCurComponentList', { component: curcom})
            }
            let index = 0;
            for(index in state.componentData){
                if(state.componentData[index].id==curcom.id){
                    store.commit('setCurComponent', { component: curcom, index: index })
                    break;
                }
            }

            store.commit('recordSnapshot')
            console.log(state.copyData,state.componentData,state.curComponentList)
            // state.copyData = null
            state.copyData = {
                data: deepCopy(data),
                index: index,
            }

        },

        cut(state) {
            //放弃剪切功能，直接拖拽不就可以了吗
            toast('请直接拖拽元素到指定位置即可')
            // if (!state.curComponent) {
            //     toast('请选择组件')
            //     return
            // }

            // if (state.copyData) {
            //     store.commit('addComponent', { component: state.copyData.data, index: state.copyData.index })
            //     if (state.curComponentIndex >= state.copyData.index) {
            //         // 如果当前组件索引大于等于插入索引，需要加一，因为当前组件往后移了一位
            //         state.curComponentIndex++
            //     }
            // }

            // store.commit('copy')
            // store.commit('deleteComponent')
        },

        setEditMode(state, mode) {
            state.editMode = mode
        },
        setOpenCustomRectangleStatus(state, mode) {
            state.openCustomRectangleStatus = mode
        },
        setOpenSelectMoreStatus(state, mode) {
            state.openSelectMoreStatus = mode
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
            if(component && !component.isCanBeSelect){
                return;
            }
            state.curComponent = component
            state.curComponentIndex = index
            if(component === null){
                state.curAndListComponentDis = {}
                return;
            }
            let i,curcom;
            let dis = {};
            for(i in state.curComponentList){
                curcom = state.curComponentList[i]
                dis[i] = {top:curcom.style.top - state.curComponent.style.top,left:curcom.style.left - state.curComponent.style.left}
            }
            state.curAndListComponentDis = dis;

        },
        setCurComponentListPostion(state){
            let i,curcom;
            let curComponent = state.curComponent;
            for(i in state.curComponentList){
                curcom = state.curComponentList[i]
                curcom.style.top = curComponent.style.top + state.curAndListComponentDis[i].top
                curcom.style.left = curComponent.style.left + state.curAndListComponentDis[i].left
            }
        },
        setCurComponentList(state, { component, isclear }) {
            if(isclear){
                Vue.set(state, 'curComponentList', [])
                state.curAndListComponentDis = {}
                state.isSelectMore = false
            }
            if(component && !component.isCanBeSelect){
                return;
            }
            if(!component){
                return;
            }
            for(let c in state.curComponentList){
                if(component.id === state.curComponentList[c].id){
                    return;
                }
            }

            state.curComponentList.push(component)
            state.curComponent = component
            if(state.curComponentList.length>1){
                state.isSelectMore = true
            }
        },
        clearCurComponentList(state) {
            // state.curComponentList.splice(0,state.curComponentList.length);
             Vue.set(state, 'curComponentList', [])
             state.curAndListComponentDis = {}
             state.curComponent = null
        },

        setShapeStyle({ curComponent }, { top, left, width, height, rotate }) {
            if (!isNaN(top)) curComponent.style.top = changeValue(Number(top))
            if (!isNaN(left)) curComponent.style.left = changeValue(Number(left))
            if (width) curComponent.style.width = Math.round(Number(width))
            if (height) curComponent.style.height = Math.round(Number(height))
            if (rotate) curComponent.style.rotate = Math.round(Number(rotate))
        },

        setShapePosStyle({ curComponent }, { key, value }) {
            value = Number(value);
            if(key=='top'){
                value = value>store.state.canvasStyleData.height?store.state.canvasStyleData.height:value;
				value = changeValue(value)
			}
            if(key=='left'){
                value = value>store.state.canvasStyleData.width?store.state.canvasStyleData.width:value;
				value = changeValue(value)
			}
            curComponent.style[key] = value
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
            let i = 0;let j = 0;
            for(i in state.curComponentList){
                for(j in state.componentData){
                    if(state.curComponentList[i].id==state.componentData[j].id){
                        state.componentData.splice(j, 1)
                    }
                }

            }

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
