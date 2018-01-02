let util = require('./util');
import WM from './WatchManager';
//===================================================
let renderList = {};
let vmList = {};
const VMO_ID = 'vmo_id$';
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
  }
}
//================================================
class VMProxy{
  constructor(id){
    this[VMO_ID] = id;
  }
  /**
   * @internal
   * 
   * 获取代理的vm实例
   * 此方法有可能被废弃，
   * 并且在内部使用，
   * 请不要主动调用它。
   */
  get _vm(){
    return vmList[this[VMO_ID]];
  }
  /**
   * @public
   * 提交属性修改
   * @param {String} prop [necessary] 属性名 
   * @param {*} value [necessary] 属性值 
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
   * @public
   * 让设置立即生效
   * 即，立即调用`this.setData()`，让设置生效
   * 次方法应用在需要立即让配置生效的场景，
   * 这会造成将当前缓存的属性修改配置立即提交wx处理。
   * 因此从性能考虑，此方法最好只用在确实必要之时。
   */
  validateNow(){
    validateNow(this[VMO_ID]);
    return this;
  }
  /**
   * @public
   * 销毁vmp和vm
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
}
//===============================================
/**
 * @private
 * 数据立即生效
 * @param {String} id [necessary] vm的id 
 */
function validateNow(id){
  let vm = vmList[id];
  if(!vm){
    return;
  }

  if(renderList[vm[VMO_ID]]){
    renderList[vm[VMO_ID]] = false;
  }
  vm.validate();
}
/**
 * @private
 * 提交数据变动
 * @param {String} id [necessary] vm的id 
 * @param {String} propName [necessary] 属性名
 * @param {*} value [necessary] 新的属性值
 */
function commitProperty(id,propName,value){
  let vm = vmList[id];
  return vm?vm.commit(propName,value):null;
}
/**
 * @private
 * 批量提交数据变动
 * @param {String} id [necessary] vm的id
 * @param {Object} opt [necessary] 修改属性的集合
 */
function commitProperties(id,opt){
  let vm = vmList[id];
  let keys = Object.keys(opt);
  for(let value of keys){
    vm.commit(value,opt[value]);
  }  
}
/**
 * @private
 * 销毁一个VM实例
 * @param {String} id [necessary] vm的id
 */
function destoryVM(id){
  let vm = vmList[id];
  return vm?vm.destory():null;
}

//only for debug
function _outputVMOS(){
  return vmList;
}

//======================================================
/**
 * @private
 * 添加一个vm到待执行列表
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
 * @private
 * 启动生效工作
 */
function setupRender(){
  renderTimer = setTimeout(validateProperties,RENDER_TIME);
}
/**
 * @private
 * 数据生效
 */
function validateProperties(){
  clearTimeout(renderTimer);
  renderTimer = null;

  let vm,
      keys = Object.keys(renderList);
  for(let value of keys){
    vm = vmList[value];
    if(vm && renderList[value]){
      vm.validate();
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
// function combinePropToVMP(props,vmp){
//   if(!props || !vmp){
//     return;
//   }
//   const keys = Object.keys(props);
//   vmp.props = {};
//   for(let value of keys){
//     vmp.props[value] = value;
//   }
// }
//===================================================
/**
 * @public
 * 创建vm对象和vmp代理对象
 * @param {*} principal 
 */
function create(principal){
  let id = util.getSysId();
  let vm = new VM(principal,id);
  vmList[vm[VMO_ID]] = vm;
  let vmp = new VMProxy(id);
  return vmp;  
}

//============================================
module.exports = {
  create,
  VMO_ID,
};

