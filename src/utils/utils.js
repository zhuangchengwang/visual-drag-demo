export function deepCopy(target) {
    if (typeof target == 'object') {
        const result = Array.isArray(target)? [] : {}
        for (const key in target) {
            if (typeof target[key] == 'object') {
                result[key] = deepCopy(target[key])
            } else {
                result[key] = target[key]
            }
        }

        return result
    }

    return target
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

export function getPositionByEditor(x,y){
    const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()
    return {left:Math.round(x-editorRectInfo.left),top:Math.round(y-editorRectInfo.top)}
}