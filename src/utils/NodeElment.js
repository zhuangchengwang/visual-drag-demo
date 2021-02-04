import _ from "lodash";
function getProtype(object,key,defaultV){
    let a = _.get(object, key);
    return a!=undefined?a:defaultV;
}
function changePos(rec){
       let getBoundingClientRect={
            x1:getProtype(rec,'x1',rec['left']),//x1 left
            y1:getProtype(rec,'y1',rec['top']),//y1  top
            x2:getProtype(rec,'x2',rec['left']+rec['width']),//x2 right
            y2:getProtype(rec,'y2',rec['top']+rec['height']),//y2 bottom
        };
        return getBoundingClientRect;
}
export function isAContainB(aNode_borderPosition_1, bNode_borderPosition_1){
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
       if(a_x1<=b_x1&&a_x2>=b_x2&&a_y1<=b_y1&&a_y2>=b_y2){
            //排除全等
            if(a_x1==b_x1&&a_x2==b_x2&&a_y1==b_y1&&a_y2==b_y2){
                return false;
            }
            return true;
        }
        return false;
}
