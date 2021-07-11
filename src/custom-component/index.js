import Vue from 'vue'

// const components = [
//     'Picture',
//     'VText',
//     'VButton',
//     'LayuiTab',
// ]
const components2 = {
    Picture: '',
    VText: '',
    VButton: '',
    VDiv: '',
    VSpan: '',
    LayuiTab: 'layui/',
}
// components.forEach(key => {
//     Vue.component(key, () => import(`@/custom-component/${key}`))
// })

for(let key in components2){
    let val = components2[key];
    Vue.component(key, () => import(`@/custom-component/${val}${key}`));
}
