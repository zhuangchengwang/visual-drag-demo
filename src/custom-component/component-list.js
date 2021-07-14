// 公共样式
const commonStyle = {
    width: 300,
    height: 200,
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: '',
    borderRadius: '',
    fontSize: '',
    fontWeight: '',
    lineHeight: '',
    letterSpacing: 0,
    textAlign: '',
    color: '',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    rotate: '',
    
    // opacity: 1,
}

// 编辑器左侧组件列表
const list = [
    {
        component: 'v-text',
        label: '文字',
        propValue: '文字',
        icon: 'el-icon-edit',
        animations: [],
        events: {},
        style: {
            width: 200,
            height: 33,

        },
    },

    {
        component: 'v-button',
        label: '按钮',
        propValue: '按钮',
        icon: 'el-icon-thumb',
        animations: [],
        events: {},
        style: {
            width: 100,
            height: 34,

        },
    },
    {
        component: 'Picture',
        label: '图片',
        icon: 'el-icon-picture',
        propValue: require('@/assets/title.jpg'),
        animations: [],
        events: {},
        style: {
            width: 300,
            height: 200,
        },
    },
    {
        component: 'VDiv',
        label: 'div',
        icon: 'el-icon-picture',
        propValue: '',
        animations: [],
        events: {},
        style: {
            width: 400,
            height: 200,
        },
    },
    {
        component: 'v-span',
        label: '文本',
        propValue: '这是一个文本,超过宽度自动换行和自动隐藏',
        icon: 'el-icon-edit',
        animations: [],
        events: {},
        style: {
            width: 100,
            height: 21,
        },
    },
    {
        component: 'LayuiTab',
        label: 'LayuiTab',
        icon: 'el-icon-picture',
        propValue: 'LayuiTab12 ',
        animations: [],
        events: {},
        style: {
            width: 456,
            height: 200,

        },
    },
]

list.forEach(item => {
    item.style = { ...commonStyle , ...item.style}
    item.drag = {startLeft:null,startTop:null}
    //生成代码的时候会计算一遍
    item.boundingClientRect={}
    //是否可以被选中
    item.isCanBeSelect = true
})

export default list
