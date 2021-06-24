<template>
    <div>
        <div class="toolbar">
            <el-button @click="undo">撤消</el-button>
            <el-button @click="redo">重做</el-button>
            <label for="input" class="insert">插入图片</label>
            <input type="file" @change="handleFileChange" id="input" hidden />
            <el-button @click="preview" class="mgl10">预览</el-button>
            <el-button @click="save">保存</el-button>
            <el-button @click="clearCanvas">清空画布</el-button>
            <el-button type="success" @click="crateCode">生成代码</el-button>
            <el-select class="mgl10" v-model="canvasMode" @change="selectCanvasMode" placeholder="请选画布大小">
                <el-option
                  v-for="item in canvasModes"

                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
            </el-select>
           <div class="canvas-config">
                <span>画布大小</span>
                <input v-model="canvasStyleData.width">
                <span>*</span>
                <input v-model="canvasStyleData.height">
            </div>
           <el-checkbox  class="mgl10" v-model="isShadow" @change="isOpenShadow">开启辅助阴影</el-checkbox>

        </div>

         <el-alert

                     title="使用帮助:1.使用键盘上←↑→↓可以精调'选中'元素x,y位置坐标 "
                     type="success">
          </el-alert>
          <el-alert
                      v-show="!isShadow"
                      title="关闭辅助阴影,由于背景为纯白色,你可能无法区分元素的边界,尤其是div等容器元素!"
                      type="warning">
           </el-alert>
        <!-- 预览 -->
        <Preview v-model="isShowPreview" @change="handlePreviewChange" />
    </div>
</template>

<script>
import generateID from '@/utils/generateID'
import toast from '@/utils/toast'
import { mapState } from 'vuex'
import Preview from '@/components/Editor/Preview'

export default {
    components: { Preview },
    data() {
        return {
            isShadow:true,
            isShowPreview: false,
            canvasMode:'pc',
            canvasModes:[
                {
                          value: 'phone',
                          label: '手机模式'
                },
                {
                          value: 'pc',
                          label: 'pc模式'
                },
            ]
        }
    },
    computed: mapState([
        'componentData',
        'canvasStyleData',
    ]),
    methods: {
        crateCode(){
          console.log(this.componentData);
        },
        isOpenShadow(v){

           this.$emit('isOpenShadow',v);
        },
        selectCanvasMode(v){

          if(v=='phone'){
              this.$store.commit('setCanvasStyle',{width:375,height:740,left:0,top:0})
          }
          if(v=='pc'){
                this.$store.commit('setCanvasStyle',{width:1000,height:740,left:0,top:0})
            }
        },
        undo() {
            this.$store.commit('undo')
        },

        redo() {
            this.$store.commit('redo')
        },

        handleFileChange(e) {
            const file = e.target.files[0]
            if (!file.type.includes('image')) {
                toast('只能插入图片')
                return
            }

            const reader = new FileReader()
            reader.onload = (res) => {
                const fileResult = res.target.result
                const img = new Image()
                img.onload = () => {
                    this.$store.commit('addComponent', {
                        component: {
                            id: generateID(),
                            component: 'Picture',
                            label: '图片',
                            icon: '',
                            propValue: fileResult,
                            animations: [],
                            events: [],
                            style: {
                                top: 0,
                                left: 0,
                                width: img.width,
                                height: img.height,
                                rotate: '',
                            },
                        },
                    })

                    this.$store.commit('recordSnapshot')
                }

                img.src = fileResult
            }

            reader.readAsDataURL(file)
        },

        preview() {
            this.isShowPreview = true
            this.$store.commit('setEditMode', 'read')
        },

        save() {
            localStorage.setItem('canvasData', JSON.stringify(this.componentData))
            localStorage.setItem('canvasStyle', JSON.stringify(this.canvasStyleData))
            this.$message.success('保存成功')
        },

        clearCanvas() {
            this.$store.commit('setComponentData', [])
        },

        handlePreviewChange() {
            this.$store.commit('setEditMode', 'edit')
        },
    },
}
</script>

<style lang="scss" scoped>

.toolbar {
    height: 64px;
    line-height: 64px;
    background: #fff;
    border-bottom: 1px solid #ddd;
    .mgl10{
        margin-left: 10px;
    }
    .canvas-config {
        display: inline-block;
        margin-left: 10px;
        font-size: 14px;
        color: #606266;

        input {
            width: 50px;
            margin-left: 10px;
            outline: none;
            padding: 0 5px;
            border: 1px solid #ddd;
            color: #606266;
        }

        span {
            margin-left: 10px;
        }
    }

    .insert {
        display: inline-block;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        background: #FFF;
        border: 1px solid #DCDFE6;
        color: #606266;
        -webkit-appearance: none;
        text-align: center;
        box-sizing: border-box;
        outline: 0;
        margin: 0;
        transition: .1s;
        font-weight: 500;
        padding: 9px 15px;
        font-size: 12px;
        border-radius: 3px;
        margin-left: 10px;

        &:active {
            color: #3a8ee6;
            border-color: #3a8ee6;
            outline: 0;
        }

        &:hover {
            background-color: #ecf5ff;
            color: #3a8ee6;
        }
    }
}
</style>
