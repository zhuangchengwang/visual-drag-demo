import componentList from '@/custom-component/component-list' // 左侧列表数据
import store from '@/store'
export function isInCurComponentList(component){
    let isin =false;
    for(let c in store.state.curComponentList){
        if(component.id === store.state.curComponentList[c].id){
            isin = true;
            break;
        }
    }
    return isin;
}
export function getComponentConfigByName(name){
    for(let i in componentList){
        if(componentList[i].component == name){
            return componentList[i];
        }
    }
    return {}
}
export function deepCopy(target) {
    return JSON.parse(JSON.stringify(target))
    // if (typeof target == 'object') {
    //     const result = Array.isArray(target)? [] : {}
    //     for (const key in target) {
    //         if (typeof target[key] == 'object') {
    //             result[key] = deepCopy(target[key])
    //         } else {
    //             result[key] = target[key]
    //         }
    //     }

    //     return result
    // }

    // return target
}

export function swap(arr, i, j) {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}
export function isRealNum(val) {
			// isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
			if (val === "" || val == null) {
				return false;
			}
			if (!isNaN(val)) {
				return true;
			} else {
				return false;
			}
};
export function  changeJsonValue(obj) {
			for (let key in obj) {
				if (!obj.hasOwnProperty(key)) return; //排除掉原型继承而来的属性
				if (typeof(obj[key]) == 'string' && obj[key] == 'true') {
					obj[key] = true;
				} else if (typeof(obj[key]) == 'string' && obj[key] == 'false') {
					obj[key] = false;
				} else if (typeof(obj[key]) == 'string' && isRealNum(obj[key])) {
					obj[key] = Number(obj[key]);
				}
				if (typeof obj[key] == 'object' || typeof obj[key] == 'function') {
					changeJsonValue(obj[key]); //递归遍历属性值的子属性
				}
	}
}

export function getPositionByEditor(x,y,scale=1){
    const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()
    return {left:changeValue(x-editorRectInfo.left)/scale,top:changeValue(y-editorRectInfo.top)/scale}
}
export function copyObject(obj){
    return JSON.parse(JSON.stringify(obj))
}
export function ajax(options){
        options = options ||{};  //调用函数时如果options没有指定，就给它赋值{},一个空的Object
        options.type=(options.type || "GET").toUpperCase();/// 请求格式GET、POST，默认为GET
        options.dataType=options.dataType || "json";    //响应数据格式，默认json

        var params=formatParams(options.data);//options.data请求的数据

        var xhr;

        //考虑兼容性
        if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
        }else if(window.ActiveObject){//兼容IE6以下版本
            xhr=new ActiveXobject('Microsoft.XMLHTTP');
        }

        //启动并发送一个请求
        if(options.type=="GET"){
            xhr.open("GET",options.url+"?"+params,true);
            xhr.send(null);
        }else if(options.type=="POST"){
            xhr.open("post",options.url,true);

            //设置表单提交时的内容类型
            //Content-type数据请求的格式
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhr.send(params);
        }

    //    设置有效时间
        setTimeout(function(){
            if(xhr.readySate!=4){
                xhr.abort();
            }
        },options.timeout)

    //    接收
    //     options.success成功之后的回调函数  options.error失败后的回调函数
    //xhr.responseText,xhr.responseXML  获得字符串形式的响应数据或者XML形式的响应数据
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                var status=xhr.status;
                if(status>=200&& status<300 || status==304){
                  options.success&&options.success(xhr.responseText,xhr.responseXML);
                }else{
                    options.error&&options.error(status);
                }
            }
        }
    }

    //格式化请求参数
export function formatParams(data){
        var arr=[];
        for(var name in data){
            arr.push(encodeURIComponent(name)+"="+encodeURIComponent(data[name]));
        }
        arr.push(("v="+Math.random()).replace(".",""));
        return arr.join("&");

}

export function changeValue(value,dis=1){
        // return Math.round(value)
        value = Number(value);
        return Number(value.toFixed(dis));

}
// 遇到相同元素级属性，以后者（main）为准
// 不返还新Object，而是main改变
export function mergeJSON (minor, main) {
  for (var key in minor) {

    if (main[key] === undefined) {  // 不冲突的，直接赋值
      main[key] = minor[key];
      continue;
    }

    // 冲突了，如果是Object，看看有么有不冲突的属性
    // 不是Object 则以main为主，忽略即可。故不需要else
    if (isJSON(minor[key])) {
      // arguments.callee 递归调用，并且与函数名解耦
      arguments.callee(minor[key], main[key]);
    }
  }
}

// 附上工具
export function isJSON(target) {
  return typeof target == "object" && target.constructor == Object;
}
