<template>
    <div class="attr-list">
        <el-form>
            <el-form-item label="内容" v-if="curComponent && !excludes.includes(curComponent.component)">
                <el-input type="textarea" v-model="curComponent.propValue" />
            </el-form-item>
            <el-form-item v-for="(key, index) in styleKeys.filter(item => item != 'rotate')" :key="index" :label="map[key]">
                <el-color-picker
                v-if="['borderColor','color','backgroundColor'].includes(key)"
                show-alpha
                :predefine="predefineColors"
                v-model="curComponent.style[key]"></el-color-picker>
                <el-select v-else-if="key == 'textAlign'" v-model="curComponent.style[key]">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>

                <el-select v-else-if="key == 'borderStyle'" v-model="curComponent.style[key]">
                    <el-option
                        v-for="item in borderStyleOpts"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <el-input type="number" v-else-if="['top','left'].includes(key)" step="0.1" :min="0" :max="stage.width" v-model="curComponent.style[key]" />
                <el-input type="number" v-else :min="0" :max="stage.width" v-model="curComponent.style[key]" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            excludes: ['Picture','LayuiTab','VDiv'], // 这些组件不显示内容
            predefineColors: [

                      '#f0f0f0',
                      '#ff4500',
                      '#ffffff',
                      '#ff8c00',
                      '#ffd700',
                      '#90ee90',
                      '#00ced1',
                      '#1e90ff',
                      '#c71585',
                      'rgba(255, 69, 0, 0.68)',
                      'rgb(255, 120, 0)',
                      'hsv(51, 100, 98)',
                      'hsva(120, 40, 94, 0.5)',
                      'hsl(181, 100%, 37%)',
                      'hsla(209, 100%, 56%, 0.73)',
                      '#c7158577'
            ],
            options: [
                {
                    label: '左对齐',
                    value: 'left',
                },
                {
                    label: '居中',
                    value: 'center',
                },
                {
                    label: '右对齐',
                    value: 'right',
                },
            ],
            borderStyleOpts:[
                {
                    label: 'none',
                    value: 'none',
                },
                {
                    label: 'solid',
                    value: 'solid',
                },
                {
                    label: 'dotted',
                    value: 'dotted',
                },
                {
                    label: 'dashed',
                    value: 'dashed',
                },
            ],
            map: {
                left: 'x 坐标',
                top: 'y 坐标',
                height: '高',
                width: '宽',
                color: '颜色',
                backgroundColor: '背景色',
                borderWidth: '边框宽度',
                borderStyle:'边框样式',
                borderColor: '边框颜色',
                borderRadius: '边框半径',
                fontSize: '字体大小',
                fontWeight: '字体粗细',
                lineHeight: '行高',
                letterSpacing: '字间距',
                textAlign: '对齐方式',
                opacity: '透明度',
            },
        }
    },
    computed: {
        styleKeys() {
            return this.$store.state.curComponent? Object.keys(this.$store.state.curComponent.style) : []
        },
        curComponent() {
            return this.$store.state.curComponent
        },
        stage() {
            return this.$store.state.canvasStyleData
        },
    },
    methods:{
        numChange(key){

            if(['top','left','width','height'].includes(key)){
               if(!NodeElment.isAContainB(this.$store.state.stage,pos)){
                   this._debounce(()=>{
                       this.$message.error('越界啦!,元素移动时不可以超出画布大小哦!');
                   },200)()
                   return;
               }
            }
            if(['top','left'].includes(key)){
                this.$emit('move', false, false)

                this.$store.commit('sort');
            }
            if(['width','height'].includes(key)){

                this.$emit('resize',false, false)
                this.$store.commit('sort');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.attr-list {
    overflow: auto;
    padding: 20px;
    padding-top: 0;
    height: 100%;
}
</style>
