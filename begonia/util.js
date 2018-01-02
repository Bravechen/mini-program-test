/**
 * 工具函数集合
 * @auhtor Brave Chan on 2017
 */
//===================================================================

/**
 * @public
* 格式化时间
* @param {Number} num [necessary] 从1970.1.1至今的毫秒数 
* @param {*} limit 是否只返回y-m-d的形式
*/
function formatTime(num, limit = true) {
    if(!Number.isInteger(+num)){
        return 0;
    }
    let date = new Date(num);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    let ymd = [year, month, day].map(formatNumber).join('-');
    if (limit) {
        return ymd;
    }

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();     

    return ymd + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
/**
 * @public
 * 空函数
 */
function noop() {}

 /**
  * 格式化分秒数字
  */
 function formatNumber(n) {
    n = n.toString();
     
    return n[1] ? n : '0' + n;
 }


 /**
  * 随机字符串
  */
 function randomStr() {
     let str;
     str = (0xffffff * Math.random()).toString(16).replace(/\./g, '');     
     return str;
 }

 /**
  * 随机字符串组成的id
  */
function getSysId(){
    return `${randomStr()}-${randomStr()}`;
}

/**
 * 是否是布尔型
 * @param {*} value 
 */
function isBoolean(value){
    return typeof value === 'boolean';
}

/**
 * 是否是数组
 * @param {*} value 
 */
function isArray(value){
    return Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * 是否是纯对象
 * @param {*} value 
 */
function isObject(value){
    return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * 快速深度复制
 * @param {*} obj 
 */
function quickDeepCopy(obj){
    let newOne;
    try{
        newOne = JSON.parse(JSON.stringify(obj));
    }catch(error){
        return newOne;
    }
    return newOne;
}
//================================================================


//================================================================
 module.exports = {
     formatTime,     
     randomStr,
     noop,
     getSysId,
     isBoolean,
     isArray,
     isObject,
     quickDeepCopy,     
 }