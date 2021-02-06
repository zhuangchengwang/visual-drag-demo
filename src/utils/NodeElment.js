import _ from "lodash";
function getProtype(object,key,defaultV){
    let a = _.get(object, key);
    return a!=undefined?a:defaultV;
}
function changePos(rec){
       let getBoundingClientRect={
            x1:getProtype(rec,'x1',Number(rec['left'])),//x1 left
            y1:getProtype(rec,'y1',Number(rec['top'])),//y1  top
            x2:getProtype(rec,'x2',Number(rec['left'])+Number(rec['width'])),//x2 right
            y2:getProtype(rec,'y2',Number(rec['top'])+Number(rec['height'])),//y2 bottom
        };
        return getBoundingClientRect;
}
/**
 * 判断a是否包含b,不排除全等
 * @param {Object} aNode_borderPosition_1
 * @param {Object} bNode_borderPosition_1
 * @param {Object} nearlyPos 返回最近不超出边界的left和top值
 * @param {Object} containInfo 返回纵横方向是否越界的信息
 */
export function isAContainB(aNode_borderPosition_1, bNode_borderPosition_1,nearlyPos=null,containInfo=null){
       //避免影响对象的值
       let aNode_borderPosition = changePos(aNode_borderPosition_1);
       let bNode_borderPosition = changePos(bNode_borderPosition_1);
       let a_x1 = aNode_borderPosition['x1'];
       let a_y1 = aNode_borderPosition['y1'];
       let a_x2 = aNode_borderPosition['x2'];
       let  a_y2 = aNode_borderPosition['y2'];
       let  b_x1 = bNode_borderPosition['x1'];
       let  b_y1 = bNode_borderPosition['y1'];
       let  b_x2 = bNode_borderPosition['x2'];
       let b_y2 = bNode_borderPosition['y2'];

       if(containInfo){
           if(b_x1>=a_x1 && b_x2<=a_x2 ){
               containInfo.x = true;
           }
           if(b_y1>=a_y1 && b_y2<=a_y2 ){
               containInfo.y = true;
           }
       }
       if(a_x1<=b_x1&&a_x2>=b_x2&&a_y1<=b_y1&&a_y2>=b_y2){
            //排除全等
            // if(a_x1==b_x1&&a_x2==b_x2&&a_y1==b_y1&&a_y2==b_y2){
            //     return false;
            // }
            return true;
        }
        if(nearlyPos){
            if(b_x1<a_x1){
               nearlyPos.left = a_x1;
            }
            if(b_y1<a_y1){
               nearlyPos.top = a_y1;
            }
            if(b_x2>a_x2){
               nearlyPos.left = Math.round(a_x2-bNode_borderPosition_1.width);
            }
            if(b_y2>a_y2){
               nearlyPos.top = Math.round(a_y2-bNode_borderPosition_1.height);
            }
            //上方结果使用相减 可能会出现负数
            if(nearlyPos.left<a_x1){
               nearlyPos.left = a_x1;
            }
            if(nearlyPos.top<a_y1){
               nearlyPos.top = a_y1;
            }
        }
        return false;
}

/**
 * 判断a是否包含b,不排除全等
 * @param {Object} aNode_borderPosition_1
 * @param {Object} bNode_borderPosition_1
 * @param {Object} nearlyWh 返回最近不超出边界的width和height值
 */
export function isAContainBResize(aNode_borderPosition_1, bNode_borderPosition_1,nearlyWh=null,containInfo=null){
       //避免影响对象的值
       let aNode_borderPosition = changePos(aNode_borderPosition_1);
       let bNode_borderPosition = changePos(bNode_borderPosition_1);
       let a_x1 = aNode_borderPosition['x1'];
       let a_y1 = aNode_borderPosition['y1'];
       let a_x2 = aNode_borderPosition['x2'];
       let  a_y2 = aNode_borderPosition['y2'];
       let  b_x1 = bNode_borderPosition['x1'];
       let  b_y1 = bNode_borderPosition['y1'];
       let  b_x2 = bNode_borderPosition['x2'];
       let b_y2 = bNode_borderPosition['y2'];

       if(containInfo){
           if(b_x1>=a_x1 && b_x2<=a_x2 ){
               containInfo.x = true;
           }
           if(b_y1>=a_y1 && b_y2<=a_y2 ){
               containInfo.y = true;
           }
       }
       if(a_x1<=b_x1&&a_x2>=b_x2&&a_y1<=b_y1&&a_y2>=b_y2){
            //排除全等
            // if(a_x1==b_x1&&a_x2==b_x2&&a_y1==b_y1&&a_y2==b_y2){
            //     return false;
            // }
            return true;
        }
        if(nearlyWh){
            //right
            if(b_x1 + bNode_borderPosition_1.width > a_x2){
               nearlyWh.width = a_x2-b_x1;
            }
            //down
            if(b_y1 + bNode_borderPosition_1.height > a_y2){
               nearlyWh.height = a_y2-b_y1;
            }
            //left
            if(b_x1<a_x1){
               nearlyPos.left = a_x1;
               nearlyWh.width = b_x2-b_x1;
            }
            //up
            if(b_y1<a_y1){
               nearlyPos.top = a_y1;
               nearlyWh.height = b_y2-b_y1;
            }

        }
        return false;
}
