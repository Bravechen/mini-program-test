const Log = require('../services/LogService');
//========================================
let initialized = false;
let cbList = [];
let timer;
let startNum = 0;
let _fps = 60;
let stopping = false;
//========================================================
/**
 * 初始化
 */
function initialize(){
  initialized = true;
  startFrame();  
}

/**
 * 计算帧率
 */
function countFrameGap(){
  return Math.floor(1000/_fps);
}
/**
 * 执行帧计算
 */
function doFrame(){
  if(stopping){
    clearTimeout(timer);
    return;
  }
  let end = new Date().getTime();
  let duration = end - startNum;
  for(let i=0,fn;(fn=cbList[i])!=null;i++){
    fn(duration);
  }
  clearTimeout(timer);
  startFrame();
}
//===============================================================
/**
 * 添加帧监听
 * @param {Function} handler 
 */
function addFrameHandler(handler){
  if(!handler || typeof handler !== 'function'){
    return;
  }
  cbList[cbList.length] = handler;
  if(!initialized){
    initialize();
  }
}
/**
 * 移除帧监听
 * @param {Function} handler 
 */
function removeFrameHandler(handler){
  if(!handler || typeof handler !== 'function' || cbList.length<=0){
    return;
  }
  cbList = cbList.filter((item)=>item !== handler);
  if(cbList.length<=0){
    stopFrame();
    cbList = [];
  }  
}
/**
 * 
 * @param {*} handler 
 */
function hasFrameHandler(handler){
  if(!handler || typeof handler !== 'function' || cbList.length<=0){
    return false;
  }
  return cbList.indexOf(handler)>=0;
}

/**
 * 开始帧循环
 */
function startFrame(){
  if(!initialized){
    Log.warn('没有handler监听帧循环，因此初始化未完成，帧循环不会启动。');
    return;
  }
  stopping = false;
  startNum = new Date().getTime();
  timer = setTimeout(doFrame,countFrameGap());
}
/**
 * 结束帧循环
 */
function stopFrame(){
  if(!initialized){
    Log.warn('没有handler监听帧循环，因此初始化未完成，帧循环不会启动。');
    return;
  }
  if(stopping){
    return;
  }
  clearTimeout(timer);
  stopping = true;
  startNum = 0;
}

//=============================================
module.exports = {
  addFrameHandler:addFrameHandler,
  removeFrameHandler:removeFrameHandler,
  hasFrameHandler:hasFrameHandler,
  stopFrame:stopFrame,
  startFrame:startFrame,
  set fps(value){
    if(!Number.isNaN(value) && value!==_fps){
      _fps = value;
    }
  },
  get fps(){
    return _fps;
  }
};