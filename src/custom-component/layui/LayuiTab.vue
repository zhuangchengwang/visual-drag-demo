/* eslint-disable */ 
<template>
    <div style="overflow: hidden">
        <div class="layui-tab">
          <ul class="layui-tab-title">
            <li class="layui-this">网站设置</li>
            <li>{{propValue}}</li>
            <li>权限分配</li>
            <li>商品管理</li>
            <li>订单管理</li>
          </ul>
          <div class="layui-tab-content">
            <div class="layui-tab-item layui-show">
              1. 高度默认自适应，也可以随意固宽。
              <br>2. Tab进行了响应式处理，所以无需担心数量多少。
            </div>
            <div class="layui-tab-item">内容2</div>
            <div class="layui-tab-item">内容3</div>
            <div class="layui-tab-item">内容4</div>
            <div class="layui-tab-item">内容5</div>
          </div>
        </div>
         <noscript>
          <div class="layui-tab">
            <ul class="layui-tab-title">
              <li class="layui-this">网站设置</li>
              <li>{{propValue}}</li>
              <li>权限分配</li>
              <li>商品管理</li>
              <li>订单管理</li>
            </ul>
            <div class="layui-tab-content">
              <div class="layui-tab-item layui-show">
                1. 高度默认自适应，也可以随意固宽。
                <br>2. Tab进行了响应式处理，所以无需担心数量多少。
              </div>
              <div class="layui-tab-item">内容2</div>
              <div class="layui-tab-item">内容3</div>
              <div class="layui-tab-item">内容4</div>
              <div class="layui-tab-item">内容5</div>
            </div>
          </div>
         </noscript>
    </div>
</template>

<script>
export default {
    props: {
        propValue: {
            type: String,
            require: true,
        },
    },
    created(){
    	this.putScript();
    },
    methods:{
        loadScriptString(code){
        	var script = document.createElement("script");  //创建一个script标签
        	            script.type = "text/javascript";
        	            try {
        	                //IE浏览器认为script是特殊元素,不能再访问子节点;报错;
        	                script.appendChild(document.createTextNode(code));
        	            }
        	            catch (ex) {
        	                script.text = code;
        	            }
        	           return script;
        },
        putScript(){
        	console.log('put');
        	var code = `
        		layui.use('element', function(){
        		  var $ = layui.jquery
        		  ,element = layui.element;
                  //Tab的切换功能，切换事件监听等，需要依赖element模块
        		});
        	`
        	document.body.appendChild(this.loadScriptString(code));
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
