/**
 * 日志管理服务类
 * @author Brave Chan on 2017.8
 */
//===============================================
const util = require('../utils/util');
//==============================================
let _debug = false;
const NORMAL = 'l1';
const INFO = 'l2';
const ERROR = 'l3';
const WARN = 'l4';
const style = {
    l1:'log__txt--normal',
    l2:'log__txt--info',
    l3:'log__txt--error',
    l4:'log__txt--warn',
};
let _logList = [];
//===============================================
/**
 * 日志单项
 */
class LogItem{
    constructor(type,message,detail){
        this.className = style[type];
        this.message = message;
        this.detail = detail;
        this.time = util.formatTime(new Date().getTime(),false);
    }
}
//================================================
/**
 * 变为数组
 * @param {*} list 
 */
function toArray(list){
    return Array.from(list);
}
/**
 * 将对象处理成json字符串
 * @param {*} obj 
 */
function handleObj(obj){
    try{
        return JSON.stringify(obj);
    }catch(error){
        return JSON.stringify({
            message:'stringify json error,please check.',
        });
    }
}
/**
 * 将日志信息整理合并为单条字符串
 * @param {*} list 
 */
function tidyMessage(list){
    for(let i=0,len=list.length;i<len;i++){
        let item = list[i];
        if(item && typeof item === 'object'){
            list[i] = handleObj(item);
        }
    }
    let cnt = list.join('<==>');
    return cnt;
}
//================================================
/**
 * 输出普通日志
 */
function trace(){
    let list = toArray(arguments);
    let cnt = tidyMessage(list);
    _logList[_logList.length] = new LogItem(NORMAL,'消息',cnt);
    if(_debug){
        console.log.apply(console,arguments);
    }
}
/**
 * 输出信息日志
 */
function info(){
    let list = toArray(arguments);
    let cnt = tidyMessage(list);
    _logList[_logList.length] = new LogItem(INFO,'信息',cnt);
    if(_debug){
        console.info.apply(console,arguments);
    }
}
/**
 * 输出错误日志
 */
function error(){
    let list = toArray(arguments);
    let cnt = tidyMessage(list);
    _logList[_logList.length] = new LogItem(ERROR,'错误',cnt);
    if(_debug){
        console.error.apply(console,arguments);
    }
}
/**
 * 输出警告日志
 */
function warn(){
    let list = toArray(arguments);
    let cnt = tidyMessage(list);
    _logList[_logList.length] = new LogItem(WARN,'警告',cnt);
    if(_debug){
        console.warn.apply(console,arguments);
    }
}
//==========================================
module.exports = {
    trace,
    info,
    error,
    warn,
    get logList(){
        return _logList;
    },
    set debug(value){
        _debug = !!value;
    },
    get debug(){
        return _debug;
    }
};
