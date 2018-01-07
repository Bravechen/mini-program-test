import chain from '../begonia/tools/chain';
import Log from '../begonia/services/LogManager';

import util from '../utils/util';


function setupLogin(){
  let c = chain.getChain([userLogin,getUserInfo],function(error,user){
    if(error){
      console.error("In UserService setupLogin()====>",error);
      return;
    }
    console.log("setup login success and end.====>",user);
  }).next();
}

/**
 * @private
 * 获取用户登录信息
 */
function userLogin({next,error}){
  wx.login({
      success:function(res){
        Log.info("In UserService userLogin(),call wx login success",res);
        if(res.code){
          Log.info("In UserService userLogin(),get login msg success");
          next(res.code);
        }else{
          Log.error('In UserService userLogin(),get login msg failed',res.errMsg);
          error(res.errMsg);
        }        
      },
      fail:function(error){
        Log.error("In UserService userLogin(),get login msg failed",error);
        error(error);  
      },
  });
}

/**
 * @private
 * 获取用户信息
 * @param {*} store 
 */
function getUserInfo({next,error},openId){
  if(!openId){
    Log.error('In UserService getUserInfo(),openId is wrong.',openId);

    return error({
      message:ConstUtil.ATTENTION,
      detail:'openId is wrong.=====>' + openId
    });
  }
  //调用登录接口
  wx.getUserInfo({
    withCredentials: true,
    lang:'zh_CN',
    success: function(res) {
      Log.info('In UserService getUserInfo(),get user data success');
      let userInfo = res.userInfo;
      let nickName = userInfo.nickName;
      let avatarUrl = userInfo.avatarUrl;
      let gender = userInfo.gender //性别 0未知 1男 2女

      let user = {
        sex:gender,
        nickName:nickName,
        wxAccount:openId,
        avatar:avatarUrl,
        dataId:util.getSysId(),
      };
      next(user);
    },
    fail:function(err){
      Log.error('In UserService getUserInfo(),get user data failed',err);

      error({
        message:ConstUtil.GET_USER_INFO_FAILED,
        detail:ConstUtil.USEER_INFO_ERROR,
      });
    }
  });
}

module.exports = {
  setupLogin,
};