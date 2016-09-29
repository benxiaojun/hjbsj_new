//var domain = 'http://www.hunjiabao.net';
var domain = 'http://test.hunjiabao.net';
//var domain = 'http://192.168.1.26';

angular.module('starter.services', [])

    .factory('LoginService', function($q,$http,$state,$ionicPopup,$rootScope,$ionicLoading) {
      return {
        loginUser: function(name, pwd,utype_value) {
            var url = domain+'/wap/index.php?ctl=biz_login&post_type=json';
            //var url2 = domain+'/wap/index.php?ctl=biz_yuyue&post_type=json';
            var params = {biz_account:name,biz_pwd:pwd,biz_type:utype_value};
            //用户名密码加入全局变量
            $rootScope.user_name = name;
            $rootScope.user_pwd = pwd;
            //本地存储
            window.localStorage['userName'] = name;
            window.localStorage['userPassword'] = pwd;
            window.localStorage['userType'] = utype_value;
             $http.post(url,params).success(function(data){
                if(data.biz_login_status === 1){
                    $rootScope.sj_name = data.supplier_name;
                    window.localStorage['sj_name'] = data.supplier_name;
                    //$http.post(url2,params).success(function(res){
                    //    //var logo,address,tel;
                    //    //logo = res.logo;
                    //    $state.go("allAppointment",{yanghuiting_count:res.yanghuiting_count,yanghuiting_list:res.yanghuiting_list},{reload:true});
                    //})
                    if(utype_value == 1){//酒店帐号
                        $state.go("allAppointment");
                    }else if(utype_value == 2){//金刚帐号
                        $state.go("newAddedCustomer");
                    }else if(utype_value == 3){//婚车帐号
                        $state.go("hcMainOrder");
                    }
                }else{
                  $ionicPopup.alert({
                    cssClass: 'myPopup',
                    title:'登录失败',
                    template:'<div style="text-align: center;font-family: 黑体">'+data.info+'</div>',
                    okText: '确定',
                    okType: 'button-assertive'
                  })
                    $ionicLoading.hide();
                }
              });
        },
        logout:function(){
          var url =domain+'/wap/index.php?ctl=biz_logout&post_type=json';
          $http.get(url).success(function(data){
              if(data.biz_logout_status === 1){
                  localStorage.removeItem('userPassword');
                $state.go("login",{},{reload:true});
              }else{
                $ionicPopup.alert({
                  cssClass: 'myPopup',
                  title:'退出登录失败',
                  template:data.info
                })
              }
          })
        },
        getAppServerVersion:function(dev_type,version){
            var url =domain+'/wap/index.php?ctl=version&act_2=shanghu&&post_type=json';
            var params = {dev_type:dev_type,version:version};
            var deferred = $q.defer();
            $http.post(url,params).success(function(data){
                deferred.resolve(data);
            })
            return deferred.promise;
        }
      }
    })
    .factory('OrderService',function($q,$http,$state,$ionicPopup,$rootScope){
        return{
            getAllAppointment:function(){
                var url = domain+'/wap/index.php?ctl=biz_yuyue&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword']};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_schedule_info:function(){
                var url = domain+'/wap/index.php?ctl=biz_dangqi&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword']};
                $http.post(url,params).success(function(data){
                    $state.go("scheduleShowPage",{items:data.item,sj_name:window.localStorage['sj_name']},{reload:true});
                })
            },
            get_yuyue_info:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuyue&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                $http.post(url,params).success(function(data){
                    $state.go("tabs",{yanghuiting_count:data.yanghuiting_count,yanghuiting_list:data.yanghuiting_list,dangqi:dangqi,index:1},{reload:true});
                })
            },
            get_kanchang_info:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                $http.post(url,params).success(function(data){
                    $state.go("tabs",{yanghuiting_count:data.yanghuiting_count,yanghuiting_list:data.yanghuiting_list,dangqi:dangqi,index:2},{reload:true});
                })
            },
            get_yuding_info:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuding&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                $http.post(url,params).success(function(data){
                    $state.go("tabs",{yanghuiting_count:data.yanghuiting_count,yanghuiting_list:data.yanghuiting_list,dangqi:dangqi,index:3},{reload:true});
                })
            },
            query_yuyue:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuyue&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_all:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_kanchang:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_yuding:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuding&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_yuyue_detail:function(id){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuyue_view&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_kanchang_detail:function(id){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang_view&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            confirm_kanchang:function(id,nickname,dangqi,zhushu,hunyan,kanchang_xuhao,kanchang_time1,kanchang_time2,kanchang_time3){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuyue_kanchang&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id,dangqi:dangqi,zhushu:zhushu,hunyan:hunyan,nickname:nickname
                    ,kanchang_xuhao:kanchang_xuhao,kanchang_time1:kanchang_time1,kanchang_time2:kanchang_time2,kanchang_time3:kanchang_time3};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            cancel_yuyue:function(id,reason){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuyue_cancel&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id,reason:reason};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_yuyue_add_info:function(dangqi){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=xianxia&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            confirm_yuyue:function(dangqi,zhushu,hunyan,nickname,phone,kanchang_time1,kanchang_time2,kanchang_time3,yuyue_type,dingjin,comment){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=xianxia_do&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi,zhushu:zhushu,hunyan:hunyan,nickname:nickname,phone:phone
                ,kanchang_time1:kanchang_time1,kanchang_time2:kanchang_time2,kanchang_time3:kanchang_time3,yuyue_type:yuyue_type,dingjin:dingjin,beizhu:comment};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_yuding_detail:function(id){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuding_view&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_canceledYuyue_detail:function(id){
                var url = domain+'/wap/index.php?ctl=biz_yuyue&act_2=order_view&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            compeleteOrCancel_yuding:function(id,status){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=yuding_do&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id,status:status};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            cancel_kanchang:function(id){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang_cancel&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            close_dangqi:function(yht_id,dangqi){
                var url = domain+'/wap/index.php?ctl=biz_setting_dangqi&act_2=danqi_close&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],yht_id:yht_id,dangqi:dangqi};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            confirm_yuding:function(id,nickname,dangqi,dingjin,zhushu,hunyan,comment){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang_yuding&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id,nickname:nickname,dangqi:dangqi,
                    dingjin:dingjin,zhushu:zhushu,hunyan:hunyan,beizhu:comment};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            confirm_yuding_chaidan:function(id,nickname,phone,dingjin,zhushu,hunyan,kanchang_time1,kanchang_time2,kanchang_time3,comment){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang_chaidan_do&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id,nickname:nickname,phone:phone,
                    dingjin:dingjin,zhushu:zhushu,hunyan:hunyan,kanchang_time1:kanchang_time1,kanchang_time2:kanchang_time2,kanchang_time3:kanchang_time3,beizhu:comment};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_chaidan_info:function(id){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=kanchang_chaidan&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_allAppointment:function(){
                var url = domain+'/wap/index.php?ctl=biz_yuyue&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword']};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_xuhao:function(dangqi,type){
                var url = domain+'/wap/index.php?ctl=biz_paiqi&act_2=xuhao&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],dangqi:dangqi,type:type};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            }
        }
    })
    .factory('UserService', function($q,$http,$state,$ionicPopup,$rootScope) {
        return{
            get_sj_info:function(){
                var url = domain+'/wap/index.php?ctl=biz_index&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword']};
                $http.post(url,params).success(function(res){
                    $state.go("accountCenter",{sup_name:window.localStorage['sj_name'],logo_img:res.logo,address:res.address,tel:res.tel,
                index_img:res.index_img,brief:res.brief,fuwufei:res.fuwufei,jingchangfei:res.jingchangfei,kaipingfei:res.kaipingfei,
                tingchechang:res.tingchechang,hunfang:res.hunfang,huazhaungjian:res.huazhaungjian});
                })
            },
            get_yht_info:function(){
                var url = domain+'/wap/index.php?ctl=biz_yanhuiting&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword']};
                $http.post(url,params).success(function(data){
                    $state.go("yhtPage",{yanhuiting_count:data.yanhuiting_count,items:data.item});
                })
            },
            get_hyth_info:function(id){
                var url = domain+'/wap/index.php?ctl=biz_tehui&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:id,pagesize:10000};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            save_hyth:function(yht_id,name,start_time,end_time,content,id){
                var url = domain+'/wap/index.php?ctl=biz_tehui&act_2=save&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],yht_id:yht_id,name:name,
                    start_time:start_time,end_time:end_time,content:content,id:id};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_hycb_info:function(){
                var url = domain+'/wap/index.php?ctl=biz_hunyan&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword']};
                $http.post(url,params).success(function(data){
                    $state.go("hycbPage",{hunyan_count:data.hunyan_count,items:data.item});
                })
            },
            get_all_order_info:function(paramsJson){
                var url = domain+'/wap/index.php?ctl=biz_yuding&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            get_yuyue_order_info:function(paramsJson){
                var url = domain+'/wap/index.php?ctl=biz_yuyue&act_2=yuyue&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_schedule_info:function(year,month,day){
                var url = domain+'/wap/index.php?ctl=biz_dangqi&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],yy:year,mm:month,dd:day};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            query_dangqi_setting:function(year,month,day){
                var url = domain+'/wap/index.php?ctl=biz_setting_dangqi&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],yy:year,mm:month,dd:day};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            close_dangqi:function(period){
                var url = domain+'/wap/index.php?ctl=biz_setting_dangqi&act_2=close&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],period:period};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            open_dangqi:function(period){
                var url = domain+'/wap/index.php?ctl=biz_setting_dangqi&act_2=open&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],period:period};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            },
            changePassword:function(newPwd){
                var url = domain+'/wap/index.php?ctl=biz_login&act_2=newpassword&post_type=json';
                var params = {biz_account:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],newpassword:newPwd};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                })
                return deferred.promise;
            }
        }
    })
    .factory('MessageService', function($q,$http,$state,$rootScope) {
        return{
            getMessageList:function(zhuangtai){
                var url = domain+'/wap/index.php?ctl=biz_xiaoxi&post_type=json';
                var params = {biz_email:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],zhuangtai:zhuangtai};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            readMessage:function(msgid){
                var url = domain+'/wap/index.php?ctl=biz_xiaoxi&act_2=yuedu&post_type=json';
                var params = {biz_email:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],id:msgid};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            getMessageDetail:function(id){
                var url = domain+'/wap/index.php?ctl=biz_xiaoxi&act_2=view&post_type=json';
                var params = {biz_email:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],zhuangtai:zhuangtai};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            bindingJPushId:function(registrationId){
                var url = domain+'/wap/index.php?ctl=binding_mobile&act_2=bindBizJiguangId&post_type=json';
                var params = {biz_email:window.localStorage['userName'],biz_pwd:window.localStorage['userPassword'],jiguangid:registrationId};
                var deferred = $q.defer();
                $http.post(url,params).success(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    })
    .factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
        var self = this;

        // Handle query's and potential errors
        self.query = function (query, parameters) {
            parameters = parameters || [];
            var q = $q.defer();
            $ionicPlatform.ready(function () {
                $cordovaSQLite.execute(db, query, parameters)
                    .then(function (result) {
                        q.resolve(result);
                    }, function (error) {
                        console.warn('found an error');
                        //alert("found an error");
                        q.reject(error);
                    });
            });
            return q.promise;
        }

        // Proces a result set
        self.getAll = function(result) {
            var output = [];

            for (var i = 0; i < result.rows.length; i++) {
                output.push(result.rows.item(i));
            }
            return output;
        }

        // Proces a single result
        self.getById = function(result) {
            var output = null;
            output = angular.copy(result.rows.item(0));
            return output;
        }
        return self;
    })
    .factory('MessageDboService', function($cordovaSQLite, DBA) {
        var self = this;

        self.allMsg = function(account) {
            var parameters = [account];
            return DBA.query("SELECT * FROM message WHERE account = ? order by sendtime desc,messageid desc", parameters)
                .then(function(result){
                    return DBA.getAll(result);
                });
        }

        self.getMsgByType = function(zhuangtai,account) {
            var parameters = [zhuangtai,account];
            return DBA.query("SELECT * FROM message WHERE msgtype = ? AND account = ? order by sendtime desc,messageid desc", parameters)
                .then(function(result){
                    return DBA.getAll(result);
                });
        }

        self.getById = function(memberId) {
            var parameters = [memberId];
            return DBA.query("SELECT * FROM message WHERE id = (?)", parameters)
                .then(function(result) {
                    return DBA.getById(result);
                });
        }

        self.addMsg = function(messageid,account,msgtype,title,content,isread,sendtime,dangqi,yanhuiting,yuyuecontent,yuyueyonghu,mobile,dingjin) {
            var parameters = [messageid,account,msgtype,title,content,isread,sendtime,dangqi,yanhuiting,yuyuecontent,yuyueyonghu,mobile,dingjin];
            return DBA.query("INSERT INTO message (messageid,account,msgtype,title,content,isread,sendtime," +
                "dangqi,yanhuiting,yuyuecontent,yuyueyonghu,mobile,dingjin) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", parameters);
        }

        self.removeMsg = function(id) {
            var parameters = [id];
            return DBA.query("DELETE FROM message WHERE id = ?", parameters);
        }

        self.updateMsg = function(id) {
            var parameters = [id];
            return DBA.query("UPDATE message SET isread = 1 WHERE id = (?)", parameters);
        }
        return self;
    })
    .factory('Push', function($timeout) {
        var push;
        return {
            setBadge: function(badge) {
                if (push) {
                    console.log('jpush: set badge', badge);
                    plugins.jPushPlugin.setBadge(badge);
                }
            },
            setAlias: function(alias) {
                if (push) {
                    console.log('jpush: set alias', alias);
                    plugins.jPushPlugin.setAlias(alias);
                }
            },
            check: function() {
                if (window.jpush && push) {
                    plugins.jPushPlugin.receiveNotificationIniOSCallback(window.jpush);
                    window.jpush = null;
                }
            },
            init: function(notificationCallback) {
                console.log('jpush: start init-----------------------');
                push = window.plugins && window.plugins.jPushPlugin;
                if (push) {
                    console.log('jpush: init');
                    window.plugins.jPushPlugin.init();
                    window.plugins.jPushPlugin.setDebugMode(false);
                    $timeout(function(){
                        window.plugins.jPushPlugin.getRegistrationID(function(data) {
                            try{
                                //alert("JPushPlugin:registrationID is :"+data);
                                window.localStorage['registrationID'] = data;
                                console.log('registrationID:'+data);
                            }catch(exception){
                                console.log(exception);
                            }
                        });
                    },5000);
                    //plugins.jPushPlugin.openNotificationInAndroidCallback = notificationCallback;
                    //plugins.jPushPlugin.receiveNotificationIniOSCallback = notificationCallback;
                }
            }
        };
    })
    .factory('SdjgOrderService', function($q,$http) {
        return {
            getAllNewCustomer:function(){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType']};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryOneOrderInfo:function(id){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=orderinfo&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],id:id};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryAddInitInfo:function(date){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=xianxia&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],date:date};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            get_xuhao_by_dangqi:function(type,date){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=get_yuyuexuhao&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],type:type,date:date};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            saveNewOrderInfo: function (paramsJson) {
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=xianxia_do&post_type=json';
                //var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword']};
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            confirmOrderInfo:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=shanghuqueren&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            saveOrderInfo:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=updatexinren&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            completeOrder:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=shanghuquerenwancheng&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryOrderListByType:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=orders&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            query_dangqi_info:function(year,month,day){
                var url = domain + '/wap/index.php?ctl=bizjg_dangqi&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],yy:year,mm:month,dd:day};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            cancelOrder:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizjg_yuyue&act_2=cancelorder&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    })
    .factory('SdjgUserService', function($q,$http) {
        return {
            queryUserInfo:function(){
                var url = domain + '/wap/index.php?ctl=bizjg_index&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType']};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            get_activity_info:function(id){
                var url = domain + '/wap/index.php?ctl=bizjg_tehui&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],id:id};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            save_activity:function(name,start_time,end_time,content,id){
                var url = domain + '/wap/index.php?ctl=bizjg_tehui&act_2=save&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],
                    name:name,start_time:start_time,end_time:end_time,content:content,id:id};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    })
    .factory('HcUserService', function($q,$http) {
        return {
            queryUserInfo:function(){
                var url = domain + '/wap/index.php?ctl=bizhc_index&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType']};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryUserDetail:function(){
                var url = domain + '/wap/index.php?ctl=bizhc_item&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType']};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            get_activity_info:function(id){
                var url = domain + '/wap/index.php?ctl=bizhc_tehui&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],id:id};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            save_activity:function(name,start_time,end_time,content,id){
                var url = domain + '/wap/index.php?ctl=bizhc_tehui&act_2=save&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],
                    name:name,start_time:start_time,end_time:end_time,content:content,id:id};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    })
    .factory('HcOrderService', function($q,$http) {
        return {
            getHcMainOrder:function(){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType']};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryOneOrderInfo:function(id){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=orderinfo&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],id:id};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            query_dangqi_info:function(year,month,day){
                var url = domain + '/wap/index.php?ctl=bizhc_dangqi&post_type=json';
                var params = {biz_email: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],yy:year,mm:month,dd:day};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            get_xuhao_by_dangqi:function(type,date){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=get_yuyuexuhao&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],type:type,date:date};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryAddInitInfo:function(date){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=xianxia&post_type=json';
                var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword'],biz_type:window.localStorage['userType'],date:date};
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            saveNewOrderInfo: function (paramsJson) {
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=xianxia_do&post_type=json';
                //var params = {biz_account: window.localStorage['userName'], biz_pwd: window.localStorage['userPassword']};
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            confirmOrderInfo:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=shanghuqueren&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            saveOrderInfo:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=updatexinren&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            completeOrder:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=shanghuquerenwancheng&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            queryOrderListByType:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=orders&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            cancelOrder:function(paramsJson){
                var url = domain + '/wap/index.php?ctl=bizhc_yuyue&act_2=cancelorder&post_type=json';
                var params = paramsJson;
                params.biz_account = window.localStorage['userName'];
                params.biz_pwd = window.localStorage['userPassword'];
                params.biz_type = window.localStorage['userType'];
                var deferred = $q.defer();
                $http.post(url, params).success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        }
    });
