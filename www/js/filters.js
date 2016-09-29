angular.module('starter.filters', [])

    .filter("dealObject", function () {
        return function (obj) {
            if(typeof(obj) == "undefined" || typeof(obj) != "object" ){
                return new Object();
            }else{
                return obj;
            }
        }
    })
    .filter("toFixNumber",function(){
        return function(value){
            if(typeof(value) == "undefined"){
                return value;
            }else{
                return parseInt(value);
            }
        }
    })
    .filter("dataChange",function(){
        return function(value){
            if(typeof(value) == "undefined" || value == null){
                return 0;
            }else{
                return value;
            }
        }
    })
    .filter("limitLength",function(){
        return function(string){
            if(typeof(string) == "undefined"){
                return string;
            }
            if(string.length > 4){
                return string.substring(0,4)+"...";
            }else{
                return string;
            }
        }
    })
    .filter("msgTitleLength",function(){
        return function(string){
            if(typeof(string) == "undefined"){
                return string;
            }
            if(string.length > 10){
                return string.substring(0,10)+"...";
            }else{
                return string;
            }
        }
    })

