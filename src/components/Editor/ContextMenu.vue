<template>
    <div class="contextmenu" v-show="menuShow" :style="{ top: menuTop + 'px', left: menuLeft + 'px' }">
        <ul>
            <template v-if="curComponent">
                <li class="lic" @click="copy">复制</li>
                <li class="lic"  @click="paste">粘贴</li>
                <li class="lic"  @click="cut">剪切</li>
                <li class="lic"  @click="deleteComponent">删除</li>
                <!-- 已经修改成根据面积大小来决定次序 -->
                <!-- <li class="lic"  @click="topComponent">置顶</li>
                <li class="lic"  @click="bottomComponent">置底</li>
                <li class="lic"  @click="upComponent">上移</li>
                <li class="lic"  @click="downComponent">下移</li> -->
            </template>
            <li v-else @click="paste">粘贴</li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    data() {
        return {
            copyData: null,
        }
    },
    computed: mapState([
        'menuTop',
        'menuLeft',
        'menuShow',
        'curComponent',
    ]),
    methods: {
        cut() {
            this.$store.commit('cut')
            this.$store.commit('hideContexeMenu')
        },

        copy() {
            this.$store.commit('copy')
            this.$store.commit('hideContexeMenu')
        },

        paste() {
            this.$store.commit('paste', true)
            this.$store.commit('hideContexeMenu')
        },

        deleteComponent() {
            this.$store.commit('deleteComponent')
            this.$store.commit('recordSnapshot')
            this.$store.commit('hideContexeMenu')
        },

        upComponent() {
            this.$store.commit('upComponent')
            this.$store.commit('recordSnapshot')
            this.$store.commit('hideContexeMenu')
        },

        downComponent() {
            this.$store.commit('downComponent')
            this.$store.commit('recordSnapshot')
            this.$store.commit('hideContexeMenu')
        },

        topComponent() {
            this.$store.commit('topComponent')
            this.$store.commit('recordSnapshot')
            this.$store.commit('hideContexeMenu')
        },

        bottomComponent() {
            this.$store.commit('bottomComponent')
            this.$store.commit('recordSnapshot')
            this.$store.commit('hideContexeMenu')
        },
    },
}
</script>

<style lang="scss" scoped>
.contextmenu {
    position: absolute;
    z-index: 1000;

    ul {
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        box-sizing: border-box;
        margin: 5px 0;
        padding: 6px 0;

        li {
            font-size: 14px;
            padding: 0 20px;
            position: relative;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #606266;
            height: 34px;
            line-height: 34px;
            box-sizing: border-box;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
            }
        }
    }
}
</style>