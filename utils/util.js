/**
 * 工具函数集合
 * @auhtor Brave Chan on 2017
 */
//===================================================================
const ConstUtil = require('./ConstUtil');
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
 * 反序列化
 * @param {*} str 
 */
function unserialize(str){
    if(str[0] === "{" && str[str.length-1] === "}"){
        str = str.slice(1,str.length);
    }
    let list = str.match(/([a-zA-Z]+)=([a-zA-Z0-9]+)/g);
    if(!list){
        return;
    }
    let obj = {};
    list.forEach(function(item,i){
        let ary = item.split('=');
        obj[ary[0]] = ary[1];
    });
    return obj;
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
 * 保留小数
 * @param {*} value 数值 
 * @param {*} keep 保留位数
 * @param {*} useRound 是否使用四舍五入，默认false
 */
function keepDecimal(value,keep=0,useRound=false){
    if(Number.isNaN(value) || Number.isNaN(keep)){
        return value;
    }
    const t = Math.pow(10,keep);
    return Math[useRound?'round':'floor'](value*t)/t;
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
     keepDecimal,     
     quickDeepCopy,     
     unserialize,
 }