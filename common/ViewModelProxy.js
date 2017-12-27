let util = require('./util');
import WM from './WatchManager';
//===================================================
let renderList = {};
let vmList = {};
const VMO_ID = 'vmo_id';
let renderTimer = null;
const RENDER_TIME = 100;

//===============================================
/**
 * VM配置对象
 */
class VM{
  constructor(principal,id){
    this.principal = principal;
    this[VMO_ID] = id;
    this.optData = {};
  }
  /**
   * @internal
   * 执行渲染，数据生效
   */
  validate(){
    if(!this.optData){
      return;
    }
    let noUse = !Object.keys(this.optData).length>0;
    if(noUse){
      return;
    }
    
    this.principal.setData(this.optData);

    //重置对象等待下一次
    this.optData = {};
  }
  /**
   * @internal
   * 提交属性改动
   * @param {String} propName 
   * @param {*} value 
   */
  commit(propName,value){
    if(this.optData[propName] === value){
      return;
    }    
    this.optData[propName] = value;
    addRender(this[VMO_ID]);
  }
  /**
   * 销毁对象
   */
  destory(){
    this.optData = null;
    this[VMO_ID] = null;
    this.principal = null;
    //only for debug
    // this.validateTime = null;
  }
}
//================================================
class VMProxy{
  constructor(id){
    this[VMO_ID] = id;
  }
  /**
   * 
   * @param {*} prop 
   * @param {*} value 
   */
  commit(prop,value){
    if(typeof prop === 'string'){
      commitProperty(this[VMO_ID],prop,value);
    }
    if(util.isObject(prop)){
      commitProperties(this[VMO_ID],prop);
    }
    return this;
  }
  /**
   * 
   */
  validateNow(){
    validateNow(this[VMO_ID]);
    return this;
  }
  /**
   * 销毁vmp
   */
  destory(){
    if(this.props){
      const keys = Object.keys(this.props);
      for(let value of keys){
        this.props[value] = null;
      }
      this.props = null;
    }    
    destoryVMO(this[VMO_ID]);  
  }
  /**
   * 监控哪些属性的改变
   * @param {*} list 
   */
  watch(list){

  }
  /**
   * 解除对属性的监控
   * @param {*} args 
   */
  unwatch(...args){

  }
}
//===============================================
/**
 * 将一个vm加入监视行列
 * @param {*} vm 
 * @param {Boolean} combinePropKeys [optional] 是否将vm.data上的属性名合并到vmp实例上
 * 每个属性名的值对应于该属性名的键名字符串:
 * <code>
 * 
 * vm.data.abc = '123';
 * vmp.props.abc = 'abc';
 * </code>
 */
function getProxy(principal,combinePropKeys=false){
  if(!principal){
    return;
  }
  let id = util.getSysId();
  let vmo = new VMOption(principal,id);
  vmoList[vmo[VMO_ID]] = vmo;
  const vmp = new VMProxy(id);
  if(principal && combinePropKeys){
    combinePropToVMP(vm.data,vmp);
  }
  return vmp;
}
/**
 * 数据立即生效
 * @param {*} id 
 */
function validateNow(id){
  let vmo = vmoList[id];
  if(!vmo){
    return;
  }

  if(renderList[vmo[VMO_ID]]){
    renderList[vmo[VMO_ID]] = false;
  }
  vmo.validate();
}
/**
 * 提交数据变动
 * @param {*} id 
 * @param {*} propName 
 * @param {*} value 
 */
function commitProperty(id,propName,value){
  let vmo = vmoList[id];
  return vmo?vmo.commit(propName,value):null;
}
/**
 * 批量提交数据变动
 * @param {*} id 
 * @param {*} opt 
 */
function commitProperties(id,opt){
  let vmo = vmoList[id];
  let keys = Object.keys(opt);
  for(let value of keys){
    vmo.commit(value,opt[value]);
  }  
}
/**
 * 销毁一个VMOption实例
 * @param {*} id 
 */
function destoryVMO(id){
  let vmo = vmoList[id];
  return vmo?vmo.destory():null;
}

//only for debug
function outputVMOS(){
  return vmoList;
}

//======================================================
/**
 * 添加一个vmo到待执行列表
 * @param {*} id 
 */
function addRender(id){
  if(renderList[id]){
    return;
  }
  renderList[id] = true;
  if(!renderTimer){
    setupRender();
  }
}
/**
 * 启动生效工作
 */
function setupRender(){
  renderTimer = setTimeout(validateProperties,RENDER_TIME);
}
/**
 * 数据生效
 */
function validateProperties(){
  clearTimeout(renderTimer);
  renderTimer = null;

  let vmo,
      keys = Object.keys(renderList);
  for(let value of keys){
    vmo = vmoList[value];
    if(vmo && renderList[value]){
      vmo.validate();
    }    
  }
  renderList = {};
}
/**
 * 将参数对象的属性键名生成字符串
 * 添加到vmp.props对象中，键值为和键名相同的字符串
 * @param {*} props 
 * @param {*} vmp 
 */
function combinePropToVMP(props,vmp){
  if(!props || !vmp){
    return;
  }
  const keys = Object.keys(props);
  vmp.props = {};
  for(let value of keys){
    vmp.props[value] = value;
  }
}

//============================================
module.exports = {
  watchVM,
  VMO_ID,
};

