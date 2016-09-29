/**
 * jquery.calendario.js v3.2.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 *
 * || Notable Changes ||
 * Calendario gets more flexible : Boží Ďábel (https://github.com/deviprsd21) (https://github.com/codrops/Calendario/pull/11)
 * Multiple Events : Mattias Lyckne (https://github.com/olyckne) (https://github.com/codrops/Calendario/pull/22)
 * Flexibility In-built : Boží Ďábel (https://github.com/deviprsd21) (https://github.com/codrops/Calendario/pull/23)
 * Now with Time : Boží Ďábel (https://github.com/deviprsd21) (https://github.com/codrops/Calendario/pull/25)
 */
;(function($, window, undefined){ 
  'use strict';

  $.Calendario = function(options, element){
    this.$el = $(element);
    this._init(options);  
  };

  // the options
  $.Calendario.defaults = {
    /*
      you can also pass:
      month : initialize calendar with this month (1-12). Default is today.
      year : initialize calendar with this year. Default is today.
      caldata : initial data/content for the calendar.
      caldata format:
      {
        'MM-DD-YYYY' : 'HTML Content',
        'MM-DD-YYYY' : 'HTML Content',
          ...
      }
    */
    weeks : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekabbrs : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthabbrs : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    displayWeekAbbr : false, // choose between values in options.weeks or options.weekabbrs
    displayMonthAbbr : false, // choose between values in options.months or options.monthabbrs
    startIn : 1, // left most day in the calendar (0 - Sunday, 1 - Monday, ... , 6 - Saturday)
    events: 'click',
    fillEmpty: false,
    feedParser: './feed/',
    zone: '00:00', // Ex: IST zone time is '+05:30' by default it is GMT, Sign is important.
    checkUpdate: true //Check if any new version of Calendario is released (Details will be in the browser console)
  };

  $.Calendario.prototype = {
    _init : function(options){
      // options
      this.VERSION = '3.2.0';
      this.UNIQUE = '%{unique}%'; //UNIQUE helps us differentiate your js from others and help us keep a track of run time.
      this.options = $.extend(true, {}, $.Calendario.defaults, options);
      this.today = new Date();
      this.month = (isNaN(this.options.month) || this.options.month === null) ? this.today.getMonth() : this.options.month - 1;
      this.year = (isNaN(this.options.year) || this.options.year === null) ? this.today.getFullYear() : this.options.year;
      this.caldata = this._processCaldata(this.options.caldata);
      // if hover is passed as an event then throw error if jQuery is 1.9 or above 1.9, because, hover psuedo name isn't supported
      if(parseFloat($().jquery) >= 1.9 && this.options.events.indexOf('hover') != -1) 
        this.logError('\'hover\' psuedo-name is not supported' + ' in jQuery 1.9+. Use \'mouseenter\' \'mouseleave\' events instead.');
        
      this.options.events = this.options.events.split(',');
      this.options.zone = this.options.zone.charAt(0) != '+' && this.options.zone.charAt(0) != '-' ? '+' + this.options.zone : this.options.zone;
      this._generateTemplate(true);
      this._initEvents();
    },
    
    _processCaldataObj: function(val, key){
      if(typeof val !== 'object') val = {content: val, startTime: '00:00', endTime: '23:59', allDay: true};
      if(!val.content) this.logError('Content is missing in date ' + key);
      if(val.startTime && !val.endTime) val.endTime = parseInt(val.startTime.split(':')[0]) + 1 + ':' + val.startTime.split(':')[1];
      if(!val.startTime && !val.endTime) val = $.extend({}, val, {startTime: '00:00', endTime: '23:59', allDay: true});
      if(val.startTime && val.endTime && val.allDay === undefined) val.allDay = false;
      if(/^\d{2}-DD-\d{4}/.test(key) || /^\d{2}-DD-YYYY/.test(key)) {
        var det = /^(\d{2})-DD-(\d{4})/.exec(key) || /^(\d{2})-DD-YYYY/.exec(key), chkDate;
        if(det.length == 3) chkDate = new Date(det[2], det[1], 0);
        else if(det.length == 2) chkDate = new Date(this.year, det[1], 0)
        if(!val.startDate) val.startDate = 1;
        if(!val.endDate && chkDate.getDate() != 1) val.endDate = chkDate.getDate();
        if(!val.endDate && chkDate.getDate() == 1 && det.length == 3) val.endDate = chkDate.getDate();
      }
      return val;
    },
    
    _processCaldata: function(caldata){
      var self = this;
      caldata = caldata || {};
      $.each(caldata, function(key, val){
        if(/^\d{2}-\d{2}-\d{4}/.test(key) || /^\d{2}-\d{2}-YYYY/.test(key) || /^\d{2}-DD-YYYY/.test(key) || /^MM-\d{2}-YYYY/.test(key) ||
        /^\d{2}-DD-YYYY/.test(key) || /^MM-\d{2}-\d{4}/.test(key) || /^\d{2}-DD-\d{4}/.test(key) || key == 'TODAY') {} else
          self.logError(key + ' is an Invalid Date. Date should not contain spaces, should be separated by \'-\' and should be in the ' + 
          'format \'MM-DD-YYYY\'. That ain\'t that difficult!');
        if(Array.isArray(val)) {
          $.each(val, function(i, c){
            val[i] = self._processCaldataObj(c, key);
          });
          caldata[key] = val;
        } else {
          caldata[key] = self._processCaldataObj(val, key);
        }
      });
      return caldata;
    },  
     
    _propDate: function($cell, event){
      var idx = $cell.index(),
          data = {allDay : [], content: [], endTime: [], startTime: []},
          dateProp = {
            day : $cell.children('span.fc-date').text(),
            month : this.month + 1,
            monthname : this.options.displayMonthAbbr ? this.options.monthabbrs[this.month] : this.options.months[this.month],
            year : this.year,
            weekday : idx + this.options.startIn,
            weekdayname : this.options.weeks[(idx==6?0:idx + this.options.startIn)]
          };
          
      $cell.children( 'div.fc-calendar-events').children('div.fc-calendar-event').each(function(i, e){
        var $html = $('<div>' + $(e).html() + '</div>');
        data.startTime[i] = new Date($html.find('time.fc-starttime').attr('datetime'));
        data.endTime[i] = new Date($html.find('time.fc-endtime').attr('datetime'));
        data.allDay[i] = $html.find('time.fc-allday').attr('datetime') === 'true' ? true : false;
        $html.find('time').remove();
        data.content[i] = $html.html();
      });
      
      if(dateProp.day) this.options[event]($cell, data, dateProp);
    },
        
    _initEvents : function() {
      var self = this, event = [], calendarioEventNameFormat = [];
      for(var i = 0; i < self.options.events.length; i++) {
        event[i] = self.options.events[i].toLowerCase().trim();
        calendarioEventNameFormat[i] = 'onDay' + event[i].charAt(0).toUpperCase() + event[i].slice(1);
        
        if(this.options[calendarioEventNameFormat[i]] === undefined)
          this.options[calendarioEventNameFormat[i]] = function($el, $content, dateProperties) {return false;};
                
        this.$el.on(event[i] + '.calendario', 'div.fc-row > div', function(e) {
          if(e.type == 'mouseenter' || e.type == 'mouseleave') e.type = $.inArray(e.type, event) == -1 ? 'hover' : e.type;
          self._propDate($(this), calendarioEventNameFormat[$.inArray(e.type, event)]);
        });
      }
      this.$el.on('shown.calendar.calendario', function(e, instance){
        // If check update set to true, then contact calendario's update servers for details. We didn't want to slow down your code. So we
        // check after the calendar is rendered.
        if(instance && instance.options.checkUpdate) self._checkUpdate();
      });
      // newday trigger. This trigger is exactly triggered at 00:00 hours the next day with an uncertainty of 6ms.
      this.$el.delay(new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1, 0, 0, 0) - new Date().getTime())
      .queue(function(){
        self.today = new Date();
        if(self.today.getMonth() == self.month || self.today.getMonth() + 1 == self.month) self._generateTemplate(true);
        self.$el.trigger($.Event('newday.calendar.calendario'));
      });
    },
        
    _checkUpdate : function() {
      var self = this;
      $.getScript("https://raw.githubusercontent.com/codrops/Calendario/master/js/update.js")
      .done(function(script, textStatus){
        if(calendario.current != self.version() && parseFloat(calendario.current) >= parseFloat(self.version())) 
          console.info(calendario.msg);
      })
      .fail(function(jqxhr, settings, exception){
        console.error(exception);
      });
    },
    
    // Calendar logic based on http://jszen.blogspot.pt/2007/03/how-to-build-simple-calendar-with.html
    _generateTemplate : function(firstRun, callback) {
      var head = this._getHead(),
          body = this._getBody(),
          rowClass;

      switch(this.rowTotal) {
        case 4 : rowClass = 'fc-four-rows'; break;
        case 5 : rowClass = 'fc-five-rows'; break;
        case 6 : rowClass = 'fc-six-rows'; break;
      }
    
      this.$cal = $('<div class="fc-calendar ' + rowClass + '">').append(head, body);
      this.$el.find('div.fc-calendar').remove().end().append(this.$cal);
      this.$el.find('.fc-emptydate').parent().css({'background':'transparent', 'cursor':'default'});
      
      if(!firstRun) this.$el.trigger($.Event('shown.calendario'));
      if(callback) callback.call();
    },
    _generateTemplate2 : function(firstRun, callback) {
      var head = this._getHead(),
          body = this._getBody(),
          rowClass;

      switch(this.rowTotal) {
        case 4 : rowClass = 'fc-four-rows'; break;
        case 5 : rowClass = 'fc-five-rows'; break;
        case 6 : rowClass = 'fc-six-rows'; break;
      }

      this.$cal = $('<div class="fc-calendar ' + rowClass + '">').append(head, body);
      this.$el.find('div.fc-calendar').remove().end().append(this.$cal);
      this.$el.find('.fc-emptydate').parent().css({'background':'transparent', 'cursor':'default'});

      if(!firstRun) this.$el.trigger($.Event('shown.calendario2'));
      if(callback) callback.call();
    },
        
    _getHead : function() {
      var html = '<div class="fc-head">';
      for(var i = 0; i <= 6; i++){
        var pos = i + this.options.startIn,
            j = pos > 6 ? pos - 6 - 1 : pos;
            html += '<div>' + (this.options.displayWeekAbbr ? this.options.weekabbrs[j] : this.options.weeks[j]) + '</div>';
      }
      return html + '</div>';
    },
        
    _parseDataToDay : function (data, day, other) {
      var content = '';
      if(!other){
        if(Array.isArray(data)) content = this._convertDayArray(data, day);
        else content = this._wrapDay(data, day, true);
      }else{
        if (!Array.isArray(data)) data = [data];
        for(var i = 0; i < data.length; i++){
          if(this.month != 1 && (day >= data[i].startDate) && (day <= data[i].endDate)) content += this._wrapDay(data[i], day, true);
          else if(this.month == 1 && (day >= data[i].startDate)){
            if(data[i].endDate && (day <= data[i].endDate)) content += this._wrapDay(data[i], day, true);
            else if(!data[i].endDate) content += this._wrapDay(data[i], day, true);
          }
        }
      }
      return content;
    },
        
    _toDateTime : function(time, day, start) {
      var zoneH = parseInt(this.options.zone.split(':')[0]),
          zoneM = parseInt(this.options.zone.charAt(0) + this.options.zone.split(':')[1]),
          hour = parseInt(time.split(':')[0]) - zoneH,
          minutes = parseInt(time.split(':')[1]) - zoneM,
          d = new Date(Date.UTC(this.year, this.month, day, hour, minutes, 0, 0));
      if(start) {
        var hStart = parseInt(start.split(':')[0]) - zoneH,
            mStart = parseInt(start.split(':')[1]) - zoneM;
        if(d.getTime() - new Date(Date.UTC(this.year, this.month, day, hStart, mStart, 0, 0)).getTime() < 0)
            d =  new Date(Date.UTC(this.year, this.month, day + 1, hour, minutes, 0, 0));
      }
      return d.toISOString();
    },
        
    _timeHtml : function(day, date){
      var content = day.content;
      content += '<time class="fc-allday" datetime="' + day.allDay + '"></time>';
      content += '<time class="fc-starttime" datetime="' + this._toDateTime(day.startTime, date) + '">' + day.startTime + '</time>';
      content += '<time class="fc-endtime" datetime="' + this._toDateTime(day.endTime, date, day.startTime) + '">' + day.endTime + '</time>';
      return content;
    },
        
    _wrapDay: function (day, date, wrap) {
      if(date){
        if(wrap) return '<div class="fc-calendar-event">' + this._timeHtml(day, date) + '</div>';
        else return this._timeHtml(day, date);
      } else return '<div class="fc-calendar-event">' + day + '</div>';
    },
        
    _convertDayArray: function (day, date) {
      var wrap_days = []
      for(var i = 0; i < day.length; i++){
        wrap_days[i] = this._wrapDay(day[i], date, false);
      }
      return this._wrapDay(wrap_days.join('</div><div class="fc-calendar-event">'));
    },
        
    _getBody : function() {
      var d = new Date(this.year, this.month + 1, 0),
          monthLength = d.getDate(), // number of days in the month
          firstDay = new Date(this.year, d.getMonth(), 1),
          pMonthLength = new Date(this.year, this.month, 0).getDate();

      // day of the week
      this.startingDay = firstDay.getDay();

      var html = '<div class="fc-body"><div class="fc-row">',
          day = 1; // fill in the days

      //计算农历
      var weeks = getWeeks(this.$el, this.year, this.month + 1);
      var currentCa = new Calendar(this.year, this.month);
      for (var i = 0; i < 7; i++){ // this loop is for weeks (rows)
        var week = weeks[i];
        for (var j = 0; j <= 6; j++) { // this loop is for weekdays (cells)
          var pos = this.startingDay - this.options.startIn,
              p = pos < 0 ? 6 + pos + 1 : pos,
              inner = '',
              today = this.month === this.today.getMonth() && this.year === this.today.getFullYear() && day === this.today.getDate(),
              past = this.year < this.today.getFullYear() || this.month < this.today.getMonth() && this.year === this.today.getFullYear() ||
                     this.month === this.today.getMonth() && this.year === this.today.getFullYear() && day < this.today.getDate(),
              content = '';

          if(this.options.fillEmpty && (j < p || i > 0)){
            if(day > monthLength) {
              inner = '<span class="fc-date fc-emptydate">' + (day - monthLength) + '</span><span class="fc-weekday">';
              ++day;
            } else if (day == 1) {
              inner = '<span class="fc-date fc-emptydate">' + (pMonthLength - p + 1) + '</span><span class="fc-weekday">';
              ++pMonthLength;
            }
            inner += this.options.weekabbrs[j + this.options.startIn > 6 ? j + this.options.startIn - 6 - 1 : j + this.options.startIn] + '</span>';
          }


          if (day <= monthLength && (i > 0 || j >= p)){
            var dday = week[j];
            if(i == 0) dday = week[j-p];
            var info = null;
            if (dday != undefined && this.month+1 == dday[1]) {
              info = currentCa[dday[2] - 1];
            }
            inner = '<span class="fc-date">' + day + '</span><br><span class="fc-lunar-date">'+cDay(info.lDay, info.lMonth)+'</span>' +
                '<span id="ly'+day+'" style="display: none;">'+info.cYear+ '年 '+ monthName[info.lMonth - 1] +cDay(info.lDay, info.lMonth,true)+ '</span>' +
                '<span id="lmd'+day+'" style="display: none;">' + info.cMonth + '月 ' + info.cDay + '日</span>' +
                '<span class="fc-weekday">' + this.options.weekabbrs[j +
                this.options.startIn > 6 ? j + this.options.startIn - 6 - 1 : j + this.options.startIn ] + '</span>';

            var strdate = (this.month + 1 < 10 ? '0' + (this.month + 1) : this.month + 1) + '-' + (day < 10 ? '0' + day : day) + '-' + this.year, 
                dayData = this.caldata[strdate],
                strdateyear = (this.month + 1 < 10 ? '0' + (this.month + 1) : this.month + 1) + '-' + (day < 10 ? '0' + day : day) + '-YYYY',
                dayDataYear = this.caldata[strdateyear],
                strdatemonth = 'MM-' + (day < 10 ? '0' + day : day) + '-' + this.year,
                dayDataMonth = this.caldata[strdatemonth],
                strdatemonthyear = 'MM' + '-' + (day < 10 ? '0' + day : day) + '-YYYY',
                dayDataMonthYear = this.caldata[strdatemonthyear],
                strdatemonthlyyear = (this.month + 1 < 10 ? '0' + (this.month + 1) : this.month + 1) + '-DD-' + this.year,
                dayDataMonthlyYear = this.caldata[strdatemonthlyyear],
                strdatemonthly = (this.month + 1 < 10 ? '0' + (this.month + 1) : this.month + 1) + '-DD-YYYY',
                dayDataMonthly = this.caldata[strdatemonthly];
    
            if(today && this.caldata.TODAY) content += this._parseDataToDay(this.caldata.TODAY, day);
            if(dayData) content += this._parseDataToDay(dayData, day);
            if(dayDataMonth) content += this._parseDataToDay(dayDataMonth, day);
            if(dayDataMonthlyYear) content += this._parseDataToDay(dayDataMonthlyYear, day, true);
            if(dayDataMonthly) content += this._parseDataToDay(dayDataMonthly, day, true);
            if(dayDataMonthYear) content += this._parseDataToDay( dayDataMonthYear, day );
            if(dayDataYear) content += this._parseDataToDay( dayDataYear, day );
            if(content !== '') inner += '<div class="fc-calendar-events">' + content + '</div>';
            ++day;
          } else {
            today = false;
          }

          var cellClasses = today ? 'fc-today ' : '';

          if(past) cellClasses += 'fc-past ';
          else cellClasses += 'fc-future ';

          if(content !== '') cellClasses += 'fc-content';
          
          html += (cellClasses !== '' ? '<div class="' + cellClasses.trim() + '">' : '<div>') + inner + '</div>';
        }

        if(day > monthLength){ // stop making rows if we've run out of days
          this.rowTotal = i + 1;
          break;
        } else {
          html += '</div><div class="fc-row">';
        }
      }
      return html + '</div></div>';
    },
        
    _move : function(period, dir, callback){
      if(dir === 'previous'){
        if(period === 'month'){
          this.year = this.month > 0 ? this.year : --this.year;
          this.month = this.month > 0 ? --this.month : 11;
        } else if(period === 'year') this.year = --this.year;
      }
      else if(dir === 'next'){
        if(period === 'month'){
          this.year = this.month < 11 ? this.year : ++this.year;
          this.month = this.month < 11 ? ++this.month : 0;
        } else if(period === 'year') this.year = ++this.year;
      }
      this._generateTemplate(false, callback);
    },
    _move2 : function(period, dir, callback){
      if(dir === 'previous'){
        if(period === 'month'){
          this.year = this.month > 0 ? this.year : --this.year;
          this.month = this.month > 0 ? --this.month : 11;
        } else if(period === 'year') this.year = --this.year;
      }
      else if(dir === 'next'){
        if(period === 'month'){
          this.year = this.month < 11 ? this.year : ++this.year;
          this.month = this.month < 11 ? ++this.month : 0;
        } else if(period === 'year') this.year = ++this.year;
      }
      this._generateTemplate2(false, callback);
    },
        
    /************************* 
    ***** PUBLIC METHODS *****
    **************************/
    option : function(option, value) {
      if(value) this.options[option] = value;
      else return this.options[option];
    },
    getYear : function(){
      return this.year;
    },
    getMonth : function(){
      return this.month + 1;
    },
    getMonthName : function(){
      return this.options.displayMonthAbbr ? this.options.monthabbrs[this.month] : this.options.months[this.month];
    },
    // gets the cell's content div associated to a day of the current displayed month
    // day : 1 - [28||29||30||31]
    getCell : function(day){
      var row = Math.floor((day + this.startingDay - this.options.startIn - 1) / 7),
          pos = day + this.startingDay - this.options.startIn - (row * 7) - 1;
      return this.$cal.find('div.fc-body').children('div.fc-row').eq(row).children('div').eq(pos);
    },
    setData : function(caldata, clear) {
      caldata = this._processCaldata(caldata);
      if(clear) this.caldata = caldata;
      else $.extend(this.caldata, caldata);
      this._generateTemplate(false);
    },
    // goes to today's month/year
    gotoNow : function(callback) {
      this.month = this.today.getMonth();
      this.year = this.today.getFullYear();
      this._generateTemplate(false, callback);
    },
    // goes to month/year
    gotoMonth : function(month, year, callback){
      this.month = month - 1;
      this.year = year;
      this._generateTemplate(false, callback);
    },
    gotoPreviousMonth : function(callback){
      this._move('month', 'previous', callback);
    },
    gotoPreviousMonth2 : function(callback){
      this._move2('month', 'previous', callback);
    },
    gotoPreviousYear : function(callback){
      this._move('year', 'previous', callback);
    },
    gotoNextMonth : function(callback){
      this._move('month', 'next', callback);
    },
    gotoNextMonth2 : function(callback){
      this._move2('month', 'next', callback);
    },
    gotoNextYear : function(callback){
      this._move('year', 'next', callback);
    },
    feed : function(callback){
      var self = this;
      $.post(self.options.feedParser, {dates: this.caldata})
      .always(function(data){
        if(callback) callback.call(this, JSON.parse(data).hevent);
      });
    },
    version : function() {
      return this.VERSION;
    }
  };
    
  var logError = function(message){
    throw new Error(message);
  };
    
  $.fn.calendario = function(options) {
    var instance = $.data(this, 'calendario');
    if(typeof options === 'string'){    
      var args = Array.prototype.slice.call(arguments, 1);  
      this.each(function(){
        if(!instance){
          logError("Cannot call methods on calendario prior to initialization; Attempted to call method '" + options + "'");
          return;
        }
        if (!$.isFunction(instance[options]) || options.charAt(0) === "_"){
          logError("No such method '" + options + "' for calendario instance.");
        }
        instance[options].apply(instance, args);
      });
    } else {
      this.each(function(){
        if (instance) instance._init();
        else instance = $.data(this, 'calendario', new $.Calendario(options, this));
      });
    }
    instance.$el.trigger($.Event('shown.calendar.calendario'), [instance]);
    return instance;
  };
  $.fn.calendario2 = function(options) {
    var instance = $.data(this, 'calendario');
    if(typeof options === 'string'){
      var args = Array.prototype.slice.call(arguments, 1);
      this.each(function(){
        if(!instance){
          logError("Cannot call methods on calendario prior to initialization; Attempted to call method '" + options + "'");
          return;
        }
        if (!$.isFunction(instance[options]) || options.charAt(0) === "_"){
          logError("No such method '" + options + "' for calendario instance.");
        }
        instance[options].apply(instance, args);
      });
    } else {
      this.each(function(){
        if (instance) instance._init();
        else instance = $.data(this, 'calendario', new $.Calendario(options, this));
      });
    }
    instance.$el.trigger($.Event('shown.calendar.calendario2'), [instance]);
    return instance;
  };


  /*****************************************************************************
   日期资料
   *****************************************************************************/
  var ttime = 0;
  var detail;
  var hideTimer;
  var Today = new Date();
  var tY = Today.getFullYear();
  var tM = Today.getMonth();
  var tD = Today.getDate();

  var tInfo = new Array(
      0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
      0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
      0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
      0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
      0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
      0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
      0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
      0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
      0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
      0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
      0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
      0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
      0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
      0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
      0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
      0x14b63);

  var solarMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
  var Gan = new Array("甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸");
  var Zhi = new Array("子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥");
  var Animals = new Array("鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪");
  var solarTerm = new Array("小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至");
  var sTermInfo = new Array(0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758);
  var nStr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');
  var nStr2 = new Array('初', '十', '廿', '卅', '□');
  var monthName = new Array("正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月");

  //国历节日 *表示放假日
  var sFtv = new Array(
      "0101*元旦节",
      "0202 世界湿地日",
      "0210 国际气象节",
      "0214 情人节",
      "0301 国际海豹日",
      "0303 全国爱耳日",
      "0305 学雷锋纪念日",
      "0308 妇女节",
      "0312 植树节 孙中山逝世纪念日",
      "0314 国际警察日",
      "0315 消费者权益日",
      "0317 中国国医节 国际航海日",
      "0321 世界森林日 消除种族歧视国际日 世界儿歌日",
      "0322 世界水日",
      "0323 世界气象日",
      "0324 世界防治结核病日",
      "0325 全国中小学生安全教育日",
      "0330 巴勒斯坦国土日",
      "0401 愚人节 全国爱国卫生运动月(四月) 税收宣传月(四月)",
      "0407 世界卫生日",
      "0422 世界地球日",
      "0423 世界图书和版权日",
      "0424 亚非新闻工作者日",
      "0501*劳动节",
      "0504 青年节",
      "0505 碘缺乏病防治日",
      "0508 世界红十字日",
      "0512 国际护士节",
      "0515 国际家庭日",
      "0517 国际电信日",
      "0518 国际博物馆日",
      "0520 全国学生营养日",
      "0523 国际牛奶日",
      "0531 世界无烟日",
      "0601 国际儿童节",
      "0605 世界环境保护日",
      "0606 全国爱眼日",
      "0617 防治荒漠化和干旱日",
      "0623 国际奥林匹克日",
      "0625 全国土地日",
      "0626 国际禁毒日",
      "0701 香港回归纪念日 中共诞辰 世界建筑日",
      "0702 国际体育记者日",
      "0707 抗日战争纪念日",
      "0711 世界人口日",
      "0730 非洲妇女日",
      "0801 建军节",
      "0808 中国男子节(爸爸节)",
      "0815 抗日战争胜利纪念",
      "0908 国际扫盲日 国际新闻工作者日",
      "0909 毛泽东逝世纪念",
      "0910 中国教师节",
      "0914 世界清洁地球日",
      "0916 国际臭氧层保护日",
      "0918 九·一八事变纪念日",
      "0920 国际爱牙日",
      "0927 世界旅游日",
      "0928 孔子诞辰",
      "1001*国庆节 世界音乐日 国际老人节",
      "1002*国庆节假日 国际和平与民主自由斗争日",
      "1003*国庆节假日",
      "1004 世界动物日",
      "1006 老人节",
      "1008 全国高血压日 世界视觉日",
      "1009 世界邮政日 万国邮联日",
      "1010 辛亥革命纪念日 世界精神卫生日",
      "1013 世界保健日 国际教师节",
      "1014 世界标准日",
      "1015 国际盲人节(白手杖节)",
      "1016 世界粮食日",
      "1017 世界消除贫困日",
      "1022 世界传统医药日",
      "1024 联合国日",
      "1031 世界勤俭日",
      "1107 十月社会主义革命纪念日",
      "1108 中国记者日",
      "1109 全国消防安全宣传教育日",
      "1110 世界青年节",
      "1111 国际科学与和平周(本日所属的一周)",
      "1112 孙中山诞辰纪念日",
      "1114 世界糖尿病日",
      "1117 国际大学生节 世界学生节",
      "1120*彝族年",
      "1121*彝族年 世界问候日 世界电视日",
      "1122*彝族年",
      "1129 国际声援巴勒斯坦人民国际日",
      "1201 世界艾滋病日",
      "1203 世界残疾人日",
      "1205 国际经济和社会发展志愿人员日",
      "1208 国际儿童电视日",
      "1209 世界足球日",
      "1210 世界人权日",
      "1212 西安事变纪念日",
      "1213 南京大屠杀(1937年)纪念日！谨记血泪史！",
      "1220 澳门回归纪念",
      "1221 国际篮球日",
      "1224 平安夜",
      "1225 圣诞节",
      "1226 毛泽东诞辰纪念")

  //农历节日 *表示放假日
  var lFtv = new Array(
      "0101*春节",
      "0102*初二",
      "0115 元宵节",
      "0505*端午节",
      "0707 七夕情人节",
      "0715 中元节",
      "0815*中秋节",
      "0909 重阳节",
      "1208 腊八节",
      "1223 小年",
      "0100*除夕")

  //某月的第几个星期几
  var wFtv = new Array(
      "0150 世界麻风日", //一月的最后一个星期日（月倒数第一个星期日）
      "0520 国际母亲节",
      "0530 全国助残日",
      "0630 父亲节",
      "0730 被奴役国家周",
      "0932 国际和平日",
      "0940 国际聋人节 世界儿童日",
      "0950 世界海事日",
      "1011 国际住房日",
      "1013 国际减轻自然灾害日(减灾日)",
      "1144 感恩节")

  /*****************************************************************************
   日期计算
   *****************************************************************************/

  //====================================== 返回农历 y年的总天数
  function lYearDays(y) {
    var i,
        sum = 348;
    for (i = 0x8000; i > 0x8; i >>= 1)
      sum += (tInfo[y - 1900] & i) ? 1 : 0;
    return (sum + leapDays(y));
  }

  //====================================== 返回农历 y年闰月的天数
  function leapDays(y) {
    if (leapMonth(y))
      return ((tInfo[y - 1900] & 0x10000) ? 30 : 29);
    else
      return (0);
  }

  //====================================== 返回农历 y年闰哪个月 1-12 , 没闰返回 0
  function leapMonth(y) {
    return (tInfo[y - 1900] & 0xf);
  }

  //====================================== 返回农历 y年m月的总天数
  function monthDays(y, m) {
    return ((tInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
  }

  //====================================== 算出农历, 传入日期控件, 返回农历日期控件
  //                                       该控件属性有 .year .month .day .isLeap
  function Lunar(objDate) {

    var i,
        leap = 0,
        temp = 0;
    var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;

    for (i = 1900; i < 2050 && offset > 0; i++) {
      temp = lYearDays(i);
      offset -= temp;
    }

    if (offset < 0) {
      offset += temp;
      i--;
    }

    this.year = i;

    leap = leapMonth(i); //闰哪个月
    this.isLeap = false;

    for (i = 1; i < 13 && offset > 0; i++) {
      //闰月
      if (leap > 0 && i == (leap + 1) && this.isLeap == false) {
        --i;
        this.isLeap = true;
        temp = leapDays(this.year);
      } else {
        temp = monthDays(this.year, i);
      }

      //解除闰月
      if (this.isLeap == true && i == (leap + 1))
        this.isLeap = false;

      offset -= temp;
    }

    if (offset == 0 && leap > 0 && i == leap + 1)
      if (this.isLeap) {
        this.isLeap = false;
      } else {
        this.isLeap = true;
        --i;
      }

    if (offset < 0) {
      offset += temp;
      --i;
    }

    this.month = i;
    this.day = offset + 1;
  }

  //==============================返回公历 y年某m+1月的天数
  function solarDays(y, m) {
    if (m == 1)
      return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
    else
      return (solarMonth[m]);
  }
  //============================== 传入 offset 返回干支, 0=甲子
  function cyclical(num) {
    return (Gan[num % 10] + Zhi[num % 12]);
  }

  //============================== 阴历属性
  function calElement(sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay) {

    this.isToday = false;
    //瓣句
    this.sYear = sYear; //公元年4位数字
    this.sMonth = sMonth; //公元月数字
    this.sDay = sDay; //公元日数字
    this.week = week; //星期, 1个中文
    //农历
    this.lYear = lYear; //公元年4位数字
    this.lMonth = lMonth; //农历月数字
    this.lDay = lDay; //农历日数字
    this.isLeap = isLeap; //是否为农历闰月?
    //八字
    this.cYear = cYear; //年柱, 2个中文
    this.cMonth = cMonth; //月柱, 2个中文
    this.cDay = cDay; //日柱, 2个中文

    this.color = '';

    this.lunarFestival = ''; //农历节日
    this.solarFestival = ''; //公历节日
    this.solarTerms = ''; //节气
  }

  //===== 某年的第n个节气为几日(从0小寒起算)
  function sTerm(y, n) {
    if (y == 2009 && n == 2) {
      sTermInfo[n] = 43467
    }
    var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
    return (offDate.getUTCDate());
  }

  //============================== 返回阴历控件 (y年,m+1月)
  /*
   功能说明: 返回整个月的日期资料控件

   使用方式: OBJ = new calendar(年,零起算月);

   OBJ.length      返回当月最大日
   OBJ.firstWeek   返回当月一日星期

   由 OBJ[日期].属性名称 即可取得各项值

   OBJ[日期].isToday  返回是否为今日 true 或 false

   其他 OBJ[日期] 属性参见 calElement() 中的注解
   */
  function Calendar(y, m) {

    var sDObj,
        lDObj,
        lY,
        lM,
        lD = 1,
        lL,
        lX = 0,
        tmp1,
        tmp2,
        tmp3;
    var cY,
        cM,
        cD; //年柱,月柱,日柱
    var lDPOS = new Array(3);
    var n = 0;
    var firstLM = 0;

    sDObj = new Date(y, m, 1, 0, 0, 0, 0); //当月一日日期

    this.length = solarDays(y, m); //公历当月天数
    this.firstWeek = sDObj.getDay(); //公历当月1日星期几

    ////////年柱 1900年立春后为庚子年(60进制36)
    if (m < 2)
      cY = cyclical(y - 1900 + 36 - 1);
    else
      cY = cyclical(y - 1900 + 36);

    var term2 = sTerm(y, 2); //立春日期

    ////////月柱 1900年1月小寒以前为 丙子月(60进制12)
    var firstNode = sTerm(y, m * 2) //返回当月「节」为几日开始
    cM = cyclical((y - 1900) * 12 + m + 12);

    //当月一日与 1900/1/1 相差天数
    //1900/1/1与 1970/1/1 相差25567日, 1900/1/1 日柱为甲戌日(60进制10)
    var dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;

    for (var i = 0; i < this.length; i++) {

      if (lD > lX) {
        sDObj = new Date(y, m, i + 1); //当月一日日期
        lDObj = new Lunar(sDObj); //农历
        lY = lDObj.year; //农历年
        lM = lDObj.month; //农历月
        lD = lDObj.day; //农历日
        lL = lDObj.isLeap; //农历是否闰月
        lX = lL ? leapDays(lY) : monthDays(lY, lM); //农历当月最后一天

        if (n == 0)
          firstLM = lM;
        lDPOS[n++] = i - lD + 1;
      }

      //依节气调整二月分的年柱, 以立春为界
      /*
       //PM提出线上2月3日，初一不是庚寅年，应该是辛卯年。
       by yuji

       这里firstNode是指农历每月的节气所在的日期，用这个标志判断
       农历每月起始日天干地支是错误的，应当用每月的农历初一所在日确定
       下月的天干地支。农历每月初一都要重新计算一下天干地支。
       */
      if (m == 1 && ((i + 1) == term2 || lD == 1))
        cY = cyclical(y - 1900 + 36);

      //依节气月柱, 以「节」为界
      //if((i+1)==firstNode) cM = cyclical((y-1900)*12+m+13);

      /*
       by yuji

       这里firstNode是指农历每月的节气所在的日期，用这个标志判断
       农历每月起始日天干地支是错误的，应当用每月的农历初一所在日确定
       下月的天干地支。农历每月初一都要重新计算一下天干地支。
       */
      if (lD == 1) {
        cM = cyclical((y - 1900) * 12 + m + 13);

      }

      //日柱
      cD = cyclical(dayCyclical + i);

      //sYear,sMonth,sDay,week,
      //lYear,lMonth,lDay,isLeap,
      //cYear,cMonth,cDay
      this[i] = new calElement(y, m + 1, i + 1, nStr1[(i + this.firstWeek) % 7],
          lY, lM, lD++, lL,
          cY, cM, cD);
    }

    //节气
    tmp1 = sTerm(y, m * 2) - 1;
    tmp2 = sTerm(y, m * 2 + 1) - 1;
    this[tmp1].solarTerms = solarTerm[m * 2];
    this[tmp2].solarTerms = solarTerm[m * 2 + 1];
    //guohao
    if (y == 2009 && m == 1) {
      if (tD == 3) {
        this[tmp1].solarTerms = ''
        //this[tmp2].solarTerms = ''
      } else if (tD == 4) {
        this[tmp1].solarTerms = '立春'
        //this[tmp2].solarTerms = ''
      }
    }
    if (m == 3)
      this[tmp1].color = 'red'; //清明颜色

    //公历节日
    for (i in sFtv)
      if (sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/))
        if (Number(RegExp.$1) == (m + 1)) {
          this[Number(RegExp.$2) - 1].solarFestival += RegExp.$4 + ' ';
          if (RegExp.$3 == '*')
            this[Number(RegExp.$2) - 1].color = 'red';
        }

    //月周节日
    for (i in wFtv)
      if (wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/))
        if (Number(RegExp.$1) == (m + 1)) {
          tmp1 = Number(RegExp.$2);
          tmp2 = Number(RegExp.$3);
          if (tmp1 < 5)
            this[((this.firstWeek > tmp2) ? 7 : 0) + 7 * (tmp1 - 1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5 + ' ';
          else {
            tmp1 -= 5;
            tmp3 = (this.firstWeek + this.length - 1) % 7; //当月最后一天星期?
            this[this.length - tmp3 - 7 * tmp1 + tmp2 - (tmp2 > tmp3 ? 7 : 0) - 1].solarFestival += RegExp.$5 + ' ';
          }
        }

    //农历节日
    for (i in lFtv)
      if (lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
        tmp1 = Number(RegExp.$1) - firstLM;
        if (tmp1 == -11)
          tmp1 = 1;
        if (tmp1 >= 0 && tmp1 < n) {
          tmp2 = lDPOS[tmp1] + Number(RegExp.$2) - 1;
          if (tmp2 >= 0 && tmp2 < this.length && this[tmp2].isLeap != true) {
            this[tmp2].lunarFestival += RegExp.$4 + ' ';
            if (RegExp.$3 == '*')
              this[tmp2].color = 'red';
          }
        }
      }

    //复活节只出现在3或4月
    if (m == 2 || m == 3) {
      var estDay = new easter(y);
      if (m == estDay.m)
        this[estDay.d - 1].solarFestival = this[estDay.d - 1].solarFestival + ' 复活节 Easter Sunday';
    }

    if (m == 2)
      this[20].solarFestival = this[20].solarFestival + unescape('%20%u6D35%u8CE2%u751F%u65E5');

    //黑色星期五
    if ((this.firstWeek + 12) % 7 == 5)
      this[12].solarFestival += '黑色星期五';

    //今日
    if (y == tY && m == tM)
      this[tD - 1].isToday = true;
  }

  //======================================= 返回该年的复活节(春分后第一次满月周后的第一主日)
  function easter(y) {

    var term2 = sTerm(y, 5); //取得春分日期
    var dayTerm2 = new Date(Date.UTC(y, 2, term2, 0, 0, 0, 0)); //取得春分的公历日期控件(春分一定出现在3月)
    var lDayTerm2 = new Lunar(dayTerm2); //取得取得春分农历

    if (lDayTerm2.day < 15) //取得下个月圆的相差天数
      var lMlen = 15 - lDayTerm2.day;
    else
      var lMlen = (lDayTerm2.isLeap ? leapDays(y) : monthDays(y, lDayTerm2.month)) - lDayTerm2.day + 15;

    //一天等于 1000*60*60*24 = 86400000 毫秒
    var l15 = new Date(dayTerm2.getTime() + 86400000 * lMlen); //求出第一次月圆为公历几日
    var dayEaster = new Date(l15.getTime() + 86400000 * (7 - l15.getUTCDay())); //求出下个周日

    this.m = dayEaster.getUTCMonth();
    this.d = dayEaster.getUTCDate();

  }

  //====================== 中文日期
  function cDay(d, m,dt) {
    var s;
    switch (d) {
      case 1:
        s = monthName[m - 1];
        if(dt){
          s = '初一';
        }
        break;
      case 10:
        s = '初十';
        break;
      case 20:
        s = '二十';
        break;
      case 30:
        s = '三十';
        break;
      default:
        s = nStr2[Math.floor(d / 10)];
        s += nStr1[d % 10];
    }
    return (s);
  }

  var detailTpl = '<div style="position: absolute;visibility: hidden;"><div></div></div>';
  var favTpl = '<font color="#000000" style="font-size:9pt;">{fav}</font>';

  function setSize(target) {
    var opts = $.data(target, 'fullCalendar').options;
    var t = $(target);
    if (opts.fit == true) {
      var p = t.parent();
      opts.width = p.width();
      opts.height = p.height();
    }
    var header = t.find('.calendar-header');
    t._outerWidth(opts.width);
    t._outerHeight(opts.height);
    t.find('.calendar-body')._outerHeight(t.height() - header._outerHeight());
  }

  function init(target) {
    $(target).addClass('calendar').wrapInner(
        '<div class="calendar-header">' +
        '<div class="calendar-prevmonth"></div>' +
        '<div class="calendar-nextmonth"></div>' +
        '<div class="calendar-prevyear"></div>' +
        '<div class="calendar-nextyear"></div>' +
        '<div class="calendar-title">' +
        '<span>Aprial 2010</span>' +
        '</div>' +
        '</div>' +
        '<div class="calendar-body fullcalendar-body">' +
        '<div class="calendar-menu">' +
        '<div class="calendar-menu-year-inner">' +
        '<span class="calendar-menu-prev"></span>' +
        '<span><input class="calendar-menu-year" type="text"></input></span>' +
        '<span class="calendar-menu-next"></span>' +
        '</div>' +
        '<div class="calendar-menu-month-inner">' +
        '</div>' +
        '</div>' +
        '</div>');
    detail = $('div.fullcalendar-detail');
    if (!detail.length) {
      detail = $('<div class="fullcalendar-detail"/>').appendTo('body');
      detail.hover(function () {
        clearTimeout(hideTimer);
      }, function () {
        $(this).hide();
      });
    }

    $(target).find('.calendar-title span').hover(
        function () {
          $(this).addClass('calendar-menu-hover');
        },
        function () {
          $(this).removeClass('calendar-menu-hover');
        }).click(function () {
          var menu = $(target).find('.calendar-menu');
          if (menu.is(':visible')) {
            menu.hide();
          } else {
            showSelectMenus(target);
          }
        });

    $('.calendar-prevmonth,.calendar-nextmonth,.calendar-prevyear,.calendar-nextyear', target).hover(
        function () {
          $(this).addClass('calendar-nav-hover');
        },
        function () {
          $(this).removeClass('calendar-nav-hover');
        });
    $(target).find('.calendar-nextmonth').click(function () {
      showMonth(target, 1);
    });
    $(target).find('.calendar-prevmonth').click(function () {
      showMonth(target, -1);
    });
    $(target).find('.calendar-nextyear').click(function () {
      showYear(target, 1);
    });
    $(target).find('.calendar-prevyear').click(function () {
      showYear(target, -1);
    });

    $(target).bind('_resize', function () {
      var opts = $.data(target, 'fullCalendar').options;
      if (opts.fit == true) {
        setSize(target);
      }
      return false;
    });
  }

  /**
   * show the calendar corresponding to the current month.
   */
  function showMonth(target, delta) {
    var opts = $.data(target, 'fullCalendar').options;
    opts.month += delta;
    if (opts.month > 12) {
      opts.year++;
      opts.month = 1;
    } else if (opts.month < 1) {
      opts.year--;
      opts.month = 12;
    }
    show(target);

    var menu = $(target).find('.calendar-menu-month-inner');
    menu.find('td.calendar-selected').removeClass('calendar-selected');
    menu.find('td:eq(' + (opts.month - 1) + ')').addClass('calendar-selected');
  }

  /**
   * show the calendar corresponding to the current year.
   */
  function showYear(target, delta) {
    var opts = $.data(target, 'fullCalendar').options;
    opts.year += delta;
    show(target);

    var menu = $(target).find('.calendar-menu-year');
    menu.val(opts.year);
  }

  /**
   * show the select menu that can change year or month, if the menu is not be created then create it.
   */
  function showSelectMenus(target) {
    var opts = $.data(target, 'fullCalendar').options;
    $(target).find('.calendar-menu').show();

    if ($(target).find('.calendar-menu-month-inner').is(':empty')) {
      $(target).find('.calendar-menu-month-inner').empty();
      var t = $('<table></table>').appendTo($(target).find('.calendar-menu-month-inner'));
      var idx = 0;
      for (var i = 0; i < 3; i++) {
        var tr = $('<tr></tr>').appendTo(t);
        for (var j = 0; j < 4; j++) {
          $('<td class="calendar-menu-month"></td>').html(opts.months[idx++]).attr('abbr', idx).appendTo(tr);
        }
      }

      $(target).find('.calendar-menu-prev,.calendar-menu-next').hover(
          function () {
            $(this).addClass('calendar-menu-hover');
          },
          function () {
            $(this).removeClass('calendar-menu-hover');
          });
      $(target).find('.calendar-menu-next').click(function () {
        var y = $(target).find('.calendar-menu-year');
        if (!isNaN(y.val())) {
          y.val(parseInt(y.val()) + 1);
        }
      });
      $(target).find('.calendar-menu-prev').click(function () {
        var y = $(target).find('.calendar-menu-year');
        if (!isNaN(y.val())) {
          y.val(parseInt(y.val() - 1));
        }
      });

      $(target).find('.calendar-menu-year').keypress(function (e) {
        if (e.keyCode == 13) {
          setDate();
        }
      });

      $(target).find('.calendar-menu-month').hover(
          function () {
            $(this).addClass('calendar-menu-hover');
          },
          function () {
            $(this).removeClass('calendar-menu-hover');
          }).click(function () {
            var menu = $(target).find('.calendar-menu');
            menu.find('.calendar-selected').removeClass('calendar-selected');
            $(this).addClass('calendar-selected');
            setDate();
          });
    }

    function setDate() {
      var menu = $(target).find('.calendar-menu');
      var year = menu.find('.calendar-menu-year').val();
      var month = menu.find('.calendar-selected').attr('abbr');
      if (!isNaN(year)) {
        opts.year = parseInt(year);
        opts.month = parseInt(month);
        show(target);
      }
      menu.hide();
    }

    var body = $(target).find('.calendar-body');
    var sele = $(target).find('.calendar-menu');
    var seleYear = sele.find('.calendar-menu-year-inner');
    var seleMonth = sele.find('.calendar-menu-month-inner');

    seleYear.find('input').val(opts.year).focus();
    seleMonth.find('td.calendar-selected').removeClass('calendar-selected');
    seleMonth.find('td:eq(' + (opts.month - 1) + ')').addClass('calendar-selected');

    sele._outerWidth(body._outerWidth());
    sele._outerHeight(body._outerHeight());
    seleMonth._outerHeight(sele.height() - seleYear._outerHeight());
  }

  /**
   * get weeks data.
   */
  function getWeeks(target, year, month) {
    //var opts = $.data(target, 'fullCalendar').options;
    var dates = [];
    var lastDay = new Date(year, month, 0).getDate();
    for (var i = 1; i <= lastDay; i++)
      dates.push([year, month, i]);

    // group date by week
    var weeks = [],
        week = [];
    //		var memoDay = 0;
    var memoDay = -1;
    while (dates.length > 0) {
      var date = dates.shift();
      week.push(date);
      var day = new Date(date[0], date[1] - 1, date[2]).getDay();
      if (memoDay == day) {
        day = 0;
      } else if (day == 6) {
        weeks.push(week);
        week = [];
      }
      memoDay = day;
    }
    if (week.length) {
      weeks.push(week);
    }

    //var firstWeek = weeks[0];
    //if (firstWeek.length < 7) {
    //  while (firstWeek.length < 7) {
    //    var firstDate = firstWeek[0];
    //    var date = new Date(firstDate[0], firstDate[1] - 1, firstDate[2] - 1)
    //    firstWeek.unshift([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
    //  }
    //} else {
    //  var firstDate = firstWeek[0];
    //  var week = [];
    //  for (var i = 1; i <= 7; i++) {
    //    var date = new Date(firstDate[0], firstDate[1] - 1, firstDate[2] - i);
    //    week.unshift([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
    //  }
    //  weeks.unshift(week);
    //}
    //
    //var lastWeek = weeks[weeks.length - 1];
    //while (lastWeek.length < 7) {
    //  var lastDate = lastWeek[lastWeek.length - 1];
    //  var date = new Date(lastDate[0], lastDate[1] - 1, lastDate[2] + 1);
    //  lastWeek.push([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
    //}
    //if (weeks.length < 6) {
    //  var lastDate = lastWeek[lastWeek.length - 1];
    //  var week = [];
    //  for (var i = 1; i <= 7; i++) {
    //    var date = new Date(lastDate[0], lastDate[1] - 1, lastDate[2] + i);
    //    week.push([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
    //  }
    //  weeks.push(week);
    //}

    return weeks;
  }
  /**
   * show the calendar day.
   */
  function show(target) {
    var opts = $.data(target, 'fullCalendar').options;
    if (opts.year > 1874 && opts.year < 1909)
      //yDisplay = '光绪' + (((opts.year - 1874) == 1) ? '元' : opts.year - 1874);
    if (opts.year > 1908 && opts.year < 1912)
      //yDisplay = '宣统' + (((opts.year - 1908) == 1) ? '元' : opts.year - 1908);

    if (opts.year > 1911)
      //yDisplay = '建国' + (((opts.year - 1949) == 1) ? '元' : opts.year - 1949);

    $(target).find('.calendar-title span').html(opts.months[opts.month - 1] + ' ' + opts.year + ' ' + yDisplay + '年 农历 ' + cyclical(opts.year - 1900 + 36) + '年 【' + Animals[(opts.year - 4) % 12] + '年】');

    var body = $(target).find('div.calendar-body');
    body.find('>table').remove();

    var t = $('<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>').prependTo(body);
    var tr = $('<tr></tr>').appendTo(t.find('thead'));
    for (var i = opts.firstDay; i < opts.weeks.length; i++) {
      tr.append('<th>' + opts.weeks[i] + '</th>');
    }
    for (var i = 0; i < opts.firstDay; i++) {
      tr.append('<th>' + opts.weeks[i] + '</th>');
    }

    var weeks = getWeeks(target, opts.year, opts.month);
    var currentCa = new Calendar(opts.year, opts.month - 1);
    for (var i = 0; i < weeks.length; i++) {
      var week = weeks[i];
      var tr = $('<tr></tr>').appendTo(t.find('tbody'));
      for (var j = 0; j < week.length; j++) {
        var day = week[j];
        var dayHtml = '<font size="5" face="Arial Black">' + day[2];
        var info = null;
        if (opts.month == day[1]) {
          info = currentCa[day[2] - 1];
          if (info.color) {
            var color = 'color="' + info.color + '"';
            dayHtml = '<font size="5" face="Arial Black" ' + color + '>' + day[2];
          }
          dayHtml += '</font>';
          if (opts.lunarDay) {
            dayHtml += "<br/>";
            if (opts.solarTerms && info.solarTerms) {
              dayHtml += '<font color="limegreen">' + info.solarTerms + '</font>';
            } else {
              dayHtml += '<font size="2" style="font-size:9pt">' + cDay(info.lDay, info.lMonth) + '</font>';
            }
          }
        }
        var day = $('<td class="calendar-day fullcalendar-day calendar-other-month"></td>').data('info', info).attr('abbr', day[0] + ',' + day[1] + ',' + day[2]).html(dayHtml).appendTo(tr);
        if (info && (info.lunarFestival || info.solarFestival)) {
          day.addClass('festival');
        }
        day.hover(function (e) {
          clearTimeout(hideTimer);
          var inf = $(this).data('info');
          if (inf) {
            var ct = '<font color="#ffffff" style="font-size:9pt;">' + inf.sYear
                + ' 年 ' + inf.sMonth + ' 月 ' + inf.sDay + ' 日<br>星期' + inf.week
                + '<br><font color="violet">农历 ' + monthName[inf.lMonth - 1] + ' 月 ' + cDay(inf.lDay, inf.lMonth,true)
                + ' 日</font><br><font color="yellow">' + inf.cYear + '年 ' + inf.cMonth + '月 ' + inf.cDay + '日</font></font>';
            detail.html(ct);
            detail.css(calculatePos.call(target, detail, e.currentTarget)).fadeIn();
            if (inf.lunarFestival) {
              detail.append('<div class="lunarFestival">' + inf.lunarFestival + '</div>');
            }
            if (inf.solarFestival) {
              detail.append('<div class="solarFestival">' + inf.solarFestival + '</div>');
            }
          } else {
            detail.hide();
          }
        }, function () {
          hideTimer = setTimeout(function () {
            $('div.fullcalendar-detail').hide();
          }, 500);
        });
      }
    }
    t.find('td[abbr^="' + opts.year + ',' + opts.month + '"]').removeClass('calendar-other-month');

    var now = new Date();
    var today = now.getFullYear() + ',' + (now.getMonth() + 1) + ',' + now.getDate();
    t.find('td[abbr="' + today + '"]').addClass('calendar-today');

    if (opts.current) {
      t.find('.calendar-selected').removeClass('calendar-selected').css('backgroundColor', '');
      var current = opts.current.getFullYear() + ',' + (opts.current.getMonth() + 1) + ',' + opts.current.getDate();
      t.find('td[abbr="' + current + '"]').addClass('calendar-selected').css('backgroundColor', '#FBEC88');
    }

    // calulate the saturday and sunday index
    var saIndex = 6 - opts.firstDay;
    var suIndex = saIndex + 1;
    if (saIndex >= 7)
      saIndex -= 7;
    if (suIndex >= 7)
      suIndex -= 7;
    t.find('tr').find('td:eq(' + saIndex + ')').addClass('calendar-saturday');
    t.find('tr').find('td:eq(' + suIndex + ')').addClass('calendar-sunday');

    t.find('td').hover(
        function () {
          $(this).addClass('calendar-hover');
        },
        function () {
          $(this).removeClass('calendar-hover');
        }).click(function () {
          t.find('.calendar-selected').removeClass('calendar-selected').css('backgroundColor', '');
          $(this).addClass('calendar-selected').css('backgroundColor', '#FBEC88');

          var parts = $(this).attr('abbr').split(',');
          opts.current = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
          opts.onSelect.call(target, opts.current, this);
          if (opts.month != parts[1]) {
            opts.year = parts[0];
            opts.month = parts[1];
            show(target);
          }
        });
    opts.onChange.call(target, opts.year, opts.month);
  }

  function calculatePos(target, currentTarget) {
    var w = $(this).width(),
        h = $(this).height();
    var x = getElementLeft(currentTarget) + currentTarget.offsetWidth,
        y = getElementTop(currentTarget);
    if (x + $(target).width() > w) {
      x = x - $(target).width() - currentTarget.offsetWidth - 9;
    }
    if (y + $(target).height() > h) {
      y = h - $(target).height() - 28;
    }
    return {
      left : x,
      top : y
    };
  }

  function getElementLeft(element) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    return actualLeft;
  }

  function getElementTop(element) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }
    return actualTop;
  }

  $.fn.fullCalendar = function (options, param) {
    if (typeof options == 'string') {
      return $.fn.fullCalendar.methods[options](this, param);
    }

    options = options || {};
    return this.each(function () {
      var state = $.data(this, 'fullCalendar');
      if (state) {
        $.extend(state.options, options);
      } else {
        state = $.data(this, 'fullCalendar', {
          options : $.extend({}, $.fn.fullCalendar.defaults, $.fn.calendar.defaults, $.fn.fullCalendar.parseOptions(this), options)
        });
        init(this);
      }
      if (state.options.border == false) {
        $(this).addClass('calendar-noborder');
      }
      setSize(this);
      show(this);
      $(this).find('div.calendar-menu').hide(); // hide the calendar menu
    });
  };

  $.fn.fullCalendar.methods = {
    options : function (jq) {
      return $.data(jq[0], 'fullCalendar').options;
    },
    resize : function (jq) {
      return jq.each(function () {
        setSize(this);
      });
    },
    moveTo : function (jq, date) {
      return jq.each(function () {
        $(this).fullCalendar({
          year : date.getFullYear(),
          month : date.getMonth() + 1,
          current : date
        });
      });
    }
  };

  $.fn.fullCalendar.parseOptions = function (target) {
    var t = $(target);
    return $.extend({}, $.parser.parseOptions(target, [
      'width', 'height', {
        firstDay : 'number',
        fit : 'boolean',
        border : 'boolean'
      }
    ]));
  };

  $.fn.fullCalendar.defaults = {
    width : 180,
    height : 180,
    fit : false,
    border : true,
    firstDay : 0,
    weeks : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    months : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    year : new Date().getFullYear(),
    month : new Date().getMonth() + 1,
    current : new Date(),
    solarTerms : true, //显示二十四节气
    lunarDay : true, //显示农历
    onSelect : function (date, target) {},
    onChange : function (year, month) {}
  };
  //增加样式
  $('head').append('<style>.fullcalendar-day {border-left: 1px dotted green;border-top: 1px dotted green;} '
      + '.calendar-hover{border: 1px solid red;}.fullcalendar-body th{padding: 5px;height:20px;}'
      + '.fullcalendar-detail{border-radius:5px;position: absolute; z-index: 10; background-color: rgb(0, 0, 102); display: none; opacity: 0.8; padding: 5px; text-align: right;filter: Alpha(opacity=80);width:150px;}'
      + '.fullcalendar-detail div{background:#CCFFCC;margin-top: 3px;font-size: 12px;padding: 2px;}'
      + '.fullcalendar-detail .lunarFestival{color: red;}.fullcalendar-detail .solarFestival{color: blue;} .calendar-selected {border: 1px solid red;}.fullcalendar-body td.festival{background:url("data:image/png;base64,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");background-repeat: no-repeat;background-position: top right;}</style>');
  $.parser.plugins.push('fullCalendar');
})(jQuery, window);
