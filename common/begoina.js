/**
 * begoina的入口文件
 * 提供基本的方法
 * 
 * @author Brave Chan on 2017.12
 */
//======================================================
import VMP from './ViewModelProxy';
import util from './util';
//=======================================================
const M_ID = 'be_m_id$';
let decorators = [];
//=======================================================
/**
 * @public
 * 获得一个小程序页面或组件实例的代理
 * @param {Object} principal [necessary] 小程序页面或者组件的实例
 * 
 * 以下参数待定
 * @param {Boolean} combinePropKeys [optional] 是否将vm.data上的属性名合并到vmp实例上
 * 每个属性名的值对应于该属性名的键名字符串:
 * <code>
 *  vm.data.abc = '123';
 *  vmp.props.abc = 'abc';
 * </code>
 */
function getProxy(principal){
    if(!principal){
      return;
    }
    let vmp = VMP.create(principal);
    //wrapper plugin factory
    doDecorate(vmp,decorators);
    return vmp;
}
/**
 * @public
 * 
 * 增加程序运行中需要使用的增强模块
 * @param {*} addModule [necessary] 增强模块 
 */
function use(addModule){
    let am = addModule;
    if(!am || !util.isObject(am)){
        return;
    }
    let id = util.getSysId();

    if(typeof am.decorator === 'function'){
        addDecorator(am.decorator,decorators);
    }

    if(typeof am.setup === 'function'){
        am.setup();
    }
}

//=========================================
/**
 * @private
 * 
 * 是否在列表中存在
 * @param {Array} array [necessary] 
 * @param {*} obj [necessary] 
 */
function isExisting(array,obj){
    return array.indexOf(obj) !== -1;
}

/**
 * @private
 * 
 * 添加装饰器
 * @param {Function} fn [necessary] 装饰器函数
 * @param {Array} list [necessary] 装饰器列表 
 */
function addDecorator(fn,list){
    if(isExisting(list,fn)){
        return;
    }
    list[list.length] = fn;
}

/**
 * @private
 * 
 * 执行装饰操作
 * @param {VMP.VMProxy} vmp [necessary] vmp实例
 * @param {Array} list [necessary] 装饰器列表
 */
function doDecorate(vmp,list){
    if(list.length<=0 || !vmp){
        return;
    }
    let len = list.length;
    while(len--){
        list[len](vmp);
    }
}

//=========================================
module.exports = {
    getProxy,
    use,
};