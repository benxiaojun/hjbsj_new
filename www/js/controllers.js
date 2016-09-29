var zhushu = new Array();
var hunyan = new Array();
var hunyan_price = new Array();
var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
angular.module('starter.controllers', [])

    .controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state,$http,$ionicHistory,$cordovaToast,$ionicLoading,MessageService,$timeout) {
        $ionicHistory.clearCache();
        $scope.data = {};
        var ut = document.getElementById("userType");
        var utype_value = ut.options[ut.selectedIndex].value;
        if (typeof($scope.data.username) == "undefined" || $scope.data.username == "") {
            $scope.data.username = window.localStorage['userName'];
        }
        if(typeof($scope.data.password) == "undefined" || $scope.data.password == ""){
            $scope.data.password = window.localStorage['userPassword'];
        }
        ut.selectedIndex = window.localStorage['userType'];
        if(window.localStorage['userName'] != undefined && window.localStorage['userPassword'] != undefined && window.localStorage['userType'] != undefined){
            if(window.localStorage['userType'] == 1){//酒店帐号
                $state.go("allAppointment");
            }else if(window.localStorage['userType'] == 2){//四大金刚帐号
                $state.go("newAddedCustomer");
            }else if(window.localStorage['userType'] == 3){//婚车帐号
                $state.go("hcMainOrder");
            }
            $timeout(function(){
                MessageService.bindingJPushId(window.localStorage['registrationID']);
            },6000);
        }
        //window.addEventListener('native.showkeyboard', function(){
        //  $(".div-bottom-ud").css({position:'relative'});
        //});
        //window.addEventListener('native.hidekeyboard', function(){
        //  $(".div-bottom-ud").css({position:'fixed'});
        //});

          $scope.login = function() {
              var ut = document.getElementById("userType");
              var utype_value = ut.options[ut.selectedIndex].value;
              if(utype_value == 0){
                  $cordovaToast.showShortBottom("您还未选择登录类型哦~");
                  return;
              }
              if(window.Connection) {
                  if(navigator.connection.type == Connection.NONE) {
                      $cordovaToast.showShortCenter("网络不给力，请网络良好时再试");
                      return;
                  }
              }
              $ionicLoading.show({
                  template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在登录中，请稍后...</span></div>',
                  hideOnStateChange:true,
                  duration:5000
              });
              //登录
              LoginService.loginUser($scope.data.username, $scope.data.password,utype_value);
              //绑定极光id
              $timeout(function(){
                  MessageService.bindingJPushId(window.localStorage['registrationID']);
              },6000);
          };
            $scope.forgetPwd = function(){
                $ionicPopup.alert({
                    cssClass: 'myPopup',
                    title:"忘记密码",
                    template:"<div align='center'>为保证商户账户安全</br>请致电客服电话<a href='tel:400-838-5018'>400-838-5018</a></br>进行申请密码重置服务</div>",
                    okText: '确定',
                    okType: "button-assertive"
                })
            };
    })
    .controller('settingCtrl', function($scope, $state,LoginService,$ionicHistory) {
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
    })
    .controller('allAppointmentCtrl',function($scope, $state,$stateParams,$ionicScrollDelegate,$ionicPopover,OrderService,UserService,$timeout,$ionicHistory,$rootScope){
        $ionicHistory.clearCache();
        OrderService.getAllAppointment().then(function(results){
            $scope.yanghuiting_count = results.yanghuiting_count;
            $scope.yanghuiting_list = results.yanghuiting_list;
        });
        //$scope.yanghuiting_count = $stateParams.yanghuiting_count;
        //$scope.yanghuiting_list = $stateParams.yanghuiting_list;

        //下拉刷新
        $scope.doRefresh_allAppointment = function() {
            $timeout( function() {
                OrderService.query_allAppointment().then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                    $scope.yanghuiting_count = results.yanghuiting_count;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.doRefresh_allAppointment();

        $scope.slide_allAppointment = function(index){
            $("#detail_yyzb"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_yyzb"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_yyzb"+index).css('display','block');
                $("#down_arrow_yyzb"+index).css('display','none');
            }else{
                $("#up_arrow_yyzb"+index).css('display','none');
                $("#down_arrow_yyzb"+index).css('display','block');
            }
            $ionicScrollDelegate.resize();
        };
        //$scope.expand_yyzb = function(index){
        //    $("#detail_yyzb"+index).slideToggle();
        //    //document.getElementById("detail_yyzb"+index).style.display="block";
        //    document.getElementById("up_arrow_yyzb"+index).style.display = "none";
        //    document.getElementById("down_arrow_yyzb"+index).style.display = "block";
        //}
        //$scope.collapse_yyzb = function(index){
        //    $("#detail_yyzb"+index).slideToggle();
        //    //document.getElementById("detail_yyzb"+index).style.display="none";
        //    document.getElementById("up_arrow_yyzb"+index).style.display = "block";
        //    document.getElementById("down_arrow_yyzb"+index).style.display = "none";
        //}

        $scope.goto_accountCenter = function(){
            UserService.get_sj_info();
        };

        $ionicPopover.fromTemplateUrl("popover.html", {
            scope: $scope
        }).then(function(popover){
                $scope.popover = popover;
            })
        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //销毁事件回调处理：清理popover对象
        $scope.$on("$destroy", function() {
            $scope.popover.remove();
        });
        $scope.goto_schedule_calendar = function(){
            OrderService.get_schedule_info();
        };
        $scope.jump_to_yuyue_tab = function(dangqi){
            OrderService.get_yuyue_info(dangqi);
        };
        $scope.jump_to_kanchang_tab = function(){
            var date = new Date();
            var month = date.getMonth()+1;
            var dangqi = date.getFullYear()+"."+month+"."+date.getDate();
            OrderService.get_kanchang_info(dangqi);
            $scope.popover.hide();
        };
        $scope.jump_to_yuding_tab = function(){
            var date = new Date();
            var month = date.getMonth()+1;
            var dangqi = date.getFullYear()+"."+month+"."+date.getDate();
            OrderService.get_yuding_info(dangqi);
            $scope.popover.hide();
        };
    })
    //.controller('yuyue_zongbiao_ctrl',function($scope, $state,$stateParams,$ionicPopover,OrderService,UserService,$timeout,$ionicHistory){
    //
    //})
    .controller('scheduleShowCtrl',function($scope,$stateParams,UserService,OrderService,$rootScope,$ionicHistory,$cordovaToast,$state,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.yuyueAdd = function(date){
            OrderService.get_yuyue_add_info(date).then(function(results) {
                if(results.yanghuiting_list == null){
                    $cordovaToast.showShortTop("该档期下无可预约宴会厅！");
                    return;
                }else{
                    $state.go("yuyueAdd",{dangqi:date});
                }
            });
        };
        $scope.sj_name = $stateParams.sj_name;
        $scope.items = $stateParams.items;
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        UserService.query_schedule_info(year,month,day).then(function(results){
            $scope.zhuting_status_format = results.item.zhuting_status_format;
            $scope.futing_status_format = results.item.futing_status_format;
        });
        $("#selected_date").html(year+"."+month+"."+day);
        $timeout(function(){
            $("#lunar_date").html($("#ly"+day).text()+"<br>"+$("#lmd"+day).text());
        },500);
        $scope.dangqi = year+"."+month+"."+day;
        var selected_date_array = new Array();
        $(function() {
            $(document).off('shown.calendar.calendario');
            $(document).on('shown.calendar.calendario', function(e, instance){
                selected_date_array = new Array();
                if(!instance) instance = cal;
                var $cell = instance.getCell(new Date().getDate());
                //if($cell.hasClass('fc-today')) $cell.trigger('click.calendario');
                $scope.instance = instance;
                UserService.query_schedule_info(instance.getYear(),instance.getMonth(),null).then(function(results){
                    var items = results.item;
                    for(var key in items){
                        //$scope.instance.getCell(parseInt(key)).removeClass("fc-close");
                        if(items[key].dangqi_status == 1){
                            $scope.instance.getCell(parseInt(key)).addClass("fc-dangqi-jinzhang");
                        }else if(items[key].dangqi_status == 2){
                            $scope.instance.getCell(parseInt(key)).addClass("fc-dangqi-full");
                        }
                    }
                });
            });

            var transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition' : 'transitionend',
                    'OTransition' : 'oTransitionEnd',
                    'msTransition' : 'MSTransitionEnd',
                    'transition' : 'transitionend'
                },
                transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                $wrapper = $( '#custom-inner' ),
                $calendar = $( '#calendar' ),
                cal = $calendar.calendario({
                    onDayClick : function( $el, data, dateProperties ) {
                        $scope.dangqi = dateProperties.year+"."+dateProperties.month+"."+dateProperties.day;
                        $scope.pdate = parseInt(dateProperties.year + parse_date(dateProperties.month) + parse_date(dateProperties.day));
                        if($el[0].firstChild.className !="fc-date fc-emptydate"){
                            $("#selected_date").html(dateProperties.year+"."+dateProperties.month+"."+dateProperties.day);
                            $("#lunar_date").html($("#ly"+dateProperties.day).text()+"<br>"+$("#lmd"+dateProperties.day).text());
                            UserService.query_schedule_info(dateProperties.year,dateProperties.month,dateProperties.day).then(function(results){
                                $scope.zhuting_status_format = results.item.zhuting_status_format;
                                $scope.futing_status_format = results.item.futing_status_format;
                                $scope.zhuting_status = results.item.zhuting_status;
                                $scope.futing_status = results.item.futing_status;
                            });
                            for(var i = 1;i<=31;i++){
                                if(i == parseInt(dateProperties.day)){
                                    $el[0].classList.add("fc-selected");
                                }else if($scope.instance != undefined){
                                    $scope.instance.getCell(parseInt(i)).removeClass("fc-selected");
                                }
                            }
                            //var has_in = false;
                            //for (var key in selected_date_array) {
                            //    if (selected_date_array[key] === $scope.pdate) {
                            //        selected_date_array.splice(key,1);
                            //        $el[0].classList.remove("fc-selected");
                            //        has_in = true;
                            //        break;
                            //    }
                            //}
                            //if(!has_in){
                            //    selected_date_array.push($scope.pdate);
                            //    $el[0].classList.add("fc-selected");
                            //}
                        }
                    },
                    //caldata : codropsEvents,
                    weekabbrs  : [ '日', '一', '二', '三', '四', '五', '六' ],
                    //monthabbrs : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    months  : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    displayWeekAbbr : true,
                    // left-most day in the calendar  0- Sunday, 1 - Monday, ... , 6 - Saturday
                    startIn : 0,
                    events: 'click'
                } ),
                $month = $( '#custom-month' ).html( cal.getMonthName() ),
                $year = $( '#custom-year' ).html( cal.getYear() );

            //cal.setData(codropsEvents);

            $( '#custom-next' ).on( 'click', function() {
                cal.gotoNextMonth( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#custom-prev' ).on( 'click', function() {
                cal.gotoPreviousMonth( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#year-next' ).on( 'click', function() {
                cal.gotoNextYear( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#year-prev' ).on( 'click', function() {
                cal.gotoPreviousYear( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            function updateMonthYear() {
                $month.html( cal.getMonthName() );
                $year.html( cal.getYear() );
                selected_date_array = new Array();
            }
            // just an example..
            function showEvents( contentEl, dateProperties ) {
                hideEvents();
                var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Events for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
                    $close = $( '<span class="custom-content-close"></span>' ).on( 'click', hideEvents );
                $events.append( contentEl.join('') , $close ).insertAfter( $wrapper );
                setTimeout( function() {
                    $events.css( 'top', '0%' );
                }, 25 );
            }
            function hideEvents() {
                var $events = $( '#custom-content-reveal' );
                if( $events.length > 0 ) {
                    $events.css( 'top', '100%' );
                    Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();
                }
            }
        });

        $scope.jump_to_yuyue_tab = function(){
            OrderService.get_yuyue_info($scope.dangqi);
        };
        $scope.jump_to_tab = function(flag){
            if(flag ==1){
                if($scope.zhuting_status == 2){
                    OrderService.get_yuding_info($scope.dangqi);
                }else{
                    OrderService.get_yuyue_info($scope.dangqi);
                }
            }else{
                if($scope.futing_status == 2){
                    OrderService.get_yuding_info($scope.dangqi);
                }else{
                    OrderService.get_yuyue_info($scope.dangqi);
                }
            }
        }
    })
    .controller('tabsCtrl',function($scope,$stateParams,OrderService,$timeout,$ionicHistory,$ionicModal,$rootScope,$cordovaToast,$state){
        //OrderService.get_yuyue_info();
        $ionicHistory.clearCache();
        $scope.backGo = function(){
            if($ionicHistory.backView().stateName == "yuyueAdd"){
                $ionicHistory.goBack(-2);
            }else{
                $ionicHistory.goBack();
            }
        };
        $scope.yuyueAdd = function(dangqi){
            OrderService.get_yuyue_add_info(dangqi).then(function(results) {
                if(results.yanghuiting_list == null){
                    $cordovaToast.showShortTop("该档期下无可预约宴会厅！");
                    return;
                }else{
                    $state.go("yuyueAdd",{dangqi:dangqi});
                }
            });
        };
        $scope.dangqi = $stateParams.dangqi;
        $scope.yanghuiting_count = $stateParams.yanghuiting_count;
        $scope.yanghuiting_list = $stateParams.yanghuiting_list;
        //$scope.goto_schedule = function(dangqi){
        //    $state.go("scheduleShowPage");
        //};
        $scope.goto_schedule_calendar = function(){
            OrderService.get_schedule_info();
        };
        //选中tab事件
        //选中全部tab
        $scope.on_select_all = function(dangqi){
            OrderService.query_all(dangqi).then(function(results){
                $scope.yanghuiting_list = results.yanghuiting_list;
            });
        };
        //选中预约tab
        $scope.on_select_yuyue = function(dangqi){
            //OrderService.query_yuyue(dangqi).then(function (results) {
            //    $scope.yanghuiting_list = results.yanghuiting_list;
            //});
            $timeout( function() {
                $rootScope.doRefresh_yuyue(dangqi);
            }, 1000);
        };
        $scope.open_yuyue_modal = function(yyid,roomid) {
            //预约处理模态框
            $ionicModal.fromTemplateUrl("yuyue_modal.html", {
                scope: $scope,
                animation: "slide-in-up",
                backdropClickToClose: false,
                hardwareBackButtonClose: false
            }).then(function(modal) {
                $scope.yuyue_modal = modal;
            });
            OrderService.get_yuyue_detail(yyid).then(function(results){
                $rootScope.yanghuiting_list_yuyue_modal = results.yanghuiting_list;
                $scope.yanghuiting_list1 = results.yanghuiting_list;
                $scope.room_one = results.yanghuiting_list[roomid];
                $scope.yanghuiting_count1 = results.yanghuiting_count;
                $scope.item = results.item;
                $scope.wtype_yy = 1;
                if(results.yanghuiting_count > 1) {
                    $scope.is_show_yuyue = true;
                }else{
                    $scope.is_show_yuyue = false;
                }
                $scope.total_price = $scope.item.total_price;
                $scope.yuyue_modal.show();
                $('#yuyue_dangqi').focus(function() {
                    this.blur();
                });
                $('#kc_date').focus(function() {
                    this.blur();
                });
                $('#kc_time').focus(function() {
                    this.blur();
                });
                $("#yuyue_kc_dec").attr('disabled',true);
            });
        };
        $scope.closeModal = function() {
            $scope.yuyue_modal.remove();
            //$scope.on_select_yuyue($scope.dangqi);
        };
        //选中看场tab
        $scope.on_select_kanchang = function(dangqi){
            //OrderService.query_kanchang(dangqi).then(function(results){
            //    $scope.yanghuiting_list = results.yanghuiting_list;
            //});
            $timeout( function() {
                $rootScope.doRefresh_kanchang(dangqi);
            }, 500);
        };
        $scope.open_kanchang_modal = function(id,roomid) {
            //看场处理模态框
            $ionicModal.fromTemplateUrl("kanchang_modal.html", {
                scope: $scope,
                animation: "slide-in-up",
                backdropClickToClose: false,
                hardwareBackButtonClose: false
            }).then(function(modal) {
                $scope.kanchang_modal = modal;
            });
            OrderService.get_kanchang_detail(id).then(function(results){
                $scope.yanghuiting_list1 = results.yanghuiting_list;
                $scope.room_one = results.yanghuiting_list[roomid];
                $scope.yanghuiting_count1 = results.yanghuiting_count;
                $scope.item = results.item;
                $scope.wtype_kc = 1;
                if(results.yanghuiting_count > 1) {
                    $scope.is_show_kanchang = true;
                }else{
                    $scope.is_show_kanchang = false;
                }
                $scope.total_price = $scope.item.total_price;
                $scope.kanchang_modal.show();
                $('#kc_dangqi').focus(function() {
                    this.blur();
                });
            })
        };
        $scope.closeModal_kc = function() {
            $scope.kanchang_modal.remove();
            //$scope.on_select_kanchang($scope.dangqi);
        };
        //选中预定tab
        $scope.on_select_yuding = function(dangqi){
            //OrderService.query_yuding(dangqi).then(function(results){
            //    $scope.yanghuiting_list = results.yanghuiting_list;
            //});
            $timeout( function() {
                $rootScope.doRefresh_yuding(dangqi);
            }, 500);
        };

        //查看详情
        $scope.showOrderDetail = function(id,status,roomid){
            if(status == 1){//“申请中”
                //预约处理模态框
                $ionicModal.fromTemplateUrl("yuyue_modal.html", {
                    scope: $scope,
                    animation: "slide-in-up",
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                }).then(function(modal) {
                    $scope.yuyue_modal = modal;
                });
                OrderService.get_yuyue_detail(id).then(function(results){
                    $rootScope.yanghuiting_list_yuyue_modal = results.yanghuiting_list;
                    $scope.yanghuiting_list1 = results.yanghuiting_list;
                    $scope.room_one = results.yanghuiting_list[roomid];
                    $scope.yanghuiting_count1 = results.yanghuiting_count;
                    $scope.item = results.item;
                    $scope.wtype_yy = 0;
                    if(results.yanghuiting_count > 1) {
                        $scope.is_show_yuyue = true;
                    }else{
                        $scope.is_show_yuyue = false;
                    }
                    $scope.total_price = $scope.item.total_price;
                    $scope.yuyue_modal.show();
                    $('#yuyue_dangqi').focus(function() {
                        this.blur();
                    });
                    $('#kc_date').focus(function() {
                        this.blur();
                    });
                    $('#kc_time').focus(function() {
                        this.blur();
                    });
                    $("#yuyue_kc_dec").attr('disabled',true);
                });

                $scope.closeModal = function() {
                    $scope.yuyue_modal.remove();
                    //$scope.on_select_yuyue($scope.dangqi);
                };
            }else if(status == 2){//“看场中”
                //看场处理模态框
                $ionicModal.fromTemplateUrl("kanchang_modal.html", {
                    scope: $scope,
                    animation: "slide-in-up",
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                }).then(function(modal) {
                    $scope.kanchang_modal = modal;
                });
                OrderService.get_kanchang_detail(id).then(function(results){
                    $scope.yanghuiting_list1 = results.yanghuiting_list;
                    $scope.room_one = results.yanghuiting_list[roomid];
                    $scope.yanghuiting_count1 = results.yanghuiting_count;
                    $scope.item = results.item;
                    $scope.wtype_kc = 0;
                    if(results.yanghuiting_count > 1) {
                        $scope.is_show_kanchang = true;
                    }else{
                        $scope.is_show_kanchang = false;
                    }
                    $scope.total_price = $scope.item.total_price;
                    $scope.kanchang_modal.show();
                    $('#kc_dangqi').focus(function() {
                        this.blur();
                    });
                })
                $scope.closeModal_kc = function() {
                    $scope.kanchang_modal.remove();
                    //$scope.on_select_kanchang($scope.dangqi);
                };
            }else if(status == 4 || status ==5){//“已预定”“已完成”
                $state.go("show_yuding_detail",{id:id,wtype:0});
            }else{//“已过期”“已取消”“无档期”
                $state.go("show_canceled_yuyue_detail",{id:id});
            }
        }
    })

    .controller('ctr',function($scope,$ionicTabsDelegate,$stateParams){
        $ionicTabsDelegate.select($stateParams.index);
    })

    .controller('tab_yuyue_ctrl',function($scope,$rootScope,$timeout,OrderService,$ionicModal,$ionicHistory,$state){
        //$ionicHistory.clearCache();
        OrderService.query_yuyue($scope.dangqi).then(function(results){
            $scope.yanghuiting_list = results.yanghuiting_list;
        });

        $rootScope.doRefresh_yuyue = function(date) {
            var dangqi = date == undefined ? $scope.dangqi:date;
            $timeout( function() {
                OrderService.query_yuyue(dangqi).then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.slide_yuyue = function(index){
            $("#detail_yy"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_yy"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_yy"+index).css('display','block');
                $("#down_arrow_yy"+index).css('display','none');
            }else{
                $("#up_arrow_yy"+index).css('display','none');
                $("#down_arrow_yy"+index).css('display','block');
            }
        };
        //$scope.expand_yy = function(index){
        //    $("#detail_yy"+index).slideToggle();
        //    //document.getElementById("detail_yy"+index).style.display="block";
        //    document.getElementById("up_arrow_yy"+index).style.display = "none";
        //    document.getElementById("down_arrow_yy"+index).style.display = "block";
        //}
        //$scope.collapse_yy = function(index){
        //    $("#detail_yy"+index).slideToggle();
        //    //document.getElementById("detail_yy"+index).style.display="none";
        //    document.getElementById("up_arrow_yy"+index).style.display = "block";
        //    document.getElementById("down_arrow_yy"+index).style.display = "none";
        //}

    })
    .controller('tab_all_ctrl',function($scope,$timeout,$rootScope,OrderService){
        //下拉刷新
        $rootScope.doRefresh_all = function(date) {
            var dangqi = date == undefined ? $scope.dangqi:date;
            $timeout( function() {
                OrderService.query_all(dangqi).then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.slide_all = function(index){
            $("#detail_all"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_all"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_all"+index).css('display','block');
                $("#down_arrow_all"+index).css('display','none');
            }else{
                $("#up_arrow_all"+index).css('display','none');
                $("#down_arrow_all"+index).css('display','block');
            }
        };
        //$scope.expand_all = function(index){
        //    $("#detail_all"+index).slideToggle();
        //    //document.getElementById("detail_all"+index).style.display="block";
        //    document.getElementById("up_arrow_all"+index).style.display = "none";
        //    document.getElementById("down_arrow_all"+index).style.display = "block";
        //};
        //$scope.collapse_all = function(index){
        //    $("#detail_all"+index).slideToggle();
        //    //document.getElementById("detail_all"+index).style.display="none";
        //    document.getElementById("up_arrow_all"+index).style.display = "block";
        //    document.getElementById("down_arrow_all"+index).style.display = "none";
        //}
    })

    .controller('tab_kanchang_ctrl',function($scope,$timeout,$ionicModal,OrderService,$state,$rootScope){
        $rootScope.doRefresh_kanchang = function(date) {
            var dangqi = date == undefined ? $scope.dangqi:date;
            $timeout( function() {
                OrderService.query_kanchang(dangqi).then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.slide_kanchang = function(index){
            $("#detail_kanchang"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_kanchang"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_kanchang"+index).css('display','block');
                $("#down_arrow_kanchang"+index).css('display','none');
            }else{
                $("#up_arrow_kanchang"+index).css('display','none');
                $("#down_arrow_kanchang"+index).css('display','block');
            }
        };
        //$scope.expand_kanchang = function(index){
        //    $("#detail_kanchang"+index).slideToggle();
        //    //document.getElementById("detail_kanchang"+index).style.display="block";
        //    document.getElementById("up_arrow_kanchang"+index).style.display = "none";
        //    document.getElementById("down_arrow_kanchang"+index).style.display = "block";
        //};
        //$scope.collapse_kanchang = function(index){
        //    $("#detail_kanchang"+index).slideToggle();
        //    //document.getElementById("detail_kanchang"+index).style.display="none";
        //    document.getElementById("up_arrow_kanchang"+index).style.display = "block";
        //    document.getElementById("down_arrow_kanchang"+index).style.display = "none";
        //};
    })

    .controller('tab_yuding_ctrl',function($scope,$timeout,OrderService,$rootScope){
        $rootScope.doRefresh_yuding = function(date) {
            var dangqi = date == undefined ? $scope.dangqi:date;
            $timeout( function() {
                OrderService.query_yuding(dangqi).then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.slide_yuding = function(index){
            $("#detail_yuding"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_yuding"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_yuding"+index).css('display','block');
                $("#down_arrow_yuding"+index).css('display','none');
            }else{
                $("#up_arrow_yuding"+index).css('display','none');
                $("#down_arrow_yuding"+index).css('display','block');
            }
        };
        //$scope.expand_yuding = function(index){
        //    $("#detail_yuding"+index).slideToggle();
        //    //document.getElementById("detail_yuding"+index).style.display="block";
        //    document.getElementById("up_arrow_yuding"+index).style.display = "none";
        //    document.getElementById("down_arrow_yuding"+index).style.display = "block";
        //};
        //$scope.collapse_yuding = function(index){
        //    $("#detail_yuding"+index).slideToggle();
        //    //document.getElementById("detail_yuding"+index).style.display="none";
        //    document.getElementById("up_arrow_yuding"+index).style.display = "block";
        //    document.getElementById("down_arrow_yuding"+index).style.display = "none";
        //}
    })

    .controller('yuyue_modal_ctrl',function($scope,$state,$ionicPopup,OrderService,$rootScope,$cordovaToast,$ionicScrollDelegate){
        //$scope.yanghuiting_list1 = $rootScope.yanghuiting_list1;

        $scope.dec_num = function(){
            var xuhao = document.getElementById("xuhao").value;
            var oldValue = parseFloat(xuhao);
            var newValue;

            if(oldValue > 0){
                newValue = oldValue - 1;
            }else{
                newValue = 0;
            }
            document.getElementById("xuhao").value = number_format(newValue);
            if(newValue == $scope.item.kanchang_xuhao){
                $("#yuyue_kc_dec").attr('disabled',true);
            }
        };
        $scope.inc_num = function(){
            $("#yuyue_kc_dec").attr('disabled',false);
            var xuhao = document.getElementById("xuhao").value;
            var oldValue = parseFloat(xuhao);
            var newValue;
            newValue = oldValue + 1;
            document.getElementById("xuhao").value = number_format(newValue);
        };
        $scope.sub =function(roomid){
            var oldValue = parseFloat($("#yyzhuoshu"+roomid).val());
            $("#add_yym"+roomid).attr('disabled',false);
            if(oldValue > 1){
                $("#yyzhuoshu"+roomid).val(oldValue-1);
            }else{
                $("#yyzhuoshu"+roomid).val(1);
            }
            if($("#yyzhuoshu"+roomid).val() == 1){
                $("#sub_yym"+roomid).attr('disabled',true);
            }
            calc_total_yymodal();
        }
        $scope.add =function(roomid){
            var oldValue = parseFloat($("#yyzhuoshu"+roomid).val());
            $("#sub_yym"+roomid).attr('disabled',false);
            $("#yyzhuoshu"+roomid).val(oldValue+1);
            //if($("#yyzhuoshu"+roomid).val() == $scope.yanghuiting_list1[roomid].zuoshu){
            //    $("#add_yym"+roomid).attr('disabled',true);
            //}
            calc_total_yymodal();
        };

        var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {

                } else {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("yuyue_dangqi").value = dangqi;
                    var type = $scope.item.yuyue_type;
                    OrderService.get_xuhao(dangqi,type).then(function(results){
                        $("#yuyue_xuhao").html(results.item.xuhao);
                        $("#xuhao").val(results.item.kanchang_xuhao);
                    });
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {

                } else {
                    document.getElementById("kc_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        var kanchang_time2;
        var kanchang_time3;
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("kc_time").value = hour+":"+ minute +" "+ meridian;
                kanchang_time2 = hour+":"+ minute;
                kanchang_time3 = meridian;
            }
        };
        //点击展开
        $scope.expand_yuyue_detail = function(){
            $state.go('yuyue_expand_detail',{yanghuiting_list:$scope.yanghuiting_list1,item:$scope.item});
            $scope.yuyue_modal.remove();
            $scope.on_select_yuyue($scope.dangqi);
        };
        //餐标修改 总预算变化
        $scope.change_cb = function(){
            calc_total_yymodal();
        };
        function calc_total_yymodal(){
            var total = 0;
            for(var key in $scope.yanghuiting_list1) {
                var item = $scope.yanghuiting_list1[key];
                var canbiao = $("#hunyan"+item.id).val();
                var zhuoshu = $("#yyzhuoshu"+item.id).val();
                total += canbiao * zhuoshu;
            }
            $scope.total_price = total.toFixed(2);
        };

        $scope.confirm_kanchang = function(){
            //校验
            if($("#nickname").val() == ""){
                $cordovaToast.showShortTop("预约用户不能为空！");
                return;
            }
            if($("#kc_date").val() == "" || $("#kc_time").val() == ""){
                $cordovaToast.showShortTop("看场日期不能为空！");
                return;
            }
            var dDate = new Date($("#yuyue_dangqi").val().replace(/\./g, "\/"));
            var kDate = new Date($("#kc_date").val().replace(/\./g, "\/"));
            var ctime = $scope.item.create_time;//预约时间戳
            var tmp_date = $("#kc_date").val() +" "+ $("#kc_time").val();
            var kc_time = new Date(tmp_date.replace(/\./g, "\/")).getTime().toString()/1000;//看场时间戳
            if(kDate > dDate  ){
                $cordovaToast.showShortTop("看场日期不能晚于预约档期！");
                return;
            }
            if(kc_time < ctime){
                $cordovaToast.showShortTop("看场时间不能早于预约时间！");
                return;
            }
            var arr = $scope.yanghuiting_list1;
            var length = $scope.yanghuiting_count1;
            $rootScope.tmp_list = $rootScope.yanghuiting_list_yuyue_modal;
            hunyan = [];
            zhushu = [];
            for(var key in $scope.yanghuiting_list1){
                var item = arr[key];
                zhushu[item.id] = $("#yyzhuoshu"+item.id).val();
                hunyan[item.id] = $("#hunyan"+item.id).val();
                $rootScope.tmp_list[item.id].zhushu = $("#yyzhuoshu"+item.id).val();
                $rootScope.tmp_list[item.id].price = $("#hunyan"+item.id).val();
            }
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"看场排期",
                template:"<div align='center'>"+$("#xuhao").val()+"&nbsp;看场日期：<span style='color: #ff7666'>"+$("#kc_date").val()+"&nbsp;"+$("#kc_time").val()+"</span><br>"
                +$("#nickname").val()+"<br>婚宴预定：<span style='color: #ff7666'>"+$("#yuyue_dangqi").val()+"</span><br>"+window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room1 in tmp_list'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room1.name}}：" +
                "￥{{room1.price}}/桌 × {{room1.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br></div>",
                okText: '确认',
                cancelText:'取消',
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    OrderService.confirm_kanchang($scope.item.id,$("#nickname").val(),$("#yuyue_dangqi").val(),zhushu,hunyan,$("#xuhao").val(),
                        $("#kc_date").val(),kanchang_time2,kanchang_time3).then(function(results){
                            $ionicPopup.alert({
                                cssClass: 'myPopup',
                                title:'提示',
                                template:'<div align="center">'+results.info+'</div>',
                                okText: '确定',
                                okType: 'button-assertive'
                            });
                    });
                }else{
                }
                $scope.yuyue_modal.remove();
                //$scope.on_select_yuyue($scope.dangqi);
                if($scope.wtype_yy == 0) {//tab全部进入
                    $rootScope.doRefresh_all($scope.dangqi);
                }else if($scope.wtype_yy == 1) {//tab预约进入
                    $rootScope.doRefresh_yuyue($scope.dangqi);
                }else{//全部预约列表进入
                    $rootScope.doRefresh_all_yuyueOrder();
                    $ionicScrollDelegate.scrollTop();
                }
            });
        }

        $scope.cancel_yuyue = function(){
            var ctime = new Date($scope.item.create_time *1000).format('yyyy.MM.dd');
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"取消预约",
                template:"<div align='center'>"+$("#xuhao").val()+"&nbsp;预约日期：<span style='color:#ff7666'>"+ctime+"</span><br>"
                +$scope.item.nickname+"<br>婚宴预定：<span style='color:#ff7666'>"+$("#yuyue_dangqi").val()+"</span><br>"+window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room1 in yanghuiting_list_yuyue_modal'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room1.name}}：" +
                "￥{{room1.price}}/桌 × {{room1.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br><div class='row row-center' style='margin-top: -20px;'>原因&nbsp;<input type='text' style='width: 170px' id='cancelReason'></div><br>是否确定取消预约？</div>",
                okText: '是',
                cancelText:'否',
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    OrderService.cancel_yuyue($scope.item.id,document.getElementById("cancelReason").value).then(function(results){
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title:'提示',
                            template:'<div align="center">'+results.info+'</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        });
                    });
                }else{
                }
                $scope.yuyue_modal.remove();
                //$scope.on_select_yuyue($scope.dangqi);
                if($scope.wtype_yy == 0) {//tab全部进入
                    $rootScope.doRefresh_all($scope.dangqi);
                }else if($scope.wtype_yy == 1) {//tab预约进入
                    $rootScope.doRefresh_yuyue($scope.dangqi);
                }else{//全部预约列表进入
                    $rootScope.doRefresh_all_yuyueOrder();
                    $ionicScrollDelegate.scrollTop();
                }
            });
        };
    })

    .controller('yuyue_expand_detail_ctrl',function($scope,$stateParams,OrderService,$ionicPopup,$cordovaToast,$state,$rootScope,$ionicHistory){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.yanghuiting_list = $stateParams.yanghuiting_list;
        $scope.item = $stateParams.item;

        $("#yuyue_kc_detail_dec").attr('disabled',true);
        $scope.dec_num = function(){
            var xuhao = document.getElementById("xuhao_detail").value;
            var oldValue = parseFloat(xuhao);
            var newValue;
            if(oldValue > 0){
                newValue = oldValue - 1;
            }else{
                newValue = 0;
            }
            document.getElementById("xuhao_detail").value = number_format(newValue);
            if(newValue == $scope.item.kanchang_xuhao){
                $("#yuyue_kc_detail_dec").attr('disabled',true);
            }
        };
        $scope.inc_num = function(){
            $("#yuyue_kc_detail_dec").attr('disabled',false);
            var xuhao = document.getElementById("xuhao_detail").value;
            var oldValue = parseFloat(xuhao);
            var newValue;
            newValue = oldValue + 1;
            document.getElementById("xuhao_detail").value = number_format(newValue);
        };
        $scope.sub =function(roomid){
            var oldValue = parseFloat($("#yyzhuoshu_detail"+roomid).val());
            $("#add_yym_exp"+roomid).attr('disabled',false);
            if(oldValue > 1){
                $("#yyzhuoshu_detail"+roomid).val(oldValue-1);
            }else{
                $("#yyzhuoshu_detail"+roomid).val(1);
            }
            if($("#yyzhuoshu_detail"+roomid).val() == 1){
                $("#sub_yym_exp"+roomid).attr('disabled',true);
            }
            calc_total_yymodal_exp();
        }
        $scope.add =function(roomid){
            var oldValue = parseFloat($("#yyzhuoshu_detail"+roomid).val());
            $("#sub_yym_exp"+roomid).attr('disabled',false);
            $("#yyzhuoshu_detail"+roomid).val(oldValue+1);
            //if($("#yyzhuoshu_detail"+roomid).val() == $scope.yanghuiting_list[roomid].zuoshu){
            //    $("#add_yym_exp"+roomid).attr('disabled',true);
            //}
            calc_total_yymodal_exp();
        };

        $('#dangqi_detail').focus(function() {
            this.blur();
        });
        $('#kc_date_detail').focus(function() {
            this.blur();
        });
        $('#kc_time_detail').focus(function() {
            this.blur();
        });
        var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("dangqi_detail").value = dangqi;
                    var type = $scope.item.yuyue_type;
                    OrderService.get_xuhao(dangqi,type).then(function(results){
                        $("#yuyue_xuhao_detail").html(results.item.xuhao);
                        $("#xuhao_detail").val(results.item.kanchang_xuhao);
                    });
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("kc_date_detail").value = val.format('yyyy.MM.dd');
                }
            }
        };
        var kanchang_time2;
        var kanchang_time3;
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("kc_time_detail").value = hour+":"+ minute +" "+ meridian;
                kanchang_time2 = hour+":"+ minute;
                kanchang_time3 = meridian;
            }
        };
        //餐标修改 总预算变化
        $scope.total_price = $scope.item.total_price;
        $scope.change_cb = function(){
            calc_total_yymodal_exp();
        };
        function calc_total_yymodal_exp(){
            var total = 0;
            for(var key in $scope.yanghuiting_list) {
                var item = $scope.yanghuiting_list[key];
                var canbiao = $("#hunyan_detail"+item.id).val();
                var zhuoshu = $("#yyzhuoshu_detail"+item.id).val();
                total += canbiao * zhuoshu;
            }
            $scope.total_price = total.toFixed(2);
        };

        $scope.confirm_kanchang = function(){
            //校验
            if($("#nickname_detail").val() == ""){
                $cordovaToast.showShortTop("联系人不能为空！");
                return;
            }
            if($("#kc_date_detail").val() == "" || $("#kc_time_detail").val() == ""){
                $cordovaToast.showShortTop("看场日期不能为空！");
                return;
            }
            var dDate = new Date($("#dangqi_detail").val().replace(/\./g, "\/"));
            var kDate = new Date($("#kc_date_detail").val().replace(/\./g, "\/"));
            var ctime = $scope.item.create_time;//预约时间戳
            var tmp_date = $("#kc_date").val() +" "+ $("#kc_time").val();
            var kc_time = new Date(tmp_date.replace(/\./g, "\/")).getTime().toString()/1000;//看场时间戳
            if(kDate > dDate  ){
                $cordovaToast.showShortTop("看场日期不能晚于预约档期！");
                return;
            }
            if(kc_time < ctime){
                $cordovaToast.showShortTop("看场时间不能早于预约时间！");
                return;
            }
            var arr = $scope.yanghuiting_list;
            $rootScope.tmp_list = $rootScope.yanghuiting_list_yuyue_modal;
            hunyan = [];
            zhushu = [];
            for(var key in arr){
                var item = arr[key];
                zhushu[item.id] = $("#yyzhuoshu_detail"+item.id).val();
                hunyan[item.id] = $("#hunyan_detail"+item.id).val();
                $rootScope.tmp_list[item.id].zhushu = $("#yyzhuoshu_detail"+item.id).val();
                $rootScope.tmp_list[item.id].price = $("#hunyan_detail"+item.id).val();
            }
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"看场排期",
                template:"<div align='center'>"+$("#xuhao_detail").val()+"&nbsp;看场日期：<span style='color: #ff7666'>"+$("#kc_date_detail").val()+"&nbsp;"+$("#kc_time_detail").val()+"</span><br>"
                +$("#nickname_detail").val()+"<br>婚宴预定：<span style='color: #ff7666'>"+$("#dangqi_detail").val()+"</span><br>"+window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room1 in tmp_list'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room1.name}}：" +
                "￥{{room1.price}}/桌 × {{room1.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br></div>",
                okText: '确认',
                cancelText:'取消',
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    OrderService.confirm_kanchang($scope.item.id,$("#nickname_detail").val(),$("#dangqi_detail").val(),zhushu,hunyan,$("#xuhao_detail").val(),
                        $("#kc_date_detail").val(),kanchang_time2,kanchang_time3).then(function(results){
                            $ionicPopup.alert({
                                cssClass: 'myPopup',
                                title:'提示',
                                template:'<div align="center">'+results.info+'</div>',
                                okText: '确定',
                                okType: 'button-assertive'
                            }).then(function(){
                                OrderService.query_yuyue($scope.item.dangqi).then(function(results){
                                    $state.go("tabs", {yanghuiting_count:results.yanghuiting_count,yanghuiting_list:results.yanghuiting_list,dangqi:$scope.item.dangqi,index:1}, {reload: true});
                                });
                            });
                        });
                }else{
                }
            });
        }

        $scope.cancel_yuyue = function(){
            var ctime = new Date($scope.item.create_time *1000).format('yyyy.MM.dd');
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"取消预约",
                template:"<div align='center'>"+$("#xuhao_detail").val()+"&nbsp;预约日期：<span style='color:#ff7666'>"+ctime+"</span><br>"
                +$scope.item.nickname+"<br>婚宴预定：<span style='color:#ff7666'>"+$scope.item.dangqi+"</span><br>"+window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room1 in yanghuiting_list_yuyue_modal'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room1.name}}：" +
                "￥{{room1.price}}/桌 × {{room1.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br><div class='row row-center' style='margin-top: -20px;'>原因&nbsp;<input type='text' style='width: 170px' id='cancelReason'></div>" +
                "<br>是否确定取消预约？</div>",
                okText: '是',
                cancelText:'否',
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    OrderService.cancel_yuyue($scope.item.id,document.getElementById("cancelReason").value).then(function(results){
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title:'提示',
                            template:'<div align="center">'+results.info+'</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        }).then(function(){
                            OrderService.query_yuyue($scope.item.dangqi).then(function(results){
                                $state.go("tabs", {yanghuiting_count:results.yanghuiting_count,yanghuiting_list:results.yanghuiting_list,dangqi:$scope.item.dangqi,index:1}, {reload: true});
                            });
                        });;
                    });
                }else{
                }
            });
        };
    })

    .controller('kanchang_modal_ctrl',function($scope,$state,$ionicPopup,OrderService,$cordovaToast,$rootScope,$ionicScrollDelegate){

        $scope.sub =function(roomid){
            var oldValue = parseFloat($("#kc_zhuoshu"+roomid).val());
            $("#add_kcm"+roomid).attr('disabled',false);
            if(oldValue > 1){
                $("#kc_zhuoshu"+roomid).val(oldValue-1);
            }else{
                $("#kc_zhuoshu"+roomid).val(1);
            }
            if($("#kc_zhuoshu"+roomid).val() == 1){
                $("#sub_kcm"+roomid).attr('disabled',true);
            }
            calc_total_kcmodal();
        }
        $scope.add =function(roomid){
            var oldValue = parseFloat($("#kc_zhuoshu"+roomid).val());
            $("#sub_kcm"+roomid).attr('disabled',false);
            $("#kc_zhuoshu"+roomid).val(oldValue+1);
            //if($("#kc_zhuoshu"+roomid).val() == $scope.yanghuiting_list1[roomid].zuoshu){
            //    $("#add_kcm"+roomid).attr('disabled',true);
            //}
            calc_total_kcmodal();
        }

        var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("kc_dangqi").value = dangqi;
                    var type = $scope.item.yuyue_type;
                    OrderService.get_xuhao(dangqi,type).then(function(results){
                        $("#yuyue_xuhao_kc").html(results.item.xuhao);
                        $("#kanchang_xuhao_kc").html(results.item.kanchang_xuhao);
                    });
                }
            }
        };

        $scope.chaidan = function(){
            $state.go('kanchang_chaidan',{id:$scope.item.id});
            $scope.kanchang_modal.remove();
            if($scope.wtype_kc == 1) {//tab看场进入
                $scope.on_select_kanchang($scope.dangqi);
            }
        };
        //点击展开
        $scope.expand_kanchang_detail = function(){
            $state.go('kanchang_expand_detail',{yanghuiting_list:$scope.yanghuiting_list1,item:$scope.item});
            $scope.kanchang_modal.remove();
            if($scope.wtype_kc == 1) {//tab看场进入
                $scope.on_select_kanchang($scope.dangqi);
            }
        };

        //餐标修改 总预算变化
        $scope.change_cb = function(){
            calc_total_kcmodal();
        };
        function calc_total_kcmodal(){
            var total = 0;
            for(var key in $scope.yanghuiting_list1) {
                var item = $scope.yanghuiting_list1[key];
                var canbiao = $("#kc_hunyan"+item.id).val();
                var zhuoshu = $("#kc_zhuoshu"+item.id).val();
                total += canbiao * zhuoshu;
            }
            $scope.total_price = total.toFixed(2);
        };

        $scope.confirm_yuding = function(){
            //校验
            if($("#kc_nickname").val() == ""){
                $cordovaToast.showShortTop("预约用户不能为空！");
                return;
            }
            var arr = $scope.yanghuiting_list1;
            $rootScope.popup_kc_list = $scope.yanghuiting_list1;
            hunyan = [];
            zhushu = [];
            for(var key in arr){
                var item = arr[key];
                zhushu[item.id] = $("#kc_zhuoshu"+item.id).val();
                hunyan[item.id] = $("#kc_hunyan"+item.id).val();
                $rootScope.popup_kc_list[item.id].zhushu = $("#kc_zhuoshu"+item.id).val();
                $rootScope.popup_kc_list[item.id].price = $("#kc_hunyan"+item.id).val();
            }
            var popup = $ionicPopup.show({
                cssClass: 'myPopup',
                title:"<span class='font-heiti-ud'>确认预定</span>",
                template:"<div align='center'>"+$scope.item.kanchang_xuhao+"&nbsp;看场日期：<span style='color: #ff7666;'>"+$scope.item.action_time+"</span><br>"
                +$scope.item.nickname+"<br>婚宴预定：<span style='color: #ff7666;'>"+$("#kc_dangqi").val()+"</span><br>" +window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room1 in popup_kc_list'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room1.name}}：" +
                "￥{{room1.price}}/桌 × {{room1.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br><div class='row row-center' style='margin-top: -20px;'><div class='col'>预付款</div><div class='col' style='margin-left: -46px;'><input type='tel' id='dingjin' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'/></div></div>" +
                "<br><div class='row row-center' style='margin-top: -30px;'><div class='col'>备注</div><div class='col' style='margin-left: -46px;'><textarea id='comment' rows='3' cols='20' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></textarea></div></div>" +
                "</div>",
                scope: $scope,
                buttons: [
                    {text:'取消'},
                    {
                        text:'确认',
                        type:'button-assertive',
                        onTap: function(e) {
                            if($("#dingjin").val() == ""){
                                $cordovaToast.showShortTop("请输入预付款!");
                                e.preventDefault();
                            }else if(!checkPrice($("#dingjin").val())){
                                $cordovaToast.showShortTop("预付款格式不正确!");
                                e.preventDefault();
                            }else{
                                return true;
                            }
                        }
                    }
                ]
                });
            popup.then(function(res){
                if(res){
                    OrderService.confirm_yuding($scope.item.id,$("#kc_nickname").val(),$("#kc_dangqi").val(),$("#dingjin").val(),zhushu,hunyan,$("#comment").val()).then(function(results){
                            if(results.status == 1){
                                var res_item = results.item;
                                $rootScope.rooms = res_item.yanghuiting_list;
                                $ionicPopup.show({
                                    cssClass: 'myPopup',
                                    title:"<span class='font-heiti-ud'>宴会厅档期</span>",
                                    template:"<div align='center' class='font-heiti-ud'><span style='line-height: 2em;'>请选择需要关闭档期的宴会厅<br>宴会厅档期: "+res_item.dangqi+"</span><br>" +
                                    //"<ion-checkbox ng-repeat='room in rooms' ng-model='room.selected'>" +
                                    //    //"<input type='checkbox'/>" +
                                    //    "<div class='row'><div class='col'>{{room.name}}</div>" +
                                    //    "<div class='col'>已预定{{room.yuding_zhushu_total}}桌<br>还剩余{{room.sheyu_zhushu_total}}桌</div></div>" +
                                    //    //"<i class='checkbox-icon  ion-ios-checkmark assertive'></i>"+
                                    //"</ion-checkbox>" +
                                    "<label class='item item-checkbox ng-valid' ng-repeat='room in rooms' ng-model='room.selected' style='padding: 0px;'>"+
                                    "<div class='checkbox checkbox-assertive checkbox-input-hidden disable-pointer-events checkbox-circle'>" +
                                        "<input type='checkbox' ng-model='room.selected' class='ng-untouched ng-valid ng-dirty ng-valid-parse' value='on'>" +
                                        "<i class='checkbox-icon' style='width: 25px;height: 25px;left:-46%;'></i>"+
                                    "</div>" +
                                    "<div class='item-content disable-pointer-events'>" +
                                        "<div class='row row-center'>" +
                                            "<div class='col' style='flex:3em;'>{{room.name|limitLength}}:</div>" +
                                            "<div class='col' style='margin-left: -3em;'>已预定{{room.yuding_zhushu_total}}桌<br>还剩余{{room.sheyu_zhushu_total}}桌</div>" +
                                        "</div>" +
                                    "</div>" +
                                    "</label>"+
                                    "<br>" +
                                    "</div>",
                                    buttons: [
                                        {
                                            text: '取消',
                                            onTap: function(e) {
                                                $scope.close_button = false;
                                            }
                                        },
                                        {
                                            text: '关闭',
                                            type: 'button-assertive',
                                            onTap: function(e) {
                                                $scope.close_button = true;
                                                var sel_count = 0;
                                                for(var key in $rootScope.rooms){
                                                    if($rootScope.rooms[key].selected){
                                                        sel_count++;
                                                    }
                                                }
                                                if(sel_count == 0){
                                                    $cordovaToast.showShortTop("请选择宴会厅！");
                                                    e.preventDefault();
                                                }
                                            }
                                        }
                                    ]
                                }).then(function(re){
                                    if($scope.close_button){//关闭档期
                                        var yht_id="";
                                        var arr = res_item.yanghuiting_list;
                                        for(var key in $rootScope.rooms){
                                            if($rootScope.rooms[key].selected){
                                                yht_id = yht_id + key + ",";
                                            }
                                        }
                                        OrderService.close_dangqi(yht_id,res_item.dangqi).then(function(data){
                                            $ionicPopup.alert({
                                                cssClass: 'myPopup',
                                                title:'提示',
                                                template:'<div align="center">'+data.info+'</div>',
                                                okText: '确定',
                                                okType: 'button-assertive'
                                            });
                                        })
                                    }else{
                                    }
                                })
                            }else{
                                $ionicPopup.alert({
                                    cssClass: 'myPopup',
                                    title:'提示',
                                    template:'<div align="center">'+results.info+'</div>',
                                    okText: '确定',
                                    okType: 'button-assertive'
                                });
                            }
                        });
                }else{
                }
                $scope.kanchang_modal.remove();
                //$scope.on_select_kanchang($scope.dangqi);
                if($scope.wtype_kc == 0) {//tab全部进入
                    $rootScope.doRefresh_all($scope.dangqi);
                }else if($scope.wtype_kc == 1) {//tab看场进入
                    $rootScope.doRefresh_kanchang($scope.dangqi);
                }else{//全部预约列表进入
                    $rootScope.doRefresh_all_yuyueOrder();
                    $ionicScrollDelegate.scrollTop();
                }
            });
        }

        $scope.cancel_kanchang = function() {
            OrderService.cancel_kanchang($scope.item.id).then(function (results) {
                $ionicPopup.alert({
                    cssClass: 'myPopup',
                    title:'提示',
                    template:'<div align="center">'+results.info+'</div>',
                    okText: '确定',
                    okType: 'button-assertive'
                });
            })
            $scope.kanchang_modal.remove();
            //$scope.on_select_kanchang($scope.dangqi);
            if($scope.wtype_kc == 0) {//tab全部进入
                $rootScope.doRefresh_all($scope.dangqi);
            }else if($scope.wtype_kc == 1) {//tab看场进入
                $rootScope.doRefresh_kanchang($scope.dangqi);
            }else{//全部预约列表进入
                $rootScope.doRefresh_all_yuyueOrder();
                $ionicScrollDelegate.scrollTop();
            }
        }
    })

    .controller('kanchang_expand_detail_ctrl',function($scope,$stateParams,OrderService,$ionicPopup,$state,$cordovaToast,$ionicHistory,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.yanghuiting_list = $stateParams.yanghuiting_list;
        $scope.item = $stateParams.item;

        $scope.sub =function(roomid){
            var oldValue = parseFloat($("#kc_zhuoshu_detail"+roomid).val());
            $("#add_kcm_exp"+roomid).attr('disabled',false);
            if(oldValue > 1){
                $("#kc_zhuoshu_detail"+roomid).val(oldValue-1);
            }else{
                $("#kc_zhuoshu_detail"+roomid).val(1);
            }
            if($("#kc_zhuoshu_detail"+roomid).val() == 1){
                $("#sub_kcm_exp"+roomid).attr('disabled',true);
            }
            calc_total_kcmodal_exp();
        }
        $scope.add =function(roomid){
            var oldValue = parseFloat($("#kc_zhuoshu_detail"+roomid).val());
            $("#sub_kcm_exp"+roomid).attr('disabled',false);
            $("#kc_zhuoshu_detail"+roomid).val(oldValue+1);
            //if($("#kc_zhuoshu_detail"+roomid).val() == $scope.yanghuiting_list[roomid].zuoshu){
            //    $("#add_kcm_exp"+roomid).attr('disabled',true);
            //}
            calc_total_kcmodal_exp();
        };
        $('#kc_dangqi_detail').focus(function() {
            this.blur();
        });
        var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("kc_dangqi_detail").value = dangqi;
                    var type = $scope.item.yuyue_type;
                    OrderService.get_xuhao(dangqi,type).then(function(results){
                        $("#yuyue_xuhao_kc_detail").html(results.item.xuhao);
                        $("#kanchang_xuhao_kc_detail").html(results.item.kanchang_xuhao);
                    });
                }
            }
        };
        //餐标修改 总预算变化
        $scope.total_price = $scope.item.total_price;
        $scope.change_cb = function(){
            calc_total_kcmodal_exp();
        };
        function calc_total_kcmodal_exp(){
            var total = 0;
            for(var key in $scope.yanghuiting_list) {
                var item = $scope.yanghuiting_list[key];
                var canbiao = $("#kc_hunyan_detail"+item.id).val();
                var zhuoshu = $("#kc_zhuoshu_detail"+item.id).val();
                total += canbiao * zhuoshu;
            }
            $scope.total_price = total.toFixed(2);
        };

        $scope.confirm_yuding = function(){
            //校验
            if($("#kc_nickname_detail").val() == ""){
                $cordovaToast.showShortTop("预约用户不能为空！");
                return;
            }
            var arr = $scope.yanghuiting_list;
            $rootScope.popup_kc_detail_list = $scope.yanghuiting_list;
            hunyan = [];
            zhushu = [];
            for(var key in arr){
                var item = arr[key];
                zhushu[item.id] = $("#kc_zhuoshu_detail"+item.id).val();
                hunyan[item.id] = $("#kc_hunyan_detail"+item.id).val();
                $rootScope.popup_kc_detail_list[item.id].zhushu = $("#kc_zhuoshu_detail"+item.id).val();
                $rootScope.popup_kc_detail_list[item.id].price = $("#kc_hunyan_detail"+item.id).val();
            }
            var popup = $ionicPopup.show({
                cssClass: 'myPopup',
                title:"<span class='font-heiti-ud'>确认预定</span>",
                template:"<div align='center'>"+$scope.item.kanchang_xuhao+"&nbsp;看场日期：<span style='color: #ff7666;'>"+$scope.item.action_time+"</span><br>"
                +$("#kc_nickname_detail").val()+"<br>婚宴预定：<span style='color: #ff7666;'>"+$("#kc_dangqi_detail").val()+"</span><br>" +window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room1 in popup_kc_detail_list'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room1.name}}：" +
                "￥{{room1.price}}/桌 × {{room1.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br><div class='row row-center' style='margin-top: -20px;'><div class='col'>预付款</div><div class='col' style='margin-left: -46px;'><input type='tel' id='dingjin' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'/></div></div>" +
                "<br><div class='row row-center' style='margin-top: -30px;'><div class='col'>备注</div><div class='col' style='margin-left: -46px;'><textarea id='comment' rows='3' cols='20' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></textarea></div></div>" +
                "</div>",
                scope: $scope,
                buttons: [
                    {text:'取消'},
                    {
                        text:'确认',
                        type:'button-assertive',
                        onTap: function(e) {
                            if($("#dingjin").val() == ""){
                                $cordovaToast.showShortTop("请输入预付款!");
                                e.preventDefault();
                            }else if(!checkPrice($("#dingjin").val())){
                                $cordovaToast.showShortTop("预付款格式不正确!");
                                e.preventDefault();
                            }else{
                                return true;
                            }
                        }
                    }
                ]
            });
            popup.then(function(res){
                if(res){
                    OrderService.confirm_yuding($scope.item.id,$("#kc_nickname_detail").val(),$("#kc_dangqi_detail").val(),$("#dingjin").val(),zhushu,hunyan,$("#comment").val()).then(function(results){
                        if(results.status == 1){
                            var res_item = results.item;
                            $rootScope.rooms_kc_detail = res_item.yanghuiting_list;
                            $ionicPopup.show({
                                cssClass: 'myPopup',
                                title:"<span class='font-heiti-ud'>宴会厅档期</span>",
                                template:"<div align='center' class='font-heiti-ud'><span style='line-height: 2em;'>请选择需要关闭档期的宴会厅<br>宴会厅档期: "+res_item.dangqi+"</span><br>" +
                                "<label class='item item-checkbox ng-valid' ng-repeat='room in rooms_kc_detail' ng-model='room.selected' style='padding: 0px;'>"+
                                    "<div class='checkbox checkbox-assertive checkbox-input-hidden disable-pointer-events checkbox-circle'>" +
                                        "<input type='checkbox' ng-model='room.selected' class='ng-untouched ng-valid ng-dirty ng-valid-parse' value='on'>" +
                                        "<i class='checkbox-icon' style='width: 25px;height: 25px;left:-46%;'></i>"+
                                    "</div>" +
                                    "<div class='item-content disable-pointer-events'>" +
                                        "<div class='row row-center'>" +
                                            "<div class='col' style='flex:3em;'>{{room.name|limitLength}}:</div>" +
                                            "<div class='col' style='margin-left: -3em;'>已预定{{room.yuding_zhushu_total}}桌<br>还剩余{{room.sheyu_zhushu_total}}桌</div>" +
                                        "</div>" +
                                    "</div>" +
                                "</label>"+
                                "<br>" +
                                "</div>",
                                buttons: [
                                    {
                                        text: '取消',
                                        onTap: function(e) {
                                            $scope.close_button = false;
                                        }
                                    },
                                    {
                                        text: '关闭',
                                        type: 'button-assertive',
                                        onTap: function(e) {
                                            $scope.close_button = true;
                                            var sel_count = 0;
                                            for(var key in $rootScope.rooms_kc_detail){
                                                if($rootScope.rooms_kc_detail[key].selected){
                                                    sel_count++;
                                                }
                                            }
                                            if(sel_count == 0){
                                                $cordovaToast.showShortTop("请选择宴会厅！");
                                                e.preventDefault();
                                            }
                                        }
                                    }
                                ]
                            }).then(function(re){
                                OrderService.query_kanchang($scope.item.dangqi).then(function(results){
                                    $state.go("tabs", {yanghuiting_count:results.yanghuiting_count,yanghuiting_list:results.yanghuiting_list,dangqi:$scope.item.dangqi,index:2}, {reload: true});
                                });
                                if($scope.close_button){//关闭档期
                                    var yht_id="";
                                    var arr = res_item.yanghuiting_list;
                                    for(var key in $rootScope.rooms_kc_detail){
                                        if($rootScope.rooms_kc_detail[key].selected) {
                                            yht_id = yht_id + key + ",";
                                        }
                                    }
                                    OrderService.close_dangqi(yht_id,res_item.dangqi).then(function(data){
                                        $ionicPopup.alert({
                                            cssClass: 'myPopup',
                                            title:'提示',
                                            template:'<div align="center">'+data.info+'</div>',
                                            okText: '确定',
                                            okType: 'button-assertive'
                                        });
                                    })
                                }else{
                                }
                            })
                        }
                    });
                }else{
                }
            });
        };

        $scope.cancel_kanchang = function(){
            OrderService.cancel_kanchang($scope.item.id).then(function (data) {
                $ionicPopup.alert({
                    cssClass: 'myPopup',
                    title:'提示',
                    template:'<div align="center">'+data.info+'</div>',
                    okText: '确定',
                    okType: 'button-assertive'
                }).then(function(res){
                    OrderService.query_kanchang($scope.item.dangqi).then(function(results){
                        $state.go("tabs", {yanghuiting_count:results.yanghuiting_count,yanghuiting_list:results.yanghuiting_list,dangqi:$scope.item.dangqi,index:2}, {reload: true});
                    });
                });
            })
        };
    })

    .controller('kanchang_chaidan_ctrl',function($scope,$stateParams,OrderService,$cordovaToast,$ionicPopup,$state,$ionicHistory,$rootScope,$timeout,$ionicLoading,$ionicScrollDelegate){
        //$ionicHistory.clearCache();
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $ionicLoading.show({
            template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
            duration:2000
        });
        zhushu = [];
        hunyan = [];
        hunyan_price = [];
        var sel_room_count = 0;//选中宴会厅数量
        $rootScope.chaidan_tmp_list = new Array();
        OrderService.query_chaidan_info($stateParams.id).then(function(results){
            $scope.yanghuiting_list = results.yanghuiting_list;
            $scope.item = results.item;
            $scope.rooms = chunk(results.yanghuiting_list,3);
            $scope.is_checked_room = new Array();
            for(var key in $scope.yanghuiting_list){
                if($scope.yanghuiting_list[key].is_checked){
                    $scope.is_checked_room.push($scope.yanghuiting_list[key]);
                    zhushu[key] = $scope.yanghuiting_list[key].zhushu;
                    hunyan[key] = $scope.yanghuiting_list[key].price;
                    hunyan_price[key] = $scope.yanghuiting_list[key].price;
                    sel_room_count++;
                    $rootScope.chaidan_tmp_list[key] = $scope.yanghuiting_list[key];
                }
            }
            $scope.kanchang_date = $scope.item.action_time.substring(0,10);
            $scope.kanchang_time = $scope.item.action_time.substring(11);
        });
        //view加载完成执行操作
        $scope.$on('$ionicView.afterEnter', function(){
            $timeout( function() {
                for (var key in $scope.is_checked_room) {
                    $("#room" + $scope.is_checked_room[key].id).attr("checked", true);
                }
            },1000);
        });
        //选择宴会厅
        $scope.select_room = function(index,id){
            $ionicScrollDelegate.resize();
            var room = $scope.yanghuiting_list[id];
            var is_checked = document.getElementById("room"+id).checked;
            if(is_checked){//选中
                //default_id = id;
                zhushu[id] = 1;
                hunyan[id] = 0;
                hunyan_price[id] = 0;
                sel_room_count++;
                $rootScope.chaidan_tmp_list[id] = {};
                $rootScope.chaidan_tmp_list[id].name = room.name;

                $("#change").append('<div id="button'+id+'" class="row yuyue-modal-detail-ud" style="margin: -15px 0px -15px 0px;line-height: 38px;">' +
                    '<div class="col" style="margin-left: 1%;">' +
                        '<span style="float: left">￥</span>' +
                        '<input type="number" id="chaidan_hunyan'+id+'" style="width: 60px;float: left;border: 1px solid #ECE4E3;border-radius:3px;text-align: center;" onkeyup="change_cb('+id+')" value="0"/>' +
                        '<span style="float: left">/桌</span>' +
                    '</div>' +
                    '<div class="col" style="margin-left: -25px;margin-right: -15%">'+limitString(room.name)+'</div>' +
                    '<div class="col" style="width: 300px;margin-right: 5%;">' +
                        '<button class="button button-small" id="sub_chaidan'+id+'" style="float: left;border:solid rgba(211,211,211,1) 1px;font-size:18px;" disabled="disabled" onclick="sub_chaidan('+id+')">-</button>' +
                        '<input type="text" id="chaidan_zhuoshu'+id+'" class="text-middle-ud" style="height: 31px;background-color:rgb(221, 221, 221);" disabled="disabled" value="1"/> ' +
                        '<button class="button button-small" id="add_chaidan'+id+'" style="float: left;border:solid rgba(211,211,211,1) 1px;font-size:18px;" onclick="add_chaidan('+id+')">+</button>' +
                    '</div>' +
                    '</div>');

                $("#room_info").append('<div id="room_div'+id+'" class="row yuyue-modal-detail-ud">' +
                    '<div class="col col-66">'+limitString(room.name)+'<br>'+room.area+'㎡ ×'+room.height+'h  &nbsp;&nbsp;已预约'+room.yuyue+'人<br>可容纳'+room.zuoshu+'桌</div>'+
                    '<div class="col"><img src="'+room.pinmiantu+'" style="width: 50px;height: 50px"></div>' +
                    '</div>');
            }else{
                hunyan.splice(id,1,"");//移除相应数组元素
                zhushu.splice(id,1,"");
                hunyan_price.splice(id,1,"");
                $rootScope.chaidan_tmp_list.splice(id,1,"");
                sel_room_count--;
                calc_total();
                $("#button"+id).remove();
                $("#room_div"+id).remove();
            }
        };
        $scope.change_cb = function(roomid){
            hunyan_price[roomid] = $("#chaidan_hunyan"+roomid).val();
            //hunyan[roomid] = $("#chaidan_hunyan"+roomid).val();
            calc_total();
        };

        $scope.add = function(roomid){
            var oldValue = parseFloat($("#chaidan_zhuoshu"+roomid).val());
            $("#sub_chaidan"+roomid).attr('disabled',false);
            $("#chaidan_zhuoshu"+roomid).val(oldValue + 1);
            //if($("#zhuoshu"+index).val() == $scope.yanghuiting_list[index].zuoshu){
            //    $("#add0").attr('disabled',true);
            //}
            zhushu[roomid] = $("#chaidan_zhuoshu"+roomid).val();
            calc_total();
        }
        $scope.sub = function(roomid){
            var oldValue = parseFloat($("#chaidan_zhuoshu"+roomid).val());
            $("#add_chaidan"+roomid).attr('disabled',false);
            if(oldValue > 1){
                $("#chaidan_zhuoshu"+roomid).val(oldValue - 1);
            }else{
                $("#chaidan_zhuoshu"+roomid).val(1);
            }
            if($("#chaidan_zhuoshu"+roomid).val() == 1){
                $("#sub_chaidan"+roomid).attr('disabled',true);
            }
            zhushu[roomid] = $("#chaidan_zhuoshu"+roomid).val();
            calc_total();
        };

        $('#kc_date_chaidan').focus(function() {
            this.blur();
        });
        $('#kc_time_chaidan').focus(function() {
            this.blur();
        });
        //日期选择
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {

                } else {
                    document.getElementById("kc_date_chaidan").value = val.format('yyyy.MM.dd');
                }
            }
        };
        var kanchang_time2;
        var kanchang_time3;
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                kanchang_time2 = hour+":"+ minute;
                kanchang_time3 = meridian;
                document.getElementById("kc_time_chaidan").value = hour+":"+ minute +" "+ meridian;
            }
        };

        $scope.confirm_yuding = function(){
            //校验
            if(sel_room_count == 0){
                $cordovaToast.showShortTop('您还未选择宴会厅！');
                return;
            }
            if($("#chaidan_nickname").val()==""){
                $cordovaToast.showShortTop('联系人不能为空！');
                return;
            }
            if($("#chaidan_phone").val()==""){
                $cordovaToast.showShortTop('联系电话不能为空！');
                return;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#chaidan_phone").val()) && !isPhone.test($("#chaidan_phone").val())){
                $cordovaToast.showShortTop('联系电话格式不正确,请重新输入！');
                return;
            }
            if($("#kc_date_chaidan").val()==""){
                $cordovaToast.showShortTop('看场日期不能为空！');
                return;
            }
            if($("#kc_time_chaidan").val()==""){
                $cordovaToast.showShortTop('看场时间不能为空！');
                return;
            }
            var dDate = new Date($scope.item.dangqi.replace(/\./g, "\/"));
            var kDate = new Date($("#kc_date_chaidan").val().replace(/\./g, "\/"));
            if(kDate > dDate  ){
                $cordovaToast.showShortTop("看场日期不能晚于预约档期！");
                return;
            }

            for(var key in $rootScope.chaidan_tmp_list){
                zhushu[key] = $("#chaidan_zhuoshu"+key).val();
                hunyan[key] = $("#chaidan_hunyan"+key).val();
                $rootScope.chaidan_tmp_list[key].price = hunyan_price[key];
                $rootScope.chaidan_tmp_list[key].zhushu = zhushu[key];
            }
            $rootScope.chaidan_tlist = new Array();
            for(var key in  $rootScope.chaidan_tmp_list){
                if($rootScope.chaidan_tmp_list[key] != ""){
                    $rootScope.chaidan_tlist.push($rootScope.chaidan_tmp_list[key]);
                }
            }

            var popup = $ionicPopup.show({
                cssClass: 'myPopup',
                title:"<span class='font-heiti-ud'>确认预定</span>",
                template:"<div align='center'>"+$scope.item.kanchang_xuhao+"&nbsp;看场日期&nbsp;"+$("#kc_date_chaidan").val()+"&nbsp;"+$("#kc_time_chaidan").val()+"<br>"
                +$("#chaidan_nickname").val()+"<br>"+$scope.item.dangqi+"婚宴预定<br>" +window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room in chaidan_tlist'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room.name|limitLength}}" +
                "￥{{room.price}}/桌 × {{room.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br><div class='row row-center' style='margin-top: -20px;'><div class='col'>预付款</div><div class='col' style='margin-left: -46px;'><input type='tel' id='dingjin' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'/></div></div>" +
                "<br><div class='row row-center' style='margin-top: -30px;'><div class='col'>备注</div><div class='col' style='margin-left: -46px;'><textarea id='comment' rows='3' cols='20' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></textarea></div></div>" +
                "</div>",
                scope: $scope,
                buttons: [
                    {text:'取消'},
                    {
                        text:'确认',
                        type:'button-assertive',
                        onTap: function(e) {
                            if($("#dingjin").val() == ""){
                                $cordovaToast.showShortTop("请输入预付款!");
                                e.preventDefault();
                            }else if(!checkPrice($("#dingjin").val())){
                                $cordovaToast.showShortTop("预付款格式不正确!");
                                e.preventDefault();
                            }else{
                                return true;
                            }
                        }
                    }
                ]
            });
            popup.then(function(res){
                if(res){
                    OrderService.confirm_yuding_chaidan($scope.item.id,$("#chaidan_nickname").val(),$("#chaidan_phone").val(),$("#dingjin").val(),zhushu,hunyan,$("#kc_date_chaidan").val()
                        ,$("#kc_time_chaidan").val().substring(0,5),$("#kc_time_chaidan").val().substring(6),$("#comment").val()).then(function(results){
                        if(results.status == 1){
                            var res_item = results.item;
                            $rootScope.rooms_chaidan = res_item.yanghuiting_list;
                            $ionicPopup.show({
                                cssClass: 'myPopup',
                                title:"<span class='font-heiti-ud'>宴会厅档期</span>",
                                template:"<div align='center' class='font-heiti-ud'><span style='line-height: 2em;'>请选择需要关闭档期的宴会厅<br>宴会厅档期: "+res_item.dangqi+"</span><br>" +
                                "<label class='item item-checkbox ng-valid' ng-repeat='room in rooms_chaidan' ng-model='room.selected' style='padding: 0px;'>"+
                                "<div class='checkbox checkbox-input-hidden disable-pointer-events checkbox-circle'>" +
                                "<input type='checkbox' ng-model='room.selected' class='ng-untouched ng-valid ng-dirty ng-valid-parse' value='on'>" +
                                "<i class='checkbox-icon' style='width: 23px;height: 23px;left:-46%;'></i>"+
                                "</div>" +
                                "<div class='item-content disable-pointer-events'>" +
                                "<div class='row row-center'>" +
                                "<div class='col' style='flex:3em;'>{{room.name|limitLength}}:</div>" +
                                "<div class='col' style='margin-left: -3em;'>已预定{{room.yuding_zhushu_total}}桌<br>还剩余{{room.sheyu_zhushu_total}}桌</div>" +
                                "</div>" +
                                "</div>" +
                                "</label>"+
                                "<br>" +
                                "</div>",
                                buttons: [
                                    {
                                        text: '取消',
                                        onTap: function(e) {
                                            $scope.close_button = false;
                                        }
                                    },
                                    {
                                        text: '关闭',
                                        type: 'button-assertive',
                                        onTap: function(e) {
                                            $scope.close_button = true;
                                            var sel_count = 0;
                                            for(var key in $rootScope.rooms_chaidan){
                                                if($rootScope.rooms_chaidan[key].selected){
                                                    sel_count++;
                                                }
                                            }
                                            if(sel_count == 0){
                                                $cordovaToast.showShortTop("请选择宴会厅！");
                                                e.preventDefault();
                                            }
                                        }
                                    }
                                ]
                            }).then(function(re){
                                $ionicHistory.goBack();
                                $rootScope.doRefresh_kanchang($scope.item.dangqi);
                                //OrderService.query_kanchang($scope.item.dangqi).then(function(results){
                                //    $state.go("tabs", {yanghuiting_count:results.yanghuiting_count,yanghuiting_list:results.yanghuiting_list,dangqi:$scope.item.dangqi,index:2}, {reload: true});
                                //});
                                if($scope.close_button){//关闭档期
                                    var yht_id="";
                                    for(var key in $rootScope.rooms_chaidan){
                                        if($rootScope.rooms_chaidan[key].selected){
                                            yht_id = yht_id + key + ",";
                                        }
                                    }
                                    OrderService.close_dangqi(yht_id,res_item.dangqi).then(function(data){
                                        $ionicPopup.alert({
                                            cssClass: 'myPopup',
                                            title:'提示',
                                            template:'<div align="center">'+data.info+'</div>',
                                            okText: '确定',
                                            okType: 'button-assertive'
                                        });
                                    })
                                }else{
                                }
                            })
                        }else{
                            $cordovaToast.showShortTop(results.info);
                            return;
                        }
                    });
                }else{
                }
            });
        };
        $scope.cancel_yuding = function(){
            OrderService.cancel_kanchang($scope.item.id).then(function (data) {
                $ionicPopup.alert({
                    cssClass: 'myPopup',
                    title:'提示',
                    template:'<div align="center">'+data.info+'</div>',
                    okText: '确定',
                    okType: 'button-assertive'
                }).then(function(){
                    $ionicHistory.goBack();
                    $rootScope.doRefresh_kanchang($scope.item.dangqi);
                    //OrderService.query_kanchang($scope.item.dangqi).then(function(results){
                    //    $state.go("tabs", {yanghuiting_count:results.yanghuiting_count,yanghuiting_list:results.yanghuiting_list,dangqi:$scope.item.dangqi,index:2}, {reload: true});
                    //});
                });
            })
        };
    })

    .controller('yuyueAddCtrl',function($scope,OrderService,$ionicPopup,$stateParams,$rootScope,$cordovaToast,$ionicHistory,$timeout,$ionicLoading,$ionicScrollDelegate){
        //$ionicHistory.clearCache();
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $ionicLoading.show({
            template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
            duration:2000
        });
        var date = $stateParams.dangqi;
        //var date = new Date().format('yyyy.MM.dd');
        var default_id;
        hunyan = [];
        zhushu = [];
        var sel_room_count = 1;//选中宴会厅数量
        $scope.no_room_checked = false;
        $rootScope.yuyue_tmp_list = new Array();

        OrderService.get_yuyue_add_info(date).then(function(results){
            $scope.yanghuiting_list = results.yanghuiting_list;
            $scope.room_one = results.yanghuiting_list[0];
            $scope.item = results.item;
            $scope.rooms = chunk(results.yanghuiting_list,3);
            $scope.hunyan = chunk($scope.room_one.hunyan_list,4);
            $scope.yuyue_xuhao = results.item.xuhao;
            $scope.kanchang_xuhao = results.item.kanchang_xuhao;
            default_id = $scope.room_one.id;
            initTotal();
            //确认弹框中list显示
            $rootScope.yuyue_tmp_list[$scope.room_one.id] = {};
            $rootScope.yuyue_tmp_list[$scope.room_one.id].name = $scope.room_one.name;
        });


        //view加载完成执行操作
        $scope.$on('$ionicView.afterEnter', function () {
            $timeout( function() {
                document.getElementsByName("group")[0].checked = true;
                document.getElementsByName("yuyue_cb")[0].checked = true;
                $scope.select_cb(default_id, $scope.room_one.hunyan_list[0].price, $scope.room_one.hunyan_list[0].id);
                //$("#change").append('<div id="button0"><span style="float: left;">'+$scope.room_one.name+'</span>' +
                //    '<button class="button button-small" style="float: left;" onclick="sub(0,'+$scope.room_one.id+')">-</button>' +
                //    '<input type="text" id="zhuoshu0" class="text-middle-ud" value="0" /> ' +
                //    '<button class="button button-small" style="float: left;" onclick="add(0,'+$scope.room_one.id+')">+</button></div>');
            },1000);
        });


        function initTotal(){
            zhushu[default_id] = 1;
            hunyan[default_id] = $scope.room_one.hunyan_list[0].id;
            hunyan_price[default_id] = $scope.room_one.hunyan_list[0].price;
            calc_total();
        }

        //选择宴会厅
        $scope.select_room = function(index,id){
            $ionicScrollDelegate.resize();
            var room;
            for(var key in $scope.yanghuiting_list){
                if($scope.yanghuiting_list[key].id == id){
                    room = $scope.yanghuiting_list[key];
                    break;
                }
            }
            var is_checked = document.getElementById("room"+id).checked;
            if(is_checked){//选中
                document.getElementById("yuyue_cy").style.display = "block";
                $scope.hunyan = chunk(room.hunyan_list,4);
                default_id = id;
                zhushu[id] = 1;
                sel_room_count++;
                $rootScope.yuyue_tmp_list[id] = {};
                $rootScope.yuyue_tmp_list[id].name = room.name;

                $("#change").append('<div id="button'+id+'" class="row yuyue-modal-detail-ud text-color-ud" style="line-height: 35px;">' +
                    '<div class="col" style="margin-left: 1%;"><span id="price'+id+'"></span></div>' +
                    '<div class="col" style="margin-left: -35px;margin-right: -15%"><span style="float: left;">'+limitString(room.name)+'</span></div>' +
                    '<div class="col" style="width: 300px;margin-right: 5%;"><button class="button button-small" id="sub'+id+'" style="float: left;border:solid rgba(211,211,211,1) 1px;font-size:18px;" disabled="disabled" onclick="sub('+id+')">-</button>' +
                    '<input type="text" id="zhuoshu'+id+'" class="text-middle-ud" style="height: 31px;background-color:rgb(221, 221, 221);" disabled="disabled" value="1"/> ' +
                    '<button class="button button-small" id="add'+id+'" style="float: left;border:solid rgba(211,211,211,1) 1px;font-size:18px;" onclick="add('+id+','+room.zuoshu+')">+</button></div></div>');

                $("#room_info").append('<div id="room_div'+id+'" class="row yuyue-modal-detail-ud text-color-ud">' +
                    '<div class="col col-66">'+limitString(room.name)+'<br>'+room.area+'㎡×'+room.height+'h  &nbsp;&nbsp;已预约'+room.yuyue_total+'人<br>可容纳'+room.zuoshu+'桌</div>'+
                    '<div class="col"><img src="'+room.pinmiantu+'" style="width: 50px;height: 50px"></div>' +
                    '</div>');

                $scope.select_cb(id,room.hunyan_list[0].price,room.hunyan_list[0].id);
            }else{
                hunyan.splice(id,1,"");//移除相应数组元素
                zhushu.splice(id,1,"");
                $rootScope.yuyue_tmp_list.splice(id,1,"");
                sel_room_count--;
                calc_total();
                document.getElementById("yuyue_cy").style.display = "none";
                $("#button"+id).remove();
                $("#room_div"+id).remove();
            }

            //一个宴会厅都未选中，预约餐宴不让选
            if(sel_room_count == 0){
                $scope.no_room_checked = true;
            } else{
                $scope.no_room_checked = false;
            }
        };
        //选择餐标
        $scope.select_cb = function(yht_id,price,id){
            hunyan[default_id] = id;
            hunyan_price[default_id] = price;
            document.getElementById("price"+yht_id).innerHTML = "￥"+price+"/桌";
            calc_total();
        };


        $scope.add = function(index){
            var oldValue = parseFloat($("#zhuoshu"+index).val());
            $("#sub0").attr('disabled',false);
            $("#zhuoshu"+index).val(oldValue + 1);
            //if($("#zhuoshu"+index).val() == $scope.yanghuiting_list[index].zuoshu){
            //    $("#add0").attr('disabled',true);
            //}
            zhushu[$scope.room_one.id] = $("#zhuoshu"+index).val();
            calc_total();
        }
        $scope.sub = function(index){
            var oldValue = parseFloat($("#zhuoshu"+index).val());
            $("#add0").attr('disabled',false);
            if(oldValue > 1){
                $("#zhuoshu"+index).val(oldValue - 1);
            }else{
                $("#zhuoshu"+index).val(1);
            }
            if($("#zhuoshu"+index).val() == 1){
                $("#sub0").attr('disabled',true);
            }
            zhushu[$scope.room_one.id] = $("#zhuoshu"+index).val();
            calc_total();
        };
        $('#dangqi').focus(function() {
            this.blur();
        });
        $('#kanchang_date').focus(function() {
            this.blur();
        });
        $('#kanchang_time').focus(function() {
            this.blur();
        });
        //日期选择
        var monthList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {

                } else {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("dangqi").value = dangqi;
                    var type = 1;//线下
                    OrderService.get_xuhao(dangqi,type).then(function(results){
                        $scope.yuyue_xuhao = results.item.xuhao;
                        $scope.kanchang_xuhao = results.item.kanchang_xuhao;
                    });
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {

                } else {
                    document.getElementById("kanchang_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        var kanchang_time2;
        var kanchang_time3;
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                kanchang_time2 = hour+":"+ minute;
                kanchang_time3 = meridian;
                document.getElementById("kanchang_time").value = hour+":"+ minute +" "+ meridian;
            }
        };
        $scope.confirm_yuyue = function(){
            //OrderService
            if(sel_room_count == 0){
                $cordovaToast.showShortTop('您还未选择宴会厅！');
                return;
            }
            if($("#nickname").val()==""){
                $cordovaToast.showShortTop('联系人不能为空！');
                return;
            }
            if($("#phone").val()==""){
                $cordovaToast.showShortTop('联系电话不能为空！');
                return;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#phone").val()) && !isPhone.test($("#phone").val())){
                $cordovaToast.showShortTop('联系电话格式不正确,请重新输入！');
                return;
            }
            if($("#kanchang_date").val()==""){
                $cordovaToast.showShortTop('看场日期不能为空！');
                return;
            }
            if($("#kanchang_time").val()==""){
                $cordovaToast.showShortTop('看场时间不能为空！');
                return;
            }
            var dDate = new Date($("#dangqi").val().replace(/\./g, "\/"));
            var kDate = new Date($("#kanchang_date").val().replace(/\./g, "\/"));
            if(kDate > dDate  ){
                $cordovaToast.showShortTop("看场日期不能晚于预约档期！");
                return;
            }

            for(var key in $rootScope.yuyue_tmp_list){
                $rootScope.yuyue_tmp_list[key].price = hunyan_price[key];
                $rootScope.yuyue_tmp_list[key].zhushu = zhushu[key];
            }
            $rootScope.tlist = new Array();
            for(var key in  $rootScope.yuyue_tmp_list){
                if($rootScope.yuyue_tmp_list[key] != ""){
                    $rootScope.tlist.push($rootScope.yuyue_tmp_list[key]);
                }
            }

            var popup = $ionicPopup.show({
                cssClass: 'myPopup',
                title:"<span class='font-heiti-ud'>预约完成</span>",
                template:"<div align='center' class='font-heiti-ud'>"+$scope.item.kanchang_xuhao+" 看场日期：<span style='color: #ff7666'>"+$("#kanchang_date").val()+"&nbsp;"+kanchang_time2+kanchang_time3
                +"</span><br>"+$("#nickname").val()+"<br>婚宴预定：<span style='color: #ff7666'>"+$("#dangqi").val()+"</span><br>"+window.localStorage['sj_name']+
                "<br><div class='list' ng-repeat='room in tlist'>" +
                "<div class='row' style='height: 2px;'>" +
                "<div class='col'>{{room.name|limitLength}}：" +
                "￥{{room.price}}/桌 × {{room.zhushu}}</div>" +
                "</div>" +
                "</div>"+
                "<br><div class='row row-center' style='margin-top: -20px;'><div class='col'>预付款</div><div class='col' style='margin-left: -46px;'><input type='tel' id='dingjin' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></div></div>" +
                "<br><div class='row row-center' style='margin-top: -30px;'><div class='col'>备注</div><div class='col' style='margin-left: -46px;'><textarea id='comment' rows='3' cols='20' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></textarea></div></div>" +
                "</div>",
                buttons: [
                    {text: '看场'},
                    {
                        text: '预定',
                        type: 'button-assertive',
                        onTap: function(e) {
                            if($("#dingjin").val() == ""){
                                $cordovaToast.showShortTop("请输入预付款！");
                                e.preventDefault();
                            }else if(!checkPrice($("#dingjin").val())){
                                $cordovaToast.showShortTop("预付款格式不正确!");
                                e.preventDefault();
                            }else{
                                return true;
                            }
                        }
                    }
                ]
            });
            popup.then(function(res) {
                if (res) {
                    OrderService.confirm_yuyue($("#dangqi").val(),zhushu,hunyan,$("#nickname").val(),$("#phone").val(),$("#kanchang_date").val(),kanchang_time2,kanchang_time3,
                        1,document.getElementById("dingjin").value,$("#comment").val()).then(function (results) {
                            if(results.status == 1){
                                var res_item = results.item;
                                $rootScope.rooms_add_yuyue = res_item.yanghuiting_list;
                                $ionicPopup.show({
                                    cssClass: 'myPopup',
                                    title:"<span class='font-heiti-ud'>宴会厅档期</span>",
                                    template:"<div align='center' class='font-heiti-ud'><span style='line-height: 2em;'>请选择需要关闭档期的宴会厅<br>宴会厅档期: "+res_item.dangqi+"</span><br>" +
                                    "<label class='item item-checkbox ng-valid' ng-repeat='room in rooms_add_yuyue' ng-model='room.selected' style='padding: 0px;'>"+
                                    "<div class='checkbox checkbox-assertive checkbox-input-hidden disable-pointer-events checkbox-circle'>" +
                                    "<input type='checkbox' ng-model='room.selected' class='ng-untouched ng-valid ng-dirty ng-valid-parse' value='on'>" +
                                    "<i class='checkbox-icon' style='width: 25px;height: 25px;left:-46%;'></i>"+
                                    "</div>" +
                                    "<div class='item-content disable-pointer-events'>" +
                                    "<div class='row row-center'>" +
                                    "<div class='col' style='flex:3em;'>{{room.name|limitLength}}:</div>" +
                                    "<div class='col' style='margin-left: -3em;'>已预定{{room.yuding_zhushu_total}}桌<br>还剩余{{room.sheyu_zhushu_total}}桌</div>" +
                                    "</div>" +
                                    "</div>" +
                                    "</label>"+
                                    "<br>" +
                                    "</div>",
                                    buttons: [
                                        {
                                            text: '取消',
                                            onTap: function(e) {
                                                $scope.close_button = false;
                                            }
                                        },
                                        {
                                            text: '关闭',
                                            type: 'button-assertive',
                                            onTap: function(e) {
                                                $scope.close_button = true;
                                                var sel_count = 0;
                                                for(var key in $rootScope.rooms_add_yuyue){
                                                    if($rootScope.rooms_add_yuyue[key].selected){
                                                        sel_count++;
                                                    }
                                                }
                                                if(sel_count == 0){
                                                    $cordovaToast.showShortTop("请选择宴会厅！");
                                                    e.preventDefault();
                                                }
                                            }
                                        }
                                    ]
                                }).then(function(res){
                                    //跳转到预定tab
                                    OrderService.get_yuding_info($scope.item.dangqi);
                                    $timeout( function() {
                                        $rootScope.doRefresh_yuding($scope.item.dangqi);
                                    },1000);
                                    if($scope.close_button){//关闭档期  这边添加close_button标识 解决res无法识别的问题（不知道为什么）
                                        var yht_id="";
                                        for(var key in $rootScope.rooms_add_yuyue){
                                            if($rootScope.rooms_add_yuyue[key].selected){
                                                yht_id = yht_id + key + ",";
                                            }
                                        }
                                        OrderService.close_dangqi(yht_id,res_item.dangqi).then(function(data){
                                            $ionicPopup.alert({
                                                cssClass: 'myPopup',
                                                title:'提示',
                                                template:'<div align="center">'+data.info+'</div>',
                                                okText: '确定',
                                                okType: 'button-assertive'
                                            });
                                        })
                                    }else{
                                    }
                                })
                            }else{//返回信息失败
                                $ionicPopup.alert({
                                    cssClass: 'myPopup',
                                    title:'提示',
                                    template:'<div align="center">'+results.info+'</div>',
                                    okText: '确定',
                                    okType: 'button-assertive'
                                });
                            }
                    });
                } else {
                    OrderService.confirm_yuyue($("#dangqi").val(),zhushu,hunyan,$("#nickname").val(),$("#phone").val(),$("#kanchang_date").val(),kanchang_time2,kanchang_time3,
                        0,document.getElementById("dingjin").value,$("#comment").val()).then(function (results) {
                            OrderService.get_kanchang_info($scope.item.dangqi);
                            $timeout( function() {
                                $rootScope.doRefresh_kanchang($scope.item.dangqi);
                            },1000);
                        });
                }
            })
        };
    })

    .controller('yudingDetailCtrl',function($scope,$stateParams,OrderService,$ionicPopup,$state,$ionicHistory,$rootScope,$ionicScrollDelegate,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        var yuding_id = $stateParams.id;
        var wtype = $stateParams.wtype;
        OrderService.query_yuding_detail(yuding_id).then(function(results){
            $scope.yanghuiting_list = results.yanghuiting_list;
            $scope.item = results.item;
            if($scope.item.status == 5){
                $scope.isComplete = true;
            }else{
                $scope.isComplete = false;
            }
            //判断是否显示取消信息
            if($scope.item.status == -2 || $scope.item.status == -1 || $scope.item.status == 3){
                $scope.is_cancel = true;
            }else{
                $scope.is_cancel = false;
            }
            if($scope.item.dingjin > 0 || $scope.item.paystatus == 1){
                $scope.kx_title = "剩余款项";
                $scope.yt_title = "预定时间";
            }else{
                $scope.kx_title = "预计款项";
                $scope.yt_title = "预约时间";
            }
        });
        $scope.compelete_hunyan = function(){
            OrderService.compeleteOrCancel_yuding(yuding_id,1).then(function(results){
                if(results.status == 1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div style="text-align: center;font-family: 黑体;">恭喜您完成婚宴！</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(){
                        $ionicHistory.goBack();
                        //刷新原列表
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all($scope.item.dangqi);
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding($scope.item.dangqi);
                        }else if(wtype == 2){//全部预约列表进入
                            $rootScope.doRefresh_all_yuyueOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }else if(wtype == 3){//全部预定线上进入
                            $rootScope.refresh_online_order();
                        }else{//全部预定线下进入
                            $rootScope.refresh_offline_order();
                        }
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(){
                        $ionicHistory.goBack();
                        //$rootScope.doRefresh_yuding($scope.item.dangqi);
                    });
                }
            });
        }
        $scope.cancel_yuding = function(){
            OrderService.compeleteOrCancel_yuding(yuding_id,-1).then(function(results){
                if(results.status == 1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div style="text-align: center;font-family: 黑体;">取消预定完成！</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(){
                        $ionicHistory.goBack();
                        //刷新原列表
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all($scope.item.dangqi);
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding($scope.item.dangqi);
                        }else if(wtype == 2){//全部预约列表进入
                            $rootScope.doRefresh_all_yuyueOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }else if(wtype == 3){//全部预定线上进入
                            $rootScope.refresh_online_order();
                        }else{//全部预定线下进入
                            $rootScope.refresh_offline_order();
                        }
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(){
                        $ionicHistory.goBack();
                        //$rootScope.doRefresh_yuding($scope.item.dangqi);
                    });
                }
            });
        }
    })
    .controller('canceledYuyueDetailCtrl',function($scope,$stateParams,OrderService,$ionicPopup,$state,$ionicHistory,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        var order_id = $stateParams.id;
        OrderService.query_canceledYuyue_detail(order_id).then(function(results){
            $scope.yanghuiting_list = results.yanghuiting_list;
            $scope.item = results.item;
            //if($scope.item.status == 5){
            //    $scope.isComplete = true;
            //}else{
            //    $scope.isComplete = false;
            //}
            //判断是否显示取消信息
            //if($scope.item.status == -2 || $scope.item.status == -1 || $scope.item.status == 3){
            //    $scope.is_cancel = true;
            //}else{
            //    $scope.is_cancel = false;
            //}
            if($scope.item.dingjin > 0 || $scope.item.paystatus == 1){
                $scope.kx_title = "剩余款项";
                $scope.yt_title = "预定时间";
            }else{
                $scope.kx_title = "预计款项";
                $scope.yt_title = "预约时间";
            }
        });
    })

    .controller('AccountCtrl', function($scope, $state,$ionicNavBarDelegate,$stateParams,LoginService,UserService,$ionicHistory,$rootScope,MessageDboService,MessageService,$timeout) {
        //$ionicNavBarDelegate.showBackButton(false);
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.showMessageTabs = function(){
            $state.go('message');
        };

        $rootScope.refreshMsgIcon = function(){
            MessageService.getMessageList(0).then(function(results) {
                var recTime = new Date().format('yyyy-MM-dd hh:mm');
                for (var key in results.item) {
                    var msg = results.item[key];
                    //消息保存到本地
                    MessageDboService.addMsg(msg.id, window.localStorage['userName'], msg.zhuangtai, msg.title, msg.fubiaoti, 0, recTime, null, null, msg.content, null, null, null);
                }
            });
            $timeout(function(){
                MessageDboService.allMsg(window.localStorage['userName']).then(function(array){
                    if(array.length == 0){
                        $scope.hasNewMsg = false;
                    }
                    for(var key in array){
                        if(array[key].isread == 0){
                            $scope.hasNewMsg = true;
                            break;
                        }else{
                            $scope.hasNewMsg = false;
                        }
                    }
                })
            },1000);
        };
        $rootScope.refreshMsgIcon();

        $scope.title = $stateParams.sup_name;
        $scope.logo = $stateParams.logo_img;
        $scope.address = $stateParams.address;
        $scope.tel = $stateParams.tel;
        $scope.index_img_one = $stateParams.index_img[0];
        $scope.brief = $stateParams.brief;
        $scope.fuwufei = $stateParams.fuwufei;
        $scope.jingchangfei = $stateParams.jingchangfei;
        $scope.kaipingfei = $stateParams.kaipingfei;
        $scope.tingchechang = $stateParams.tingchechang;
        $scope.hunfang = $stateParams.hunfang;
        $scope.huazhaungjian = $stateParams.huazhaungjian;
        $scope.showDetail = function(){
            $state.go('hotelDetail',{title:$scope.title,address:$scope.address,index_img:$stateParams.index_img,brief:$scope.brief
                ,fuwufei:$scope.fuwufei,jingchangfei:$scope.jingchangfei,kaipingfei:$scope.kaipingfei,
                tingchechang:$scope.tingchechang,hunfang:$scope.hunfang,huazhaungjian:$scope.huazhaungjian});
        };
        $scope.goto_yht = function(){
            UserService.get_yht_info();
        };
        $scope.goto_hycb = function(){
            UserService.get_hycb_info();
        };
        //$scope.goto_order_all = function(){
        //    UserService.get_all_order_info();
        //}
        $scope.logout = function(){
            LoginService.logout();
        }
    })
    .controller('hotelDetailCtrl',function($scope, $state,$ionicSlideBoxDelegate,$stateParams,$ionicHistory){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $ionicSlideBoxDelegate.update();
        //$scope.slideCount = $ionicSlideBoxDelegate.slidesCount();
        $scope.title = $stateParams.title;
        $scope.address = $stateParams.address;
        $scope.brief = $stateParams.brief;
        $scope.fuwufei = number2word($stateParams.fuwufei);
        $scope.jingchangfei = number2word($stateParams.jingchangfei);
        $scope.kaipingfei = number2word($stateParams.kaipingfei);
        $scope.tingchechang = $stateParams.tingchechang;
        $scope.hunfang = number2word($stateParams.hunfang);
        $scope.huazhaungjian = number2word($stateParams.huazhaungjian);
        $scope.images = unique($stateParams.index_img);
        $scope.slideCount = $scope.images.length;

    })
    .controller('yhtCtrl',function($scope,$state,$stateParams,$ionicHistory){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.yanhuiting_count = $stateParams.yanhuiting_count;
        $scope.items = $stateParams.items;
    })
    .controller('hycbCtrl',function($scope,$state,$stateParams,$ionicHistory){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.hunyan_count = $stateParams.hunyan_count;
        //$scope.items = $stateParams.items;
        $scope.chunkedData = chunk($stateParams.items, 2);
    })
    .controller('hythCtrl',function($scope,$state,$ionicHistory,$stateParams,UserService,$timeout,$rootScope){
        $scope.items = $stateParams.items;
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };

        UserService.get_hyth_info(0).then(function(results){
            $scope.items = results.item;
        });
        $rootScope.doRefresh_hyth = function() {
            $timeout( function() {
                UserService.get_hyth_info(0).then(function(results){
                    $scope.items = results.item;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.slide_acty = function(index){
            $("#item_detail"+index).slideToggle();
            var up_arroe_state =$("#up_arrow"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow"+index).css('display','block');
                $("#down_arrow"+index).css('display','none');
            }else{
                $("#up_arrow"+index).css('display','none');
                $("#down_arrow"+index).css('display','block');
            }
        };

    })
    .controller('hythAddCtrl',function($scope,$state,$ionicPopup,UserService,$cordovaToast,$ionicHistory,$rootScope) {
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $('#start_date').focus(function() {
            this.blur();
        });
        $('#end_date').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("start_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("end_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.saveActivity = function(){
            //校验
            if($("#title").val() == ""){
                $cordovaToast.showShortCenter("请输入活动标题!");
                return;
            }
            if($("#start_date").val() == ""){
                $cordovaToast.showShortCenter("请选择活动开始时间!");
                return;
            }
            if($("#end_date").val() == ""){
                $cordovaToast.showShortCenter("请选择活动结束时间!");
                return;
            }
            if($("#content").val() == ""){
                $cordovaToast.showShortCenter("请输入活动内容!");
                return;
            }
            var room = document.getElementsByName("group");
            var yht_id = 0;
            for(var i=0;i<room.length;i++){
                if(room[i].checked){
                    yht_id = i;
                }
            }
            UserService.save_hyth(yht_id,$("#title").val(),$("#start_date").val(),$("#end_date").val(),$("#content").val(),null).then(function(results){
                if(results.status ==1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:"保存成功",
                        template:"<div align='center'>酒店特惠活动已保存</br>我们将在一个工作日内更新至前台</div>",
                        okText: '确认',
                        okType: "button-assertive"
                    }).then(function(res){
                        UserService.get_hyth_info(0).then(function(results){
                            //$state.go('hythPage',{items:results.item}, {reload: true});
                            $ionicHistory.goBack();
                            $rootScope.doRefresh_hyth();
                        });
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(res){
                        UserService.get_hyth_info(0).then(function(results){
                            //$state.go('hythPage',{items:results.item}, {reload: true});
                            $ionicHistory.goBack();
                            $rootScope.doRefresh_hyth();
                        });
                    });
                }
            });
        }
    })
    .controller('hythEditCtrl',function($scope,$state,$ionicPopup,$stateParams,UserService,$cordovaToast,$ionicHistory,$rootScope) {
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.id = $stateParams.id;
        UserService.get_hyth_info($scope.id).then(function(results){
            $scope.item = results.item;
            document.getElementsByName("group")[$scope.item.yht_id].checked = true;
        });
        $('#start_date_edit').focus(function() {
            this.blur();
        });
        $('#end_date_edit').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("start_date_edit").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("end_date_edit").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.saveActivity = function(){
            //校验
            if($("#title_edit").val() == ""){
                $cordovaToast.showShortCenter("请输入活动标题!");
                return;
            }
            if($("#start_date_edit").val() == ""){
                $cordovaToast.showShortCenter("请选择活动开始时间!");
                return;
            }
            if($("#end_date_edit").val() == ""){
                $cordovaToast.showShortCenter("请选择活动结束时间!");
                return;
            }
            if($("#content_edit").val() == ""){
                $cordovaToast.showShortCenter("请输入活动内容!");
                return;
            }
            var room = document.getElementsByName("group");
            var yht_id = $scope.item.yht_id;
            for(var i=0;i<room.length;i++){
                if(room[i].checked){
                    yht_id = i;
                }
            }
            UserService.save_hyth(yht_id,$("#title_edit").val(),$("#start_date_edit").val(),$("#end_date_edit").val(),$("#content_edit").val(),$scope.id).then(function(results){
                if(results.status ==1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:"保存成功",
                        template:"<div align='center'>酒店特惠活动已保存</br>我们将在一个工作日内更新至前台</div>",
                        okText: '确认',
                        okType: "button-assertive"
                    }).then(function(res){
                        UserService.get_hyth_info(0).then(function(results){
                            //$state.go('hythPage',{items:results.item}, {reload: true});
                            $ionicHistory.goBack();
                            $rootScope.doRefresh_hyth();
                        });
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(res){
                        UserService.get_hyth_info(0).then(function(results){
                            //$state.go('hythPage',{items:results.item}, {reload: true});
                            $ionicHistory.goBack();
                            $rootScope.doRefresh_hyth();
                        });
                    });
                }
            })
        }
    })
    .controller('allYuyueOrderCtrl', function($scope,$rootScope,$stateParams,UserService,OrderService,$timeout,$ionicHistory,$state,$ionicModal,$ionicLoading) {
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        //$ionicLoading.show({
        //    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //});
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv = false;
        $scope.noMoredata = false;
        $scope.order_list = [];
        $scope.loadMore = function () {
            var paramsJson = {page:page,pagesize:pagesize};//“-2=>已过期”“-1=>已取消”“1=>申请中”“2=>看场中”“3=>无档期”“4=>已预定”“5=>已完成”
            UserService.get_yuyue_order_info(paramsJson).then(function (results) {
                $scope.order_count = results.order_count;
                $scope.name = results.name;
                for(var key in results.order_list){
                    if($scope.order_list.length < $scope.order_count) {
                        $scope.order_list.push(results.order_list[key]);
                    }else{
                        $scope.noMoredata = true;
                        $scope.showDiv = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        $rootScope.doRefresh_all_yuyueOrder = function() {
            $scope.showDiv = false;
            $scope.noMoredata = false;
            $timeout( function() {
                page = 1;
                var paramsJson = {page:page,pagesize:pagesize};
                UserService.get_yuyue_order_info(paramsJson).then(function(results){
                    $scope.order_list = results.order_list;
                    $scope.order_count = results.order_count;
                    $scope.name = results.name;
                    page++;
                    //$ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.doRefresh_all_yuyueOrder();

        //查看详情
        $scope.showOrderDetail = function(id,status,roomid){
            if(status == 1){//“申请中”
                //预约处理模态框
                $ionicModal.fromTemplateUrl("yuyue_modal.html", {
                    scope: $scope,
                    animation: "slide-in-up",
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                }).then(function(modal) {
                    $scope.yuyue_modal = modal;
                });
                OrderService.get_yuyue_detail(id).then(function(results){
                    $rootScope.yanghuiting_list_yuyue_modal = results.yanghuiting_list;
                    $scope.yanghuiting_list1 = results.yanghuiting_list;
                    $scope.room_one = results.yanghuiting_list[roomid];
                    $scope.yanghuiting_count1 = results.yanghuiting_count;
                    $scope.item = results.item;
                    $scope.wtype_yy = 2;
                    if(results.yanghuiting_count > 1) {
                        $scope.is_show_yuyue = true;
                    }else{
                        $scope.is_show_yuyue = false;
                    }
                    $scope.total_price = $scope.item.total_price;
                    $scope.yuyue_modal.show();
                    $('#yuyue_dangqi').focus(function () {
                        this.blur();
                    });
                    $('#kc_date').focus(function () {
                        this.blur();
                    });
                    $('#kc_time').focus(function () {
                        this.blur();
                    });
                    $("#yuyue_kc_dec").attr('disabled',true);
                });
                $scope.closeModal = function() {
                    $scope.yuyue_modal.remove();
                    //$scope.on_select_yuyue($scope.dangqi);
                };
            }else if(status == 2){//“看场中”
                //看场处理模态框
                $ionicModal.fromTemplateUrl("kanchang_modal.html", {
                    scope: $scope,
                    animation: "slide-in-up",
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                }).then(function(modal) {
                    $scope.kanchang_modal = modal;
                });
                OrderService.get_kanchang_detail(id).then(function(results){
                    $scope.yanghuiting_list1 = results.yanghuiting_list;
                    $scope.room_one = results.yanghuiting_list[roomid];
                    $scope.yanghuiting_count1 = results.yanghuiting_count;
                    $scope.item = results.item;
                    $scope.wtype_kc = 2;
                    if(results.yanghuiting_count > 1) {
                        $scope.is_show_kanchang = true;
                    }else{
                        $scope.is_show_kanchang = false;
                    }
                    $scope.total_price = $scope.item.total_price;
                    $scope.kanchang_modal.show();
                    $('#kc_dangqi').focus(function() {
                        this.blur();
                    });
                })
                $scope.closeModal_kc = function() {
                    $scope.kanchang_modal.remove();
                    //$scope.on_select_kanchang($scope.dangqi);
                };
            }else if(status == 4 || status ==5){//“已预定”“已完成”
                $state.go("show_yuding_detail",{id:id,wtype:2});
            }else{//“已过期”“已取消”“无档期”
                $state.go("show_canceled_yuyue_detail",{id:id});
            }
        }
    })
    .controller('jdCanceledOrdersCtrl',function($scope,$state,$ionicHistory,UserService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        //$ionicLoading.show({
        //    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //});
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv = false;
        $scope.noMoredata = false;
        $scope.order_list = [];
        $scope.loadMore = function () {
            var paramsJson = {status:"-2,-1,3",page:page,pagesize:pagesize};//-2=>'已过期', -1=>'已取消', 3=>'无档期'
            UserService.get_yuyue_order_info(paramsJson).then(function (results) {
                $scope.order_count = results.order_count;
                $scope.name = results.name;
                for(var key in results.order_list){
                    if($scope.order_list.length < $scope.order_count) {
                        $scope.order_list.push(results.order_list[key]);
                    }else{
                        $scope.noMoredata = true;
                        $scope.showDiv = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        $scope.doRefresh_canceled_jdOrder = function() {
            $scope.showDiv = false;
            $scope.noMoredata = false;
            $timeout( function() {
                page = 1;//第几页
                var paramsJson = {status:"-2,-1,3",page:page,pagesize:pagesize};
                UserService.get_yuyue_order_info(paramsJson).then(function(results){
                    $scope.order_list = results.order_list;
                    $scope.order_count = results.order_count;
                    $scope.name = results.name;
                    page++;
                    //$ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.doRefresh_canceled_jdOrder();
    })
    .controller('allYudingOrderCtrl', function($scope,$rootScope,$stateParams,UserService,$timeout,$ionicHistory,$ionicLoading,$ionicScrollDelegate) {
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        var paramsJson = {yuyue_type:0};
        UserService.get_all_order_info(paramsJson).then(function(results){
            $scope.yanghuiting_list = results.yanghuiting_list;
        });

        $rootScope.refresh_online_order = function() {
            $timeout( function() {
                var paramsJson = {yuyue_type:0};
                UserService.get_all_order_info(paramsJson).then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $rootScope.refresh_offline_order = function() {
            $timeout( function() {
                var paramsJson = {yuyue_type:1};
                UserService.get_all_order_info(paramsJson).then(function(results){
                    $scope.yanghuiting_list = results.yanghuiting_list;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.slide_onLineOrder = function(index){
            $("#detail_on"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_on"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_on"+index).css('display','block');
                $("#down_arrow_on"+index).css('display','none');
            }else{
                $("#up_arrow_on"+index).css('display','none');
                $("#down_arrow_on"+index).css('display','block');
            }
            $ionicScrollDelegate.resize();
        };
        $scope.slide_offLineOrder = function(index){
            $("#detail_off"+index).slideToggle();
            var up_arroe_state =$("#up_arrow_off"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_off"+index).css('display','block');
                $("#down_arrow_off"+index).css('display','none');
            }else{
                $("#up_arrow_off"+index).css('display','none');
                $("#down_arrow_off"+index).css('display','block');
            }
            $ionicScrollDelegate.resize();
        };
        $scope.selectOnlineTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $scope.refresh_online_order();
        }
        $scope.seleectOfflineTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $scope.refresh_offline_order();
        }
    })
    .controller('scheduleCtrl',function($scope,$ionicPopup,UserService,OrderService,$rootScope,$ionicHistory,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        var selected_date_array = new Array();
        //var is_first_load = true;
        $(function() {
            $(document).on('shown.calendar.calendario2', function(e, instance){
                selected_date_array = new Array();
                if(!instance) instance = cal;
                var $cell = instance.getCell(new Date().getDate());
                $scope.instance2 = instance;
                UserService.query_dangqi_setting(instance.getYear(),instance.getMonth(),null).then(function(results){
                    var items = results.item;
                    for(var i=1;i<=31;i++){
                        $scope.instance2.getCell(parseInt(i)).removeClass("fc-selected");
                        if(items != undefined && items[i] == i){
                            $scope.instance2.getCell(parseInt(i)).addClass("fc-close");
                        }else{
                            $scope.instance2.getCell(parseInt(i)).removeClass("fc-close");
                        }
                    }
                });
                $timeout(function(){
                    if($cell.hasClass('fc-today')) $cell.trigger('click.calendario');
                },1000);
            });

            var transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition' : 'transitionend',
                    'OTransition' : 'oTransitionEnd',
                    'msTransition' : 'MSTransitionEnd',
                    'transition' : 'transitionend'
                },
                transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                $wrapper = $( '#custom-inner2' ),
                $calendar = $( '#calendar_setting' ),

                cal = $calendar.calendario2({
                    onDayClick : function( $el, data, dateProperties ) {
                        $scope.dangqi = dateProperties.year+"."+dateProperties.month+"."+dateProperties.day;
                        $scope.pdate = parseInt(dateProperties.year + parse_date(dateProperties.month) + parse_date(dateProperties.day));
                        if($el[0].firstChild.className !="fc-date fc-emptydate") {
                            document.getElementById("selected_date").innerHTML="当前选择日期："+dateProperties.year+"."+dateProperties.month+"."+dateProperties.day;

                            var has_in = false;
                            for (var key in selected_date_array) {
                                if (selected_date_array[key] === $scope.pdate) {//取消选中
                                    selected_date_array.splice(key,1);
                                    $el[0].classList.remove("fc-selected");
                                    has_in = true;
                                    if(selected_date_array.length > 0){
                                        var last_date = selected_date_array[selected_date_array.length-1].toString();
                                        UserService.query_dangqi_setting(last_date.substring(0,4),last_date.substring(4,6),last_date.substring(6)).then(function(results){
                                            if(results.item == null){//档期未关闭
                                                $scope.closeButton = true;
                                                $scope.releaseButton = false;
                                            }else{
                                                $scope.closeButton = false;
                                                $scope.releaseButton = true;
                                            }
                                        });
                                    }
                                    break;
                                }
                            }
                            if(!has_in){//选中
                                selected_date_array.push($scope.pdate);
                                $el[0].classList.add("fc-selected");
                                UserService.query_dangqi_setting(dateProperties.year,dateProperties.month,dateProperties.day).then(function(results){
                                    if(results.item == null){//档期未关闭
                                        $scope.closeButton = true;
                                        $scope.releaseButton = false;
                                    }else{
                                        $scope.closeButton = false;
                                        $scope.releaseButton = true;
                                    }
                                });
                            }
                            //is_first_load = false;
                        }
                    },
                    //caldata : codropsEvents,
                    weekabbrs  : [ '日', '一', '二', '三', '四', '五', '六' ],
                    //monthabbrs : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    months  : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    displayWeekAbbr : true,
                    // left-most day in the calendar  0- Sunday, 1 - Monday, ... , 6 - Saturday
                    startIn : 0,
                    events: 'click'
                } ),
                $month = $( '#custom-month2' ).html( cal.getMonthName() ),
                $year = $( '#custom-year2' ).html( cal.getYear() );

            //cal.setData(codropsEvents);

            $( '#custom-next2' ).on( 'click', function() {
                cal.gotoNextMonth2( updateMonthYear );
            } );
            $( '#custom-prev2' ).on( 'click', function() {
                cal.gotoPreviousMonth2( updateMonthYear );
            } );
            function updateMonthYear() {
                $month.html( cal.getMonthName() );
                $year.html( cal.getYear() );
                selected_date_array = new Array();
            }
            // just an example..
            function showEvents( contentEl, dateProperties ) {
                hideEvents();
                var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Events for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
                    $close = $( '<span class="custom-content-close"></span>' ).on( 'click', hideEvents );
                $events.append( contentEl.join('') , $close ).insertAfter( $wrapper );
                setTimeout( function() {
                    $events.css( 'top', '0%' );
                }, 25 );
            }
            function hideEvents() {
                var $events = $( '#custom-content-reveal' );
                if( $events.length > 0 ) {
                    $events.css( 'top', '100%' );
                    Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();
                }
            }
        });
        $scope.jump_to_yuyue_tab = function(){
            OrderService.get_yuyue_info($scope.dangqi);
        };

        $scope.closeSchedule = function(){
            var period = new Array();
            var array_temp = arrange(selected_date_array.sort(function(a,b){return a-b;}));
            for(var key in array_temp){
                var pe_str = array_temp[key][0]+"-"+array_temp[key][array_temp[key].length-1];
                period.push(pe_str);
            }
            $rootScope.period_close = period;
             $ionicPopup.confirm({
                 cssClass: 'myPopup',
                title:"关闭档期",
                template:"<div align='center'>酒店档期"+
                "<div class='list' ng-repeat='item in period_close'>" +
                "<div class='row' style='margin-bottom: -40px;'><div class='col col-center'>{{item}}</div>" +
                "</div></div>"+"<br>是否确认关闭该档期酒店预约？</div>",
                okText: '是',
                cancelText:'否',
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    UserService.close_dangqi(period).then(function(results){
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title:'提示',
                            template:'<div align="center">'+results.info+'</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        }).then(function(){
                            $scope.instance2.$el.trigger($.Event('shown.calendar.calendario2'), [$scope.instance2]);
                        });
                    });
                    //$scope.instance2.$el.trigger($.Event('shown.calendario2'));
                }
            });
        };
        $scope.releaseSchedule = function(){
            var period = new Array();
            var array_temp = arrange(selected_date_array.sort(function(a,b){return a-b;}));
            for(var key in array_temp){
                var pe_str = array_temp[key][0]+"-"+array_temp[key][array_temp[key].length-1];
                period.push(pe_str);
            }
            $rootScope.period_release = period;
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"释放档期",
                template:"<div align='center'>酒店档期"+"<div class='list' ng-repeat='item in period_release'>" +
                "<div class='row' style='margin-bottom: -40px;'><div class='col col-center'>{{item}}</div>" +
                "</div></div>"+"<br>是否确认释放该档期酒店预约？</div>",
                okText: '是',
                cancelText:'否',
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    UserService.open_dangqi(period).then(function(results){
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title:'提示',
                            template:'<div align="center">'+results.info+'</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        }).then(function(){
                            $scope.instance2.$el.trigger($.Event('shown.calendar.calendario2'), [$scope.instance2]);
                        });
                    });
                }
            });
        }
    })
    .controller('changePasswordCtrl',function($scope,$ionicPopup,UserService,$state,$rootScope,$ionicHistory,$cordovaToast) {
        $scope.backGo = function () {
            $ionicHistory.goBack();
        };
        $scope.completeChange = function(){
            var oldPwd = $("#oldPwd").val();
            var newPwd = $("#newPwd").val();
            var confirmPwd = $("#confirmPwd").val();
            if(oldPwd == ""){
                $cordovaToast.showShortTop("请输入原密码！");
                return;
            }
            if(oldPwd != $rootScope.user_pwd){
                $cordovaToast.showShortTop("原密码不正确，请重新输入！");
                return;
            }
            if(newPwd == ""){
                $cordovaToast.showShortTop("请输入新密码！");
                return;
            }
            if(confirmPwd == ""){
                $cordovaToast.showShortTop("请输入确认密码！");
                return;
            }
            if(newPwd != confirmPwd){
                $cordovaToast.showShortTop("新密码和确认密码不一致！");
                return;
            }
            UserService.changePassword(newPwd).then(function(res){
                if(res.status == 1){
                    $cordovaToast.showShortTop("密码修改成功，请重新登录！");
                    localStorage.removeItem("userPassword");
                    $state.go("login",{},{reload:true});
                }else{
                    $cordovaToast.showShortTop(res.info);
                    return;
                }
            });
        }
    })
    .controller('messageCtrl',function($scope,$rootScope,$ionicHistory,$cordovaSQLite,$ionicTabsDelegate,MessageService
        ,MessageDboService,$timeout,$ionicLoading,$ionicScrollDelegate,$cordovaToast,$state){
        $scope.backGo = function () {
            $ionicHistory.goBack();
            $rootScope.refreshMsgIcon();
        };

        $rootScope.selectedNum = 0;
        $scope.action = "编辑";
        //$scope.isEmpty = false;
        $scope.edit = function(){
            var index = $ionicTabsDelegate.selectedIndex();
            var arrCheckbox = document.getElementsByName("checkbox"+index);
            $rootScope.hasChecked = false;
            if( $scope.action == "编辑"){//点击编辑
                $rootScope.isEditStatus = true;
                $scope.action = "取消";
                $("li").addClass("item-checkbox");
            }else{//点击取消
                $rootScope.isEditStatus = false;
                $scope.action = "编辑";
                $("li").removeClass("item-checkbox");
                $rootScope.selectedNum = 0;
                //取消item选中状态
                for(var i = 0;i<arrCheckbox.length;i++){
                    arrCheckbox[i].checked = false;
                }
                document.getElementById("allSelButton").checked = false;
            }
        }
        $scope.selectAll = function(){
            var index = $ionicTabsDelegate.selectedIndex();
            var arrCheckbox = document.getElementsByName("checkbox"+index);
            if($("#allSelButton").is(':checked')){
                for(var i = 0;i<arrCheckbox.length;i++){
                    arrCheckbox[i].checked = true;
                }
                $rootScope.selectedNum = arrCheckbox.length;
                $rootScope.hasChecked = true;
            }else{
                for(var i = 0;i<arrCheckbox.length;i++){
                    arrCheckbox[i].checked = false;
                }
                $rootScope.selectedNum = 0;
                $rootScope.hasChecked = false;
            }
        };
        $scope.selectTab = function(){
            var index = $ionicTabsDelegate.selectedIndex();
            var arrCheckbox = document.getElementsByName("checkbox"+index);
            $rootScope.isEditStatus = false;
            $scope.action = "编辑";
            $("li").removeClass("item-checkbox");
            $rootScope.selectedNum = 0;
            //取消item选中状态
            for(var i = 0;i<arrCheckbox.length;i++){
                arrCheckbox[i].checked = false;
            }
            document.getElementById("allSelButton").checked = false;
            $rootScope.doRefresh_allMsg();
        }
        //下拉刷新
        $rootScope.doRefresh_allMsg = function() {
            var index = $ionicTabsDelegate.selectedIndex();
            switch(index) {
                case 0:
                    var zhuaitai = 0;
                    $timeout( function() {
                        MessageService.getMessageList(zhuaitai).then(function(results){
                            var recTime = new Date().format('yyyy-MM-dd hh:mm');
                            for(var key in results.item){
                                var msg = results.item[key];
                                //消息保存到本地
                                MessageDboService.addMsg(msg.id,window.localStorage['userName'],msg.zhuangtai,msg.title,msg.fubiaoti,0,recTime,null,null,msg.content,null,null,null);
                            }
                            //获取本地消息列表
                            MessageDboService.allMsg(window.localStorage['userName']).then(function(messageList){
                                //if(messageList.length == 0){
                                //    $scope.isEmpty = true;
                                //}else{
                                //    $scope.isEmpty = false;
                                //}
                                $rootScope.messages = messageList;
                            })
                        });
                        $scope.$broadcast('scroll.refreshComplete');
                    }, 1000);
                    break;
                case 1:
                    var zhuaitai = 1;
                    $timeout( function() {
                        MessageService.getMessageList(zhuaitai).then(function(results){
                            var recTime = new Date().format('yyyy-MM-dd hh:mm');
                            for(var key in results.item){
                                var msg = results.item[key];
                                //消息保存到本地
                                MessageDboService.addMsg(msg.id,window.localStorage['userName'],msg.zhuangtai,msg.title,msg.fubiaoti,0,recTime,null,null,msg.content,null,null,null);
                            }
                            //获取本地消息列表
                            MessageDboService.getMsgByType(zhuaitai,window.localStorage['userName']).then(function(messageList){
                                //if(messageList.length == 0){
                                //    $scope.isEmpty = true;
                                //}else{
                                //    $scope.isEmpty = false;
                                //}
                                $rootScope.messages_yuyue = messageList;
                            })
                        });
                        $scope.$broadcast('scroll.refreshComplete');
                    }, 1000);
                    break;
                case 2:
                    var zhuaitai = 4;
                    $timeout( function() {
                        MessageService.getMessageList(zhuaitai).then(function(results){
                            var recTime = new Date().format('yyyy-MM-dd hh:mm');
                            for(var key in results.item){
                                var msg = results.item[key];
                                //消息保存到本地
                                MessageDboService.addMsg(msg.id,window.localStorage['userName'],msg.zhuangtai,msg.title,msg.fubiaoti,0,recTime,null,null,msg.content,null,null,null);
                            }
                            //获取本地消息列表
                            MessageDboService.getMsgByType(zhuaitai,window.localStorage['userName']).then(function(messageList){
                                //if(messageList.length == 0){
                                //    $scope.isEmpty = true;
                                //}else{
                                //    $scope.isEmpty = false;
                                //}
                                $rootScope.messages_yuding = messageList;
                            })
                        });
                        $scope.$broadcast('scroll.refreshComplete');
                    }, 1000);
                    break;
                default:
            }
            $timeout( function() {
                if($rootScope.isEditStatus){
                    $("li").addClass("item-checkbox");
                    $rootScope.selectedNum = 0;
                    document.getElementById("allSelButton").checked = false;
                    $rootScope.hasChecked = false;
                }
                $ionicLoading.hide();
            },1500);
        };
        //删除消息
        $scope.deleteMsg = function(){
            var index = $ionicTabsDelegate.selectedIndex();
            var arrCheckbox = document.getElementsByName("checkbox"+index);
            var checkedCount = 0;
            for(var key in arrCheckbox){
                if(arrCheckbox[key].checked){
                    checkedCount++;
                }
            }
            if(checkedCount == 0){
                $cordovaToast.showShortCenter("您还未选择哦~");
                return;
            }
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="ios-small"></ion-spinner></div>',
                duration:3000
            });
            switch(index){
                case 0:
                    for(var key in $rootScope.messages){
                        if(arrCheckbox[key].checked){
                            MessageDboService.removeMsg($rootScope.messages[key].id);
                        }
                    }
                    //$rootScope.doRefresh_allMsg();
                    $scope.selectTab();
                    //$state.go($state.current, {}, {reload: true});
                    break;
                case 1:
                    for(var key in $rootScope.messages_yuyue){
                        if(arrCheckbox[key].checked){
                            MessageDboService.removeMsg($rootScope.messages_yuyue[key].id);
                        }
                    }
                    //$rootScope.doRefresh_allMsg();
                    $scope.selectTab();
                    break;
                case 2:
                    for(var key in $rootScope.messages_yuding){
                        if(arrCheckbox[key].checked){
                            MessageDboService.removeMsg($rootScope.messages_yuding[key].id);
                        }
                    }
                    //$rootScope.doRefresh_allMsg();
                    $scope.selectTab();
                    break;
                default:
            }
        }
    })
    .controller('allMessageCtrl',function($scope,$rootScope,$state,MessageService,$cordovaSQLite,MessageDboService,$ionicLoading,$ionicTabsDelegate){
        $ionicLoading.show({
            template: '<div class="row row-center"><ion-spinner icon="ios-small"></ion-spinner></div>',
            duration:1000
        });
        $rootScope.selectedNum = 0;
        //获取服务器新消息
        var zhuangtai = 0;
        MessageService.getMessageList(zhuangtai).then(function(results){
            var recTime = new Date().format('yyyy-MM-dd hh:mm');
            for(var key in results.item){
                var msg = results.item[key];
                //消息保存到本地
                MessageDboService.addMsg(msg.id,window.localStorage['userName'],msg.zhuangtai,msg.title,msg.fubiaoti,0,recTime,null,null,msg.content,null,null,null);
            }
            //获取本地消息列表
            MessageDboService.allMsg(window.localStorage['userName']).then(function(messageList){
                //if(messageList.length == 0){
                //    $scope.isEmpty = true;
                //}else{
                //    $scope.isEmpty = false;
                //}
                $rootScope.messages = messageList;
                $ionicLoading.hide();
            })
        });

        $scope.itemClick = function(id,msgid){
            if(!$rootScope.isEditStatus){
                $("#allTitle"+id).addClass("message-read-ud");
                $("#allTime"+id).addClass("message-read-ud");
                $("#allContent"+id).addClass("message-read-ud");
                $("#allTitle"+id).removeClass("message-sub-ud1");
                $("#allTime"+id).removeClass("message-sub-ud2");
                $("#allContent"+id).removeClass("message-sub-ud3");
                $state.go("messageDetail",{id:id,index:$ionicTabsDelegate.selectedIndex()});
                MessageService.readMessage(msgid);
                MessageDboService.updateMsg(id);
            }
        }
        $scope.selectForDel = function(id){
            var checkStatus = $("#message_all"+id).is(':checked');
            if(checkStatus){
                $rootScope.selectedNum += 1;
            }else{
                $rootScope.selectedNum -= 1;
            }
            var checkTotal = $("input[type='checkbox'][name='checkbox0']").length;
            var checkedNum = $("input[type='checkbox'][name='checkbox0']:checked").length;
            if(checkedNum == checkTotal){
                document.getElementById("allSelButton").checked = true;
            }else{
                document.getElementById("allSelButton").checked = false;
            }
            //删除button颜色
            if(checkedNum == 0){
                $rootScope.hasChecked = false;
            }else{
                $rootScope.hasChecked = true;
            }
        }
    })
    .controller('yuyueMessageCtrl',function($scope,$rootScope,$state,MessageService,$cordovaSQLite,MessageDboService,$ionicTabsDelegate){
        $rootScope.selectedNum = 0;
        var zhuangtai = 1;
        //获取本地消息列表
        MessageDboService.getMsgByType(zhuangtai,window.localStorage['userName']).then(function(messageList){
            //if(messageList.length == 0){
            //    $scope.isEmpty = true;
            //}else{
            //    $scope.isEmpty = false;
            //}
            $rootScope.messages_yuyue = messageList;
        })

        $scope.itemClick = function(id,msgid){
            if(!$rootScope.isEditStatus){
                $("#yyTitle"+id).addClass("message-read-ud");
                $("#yyTime"+id).addClass("message-read-ud");
                $("#yyContent"+id).addClass("message-read-ud");
                $("#yyTitle"+id).removeClass("message-sub-ud1");
                $("#yyTime"+id).removeClass("message-sub-ud2");
                $("#yyContent"+id).removeClass("message-sub-ud3");
                $state.go("messageDetail",{id:id,index:$ionicTabsDelegate.selectedIndex()});
                MessageService.readMessage(msgid);
                MessageDboService.updateMsg(id);
            }
        }
        $scope.selectForDel = function(id){
            var checkStatus = $("#message_yuyue"+id).is(':checked');
            if(checkStatus){
                $rootScope.selectedNum += 1;
            }else{
                $rootScope.selectedNum -= 1;
            }
            var checkTotal = $("input[type='checkbox'][name='checkbox1']").length;
            var checkedNum = $("input[type='checkbox'][name='checkbox1']:checked").length;
            if(checkedNum == checkTotal){
                document.getElementById("allSelButton").checked = true;
            }else{
                document.getElementById("allSelButton").checked = false;
            }
            //删除button颜色
            if(checkedNum == 0){
                $rootScope.hasChecked = false;
            }else{
                $rootScope.hasChecked = true;
            }
        }
    })
    .controller('yudingMessageCtrl',function($scope,$rootScope,$state,MessageService,$cordovaSQLite,MessageDboService,$ionicTabsDelegate){
        $rootScope.selectedNum = 0;
        var zhuangtai = 4;
        //获取本地消息列表
        MessageDboService.getMsgByType(zhuangtai,window.localStorage['userName']).then(function(messageList){
            //if(messageList.length == 0){
            //    $scope.isEmpty = true;
            //}else{
            //    $scope.isEmpty = false;
            //}
            $rootScope.messages_yuding = messageList;
        })

        $scope.itemClick = function(id,msgid){
            if(!$rootScope.isEditStatus){
                $("#ydTitle"+id).addClass("message-read-ud");
                $("#ydTime"+id).addClass("message-read-ud");
                $("#ydContent"+id).addClass("message-read-ud");
                $("#ydTitle"+id).removeClass("message-sub-ud1");
                $("#ydTime"+id).removeClass("message-sub-ud2");
                $("#ydContent"+id).removeClass("message-sub-ud3");
                $state.go("messageDetail",{id:id,index:$ionicTabsDelegate.selectedIndex()});
                MessageService.readMessage(msgid);
                MessageDboService.updateMsg(id);
            }
        }
        $scope.selectForDel = function(id){
            var checkStatus = $("#message_yuding"+id).is(':checked');
            if(checkStatus){
                $rootScope.selectedNum += 1;
            }else{
                $rootScope.selectedNum -= 1;
            }
            var checkTotal = $("input[type='checkbox'][name='checkbox2']").length;
            var checkedNum = $("input[type='checkbox'][name='checkbox2']:checked").length;
            if(checkedNum == checkTotal){
                document.getElementById("allSelButton").checked = true;
            }else{
                document.getElementById("allSelButton").checked = false;
            }
            //删除button颜色
            if(checkedNum == 0){
                $rootScope.hasChecked = false;
            }else{
                $rootScope.hasChecked = true;
            }
        }
    })
    .controller('messageDetailCtrl',function($scope,$ionicHistory,$stateParams,MessageDboService,$ionicLoading,$ionicTabsDelegate,$timeout){
        $scope.backGo = function () {
            $ionicHistory.goBack();
            //$timeout(function(){
            //    $ionicTabsDelegate.select($stateParams.index);
            //},500);
        };
        $ionicLoading.show({
            template: '<div class="row row-center"><ion-spinner icon="ios-small"></ion-spinner></div>',
            duration:1500
        });
        MessageDboService.getById($stateParams.id).then(function(results){
            $scope.title = results.title;
            $scope.sendtime = results.sendtime;
            //$scope.yuyuecontent = results.yuyuecontent;
            $("#content").html(results.yuyuecontent);
            if(results.msgtype == 1){
                $scope.message_type = "预约";
            }else{
                $scope.message_type = "预定";
            }
            $("#content").find("img").addClass("img-autosize-ud");
            $ionicLoading.hide();
        })
    })
    .controller('newAddedCustomerCtrl',function($scope,$state,$timeout,SdjgOrderService){
        $scope.gotoOrderDetail = function(id){
            $state.go('orderDetail',{type:0,id:id});
        };
        $scope.goto_schedule_view = function(){
            $state.go('scheduleView');
        };
        $scope.goto_personalCenter = function(){
            $state.go('personalCenter');
        };
        $scope.$on('$ionicView.beforeEnter', function(){
            SdjgOrderService.getAllNewCustomer().then(function(results){
                $scope.yuyuelist = results.yuyuelist;
            });
        });
        //SdjgOrderService.getAllNewCustomer().then(function(results){
        //    $scope.yuyuelist = results.yuyuelist;
        //});
        //下拉刷新
        $scope.doRefresh_newCustomerList = function() {
            $timeout( function() {
                SdjgOrderService.getAllNewCustomer().then(function(results){
                    $scope.yuyuelist = results.yuyuelist;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
    })
    .controller('addOrderCtrl',function($scope,$rootScope,$state,$ionicHistory,SdjgOrderService,$cordovaToast,$ionicPopup,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        SdjgOrderService.queryAddInitInfo().then(function(results){
            $scope.jingang = results.jingang;
            $rootScope.ewaifuwu_list = results.jingang.ewaifuwu_list;
            if($scope.jingang.wuyan == undefined){
                $scope.jingang.wuyan = {begin_time: "00:00", end_time: "00:00"};
                $("#lunchTime").attr("disabled",true);
                $timeout(function(){
                    $("#lunchTime").parent().children(".radio-content").css("color","gainsboro");
                },100);
            }
            if($scope.jingang.wanyan == undefined){
                $scope.jingang.wanyan = {begin_time: "00:00", end_time: "00:00"};
                $("#dinnerTime").attr("disabled",true);
                $timeout(function(){
                    $("#dinnerTime").parent().children(".radio-content").css("color","gainsboro");
                },100);
            }
            if($scope.jingang.quantian == undefined){
                $scope.jingang.quantian = {begin_time: "00:00", end_time: "00:00"};
                $("#allDay").attr("disabled",true);
                $timeout(function(){
                    $("#allDay").parent().children(".radio-content").css("color","gainsboro");
                },100);
            }
            var lcount = 0;
            var nolcount = 0;
            for(var key in $scope.jingang.jiage_list){
                if($scope.jingang.jiage_list[key].isyidi == 0){
                    lcount++;
                }else{
                    nolcount++;
                }
            }
            if(lcount == 0){
                $("#local").attr("disabled",true);
                $("#local").parent().children(".radio-content").css("color","gainsboro");
            }
            if(nolcount == 0){
                $("#nonlocal").attr("disabled",true);
                $("#nonlocal").parent().children(".radio-content").css("color","gainsboro");
            }
        });
        //选择婚礼时间
        $scope.selectTime = function(val){
            $("input:radio[name='addressGroup']").attr("checked",false);
            var list = $scope.jingang.jiage_list;
            var ytype = "";
            switch(val){
                case 0:
                    ytype = "午宴";
                    break;
                case 1:
                    ytype = "晚宴";
                    break;
                case 2:
                    ytype = "全天";
                    break;
            }
            var count = 0;
            var isyidi = 0;
            for(var key in list){
                if(list[key].ytype == ytype){
                    isyidi = list[key].isyidi;
                    count++;
                }
            }
            if(count != 2){
                if(isyidi == 0){//只配置同城
                    $("#nonlocal").attr("disabled",true);
                    $("#nonlocal").parent().children(".radio-content").css("color","gainsboro");
                    $("#local").attr("disabled",false);
                    $("#local").parent().children(".radio-content").css("color","");
                }else{//只配置异地
                    $("#local").attr("disabled",true);
                    $("#local").parent().children(".radio-content").css("color","gainsboro");
                    $("#nonlocal").attr("disabled",false);
                    $("#nonlocal").parent().children(".radio-content").css("color","");
                }
            }else{
                $("#local").attr("disabled",false);
                $("#local").parent().children(".radio-content").css("color","");
                $("#nonlocal").attr("disabled",false);
                $("#nonlocal").parent().children(".radio-content").css("color","");
            }
        };

        //选择婚礼地点
        $scope.hideCity = true;
        $scope.chooseAddr = function(type){
            if(type == 0){
                $scope.hideCity = true;
            }else{
                $scope.hideCity = false;
            }
            //$("#lunchTime").attr("disabled",false);
            //$("#lunchTime").parent().children(".radio-content").css("color","");
            //$("#dinnerTime").attr("disabled",false);
            //$("#dinnerTime").parent().children(".radio-content").css("color","");
            //$("#allDay").attr("disabled",false);
            //$("#allDay").parent().children(".radio-content").css("color","");
            //var list = $scope.jingang.jiage_list;
            //var array = new Array();
            //for(var key in list){
            //    if(list[key].isyidi == type){
            //        array.push(list[key].ytype);
            //    }
            //}
            //if($.inArray("午宴",array) == -1){
            //    $("#lunchTime").attr("disabled",true);
            //    $("#lunchTime").parent().children(".radio-content").css("color","gainsboro");
            //}
            //if($.inArray("晚宴",array) == -1){
            //    $("#dinnerTime").attr("disabled",true);
            //    $("#dinnerTime").parent().children(".radio-content").css("color","gainsboro");
            //}
            //if($.inArray("全天",array) == -1){
            //    $("#allDay").attr("disabled",true);
            //    $("#allDay").parent().children(".radio-content").css("color","gainsboro");
            //}
        };

        $('#dangqi').focus(function() {
            this.blur();
        });
        $('#meet_date').focus(function() {
            this.blur();
        });
        $('#meet_time').focus(function() {
            this.blur();
        });
        //服务档期选择
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("dangqi").value = dangqi;
                    var type = 1;//线下
                    SdjgOrderService.get_xuhao_by_dangqi(type,dangqi).then(function(results){
                        $scope.order_xuhao = results.xuhao;
                    });
                    //时间选择radio初始化
                    $("#lunchTime").parent().children(".radio-content").css("color","");
                    $("#dinnerTime").parent().children(".radio-content").css("color","");
                    $("#allDay").parent().children(".radio-content").css("color","");
                    $("input[name=timeGroup]").attr("disabled",false);
                    $("input[name=timeGroup]").attr("checked",false);
                    //地点选择radio初始化
                    $("#local").parent().children(".radio-content").css("color","");
                    $("#nonlocal").parent().children(".radio-content").css("color","");
                    $("input[name=addressGroup]").attr("disabled",false);
                    $("input[name=addressGroup]").attr("checked",false);
                    SdjgOrderService.queryAddInitInfo(val.format('yyyy-MM-dd')).then(function(results) {
                        $scope.jingang = results.jingang;
                        var list = $scope.jingang.jiage_list;
                        var array = new Array();
                        for(var key in list){
                            array.push(list[key].ytype);
                        }
                        if($.inArray("午宴",array) == -1){
                            $("#lunchTime").attr("disabled",true);
                            $("#lunchTime").parent().children(".radio-content").css("color","gainsboro");
                        }
                        if($.inArray("晚宴",array) == -1){
                            $("#dinnerTime").attr("disabled",true);
                            $("#dinnerTime").parent().children(".radio-content").css("color","gainsboro");
                        }
                        if($.inArray("全天",array) == -1){
                            $("#allDay").attr("disabled",true);
                            $("#allDay").parent().children(".radio-content").css("color","gainsboro");
                        }
                    });
                }
            }
        };
        //会面日期选择
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("meet_date").value = dangqi;
                }
            }
        };
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("meet_time").value = hour+":"+ minute +" "+ meridian;
            }
        };


        $scope.extServId = 0;
        $scope.showExtraService = function(){
            $timeout(function(){
                if($scope.extServId != 0){
                    $("input[name='exServName'][value='"+$scope.extServId+"']").attr("checked",true);
                }
            },100);
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"<span class='font-heiti-ud'>增值服务</span>",
                template:"<div align='left' class='font-heiti-ud'>" +
                //"<ion-radio name='exServName' ng-model='default' ng-value='default'>不需要其他额外服务</ion-radio>" +
                //"<div ng-repeat='item in ewaifuwu_list'><ion-radio name='exServName' ng-value='item.id'><span>{{item.name}}</span><span style='position: absolute;right: 4em;'>{{item.price}}</span></ion-radio></div>"+
                "<label class='item item-radio' style='border-width: 0px;margin: 0px -1px;'>" +
                    "<input type='radio' name='exServName' ng-value='default' ng-model='default'>" +
                    "<div class='radio-content'>" +
                        "<div class='item-content'><span>不需要其他额外服务</span></div>" +
                    "</div>" +
                "</label>" +
                "<div ng-repeat='item in ewaifuwu_list'>" +
                    "<label class='item item-radio' style='border-width: 0px;margin: 0px -1px;'>" +
                        "<input type='radio' name='exServName' ng-value='item.id'>" +
                        "<div class='radio-content'>" +
                            "<div class='item-content'><span>{{item.name}}</span><span style='position: absolute;right: 4em;'>{{item.price}}</span></div>" +
                        "</div>" +
                    "</label>" +
                "</div>"+
                "</div>",
                cancelText:"取消",
                okText:"确认",
                okType: "button-assertive"
            }).then(function(res){
                if(res){
                    var checkedValue = $("input[name='exServName']:checked").val();
                    if(checkedValue != "on"){
                        for(var key in $rootScope.ewaifuwu_list){
                            if($rootScope.ewaifuwu_list[key].id == checkedValue){
                                $scope.extraServ = $rootScope.ewaifuwu_list[key].name + "  " + $rootScope.ewaifuwu_list[key].price;
                            }
                        }
                        $scope.extServId = checkedValue;
                    }else{
                        $scope.extraServ = "不需要其他额外服务";
                        $scope.extServId = 0;
                    }
                }
            })
        };

        //提交保存
        $scope.commitNewOrder = function(){
            if($("#dangqi").val().trim() == ""){
                $cordovaToast.showShortTop("请选择服务档期！");
                return;
            }
            if($("input[name='timeGroup']:checked").val() == undefined){
                $cordovaToast.showShortTop("请选择婚礼时间！");
                return;
            }
            if($("input[name='addressGroup']:checked").val() == undefined){
                $cordovaToast.showShortTop("请选择婚礼地点！");
                return;
            }
            if($("input[name='addressGroup']:checked").val() == 1){
                if($("#nonlocalCity").val().trim() == ""){
                    $cordovaToast.showShortTop("请输入异地城市！");
                    return;
                }
            }
            if($("#totalPrice").val().trim() == ""){
                $cordovaToast.showShortTop("请输入总金额！");
                return;
            }
            var reg = /^(([1-9]{1}\d*))(\.(\d){1,2})?$/;
            if(!reg.test($("#totalPrice").val().trim())){
                $cordovaToast.showShortTop("总金额格式有误，请重新输入！");
                return;
            }
            if($("#recommendPerson").val().trim() == ""){
                $cordovaToast.showShortTop("请输入联系人！");
                return;
            }
            if($("#contactPhone").val().trim() == ""){
                $cordovaToast.showShortTop("请输入联系电话！");
                return;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#contactPhone").val()) && !isPhone.test($("#contactPhone").val())){
                $cordovaToast.showShortTop('联系电话格式不正确,请重新输入！');
                return;
            }
            if($("#brideName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新郎姓名！");
                return;
            }
            if($("#bridegroomName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新娘姓名！");
                return;
            }
            if($("#weedingAddr").val().trim() == ""){
                $cordovaToast.showShortTop("请输入婚礼场所！");
                return;
            }
            if($("#newerMobile").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新人电话！");
                return;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#newerMobile").val()) && !isPhone.test($("#newerMobile").val())){
                $cordovaToast.showShortTop('新人电话格式不正确,请重新输入！');
                return;
            }
            var ytype = "";
            var servtime = $("input[name='timeGroup']:checked").val();
            if(servtime == 0){
                ytype = "午宴";
            }else if(servtime == 1){
                ytype = "晚宴";
            }else{
                ytype = "全天";
            }
            var yidi_checked = $("input[name='addressGroup']:checked").val();
            var paramsJson = {
                date:$("#dangqi").val(),
                ytype:ytype,
                isyidi:yidi_checked,
                city_name:yidi_checked==1 ? $("#nonlocalCity").val():$scope.jingang.gongsi_cityname,
                ewai_id:$scope.extServId,
                totalprice:$("#totalPrice").val(),
                recommendPerson:$("#recommendPerson").val(),
                xuhao:$scope.order_xuhao,
                phone:$("#contactPhone").val(),
                man:$("#brideName").val(),
                woman:$("#bridegroomName").val(),
                hotel:$("#weedingAddr").val(),
                xinrenphone:$("#newerMobile").val(),
                hunqi:$("#meet_date").val(),
                begin_time:$("#meet_time").val(),
                comment:$("#comment").val(),
                jingang:$scope.jingang,
                servName:$scope.extServId == 0 ? "":$scope.extraServ
            }
            SdjgOrderService.saveNewOrderInfo(paramsJson).then(function(results){
                if(results.status == 1) {
                    $state.go('offlineOrderInfo',{orderinfo:results.orderinfo,paramsJson:paramsJson});
                }else{
                    $cordovaToast.showShortBottom(results.info);
                }
            })
        }
    })
    //新增-跳转到-线下订单处理页
    .controller('offlineOrderInfoCtrl',function($scope,$ionicHistory,$ionicPopup,SdjgOrderService,$stateParams,$cordovaToast,$state,$timeout,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.orderinfo = $stateParams.orderinfo;
        $scope.orderData = $stateParams.paramsJson;
        if($scope.orderData.ytype == "午宴"){
            $scope.beginTime = $scope.orderData.jingang.wuyan.begin_time;
            $scope.endTime = $scope.orderData.jingang.wuyan.end_time;
        }else if($scope.orderData.ytype == "晚宴"){
            $scope.beginTime = $scope.orderData.jingang.wanyan.begin_time;
            $scope.endTime = $scope.orderData.jingang.wanyan.end_time;
        }else{
            $scope.beginTime = $scope.orderData.jingang.quantian.begin_time;
            $scope.endTime = $scope.orderData.jingang.quantian.end_time;
        }
        //if($scope.orderData.isyidi == 0){
        //    for(var key in $scope.orderData.jingang.diqu_list){
        //        if($scope.orderData.jingang.diqu_list[key].id == $scope.orderData.jingang.gongsi_cityid){
        //            $scope.weddingAddr = $scope.orderData.jingang.diqu_list[key].name;
        //        }
        //    }
        //}else{
            $scope.weddingAddr = $scope.orderData.city_name;
        //}
        if($scope.orderData.servName != "") {
            $scope.extServName = $scope.orderData.servName.substring(0, $scope.orderData.servName.length - 2);
        }

        $scope.completeOrder = function(){
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:'操作成功',
                template:'<div style="text-align: center">确定已完成该笔订单吗？</div>',
                cancelText:'确认',
                cancelType:'button-assertive',
                okText:'取消',
                okType:'button-ligth'
            }).then(function(res) {
                if(!res){//确认
                    var paramsJson = {
                        id:$scope.orderinfo.id,
                        man:$scope.orderData.man,
                        woman:$scope.orderData.woman,
                        hotel:$scope.orderData.hotel,
                        phone:$scope.orderData.xinrenphone,
                        hunqi:$scope.orderData.hunqi.replace(/\./g,"-"),
                        begin_time:$scope.orderData.begin_time,
                        beizhu:$("#comment2").val()
                    };
                    SdjgOrderService.completeOrder(paramsJson).then(function(results){
                        if(results.status == 1){
                            $state.go('orderTabs',{dangqi:$scope.orderData.date,index:2});
                            $timeout(function(){
                                $rootScope.doRefresh_complete_tab();
                            },500);
                        }else{
                            $cordovaToast.showShortTop(results.info);
                        }
                    });
                }else{//取消
                    $state.go('orderTabs',{dangqi:$scope.orderData.date,index:1});
                    $timeout(function(){
                        $rootScope.doRefresh_yuding_tab();
                    },500);
                }
            });;
        }
        $scope.saveOrder = function(){
            var paramsJson = {
                id:$scope.orderinfo.id,
                man:$scope.orderData.man,
                woman:$scope.orderData.woman,
                hotel:$scope.orderData.hotel,
                phone:$scope.orderData.xinrenphone,
                hunqi:$scope.orderData.hunqi.replace(/\./g,"-"),
                begin_time:$scope.orderData.begin_time,
                beizhu:$("#comment2").val()
            };
            SdjgOrderService.saveOrderInfo(paramsJson).then(function(results) {
                if (results.status == 1) {
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title: '操作成功',
                        template: '<div style="text-align: center">保存完成</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    });
                    $state.go('orderTabs',{dangqi:$scope.orderData.date,index:1});
                    $timeout(function(){
                        $rootScope.doRefresh_yuding_tab();
                    },500);
                }
            });
        }
    })
    .controller('orderDetailCtrl',function($scope,$state,$ionicHistory,$cordovaToast,SdjgOrderService,$stateParams,$ionicPopup,$timeout,$rootScope,$ionicScrollDelegate){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.showCancleOdBtt = false;
        var wtype = $stateParams.wtype;
        SdjgOrderService.queryOneOrderInfo($stateParams.id).then(function(results){
            $scope.item = results.item;
            if(results.item.contact_sex == "新郎" || results.item.contact_sex == "man"){
                $scope.contactMan = true;
            }else if(results.item.contact_sex == "新娘" || results.item.contact_sex == "woman"){
                $scope.contactMan = false;
            }else{
                $("#contact_man_flag").hide();
                $("#contact_woman_flag").hide();
            }
            if(results.item.huimianshijian.trim() != ""){
                $scope.meet_date = results.item.huimianshijian.substring(0,11);
                $scope.meet_time = results.item.huimianshijian.substring(11);
            }
            if(results.item.yuding_xuhao.match(/\D/) == null){//预定序号中不含字母 线上订单
                $scope.orderUser = "预定用户";
            }else{//线下订单
                $scope.orderUser = "推介商家";
                $("#pay_info_row").hide();
                if($scope.item.status == "订单生效"){//商户端新增线下订单且状态是订单生效
                    $scope.showCancleOdBtt = true;
                }
            }
        });
        //取消订单弹框
        $scope.cancelOrderPop = function(){
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"取消订单",
                template:"<div align='center'><div class='row'><div class='col'>服务档期</div><div class='col col-67' style='color:#ff7666'>"+$scope.item.dangqi+"</div></div>" +
                "<div class='row'><div class='col'></div><div class='col col-67' style='color:#ff7666'>"+$scope.item.ytype+"("+$scope.item.begin_time+"~"+$scope.item.end_time+")</div></div>" +
                "<div class='row'><div class='col'>原因</div><div class='col col-67'><textarea id='reason' rows='3' cols='20' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></textarea></div></div>" +
                "<div class='row'><div class='col'>是否确认取消预约?</div></div></div>",
                okText: '是',
                cancelText:'否',
                okType: "button-assertive"
            }).then(function(res) {
                if (res) {
                    var paramsJson = {id:$scope.item.id,reason:$("#reason").val()};
                    SdjgOrderService.cancelOrder(paramsJson).then(function(results){
                        if(results.status == 1){
                            $ionicHistory.goBack();
                            if(wtype == 0){//tab全部进入
                                $rootScope.doRefresh_all_tab();
                            }else if(wtype == 1){//tab预定进入
                                $rootScope.doRefresh_yuding_tab();
                            }else{//全部订单进入
                                $rootScope.doRefresh_all_jgOrder();
                                $timeout(function(){
                                    $ionicScrollDelegate.scrollTop();
                                },500);
                            }
                        }
                    })
                }
            });
        };
        if($stateParams.type == 0){//预约总表进入
            $scope.allListEnter = true;
        }else{//档期列表进入
            $scope.allListEnter = false;
        }
        $('#meet_date').focus(function() {
            this.blur();
        });
        $('#meet_time').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("meet_date").value = dangqi;
                }
            }
        };
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("meet_time").value = hour+":"+ minute +" "+ meridian;
            }
        };
        $scope.validateData = function(){
            if($("#brideName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新郎姓名！");
                return false;
            }
            if($("#bridegroomName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新娘姓名！");
                return false;
            }
            if($("#weedingAddr").val().trim() == ""){
                $cordovaToast.showShortTop("请输入婚礼场所！");
                return false;
            }
            if($("#newerMobile").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新人电话！");
                return false;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#newerMobile").val()) && !isPhone.test($("#newerMobile").val())){
                $cordovaToast.showShortTop('新人电话格式不正确,请重新输入！');
                return false;
            }
            return true;
        };

        $scope.confirmOrder = function(){
            if($scope.validateData()){
                var paramsJson = {
                    id:$stateParams.id,
                    man:$("#brideName").val(),
                    woman:$("#bridegroomName").val(),
                    hotel:$("#weedingAddr").val(),
                    phone:$("#newerMobile").val(),
                    hunqi:$("#meet_date").val().replace(/\./g,"-"),
                    begin_time:$("#meet_time").val(),
                    beizhu:$("#comment").val()
                };
                SdjgOrderService.confirmOrderInfo(paramsJson).then(function(results){
                    if(results.status == 1){
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title: '操作成功',
                            template: '<div style="text-align: center">确认完成</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        });
                        $ionicHistory.goBack();
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all_tab();
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding_tab();
                        }else{//全部订单进入
                            $rootScope.doRefresh_all_jgOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }
                    }
                });
            }
        };
        $scope.completeOrder = function(){
            if($scope.validateData()) {
                $ionicPopup.confirm({
                    cssClass: 'myPopup',
                    title: '操作成功',
                    template: '<div style="text-align: center">确定已完成该笔订单吗？</div>',
                    cancelText: '确认',
                    cancelType: 'button-assertive',
                    okText: '取消',
                    okType: 'button-ligth'
                }).then(function(res) {
                    if(!res){ //确认
                        var paramsJson = {
                            id:$stateParams.id,
                            man:$("#brideName").val(),
                            woman:$("#bridegroomName").val(),
                            hotel:$("#weedingAddr").val(),
                            phone:$("#newerMobile").val(),
                            hunqi:$("#meet_date").val().replace(/\./g,"-"),
                            begin_time:$("#meet_time").val(),
                            beizhu:$("#comment").val()
                        };
                        SdjgOrderService.completeOrder(paramsJson).then(function(results){
                            if(results.status == 1){
                                if(wtype == 0 || wtype == 1) {
                                    $state.go('orderTabs', {dangqi: $scope.item.dangqi, index: 2});
                                    $timeout(function () {
                                        $rootScope.doRefresh_complete_tab();
                                    }, 500);
                                }else{//全部订单进入
                                    $ionicHistory.goBack();
                                    $rootScope.doRefresh_all_jgOrder();
                                    $timeout(function(){
                                        $ionicScrollDelegate.scrollTop();
                                    },500);
                                }
                            }
                        });
                    }else{//取消
                        //$state.go('orderTabs',{dangqi:$scope.item.dangqi,index:1});
                        //$timeout(function(){
                        //    $rootScope.doRefresh_yuding_tab();
                        //},500);
                        $ionicHistory.goBack();
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all_tab();
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding_tab();
                        }else{//全部订单进入
                            $rootScope.doRefresh_all_jgOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }
                    }
                });
            }
        };
        $scope.saveOrder = function(){
            if($scope.validateData()) {
                var paramsJson = {
                    id:$stateParams.id,
                    man:$("#brideName").val(),
                    woman:$("#bridegroomName").val(),
                    hotel:$("#weedingAddr").val(),
                    phone:$("#newerMobile").val(),
                    hunqi:$("#meet_date").val().replace(/\./g,"-"),
                    begin_time:$("#meet_time").val(),
                    beizhu:$("#comment").val()
                };
                SdjgOrderService.saveOrderInfo(paramsJson).then(function(results) {
                    if (results.status == 1) {
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title: '操作成功',
                            template: '<div style="text-align: center">保存完成</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        });
                        //$state.go('orderTabs',{dangqi:$scope.item.dangqi,index:1});
                        //$timeout(function(){
                        //    $rootScope.doRefresh_yuding_tab();
                        //},500);
                        $ionicHistory.goBack();
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all_tab();
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding_tab();
                        }else{//全部订单进入
                            $rootScope.doRefresh_all_jgOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }
                    }
                });
            }
        }
    })
    .controller('scheduleViewCtrl',function($scope,$state,$ionicHistory,SdjgOrderService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.show_yuding_tab = function(){
            $state.go('orderTabs',{dangqi:$scope.dangqi,index:1});
        };
        $scope.sj_name = window.localStorage['sj_name'];

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        $("#selected_date").html(year+"."+month+"."+day);
        $timeout(function(){
            $("#lunar_date").html($("#ly"+day).text()+"<br>"+$("#lmd"+day).text());
        },500);
        $scope.dangqi = year+"."+month+"."+day;
        var selected_date_array = new Array();
        $(function() {
            $(document).off('shown.calendar.calendario');
            $(document).on('shown.calendar.calendario', function(e, instance){
                selected_date_array = new Array();
                if(!instance) instance = cal;
                var $cell = instance.getCell(new Date().getDate());
                //if($cell.hasClass('fc-today')) $cell.trigger('click.calendario');
                $scope.instance = instance;
                SdjgOrderService.query_dangqi_info(instance.getYear(),instance.getMonth(),null).then(function(results){
                    var items = results.item;
                    for(var key in items){
                        //$scope.instance.getCell(parseInt(key)).removeClass("fc-close");
                        //午宴
                        if(items[key].shangwu_type == 0){
                            $scope.instance.getCell(parseInt(key)).append('<div style="content: url(img/lunch_blue.png);position: absolute;left: 0;top: 0;width: 40%;"></div>');
                        }else if(items[key].shangwu_type == 1){
                            $scope.instance.getCell(parseInt(key)).append('<div style="content: url(img/lunch_red.png);position: absolute;left: 0;top: 0;width: 40%;"></div>');
                        }
                        //晚宴
                        if(items[key].xiawu_type == 0){
                            $scope.instance.getCell(parseInt(key)).append('<div style="content: url(img/dinner_blue.png);position: absolute;right:0;bottom: 0;width: 40%;"></div>');
                        }else if(items[key].xiawu_type == 1){
                            $scope.instance.getCell(parseInt(key)).append('<div style="content: url(img/dinner_red.png);position: absolute;right:0;bottom: 0;width: 40%;"></div>');
                        }
                    }
                });
                //$(".fc-weekday").after('<span class="calendar-lunch-span-ud">午<br>宴</span><div class="calendar-lunch-top-ud"></div><div class="calendar-lunch-left-ud"></div>');
                //$(".fc-weekday").after('<span class="calendar-dinner-span-ud">晚<br>宴</span><div class="calendar-dinner-bottom-ud"></div><div class="calendar-dinner-right-ud"></div>');
                //$(".fc-weekday").after('<div style="content: url(img/lunch_red.png);position: absolute;left: 0;top: 0;width: 40%;"></div>');
                //$(".fc-weekday").after('<div style="content: url(img/dinner_blue.png);position: absolute;right:0;bottom: 0;width: 40%;"></div>');
            });

            var transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition' : 'transitionend',
                    'OTransition' : 'oTransitionEnd',
                    'msTransition' : 'MSTransitionEnd',
                    'transition' : 'transitionend'
                },
                transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                $wrapper = $( '#custom-inner' ),
                $calendar = $( '#calendar' ),
                cal = $calendar.calendario({
                    onDayClick : function( $el, data, dateProperties ) {
                        $scope.dangqi = dateProperties.year+"."+dateProperties.month+"."+dateProperties.day;
                        $scope.pdate = parseInt(dateProperties.year + parse_date(dateProperties.month) + parse_date(dateProperties.day));
                        if($el[0].firstChild.className !="fc-date fc-emptydate"){
                            $("#selected_date").html(dateProperties.year+"."+dateProperties.month+"."+dateProperties.day);
                            $("#lunar_date").html($("#ly"+dateProperties.day).text()+"<br>"+$("#lmd"+dateProperties.day).text());
                            //UserService.query_schedule_info(dateProperties.year,dateProperties.month,dateProperties.day).then(function(results){
                            //    $scope.zhuting_status_format = results.item.zhuting_status_format;
                            //    $scope.futing_status_format = results.item.futing_status_format;
                            //    $scope.zhuting_status = results.item.zhuting_status;
                            //    $scope.futing_status = results.item.futing_status;
                            //});
                            for(var i = 1;i<=31;i++){
                                if(i == parseInt(dateProperties.day)){
                                    $el[0].classList.add("fc-selected");
                                }else if($scope.instance != undefined){
                                    $scope.instance.getCell(parseInt(i)).removeClass("fc-selected");
                                }
                            }
                        }
                    },
                    //caldata : codropsEvents,
                    weekabbrs  : [ '日', '一', '二', '三', '四', '五', '六' ],
                    //monthabbrs : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    months  : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    displayWeekAbbr : true,
                    // left-most day in the calendar  0- Sunday, 1 - Monday, ... , 6 - Saturday
                    startIn : 0,
                    events: 'click'
                } ),
                $month = $( '#custom-month' ).html( cal.getMonthName() ),
                $year = $( '#custom-year' ).html( cal.getYear() );

            //cal.setData(codropsEvents);

            $( '#custom-next' ).on( 'click', function() {
                cal.gotoNextMonth( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#custom-prev' ).on( 'click', function() {
                cal.gotoPreviousMonth( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#year-next' ).on( 'click', function() {
                cal.gotoNextYear( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#year-prev' ).on( 'click', function() {
                cal.gotoPreviousYear( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            function updateMonthYear() {
                $month.html( cal.getMonthName() );
                $year.html( cal.getYear() );
                selected_date_array = new Array();
            }
        });

    })
    .controller('personalCenterCtrl',function($scope,$state,$ionicHistory,LoginService,SdjgUserService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.logout = function(){
            LoginService.logout();
        };
        $scope.$on('$ionicView.beforeEnter', function() {
            SdjgUserService.queryUserInfo().then(function (results) {
                $scope.item = results.item;
                if($scope.item.stype == 1){
                    $scope.jgName = "主持人";
                }else if($scope.item.stype == 2){
                    $scope.jgName = "摄影师";
                }else if($scope.item.stype == 3){
                    $scope.jgName = "摄像师";
                }else if($scope.item.stype == 4){
                    $scope.jgName = "化妆师";
                }
            })
        })
    })
    .controller('personDetailCtrl',function($scope,$state,$ionicHistory,$ionicModal,$ionicSlideBoxDelegate,SdjgUserService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        SdjgUserService.queryUserInfo().then(function(results){
            $scope.item = results.item;
            $scope.skill = "";
            $scope.serveArea = "";
            //技能字符拼接
            for(var key in results.item.jineng){
                $scope.skill += results.item.jineng[key] + " | ";
            }
            $scope.skill = $scope.skill.substring(0,$scope.skill.length-2);
            //服务地区拼接
            //for(var key in results.item.yidi){
            //    $scope.serveArea += results.item.yidi[key] + " | ";
            //}
            //$scope.serveArea = $scope.serveArea.substring(0,$scope.serveArea.length-2);
            if(results.item.yidi == null){
                $scope.serveArea = "主场";
            }else{
                $scope.serveArea = "主场 | 可外地";
            }
            $scope.images = new Array();
            if(results.item.logo != ""){
                $scope.images.push({src:results.item.logo});
            }
            if(results.item.index_img1 != ""){
                $scope.images.push({src:results.item.index_img1});
            }
            if(results.item.index_img2 != ""){
                $scope.images.push({src:results.item.index_img2});
            }
            if(results.item.index_img3 != ""){
                $scope.images.push({src:results.item.index_img3});
            }
            if(results.item.index_img4 != ""){
                $scope.images.push({src:results.item.index_img4});
            }
            if($scope.item.stype == 1){
                $scope.jgName = "主持人";
                $scope.stypeName = "主持技能";
            }else if($scope.item.stype == 2){
                $scope.jgName = "摄影师";
                $scope.stypeName = "摄影服务";
            }else if($scope.item.stype == 3){
                $scope.jgName = "摄像师";
                $scope.stypeName = "摄像服务";
            }else if($scope.item.stype == 4){
                $scope.jgName = "化妆师";
                $scope.stypeName = "化妆风格";
            }
        });

        $ionicModal.fromTemplateUrl('image-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function() {
            $ionicSlideBoxDelegate.slide(0);
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    })
    .controller('orderTabsCtrl',function($scope,$state,$stateParams,$ionicHistory,$ionicTabsDelegate,$timeout,SdjgOrderService,$ionicLoading,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.dangqi = $stateParams.dangqi;
        //$scope.$on('$ionicView.beforeEnter', function() {
            $timeout(function () {
                $ionicTabsDelegate.select($stateParams.index);
            }, 500);
        //})

        $scope.goto_schedule_view = function(){
            $state.go('scheduleView');
        };
        //status:全部 空 预定-2 完成-4
        var paramsJson = {
            dangqi:$scope.dangqi.replace(/\./g,"-"),
            status:2
        };
        SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
            $scope.yudingOrderList = results.yuyuelist;
        });
        //下拉刷新
        $rootScope.doRefresh_all_tab = function() {
            $timeout( function() {
                paramsJson = {dangqi:$scope.dangqi.replace(/\./g,"-")};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.allOrderList = results.yuyuelist;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $rootScope.doRefresh_yuding_tab = function() {
            $timeout( function() {
                paramsJson = {dangqi:$scope.dangqi.replace(/\./g,"-"),status:2};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.yudingOrderList = results.yuyuelist;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $rootScope.doRefresh_complete_tab = function() {
            $timeout( function() {
                paramsJson = {dangqi:$scope.dangqi.replace(/\./g,"-"),status:4};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.completedOrderList = results.yuyuelist;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //选中tab刷新数据
        $scope.selectAllOrderTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $scope.doRefresh_all_tab();
        };
        $scope.selectYudingOrderTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $rootScope.doRefresh_yuding_tab();
        };
        $scope.selectCompeleteOrderTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $rootScope.doRefresh_complete_tab();
        };

        $scope.gotoOrderDetail = function(id){
            //if(status == 2){//预定
                $state.go('orderDetail',{type:1,id:id,wtype:1});
            //}else{//完成
            //    $state.go('completedOrderDetail',{id:id});
            //}
        };
        $scope.showOrderDetail = function(id,status,yuyue_type){
            if(status == 1){//1=>'支付成功'
                $state.go("orderDetail",{id:id,type:0,wtype:0});
            }else if(status == 2){//2=>'订单生效'
                $state.go("orderDetail",{id:id,wtype:0});
            }else{//3=>'交易关闭', 4=>'交易成功', 5=>'退款处理', 6=>'已退款'
                $state.go("completedOrderDetail",{id:id,type:yuyue_type});
            }
        };
    })
    .controller('sdjgMessageTabCtrl',function($scope,$state,$ionicHistory){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
    })
    .controller('sdjg_allMessageCtrl',function($scope,$state,$ionicHistory){

    })
    .controller('sdjg_yuyueMessageCtrl',function($scope,$state,$ionicHistory){

    })
    .controller('sdjg_yudingMessageCtrl',function($scope,$state,$ionicHistory){

    })
    .controller('jgAllOrdersCtrl',function($scope,$rootScope,$state,$ionicHistory,SdjgOrderService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        //$ionicLoading.show({
        //    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //});
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv = false;
        $scope.noMoredata = false;
        $scope.allOrderList = [];
        $scope.loadMore = function () {
            var paramsJson = {page:page,pagesize:pagesize};
            SdjgOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.sname = results.sname;
                $scope.name = results.name;
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.allOrderList.length < $scope.total_yuyue) {
                        $scope.allOrderList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata = true;
                        $scope.showDiv = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        $rootScope.doRefresh_all_jgOrder = function() {
            $scope.showDiv = false;
            $scope.noMoredata = false;
            $timeout( function() {
                page = 1;//覆盖上面定义的全局变量page
                var paramsJson = {page:page,pagesize:pagesize};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.sname = results.sname;
                    $scope.name = results.name;
                    //$scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.allOrderList = results.yuyuelist;
                    page++;
                    //$ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.doRefresh_all_jgOrder();
        $scope.showOrderDetail = function(id,status,yuyue_type){
            if(status == 1){//1=>'支付成功'
                $state.go("orderDetail",{id:id,type:0,wtype:2});
            }else if(status == 2){//2=>'订单生效'
                $state.go("orderDetail",{id:id,wtype:2});
            }else{//3=>'交易关闭', 4=>'交易成功', 5=>'退款处理', 6=>'已退款'
                $state.go("completedOrderDetail",{id:id,type:yuyue_type});
            }
        }
    })
    .controller('jgCanceledOrdersCtrl',function($scope,$state,$ionicHistory,SdjgOrderService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        //$ionicLoading.show({
        //    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //});
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv = false;
        $scope.noMoredata = false;
        $scope.canceledOrderList = [];
        $scope.loadMore = function () {
            var paramsJson = {status:"3,5,6",page:page,pagesize:pagesize};//3=>'交易关闭', 5=>'退款处理', 6=>'退款完成'
            SdjgOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.sname = results.sname;
                $scope.name = results.name;
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.canceledOrderList.length < $scope.total_yuyue) {
                        $scope.canceledOrderList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata = true;
                        $scope.showDiv = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };

        $scope.doRefresh_canceled_jgOrder = function() {
            $scope.showDiv = false;
            $scope.noMoredata = false;
            $timeout( function() {
                page = 1;//覆盖上面定义的全局变量page
                var paramsJson = {status:"3,5,6",page:page,pagesize:pagesize};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.sname = results.sname;
                    $scope.name = results.name;
                    //$scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.canceledOrderList = results.yuyuelist;
                    page++;
                    //$ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.doRefresh_canceled_jgOrder();
    })
    .controller('completedOrderTabCtrl',function($scope,$state,$ionicHistory,$timeout,SdjgOrderService,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv_online = false;
        $scope.noMoredata_online = false;
        $scope.onlineList = [];
        $scope.loadMore_online = function () {
            var paramsJson = {yuyue_type:0,status:4,page:page,pagesize:pagesize};//yuyue_type 订单类别 0：线上 1：线下  status=4 已完成
            SdjgOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.onlineList.length < $scope.total_yuyue) {
                        $scope.onlineList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata_online = true;
                        $scope.showDiv_online = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        var page2 = 1;//第几页
        var pagesize2 = 20;//每页条数
        $scope.showDiv_offline = false;
        $scope.noMoredata_offline = false;
        $scope.offlineList = [];
        $scope.loadMore_offline = function () {
            var paramsJson = {yuyue_type:1,status:4,page:page2,pagesize:pagesize2};//yuyue_type 订单类别 0：线上 1：线下  status=4 已完成
            SdjgOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.offlineList.length < $scope.total_yuyue) {
                        $scope.offlineList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata_offline = true;
                        $scope.showDiv_offline = true;
                        break;
                    }
                }
                page2++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };

        //SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
        //    $scope.onlineList = results.yuyuelist;
        //});
        $scope.refresh_online_order = function() {
            $scope.showDiv_online = false;
            $scope.noMoredata_online = false;
            $timeout( function() {
                page = 1;
                var paramsJson = {yuyue_type:0,status:4,page:page,pagesize:pagesize};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.onlineList = results.yuyuelist;
                    $ionicLoading.hide();
                    page++;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.refresh_offline_order = function() {
            $scope.showDiv_offline = false;
            $scope.noMoredata_offline = false;
            $timeout( function() {
                page2 = 1;
                var paramsJson = {yuyue_type:1,status:4,page:page2,pagesize:pagesize2};
                SdjgOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.offlineList = results.yuyuelist;
                    $ionicLoading.hide();
                    page2++;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.selectOnlineTab = function(){
        //    $ionicLoading.show({
        //        template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //    });
        //    $scope.refresh_online_order();
        //}
        //$scope.seleectOfflineTab = function(){
        //    $ionicLoading.show({
        //        template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //    });
        //    $scope.refresh_offline_order();
        //}
    })
    .controller('completedOrderDetailCtrl',function($scope,$state,$ionicHistory,$stateParams,SdjgOrderService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        SdjgOrderService.queryOneOrderInfo($stateParams.id).then(function(results){
            $scope.item = results.item;
            if($stateParams.type == 1){//自接订单 联系人隐藏
                $("#contact_man_flag").hide();
                $("#contact_woman_flag").hide();
            }else{//线上订单
                if(results.item.contact_sex == "新郎" || results.item.contact_sex == "man"){
                    $scope.contactMan = true;
                }else if(results.item.contact_sex == "新娘" || results.item.contact_sex == "woman"){
                    $scope.contactMan = false;
                }else{
                    $("#contact_man_flag").hide();
                    $("#contact_woman_flag").hide();
                }
            }
            //档期列表 完成tab跳转到详情页
            if(results.item.yuding_xuhao.match(/\D/) == null){//预定序号中不含字母 线上订单
                $scope.orderUser = "预定用户";
            }else{//线下订单
                $scope.orderUser = "推介商家";
                $("#pay_info_row").hide();
            }
            if($scope.item.status == "已退款" || $scope.item.status == "交易关闭"){
                $scope.is_tuikuan = true;
            }else{
                $scope.is_tuikuan = false;
            }
            if($scope.item.status == "已退款" || $scope.item.status == "退款处理"){
                $("#pay_stat").html($scope.item.status);
                $("#pay_stat").css("color","#ff7666");
            }else{
                $("#pay_stat").html("待付："+($scope.item.yuding_price-$scope.item.bencizhifu).toFixed(2));
            }
        })
    })
    .controller('activityPageCtrl',function($scope,$rootScope,$state,$ionicHistory,SdjgUserService,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        SdjgUserService.get_activity_info(0).then(function(results){
            $scope.items = results.item;
        });
        $rootScope.doRefresh_actvt = function() {
            $timeout( function() {
                SdjgUserService.get_activity_info(0).then(function(results){
                    $scope.items = results.item;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.slide_acty = function(index){
            $("#item_detail"+index).slideToggle();
            var up_arroe_state =$("#up_arrow"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow"+index).css('display','block');
                $("#down_arrow"+index).css('display','none');
            }else{
                $("#up_arrow"+index).css('display','none');
                $("#down_arrow"+index).css('display','block');
            }
        };
    })
    .controller('activityAddCtrl',function($scope,$state,$ionicHistory,SdjgUserService,$cordovaToast,$ionicPopup,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $('#start_date').focus(function() {
            this.blur();
        });
        $('#end_date').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("start_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("end_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.saveActivity = function(){
            //校验
            if($("#title").val() == ""){
                $cordovaToast.showShortCenter("请输入活动标题!");
                return;
            }
            if($("#start_date").val() == ""){
                $cordovaToast.showShortCenter("请选择活动开始时间!");
                return;
            }
            if($("#end_date").val() == ""){
                $cordovaToast.showShortCenter("请选择活动结束时间!");
                return;
            }
            if($("#content").val() == ""){
                $cordovaToast.showShortCenter("请输入活动内容!");
                return;
            }

            SdjgUserService.save_activity($("#title").val(),$("#start_date").val(),$("#end_date").val(),$("#content").val(),null).then(function(results){
                if(results.status ==1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:"保存成功",
                        template:"<div align='center'>酒店特惠活动已保存</br>我们将在一个工作日内更新至前台</div>",
                        okText: '确认',
                        okType: "button-assertive"
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt();
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt();
                    });
                }
            });
        }
    })
    .controller('activityEditCtrl',function($scope,$state,$ionicHistory,$stateParams,SdjgUserService,$cordovaToast,$ionicPopup,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.id = $stateParams.id;
        SdjgUserService.get_activity_info($scope.id).then(function(results){
            $scope.item = results.item;
        });
        $('#start_date_edit').focus(function() {
            this.blur();
        });
        $('#end_date_edit').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("start_date_edit").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("end_date_edit").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.saveActivity = function(){
            //校验
            if($("#title_edit").val() == ""){
                $cordovaToast.showShortCenter("请输入活动标题!");
                return;
            }
            if($("#start_date_edit").val() == ""){
                $cordovaToast.showShortCenter("请选择活动开始时间!");
                return;
            }
            if($("#end_date_edit").val() == ""){
                $cordovaToast.showShortCenter("请选择活动结束时间!");
                return;
            }
            if($("#content_edit").val() == ""){
                $cordovaToast.showShortCenter("请输入活动内容!");
                return;
            }

            SdjgUserService.save_activity($("#title_edit").val(),$("#start_date_edit").val(),$("#end_date_edit").val(),$("#content_edit").val(),$scope.id).then(function(results){
                if(results.status ==1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:"保存成功",
                        template:"<div align='center'>酒店特惠活动已保存</br>我们将在一个工作日内更新至前台</div>",
                        okText: '确认',
                        okType: "button-assertive"
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt();
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt();
                    });
                }
            })
        }
    })
    .controller('hcMainOrderCtrl',function($scope,$state,$ionicHistory,HcOrderService,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.gotoOrderDetail_hc = function(id){
            $state.go('hcOrderDetail',{type:0,id:id});
        };
        $scope.$on('$ionicView.beforeEnter', function(){
            HcOrderService.getHcMainOrder().then(function(results){
                $scope.yuyuelist = results.yuyuelist;
            });
        });

        //下拉刷新
        $scope.doRefresh_mainOrderList = function() {
            $timeout( function() {
                HcOrderService.getHcMainOrder().then(function(results){
                    $scope.yuyuelist = results.yuyuelist;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
    })
    .controller('hcOrderDetailCtrl',function($scope,$state,$ionicHistory,$cordovaToast,HcOrderService,$stateParams,$ionicPopup,$timeout,$rootScope,$ionicScrollDelegate){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.showCancleOdBtt = false;
        var wtype = $stateParams.wtype;
        HcOrderService.queryOneOrderInfo($stateParams.id).then(function(results){
            $scope.item = results.item;
            if(($scope.item.hunche_qidian == "" && $scope.item.hunche_tujing == "" && $scope.item.hunche_zhongdian == "")||
                ($scope.item.hunche_qidian == null && $scope.item.hunche_tujing == null && $scope.item.hunche_zhongdian == null)){
                $scope.has_route = false;
                $("#route_id").hide();
            }else{
                $scope.has_route = true;
                $("#route_id").show();
            }
            if(results.item.contact_sex == "man"){
                $scope.contactMan = true;
            }else if(results.item.contact_sex == "woman"){
                $scope.contactMan = false;
            }else{
                $("#contact_man_flag").hide();
                $("#contact_woman_flag").hide();
            }
            if(results.item.yuding_xuhao.match(/\D/) == null){//预定序号中不含字母 线上订单
                $scope.orderUser = "预定用户";
                $scope.onlineOrder = true;
                $scope.serv_cont_dif = "￥" + $scope.item.price + "×" + $scope.item.count;
            }else{//线下订单
                $scope.orderUser = "推介商家";
                $("#pay_info_row").hide();
                $scope.onlineOrder = false;
                $scope.serv_cont_dif = $scope.item.count + "辆";
                if($scope.item.status == "订单生效"){//商户端新增线下订单且状态是订单生效
                    $scope.showCancleOdBtt = true;
                }
            }
        });
        //取消订单弹框
        $scope.cancelOrderPop = function(){
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:"取消订单",
                template:"<div align='center'><div class='row'><div class='col'>服务档期</div><div class='col col-67' style='color:#ff7666'>"+$scope.item.dangqi+"</div></div>" +
                "<div class='row'><div class='col'>原因</div><div class='col col-67'><textarea id='reason' rows='3' cols='20' style='border:1px solid #ECE4E3;border-radius:3px;width:100%;'></textarea></div></div>" +
                "<div class='row'><div class='col'>是否确认取消预约?</div></div></div>",
                okText: '是',
                cancelText:'否',
                okType: "button-assertive"
            }).then(function(res) {
                if (res) {
                    var paramsJson = {id:$scope.item.id,reason:$("#reason").val()};
                    HcOrderService.cancelOrder(paramsJson).then(function(results){
                        if(results.status == 1){
                            $ionicHistory.goBack();
                            if(wtype == 0){//tab全部进入
                                $rootScope.doRefresh_all_tab();
                            }else if(wtype == 1){//tab预定进入
                                $rootScope.doRefresh_yuding_tab_hc();
                            }else{//全部订单进入
                                $rootScope.doRefresh_all_hcOrder();
                                $timeout(function(){
                                    $ionicScrollDelegate.scrollTop();
                                },500);
                            }
                        }
                    })
                }
            });
        };
        if($stateParams.type == 0){//预约总表进入
            $scope.allListEnter = true;
        }else{//档期列表进入
            $scope.allListEnter = false;
        }
        $('#meet_date').focus(function() {
            this.blur();
        });
        $('#meet_time').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("meet_date").value = dangqi;
                }
            }
        };
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("meet_time").value = hour+":"+ minute +" "+ meridian;
            }
        };
        $scope.validateData = function(){
            if($("#brideName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新郎姓名！");
                return false;
            }
            if($("#bridegroomName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新娘姓名！");
                return false;
            }
            if($("#weedingAddr").val().trim() == ""){
                $cordovaToast.showShortTop("请输入婚礼场所！");
                return false;
            }
            if($("#newerMobile").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新人电话！");
                return false;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#newerMobile").val()) && !isPhone.test($("#newerMobile").val())){
                $cordovaToast.showShortTop('新人电话格式不正确,请重新输入！');
                return false;
            }
            return true;
        };

        $scope.confirmOrder = function(){
            if($scope.validateData()){
                var paramsJson = {
                    id:$stateParams.id,
                    man:$("#brideName").val(),
                    woman:$("#bridegroomName").val(),
                    hotel:$("#weedingAddr").val(),
                    phone:$("#newerMobile").val(),
                    hetongriqi:$("#meet_date").val().replace(/\./g,"-"),
                    hetongshijian:$("#meet_time").val(),
                    contact_sex:$scope.item.contact_sex,
                    beizhu:$("#comment").val()
                };
                HcOrderService.confirmOrderInfo(paramsJson).then(function(results){
                    if(results.status == 1){
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title: '操作成功',
                            template: '<div style="text-align: center">确认完成</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        });
                        $ionicHistory.goBack();
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all_tab();
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding_tab_hc();
                        }else{//全部订单进入
                            $rootScope.doRefresh_all_hcOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }
                    }
                });
            }
        };
        $scope.completeOrder = function(){
            if($scope.validateData()) {
                $ionicPopup.confirm({
                    cssClass: 'myPopup',
                    title: '操作成功',
                    template: '<div style="text-align: center">确定已完成该笔订单吗？</div>',
                    cancelText: '确认',
                    cancelType: 'button-assertive',
                    okText: '取消',
                    okType: 'button-ligth'
                }).then(function(res) {
                    if(!res){ //确认
                        var paramsJson = {
                            id:$stateParams.id,
                            man:$("#brideName").val(),
                            woman:$("#bridegroomName").val(),
                            hotel:$("#weedingAddr").val(),
                            phone:$("#newerMobile").val(),
                            hetongriqi:$("#meet_date").val().replace(/\./g,"-"),
                            hetongshijian:$("#meet_time").val(),
                            contact_sex:$scope.item.contact_sex,
                            beizhu:$("#comment").val()
                        };
                        HcOrderService.completeOrder(paramsJson).then(function(results){
                            if(results.status == 1){
                                if(wtype == 0 || wtype == 1) {
                                    $state.go('hcOrderTabs', {dangqi: $scope.item.dangqi, index: 2}, {reload: true});
                                    $timeout(function () {
                                        $rootScope.doRefresh_complete_tab_hc();
                                    }, 500);
                                }else{//全部订单进入
                                    $ionicHistory.goBack();
                                    $rootScope.doRefresh_all_hcOrder();
                                    $timeout(function(){
                                        $ionicScrollDelegate.scrollTop();
                                    },500);
                                }
                            }
                        });
                    }else{//取消
                        //$state.go('hcOrderTabs',{dangqi:$scope.item.dangqi,index:1},{reload:true});
                        //$timeout(function(){
                        //    $rootScope.doRefresh_yuding_tab_hc();
                        //},500);
                        $ionicHistory.goBack();
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all_tab();
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding_tab_hc();
                        }else{//全部订单进入
                            $rootScope.doRefresh_all_hcOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }
                    }
                });
            }
        };
        $scope.saveOrder = function(){
            if($scope.validateData()) {
                var paramsJson = {
                    id:$stateParams.id,
                    man:$("#brideName").val(),
                    woman:$("#bridegroomName").val(),
                    hotel:$("#weedingAddr").val(),
                    phone:$("#newerMobile").val(),
                    hetongriqi:$("#meet_date").val().replace(/\./g,"-"),
                    hetongshijian:$("#meet_time").val(),
                    contact_sex:$scope.item.contact_sex,
                    beizhu:$("#comment").val()
                };
                HcOrderService.saveOrderInfo(paramsJson).then(function(results) {
                    if (results.status == 1) {
                        $ionicPopup.alert({
                            cssClass: 'myPopup',
                            title: '操作成功',
                            template: '<div style="text-align: center">保存完成</div>',
                            okText: '确定',
                            okType: 'button-assertive'
                        });
                        //$state.go('hcOrderTabs',{dangqi:$scope.item.dangqi,index:1},{reload:true});
                        //$timeout(function(){
                        //    $rootScope.doRefresh_yuding_tab_hc();
                        //},500);
                        $ionicHistory.goBack();
                        if(wtype == 0){//tab全部进入
                            $rootScope.doRefresh_all_tab();
                        }else if(wtype == 1){//tab预定进入
                            $rootScope.doRefresh_yuding_tab_hc();
                        }else{//全部订单进入
                            $rootScope.doRefresh_all_hcOrder();
                            $timeout(function(){
                                $ionicScrollDelegate.scrollTop();
                            },500);
                        }
                    }
                });
            }
        }
    })
    .controller('hcAccountCenterCtrl',function($scope,$state,$ionicHistory,LoginService,HcUserService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.logout = function(){
            LoginService.logout();
        };
        $scope.$on('$ionicView.beforeEnter', function() {
            HcUserService.queryUserInfo().then(function (results) {
                $scope.item = results.item;
                if($scope.item.stype == 6){
                    $scope.hideCarType = false;
                    $scope.carType = "头车";
                }else if($scope.item.stype == 7){
                    $scope.hideCarType = false;
                    $scope.carType = "车队";
                }else{
                    $scope.hideCarType = true;
                }
            })
        })
    })
    .controller('hcAccountCenterDetailCtrl',function($scope,$state,$ionicHistory,$ionicModal,$ionicSlideBoxDelegate,HcUserService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        HcUserService.queryUserDetail().then(function(results){
            $scope.item = results.item;
            $scope.yanse = results.yanse;
            $scope.images = new Array();
            if(results.item.logo != ""){
                $scope.images.push({src:results.item.logo});
            }
            if(results.item.index_img1 != ""){
                $scope.images.push({src:results.item.index_img1});
            }
            if(results.item.index_img2 != ""){
                $scope.images.push({src:results.item.index_img2});
            }
            if(results.item.index_img3 != ""){
                $scope.images.push({src:results.item.index_img3});
            }
            if(results.item.index_img4 != ""){
                $scope.images.push({src:results.item.index_img4});
            }
            $("#intro").html($scope.item.tuanduijieshao);
            if($scope.yanse.length > 5){
                $("#pinCol").addClass("col-75");
                $("#pinCol .row .col").removeClass("col-40");
                $("#pinCol .row .col").addClass("col-20");
                $("#xcol .row .col").removeClass("col-40");
                $("#xcol .row .col").addClass("col-50");
                $("#colorCol").addClass("col-75");
                $("#colorCol .row .col").removeClass("col-40");
                $("#colorCol .row .col").addClass("col-20");
                $("#pcol .row .col").removeClass("col-40");
                $("#pcol .row .col").addClass("col-50");
            }
        });

        $ionicModal.fromTemplateUrl('image-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function() {
            $ionicSlideBoxDelegate.slide(0);
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    })
    .controller('hcCalendarCtrl',function($scope,$state,$ionicHistory,$timeout,$ionicLoading,HcOrderService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.show_yuding_tab = function(){
            $state.go('hcOrderTabs',{dangqi:$scope.dangqi,index:1});
        };
        $scope.sj_name = window.localStorage['sj_name'];

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        $("#selected_date").html(year+"."+month+"."+day);
        $timeout(function(){
            $("#lunar_date").html($("#ly"+day).text()+"<br>"+$("#lmd"+day).text());
        },500);
        $scope.dangqi = year+"."+month+"."+day;
        var selected_date_array = new Array();
        $(function() {
            $(document).off('shown.calendar.calendario');
            $(document).on('shown.calendar.calendario', function(e, instance){
                selected_date_array = new Array();
                if(!instance) instance = cal;
                var $cell = instance.getCell(new Date().getDate());
                //if($cell.hasClass('fc-today')) $cell.trigger('click.calendario');
                $scope.instance = instance;
                HcOrderService.query_dangqi_info(instance.getYear(),instance.getMonth(),null).then(function(results){
                    var items = results.item;
                    for(var key in items){
                        if(items[key].dangqi_status == 1){
                            $scope.instance.getCell(parseInt(key)).addClass("fc-dangqi-jinzhang");
                        }else if(items[key].dangqi_status == 2){
                            $scope.instance.getCell(parseInt(key)).addClass("fc-dangqi-full");
                        }
                    }
                });
            });

            var transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition' : 'transitionend',
                    'OTransition' : 'oTransitionEnd',
                    'msTransition' : 'MSTransitionEnd',
                    'transition' : 'transitionend'
                },
                transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                $wrapper = $( '#custom-inner' ),
                $calendar = $( '#calendar' ),
                cal = $calendar.calendario({
                    onDayClick : function( $el, data, dateProperties ) {
                        $scope.dangqi = dateProperties.year+"."+dateProperties.month+"."+dateProperties.day;
                        $scope.pdate = parseInt(dateProperties.year + parse_date(dateProperties.month) + parse_date(dateProperties.day));
                        if($el[0].firstChild.className !="fc-date fc-emptydate"){
                            $("#selected_date").html(dateProperties.year+"."+dateProperties.month+"."+dateProperties.day);
                            $("#lunar_date").html($("#ly"+dateProperties.day).text()+"<br>"+$("#lmd"+dateProperties.day).text());
                            for(var i = 1;i<=31;i++){
                                if(i == parseInt(dateProperties.day)){
                                    $el[0].classList.add("fc-selected");
                                }else if($scope.instance != undefined){
                                    $scope.instance.getCell(parseInt(i)).removeClass("fc-selected");
                                }
                            }
                        }
                    },
                    //caldata : codropsEvents,
                    weekabbrs  : [ '日', '一', '二', '三', '四', '五', '六' ],
                    //monthabbrs : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    months  : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
                    displayWeekAbbr : true,
                    // left-most day in the calendar  0- Sunday, 1 - Monday, ... , 6 - Saturday
                    startIn : 0,
                    events: 'click'
                } ),
                $month = $( '#custom-month' ).html( cal.getMonthName() ),
                $year = $( '#custom-year' ).html( cal.getYear() );

            //cal.setData(codropsEvents);

            $( '#custom-next' ).on( 'click', function() {
                cal.gotoNextMonth( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#custom-prev' ).on( 'click', function() {
                cal.gotoPreviousMonth( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#year-next' ).on( 'click', function() {
                cal.gotoNextYear( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            $( '#year-prev' ).on( 'click', function() {
                cal.gotoPreviousYear( updateMonthYear );
                $ionicLoading.show({
                    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner><span style="font-family: 黑体">正在加载中，请稍后...</span></div>',
                    duration:500
                });
            } );
            function updateMonthYear() {
                $month.html( cal.getMonthName() );
                $year.html( cal.getYear() );
                selected_date_array = new Array();
            }
        });
    })
    .controller('hcAddOrderCtrl',function($scope,$state,$ionicHistory,HcOrderService,$cordovaToast,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        HcOrderService.queryAddInitInfo().then(function(results){
            $scope.hunche = results.hunche;
        });

        $('#dangqi').focus(function() {
            this.blur();
        });
        $('#meet_date').focus(function() {
            this.blur();
        });
        $('#meet_time').focus(function() {
            this.blur();
        });
        //服务档期选择
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("dangqi").value = dangqi;
                    var type = 1;//线下
                    HcOrderService.get_xuhao_by_dangqi(type,dangqi).then(function(results){
                        $scope.order_xuhao = results.xuhao;
                    });
                    HcOrderService.queryAddInitInfo(val.format('yyyy-MM-dd')).then(function(results) {
                        $scope.hunche = results.hunche;
                        var arr = new Array();
                        for(var key in $scope.hunche.jiage_list){
                            if($scope.hunche.jiage_list[key].keyong == 0){
                                arr.push(key);
                            }
                        }
                        $timeout(function(){
                            for(var key in arr){
                                $("#color"+arr[key]).attr("disabled",true);
                                $("#color"+arr[key]).parent().children(".radio-content").css("color","gainsboro");
                            }
                        },500);
                    });
                }
            }
        };
        //会面日期选择
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("meet_date").value = dangqi;
                }
            }
        };
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("meet_time").value = hour+":"+ minute +" "+ meridian;
            }
        };

        $scope.selectColor = function(index){
            if($("#carNum").val() >= $scope.hunche.jiage_list[index].keyong){
                $("#carNum").val($scope.hunche.jiage_list[index].keyong);
                $("#add").attr('disabled',true);
            }else{
                $("#add").attr('disabled',false);
            }
        };
        $scope.add = function(){
            var oldValue = parseFloat($("#carNum").val());
            $("#sub").attr('disabled',false);
            $("#carNum").val(oldValue + 1);
            var colorVal = $("input[name='carColorGroup']:checked").val();
            if(colorVal != undefined && $("#carNum").val() == $scope.hunche.jiage_list[colorVal].keyong){
                $("#add").attr('disabled',true);
                return;
            }
        };
        $scope.sub = function(){
            var oldValue = parseFloat($("#carNum").val());
            $("#add").attr('disabled',false);
            if(oldValue > 1){
                $("#carNum").val(oldValue - 1);
            }else{
                $("#carNum").val(1);
            }
            if($("#carNum").val() == 1){
                $("#sub").attr('disabled',true);
            }
        };

        //提交保存
        $scope.commitNewOrder = function(){
            if($("#dangqi").val().trim() == ""){
                $cordovaToast.showShortTop("请选择服务档期！");
                return;
            }
            if($("input[name='carGroup']:checked").val() == undefined){
                $cordovaToast.showShortTop("请选择预约车队！");
                return;
            }
            if($("input[name='carColorGroup']:checked").val() == undefined){
                $cordovaToast.showShortTop("请选择车身颜色！");
                return;
            }
            var colorVal = $("input[name='carColorGroup']:checked").val();
            if($("#carNum").val() > $scope.hunche.jiage_list[colorVal].keyong){
                $cordovaToast.showShortTop("预约数量超过最大范围！");
                return;
            }
            if($("#totalPrice").val().trim() == ""){
                $cordovaToast.showShortTop("请输入总金额！");
                return;
            }
            var reg = /^(([1-9]{1}\d*))(\.(\d){1,2})?$/;
            if(!reg.test($("#totalPrice").val().trim())){
                $cordovaToast.showShortTop("总金额格式有误，请重新输入！");
                return;
            }
            //if($("#startPoint").val().trim() == ""){
            //    $cordovaToast.showShortTop("请输入集合地点！");
            //    return;
            //}
            //if($("#endPoint").val().trim() == ""){
            //    $cordovaToast.showShortTop("请输入到达地点！");
            //    return;
            //}
            if($("#recommendPerson").val().trim() == ""){
                $cordovaToast.showShortTop("请输入推介商家！");
                return;
            }
            if($("#contactPhone").val().trim() == ""){
                $cordovaToast.showShortTop("请输入联系电话！");
                return;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#contactPhone").val()) && !isPhone.test($("#contactPhone").val())){
                $cordovaToast.showShortTop('联系电话格式不正确,请重新输入！');
                return;
            }
            if($("#brideName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新郎姓名！");
                return;
            }
            if($("#bridegroomName").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新娘姓名！");
                return;
            }
            if($("#weedingAddr").val().trim() == ""){
                $cordovaToast.showShortTop("请输入婚礼场所！");
                return;
            }
            if($("#newerMobile").val().trim() == ""){
                $cordovaToast.showShortTop("请输入新人电话！");
                return;
            }
            var isMobile=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;
            var isPhone=/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            if(!isMobile.test($("#newerMobile").val()) && !isPhone.test($("#newerMobile").val())){
                $cordovaToast.showShortTop('新人电话格式不正确,请重新输入！');
                return;
            }
            var ctype = "";
            var colorVal = $("input[name='carColorGroup']:checked").val();
            ctype = $scope.hunche.jiage_list[colorVal].ctype;

            var paramsJson = {
                date:$("#dangqi").val(),
                carName:$scope.hunche.name,
                ctype:ctype,
                count:$("#carNum").val(),
                totalprice:$("#totalPrice").val(),
                hunche_qidian:$("#startPoint").val(),
                hunche_tujing:$("#middlePoint").val(),
                hunche_zhongdian:$("#endPoint").val(),
                recommendPerson:$("#recommendPerson").val(),
                xuhao:$scope.order_xuhao,
                phone:$("#contactPhone").val(),
                man:$("#brideName").val(),
                woman:$("#bridegroomName").val(),
                hotel:$("#weedingAddr").val(),
                xinrenphone:$("#newerMobile").val(),
                hunqi:$("#meet_date").val(),
                begin_time:$("#meet_time").val(),
                comment:$("#comment").val()
            };
            HcOrderService.saveNewOrderInfo(paramsJson).then(function(results){
                if(results.status == 1) {
                    $state.go('hc_offlineOrderInfo',{orderinfo:results.orderinfo,paramsJson:paramsJson});
                }else{
                    $cordovaToast.showShortBottom(results.info);
                }
            })
        }
    })
    //新增线下订单处理页面
    .controller('hc_offlineOrderInfoCtrl',function($scope,$ionicHistory,$ionicPopup,HcOrderService,$stateParams,$cordovaToast,$state,$timeout,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.orderinfo = $stateParams.orderinfo;
        $scope.orderData = $stateParams.paramsJson;
        if($scope.orderData.hunche_qidian =="" && $scope.orderData.hunche_tujing == "" && $scope.orderData.hunche_zhongdian ==""){
            $scope.has_route = false;
            $("#route_id").hide();
        }else{
            $scope.has_route = true;
            $("#route_id").show();
        }

        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) != 'undefined') {
                    var dangqi = val.format('yyyy.MM.dd');
                    document.getElementById("meet_date_off").value = dangqi;
                }
            }
        };
        //时间选择
        $scope.slots = {epochTime: 32400, format: 12, step: 1};
        $scope.timePickerCallback = function (val) {
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var myDate= new Date(val * 1000 - 8 * 3600 * 1000);
                var hour = myDate.getHours();
                var minute = myDate.getMinutes();
                var meridian = "am";
                if(hour == 0){
                    hour = 12;
                }else if(hour <= 9){
                    hour = "0"+hour;
                }else if(hour < 12){
                    hour = hour;
                }else if(hour ==12){
                    hour = hour;
                    meridian = "pm";
                }else{
                    hour -= 12;
                    meridian = "pm";
                }
                if(minute <= 9){
                    minute = "0" +　minute;
                }
                document.getElementById("meet_time_off").value = hour+":"+ minute +" "+ meridian;
            }
        };

        $('#meet_date_off').focus(function() {
            this.blur();
        });
        $('#meet_time_off').focus(function() {
            this.blur();
        });

        $scope.completeOrder = function(){
            $ionicPopup.confirm({
                cssClass: 'myPopup',
                title:'操作成功',
                template:'<div style="text-align: center">确定已完成该笔订单吗？</div>',
                cancelText:'确认',
                cancelType:'button-assertive',
                okText:'取消',
                okType:'button-light'
            }).then(function(res) {
                if(!res){//确认
                    var paramsJson = {
                        id:$scope.orderinfo.id,
                        man:$scope.orderData.man,
                        woman:$scope.orderData.woman,
                        hotel:$scope.orderData.hotel,
                        phone:$scope.orderData.xinrenphone,
                        hetongriqi:$("#meet_date_off").val().replace(/\./g,"-"),
                        hetongshijian:$("#meet_time_off").val(),
                        beizhu:$("#comment2").val()
                    };
                    HcOrderService.completeOrder(paramsJson).then(function(results){
                        if(results.status == 1){
                            $state.go('hcOrderTabs',{dangqi:$scope.orderData.date,index:2});
                            $timeout(function(){
                                $rootScope.doRefresh_complete_tab_hc();
                            },500);
                        }else{
                            $cordovaToast.showShortTop(results.info);
                        }
                    });
                }else{//取消
                    $state.go('hcOrderTabs',{dangqi:$scope.orderData.date,index:1});
                    $timeout(function(){
                        $rootScope.doRefresh_yuding_tab_hc();
                    },500);
                }
            });;
        }
        $scope.saveOrder = function(){
            var paramsJson = {
                id:$scope.orderinfo.id,
                man:$scope.orderData.man,
                woman:$scope.orderData.woman,
                hotel:$scope.orderData.hotel,
                phone:$scope.orderData.xinrenphone,
                hetongriqi:$("#meet_date_off").val().replace(/\./g,"-"),
                hetongshijian:$("#meet_time_off").val(),
                beizhu:$("#comment2").val()
            };
            HcOrderService.saveOrderInfo(paramsJson).then(function(results) {
                if (results.status == 1) {
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title: '操作成功',
                        template: '<div style="text-align: center">保存完成</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    });
                    $state.go('hcOrderTabs',{dangqi:$scope.orderData.date,index:1});
                    $timeout(function(){
                        $rootScope.doRefresh_yuding_tab_hc();
                    },500);
                }
            });
        }
    })
    .controller('hcOrderTabsCtrl',function($scope,$state,$stateParams,$ionicHistory,$ionicTabsDelegate,$timeout,HcOrderService,$ionicLoading,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.dangqi = $stateParams.dangqi;
        //$scope.$on('$ionicView.beforeEnter', function() {
        $timeout(function () {
            $ionicTabsDelegate.select($stateParams.index);
        }, 500);
        //})

        $scope.goto_schedule_view = function(){
            $state.go('hcCalendar');
        };
        //status:全部 空 预定-2 完成-4
        var paramsJson = {
            dangqi:$scope.dangqi.replace(/\./g,"-"),
            status:2
        };
        HcOrderService.queryOrderListByType(paramsJson).then(function(results){
            $scope.name = results.name;
            $scope.keyuding = results.keyuding;
            $scope.total_yuyue = results.total_yuyue;
            $scope.keyuyuelist = results.keyuyuelist;
            $scope.yudingOrderList = results.yuyuelist;
            $scope.llength = results.keyuyuelist.length - 1;
        });
        //下拉刷新
        $rootScope.doRefresh_all_tab = function() {
            $timeout( function() {
                paramsJson = {dangqi:$scope.dangqi.replace(/\./g,"-")};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.keyuyuelist = results.keyuyuelist;
                    $scope.allOrderList = results.yuyuelist;
                    $scope.llength = results.keyuyuelist.length - 1;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $rootScope.doRefresh_yuding_tab_hc = function() {
            $timeout( function() {
                paramsJson = {dangqi:$scope.dangqi.replace(/\./g,"-"),status:2};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.keyuyuelist = results.keyuyuelist;
                    $scope.yudingOrderList = results.yuyuelist;
                    $scope.llength = results.keyuyuelist.length - 1;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $rootScope.doRefresh_complete_tab_hc = function() {
            $timeout( function() {
                paramsJson = {dangqi:$scope.dangqi.replace(/\./g,"-"),status:4};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.keyuyuelist = results.keyuyuelist;
                    $scope.completedOrderList = results.yuyuelist;
                    $scope.llength = results.keyuyuelist.length - 1;
                    $ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //选中tab刷新数据
        $scope.selectAllOrderTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $scope.doRefresh_all_tab();
        };
        $scope.selectYudingOrderTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $rootScope.doRefresh_yuding_tab_hc();
        };
        $scope.selectCompeleteOrderTab = function(){
            $ionicLoading.show({
                template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
            });
            $rootScope.doRefresh_complete_tab_hc();
        };
        $scope.slide_all_hc = function(){
            $("#detail_all").slideToggle();
            var up_arroe_state =$("#up_arrow_all").css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_all").css('display','block');
                $("#down_arrow_all").css('display','none');
            }else{
                $("#up_arrow_all").css('display','none');
                $("#down_arrow_all").css('display','block');
            }
        };
        $scope.slide_yuding_hc = function(){
            $("#detail_yuding").slideToggle();
            var up_arroe_state =$("#up_arrow_yuding").css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_yuding").css('display','block');
                $("#down_arrow_yuding").css('display','none');
            }else{
                $("#up_arrow_yuding").css('display','none');
                $("#down_arrow_yuding").css('display','block');
            }
        };
        $scope.slide_complete_hc = function(){
            $("#detail_complete").slideToggle();
            var up_arroe_state =$("#up_arrow_complete").css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_complete").css('display','block');
                $("#down_arrow_complete").css('display','none');
            }else{
                $("#up_arrow_complete").css('display','none');
                $("#down_arrow_complete").css('display','block');
            }
        };

        $scope.gotoOrderDetail = function(id){
            //if(status == 2){//预定
            $state.go('hcOrderDetail',{type:1,id:id,wtype:1});
            //}else{//完成
            //    $state.go('completedOrderDetail',{id:id});
            //}
        };
        $scope.showOrderDetail = function(id,status,yuyue_type){
            if(status == 1){//1=>'支付成功'
                $state.go("hcOrderDetail",{id:id,type:0,wtype:0});
            }else if(status == 2){// 2=>'订单生效'
                $state.go("hcOrderDetail",{id:id,wtype:0});
            }else{//3=>'交易关闭', 4=>'交易成功', 5=>'退款处理', 6=>'已退款'
                $state.go("hcCompletedOrderDetail",{id:id,type:yuyue_type});
            }
        };
    })
    .controller('hcActivityCtrl',function($scope,$rootScope,$state,$ionicHistory,HcUserService,$timeout){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        HcUserService.get_activity_info(0).then(function(results){
            $scope.items = results.item;
        });
        $rootScope.doRefresh_actvt_hc = function() {
            $timeout( function() {
                HcUserService.get_activity_info(0).then(function(results){
                    $scope.items = results.item;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.slide_acty = function(index){
            $("#item_detail"+index).slideToggle();
            var up_arroe_state =$("#up_arrow"+index).css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow"+index).css('display','block');
                $("#down_arrow"+index).css('display','none');
            }else{
                $("#up_arrow"+index).css('display','none');
                $("#down_arrow"+index).css('display','block');
            }
        };
    })
    .controller('hcActivityAddCtrl',function($scope,$state,$ionicHistory,HcUserService,$cordovaToast,$ionicPopup,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $('#start_date').focus(function() {
            this.blur();
        });
        $('#end_date').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("start_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("end_date").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.saveActivity = function(){
            //校验
            if($("#title").val() == ""){
                $cordovaToast.showShortCenter("请输入活动标题!");
                return;
            }
            if($("#start_date").val() == ""){
                $cordovaToast.showShortCenter("请选择活动开始时间!");
                return;
            }
            if($("#end_date").val() == ""){
                $cordovaToast.showShortCenter("请选择活动结束时间!");
                return;
            }
            if($("#content").val() == ""){
                $cordovaToast.showShortCenter("请输入活动内容!");
                return;
            }

            HcUserService.save_activity($("#title").val(),$("#start_date").val(),$("#end_date").val(),$("#content").val(),null).then(function(results){
                if(results.status ==1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:"保存成功",
                        template:"<div align='center'>酒店特惠活动已保存</br>我们将在一个工作日内更新至前台</div>",
                        okText: '确认',
                        okType: "button-assertive"
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt_hc();
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt_hc();
                    });
                }
            });
        }
    })
    .controller('hcActivityEditCtrl',function($scope,$state,$ionicHistory,$stateParams,HcUserService,$cordovaToast,$ionicPopup,$rootScope){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $scope.id = $stateParams.id;
        HcUserService.get_activity_info($scope.id).then(function(results){
            $scope.item = results.item;
        });
        $('#start_date_edit').focus(function() {
            this.blur();
        });
        $('#end_date_edit').focus(function() {
            this.blur();
        });
        $scope.datepickerObject = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("start_date_edit").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.datepickerObject2 = {
            titleLabel: '选择日期',  //Optional
            todayLabel: '今天',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional
            errorMsgLabel : 'Please select time.',    //Optional
            setButtonType : 'button-assertive',  //Optional
            inputDate: new Date(),    //Optional
            mondayFirst: true,    //Optional
            //disabledDates:disabledDates,  //Optional
            monthList:monthList,  //Optional
            //from: new Date(2015, 8, 15),   //Optional
            //to: new Date(2015, 8, 20),    //Optional
            callback: function (val) {    //Mandatory
                if (typeof(val) === 'undefined') {
                } else {
                    document.getElementById("end_date_edit").value = val.format('yyyy.MM.dd');
                }
            }
        };
        $scope.saveActivity = function(){
            //校验
            if($("#title_edit").val() == ""){
                $cordovaToast.showShortCenter("请输入活动标题!");
                return;
            }
            if($("#start_date_edit").val() == ""){
                $cordovaToast.showShortCenter("请选择活动开始时间!");
                return;
            }
            if($("#end_date_edit").val() == ""){
                $cordovaToast.showShortCenter("请选择活动结束时间!");
                return;
            }
            if($("#content_edit").val() == ""){
                $cordovaToast.showShortCenter("请输入活动内容!");
                return;
            }

            HcUserService.save_activity($("#title_edit").val(),$("#start_date_edit").val(),$("#end_date_edit").val(),$("#content_edit").val(),$scope.id).then(function(results){
                if(results.status ==1){
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:"保存成功",
                        template:"<div align='center'>酒店特惠活动已保存</br>我们将在一个工作日内更新至前台</div>",
                        okText: '确认',
                        okType: "button-assertive"
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt_hc();
                    });
                }else{
                    $ionicPopup.alert({
                        cssClass: 'myPopup',
                        title:'提示',
                        template:'<div align="center">'+results.info+'</div>',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function(res){
                        $ionicHistory.goBack();
                        $rootScope.doRefresh_actvt_hc();
                    });
                }
            })
        }
    })
    .controller('hcAllOrdersCtrl',function($scope,$rootScope,$state,$ionicHistory,HcOrderService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        //$ionicLoading.show({
        //    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //});
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv = false;
        $scope.noMoredata = false;
        $scope.allOrderList = [];
        $scope.loadMore = function () {
            var paramsJson = {page:page,pagesize:pagesize};
            HcOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.name = results.name;
                $scope.keyuding = results.keyuding;
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.allOrderList.length < $scope.total_yuyue) {
                        $scope.allOrderList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata = true;
                        $scope.showDiv = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        $rootScope.doRefresh_all_hcOrder = function() {
            $scope.showDiv = false;
            $scope.noMoredata = false;
            $timeout( function() {
                page = 1;
                var paramsJson = {page:page,pagesize:pagesize};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.allOrderList = results.yuyuelist;
                    page++;
                    //$ionicLoading.hide();
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.doRefresh_all_hcOrder();
        $scope.showOrderDetail = function(id,status,yuyue_type){
            if(status == 1){//1=>'支付成功'
                $state.go("hcOrderDetail",{id:id,type:0,wtype:2});
            }else if(status == 2){// 2=>'订单生效'
                $state.go("hcOrderDetail",{id:id,wtype:2});
            }else{//3=>'交易关闭', 4=>'交易成功', 5=>'退款处理', 6=>'已退款'
                $state.go("hcCompletedOrderDetail",{id:id,type:yuyue_type});
            }
        }
    })
    .controller('hcCanceledOrdersCtrl',function($scope,$state,$ionicHistory,HcOrderService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        //$ionicLoading.show({
        //    template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //});
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv = false;
        $scope.noMoredata = false;
        $scope.canceledOrderList = [];
        $scope.loadMore = function () {
            var paramsJson = {status:"3,5,6",page:page,pagesize:pagesize};//3=>'交易关闭', 5=>'退款处理', 6=>'退款完成'
            HcOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.name = results.name;
                $scope.keyuding = results.keyuding;
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.canceledOrderList.length < $scope.total_yuyue) {
                        $scope.canceledOrderList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata = true;
                        $scope.showDiv = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        $scope.doRefresh_canceled_hcOrder = function() {
            $scope.showDiv = false;
            $scope.noMoredata = false;
            $timeout( function() {
                page = 1;
                var paramsJson = {status:"3,5,6",page:page,pagesize:pagesize};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.canceledOrderList = results.yuyuelist;
                    //$ionicLoading.hide();
                    page++;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        //$scope.doRefresh_canceled_hcOrder();
    })
    .controller('hcCompletedOrdersCtrl',function($scope,$state,$ionicHistory,HcOrderService,$timeout,$ionicLoading){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        var page = 1;//第几页
        var pagesize = 20;//每页条数
        $scope.showDiv_online = false;
        $scope.noMoredata_online = false;
        $scope.onlineList = [];
        $scope.loadMore_online = function () {
            var paramsJson = {yuyue_type:0,status:4,page:page,pagesize:pagesize};//yuyue_type 订单类别 0：线上 1：线下  status=4 已完成
            HcOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.name = results.name;
                $scope.keyuding = results.keyuding;
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.onlineList.length < $scope.total_yuyue) {
                        $scope.onlineList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata_online = true;
                        $scope.showDiv_online = true;
                        break;
                    }
                }
                page++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };
        var page2 = 1;//第几页
        var pagesize2 = 20;//每页条数
        $scope.showDiv_offline = false;
        $scope.noMoredata_offline = false;
        $scope.offlineList = [];
        $scope.loadMore_offline = function () {
            var paramsJson = {yuyue_type:1,status:4,page:page2,pagesize:pagesize2};//yuyue_type 订单类别 0：线上 1：线下  status=4 已完成
            HcOrderService.queryOrderListByType(paramsJson).then(function (results) {
                $scope.name = results.name;
                $scope.keyuding = results.keyuding;
                $scope.total_yuyue = results.total_yuyue;
                for(var key in results.yuyuelist){
                    if($scope.offlineList.length < $scope.total_yuyue) {
                        $scope.offlineList.push(results.yuyuelist[key]);
                    }else{
                        $scope.noMoredata_offline = true;
                        $scope.showDiv_offline = true;
                        break;
                    }
                }
                page2++;
                $scope.$broadcast('scroll.infiniteScrollComplete');//这行要在此service请求里面声明，否则会多次发请求
            });
        };

        //HcOrderService.queryOrderListByType(paramsJson).then(function(results){
        //    $scope.name = results.name;
        //    $scope.keyuding = results.keyuding;
        //    $scope.total_yuyue = results.total_yuyue;
        //    $scope.onlineList = results.yuyuelist;
        //});
        $scope.refresh_online_order = function() {
            $scope.showDiv_online = false;
            $scope.noMoredata_online = false;
            $timeout( function() {
                page = 1;
                var paramsJson = {yuyue_type:0,status:4,page:page,pagesize:pagesize};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.onlineList = results.yuyuelist;
                    //$ionicLoading.hide();
                    page++;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.refresh_offline_order = function() {
            $scope.showDiv_offline = false;
            $scope.noMoredata_offline = false;
            $timeout( function() {
                page2 = 1;
                var paramsJson = {yuyue_type:1,status:4,page:page2,pagesize:pagesize2};
                HcOrderService.queryOrderListByType(paramsJson).then(function(results){
                    $scope.name = results.name;
                    $scope.keyuding = results.keyuding;
                    $scope.total_yuyue = results.total_yuyue;
                    $scope.offlineList = results.yuyuelist;
                    //$ionicLoading.hide();
                    page2++;
                });
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.slide_onLineOrder = function(){
            $("#detail_on").slideToggle();
            var up_arroe_state =$("#up_arrow_on").css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_on").css('display','block');
                $("#down_arrow_on").css('display','none');
            }else{
                $("#up_arrow_on").css('display','none');
                $("#down_arrow_on").css('display','block');
            }
        };
        $scope.slide_offLineOrder = function(){
            $("#detail_off").slideToggle();
            var up_arroe_state =$("#up_arrow_off").css('display');
            if(up_arroe_state == "none"){
                $("#up_arrow_off").css('display','block');
                $("#down_arrow_off").css('display','none');
            }else{
                $("#up_arrow_off").css('display','none');
                $("#down_arrow_off").css('display','block');
            }
        };
        //$scope.selectOnlineTab = function(){
        //    $ionicLoading.show({
        //        template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //    });
        //    $scope.refresh_online_order();
        //}
        //$scope.seleectOfflineTab = function(){
        //    $ionicLoading.show({
        //        template: '<div class="row row-center"><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner></div>',
        //    });
        //    $scope.refresh_offline_order();
        //}
    })
    .controller('hcCompletedOrderDetailCtrl',function($scope,$state,$stateParams,$ionicHistory,HcOrderService){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        HcOrderService.queryOneOrderInfo($stateParams.id).then(function(results){
            $scope.item = results.item;
            if(($scope.item.hunche_qidian=="" && $scope.item.hunche_tujing == "" && $scope.item.hunche_zhongdian == "")||
                ($scope.item.hunche_qidian == null && $scope.item.hunche_tujing == null && $scope.item.hunche_zhongdian == null)){
                $scope.has_route = false;
                $("#route_id").hide();
            }else{
                $scope.has_route = true;
                $("#route_id").show();
            }
            if($stateParams.type == 1){//自接订单 联系人隐藏
                $("#contact_man_flag").hide();
                $("#contact_woman_flag").hide();
            }else{//线上订单
                if(results.item.contact_sex == "man"){
                    $scope.contactMan = true;
                }else if(results.item.contact_sex == "woman"){
                    $scope.contactMan = false;
                }else{
                    $("#contact_man_flag").hide();
                    $("#contact_woman_flag").hide();
                }
            }
            //档期列表 完成tab跳转到详情页
            if(results.item.yuding_xuhao.match(/\D/) == null){//预定序号中不含字母 线上订单
                $scope.orderUser = "预定用户";
                $scope.onlineOrder = true;
                $scope.serv_cont_dif = "￥" + $scope.item.price + "×" + $scope.item.count;
            }else{//线下订单
                $scope.orderUser = "推介商家";
                $("#pay_info_row").hide();
                $scope.onlineOrder = false;
                $scope.serv_cont_dif = $scope.item.count + "辆";
            }
            if($scope.item.status == "已退款" || $scope.item.status == "交易关闭"){
                $scope.is_tuikuan = true;
            }else{
                $scope.is_tuikuan = false;
            }
            if($scope.item.status == "已退款" || $scope.item.status == "退款处理"){
                $("#pay_stat").html($scope.item.status);
                $("#pay_stat").css("color","#ff7666");
            }else{
                $("#pay_stat").html("待付："+$scope.item.weifu);
            }
        })
    })
    .controller('contactUsCtrl',function($scope,$state,$ionicHistory,$cordovaAppVersion){
        $scope.backGo = function(){
            $ionicHistory.goBack();
        };
        $cordovaAppVersion.getVersionNumber().then(function (version) {
            $scope.appVersion = version;
        });
    });

/**
 * 数组去重
 * @param arr
 * @returns {Array}
 */
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
/**
 * 字符转化
 * @param number
 * @returns {string}
 */
function number2word(number){
    var word='';
    if(number == 0){
        word = '无';
    }else if(number == 1){
        word = '有';
    }else{
        word = '未定义';
    }
    return word;
}
/**
 * 数组分组
 * @param arr
 * @param size
 * @returns {Array}
 */
function chunk(arr, size) {
    var newArr = [];
    var tmp_arr = [];
    for(var key in arr){
        tmp_arr.push(arr[key]);
    }
    for (var i=0; i<tmp_arr.length; i+=size) {
        newArr.push(tmp_arr.slice(i, i+size));
    }
    return newArr;
}
/**
 * 日期格式化
 * @param format
 * @returns {*}
 */
Date.prototype.format =function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length==1? o[k] :
                ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};
/**
 * 加操作
 * @param index
 */
function add(id,zuoshu){
    var oldValue = parseFloat($("#zhuoshu"+id).val());
    $("#sub"+id).attr('disabled',false);
    $("#zhuoshu"+id).val(oldValue + 1);
    //if($("#zhuoshu"+index).val() == zuoshu){
    //    $("#add"+index).attr('disabled',true);
    //}
    zhushu[id] = $("#zhuoshu"+id).val();
    calc_total();
}
/**
 * 减操作
 * @param index
 */
function sub(id){
    var oldValue = parseFloat($("#zhuoshu"+id).val());
    $("#add"+id).attr('disabled',false);
    if(oldValue > 1){
        $("#zhuoshu"+id).val(oldValue - 1);
    }else{
        $("#zhuoshu"+id).val(1);
    }
    if($("#zhuoshu"+id).val() == 1){
        $("#sub"+id).attr('disabled',true);
    }
    zhushu[id] = $("#zhuoshu"+id).val();
    calc_total();
}
/**
 * 拆单桌数加操作
 * @param index
 */
function add_chaidan(id){
    var oldValue = parseFloat($("#chaidan_zhuoshu"+id).val());
    $("#sub_chaidan"+id).attr('disabled',false);
    $("#chaidan_zhuoshu"+id).val(oldValue + 1);
    //if($("#zhuoshu"+index).val() == zuoshu){
    //    $("#add"+index).attr('disabled',true);
    //}
    zhushu[id] = $("#chaidan_zhuoshu"+id).val();
    calc_total();
}
/**
 * 拆单桌数减操作
 * @param index
 */
function sub_chaidan(id){
    var oldValue = parseFloat($("#chaidan_zhuoshu"+id).val());
    $("#add_chaidan"+id).attr('disabled',false);
    if(oldValue > 1){
        $("#chaidan_zhuoshu"+id).val(oldValue - 1);
    }else{
        $("#chaidan_zhuoshu"+id).val(1);
    }
    if($("#chaidan_zhuoshu"+id).val() == 1){
        $("#sub_chaidan"+id).attr('disabled',true);
    }
    zhushu[id] = $("#chaidan_zhuoshu"+id).val();
    calc_total();
}
/**
 * 计算预算总价
 */
function calc_total(){
    var total = 0.00;
    for(var item in hunyan){
        total +=hunyan_price[item]*zhushu[item];
    }
    document.getElementById("total_price").innerHTML = "￥"+total.toFixed(2);
}

/**
 * 日期格式化
 * @param value
 * @returns {*}
 */
function parse_date(value){
    if(parseInt(value) < 10 ){
        value = "0" + value;
    }
    return value.toString();
}
/**
 * 相连日期分组
 * @param source
 * @returns {Array}
 */
function arrange(source) {
    var t;
    var ta;
    var r = [];
    source.forEach(function(v) {
        if (t === v) {
            ta.push(t);
            t++;
            return;
        }
        ta = [v];
        t = v + 1;
        r.push(ta);
    });
    return r;
}

function number_format(value){
    var str;
    if(value < 10){
        str = "00"+value;
    }else if(value < 100){
        str = "0"+value;
    }else{
        str = value;
    }
    return str;
}

function change_cb(roomid){
    hunyan_price[roomid] = $("#chaidan_hunyan"+roomid).val();
    calc_total();
}

function limitString(str){
    if(str.length > 4){
        return str.substring(0,4)+"...";
    }else{
        return str;
    }
}
function checkPrice(price){
    return (/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(price.toString());
}


