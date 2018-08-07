$('.actions>.icon-bofang').on('click', function(){
  $(this).toggleClass("icon-bofang").toggleClass("icon-zanting")
})

var timer = null

var Helper = {
  throttle: function(callback, time) {
    if(timer) {clearTimeout(timer)}
      timer = setTimeout(function(){
      callback()
    },time)       
  }
}

var EventCenter = {
  on: function(type, handler){
    $(document).on(type, handler)
  },
  fire: function(type, data){
    $(document).trigger(type, data)
  }
}



var footer = {
  init: function(){
    this.$footer = $('footer')
    this.$ul = $('footer .box>ul')
    this.$box = $('footer .box')
    this.$btnRight = $('footer .icon-right')
    this.$btnLeft = $('footer .icon-zuo')
    this.isMoving = false
    this.isStart = true
    this.isEnd = false
    this.render()
    this.bind()
  },
  bind: function(){
    var _this = this
    
    this.$footer.on('click', 'li', function(){
      $(this).addClass('active')
        .siblings().removeClass('active')

      EventCenter.fire('select-albumn',{
        channelId: $(this).attr('channel_id'),
        channel_name: $(this).attr('channel_name') 
      })
    })

    _this.$btnRight.on('click', function(){
      var count = Math.floor(_this.$box.width()/_this.$box.find('li').outerWidth(true))
      var width = _this.$box.find('li').outerWidth(true)
      if(_this.isMoving) return
      if(!_this.isEnd){
        _this.isMoving = true
        _this.isStart = false
        _this.$btnLeft.removeClass('disable')
        _this.$ul.animate({
          left: '-=' + count*width + 'px'
        }, 400, function(){
          _this.isMoving = false
          if(_this.$box.width() - parseFloat(_this.$ul.css('left')) >= _this.$ul.width()){
            _this.isEnd = true
            _this.$btnRight.addClass('disable')
          }
        })
      }
    })

    _this.$btnLeft.on('click', function(){
      var count = Math.floor(_this.$box.width()/_this.$box.find('li').outerWidth(true))
      var width = _this.$box.find('li').outerWidth(true)
      if(_this.isMoving) return
      if(!_this.isStart){
        _this.isMoving = true
        _this.isEnd = false
        _this.$btnRight.removeClass('disable')
        _this.$ul.animate({
          left: '+=' + count*width + 'px'
        }, 400, function(){
          _this.isMoving = false
          if(parseFloat(_this.$ul.css('left')) >= 0){
            _this.isStart = true
            _this.$btnLeft.addClass('disable')
            _this.$ul.animate({
              left: 0 + 'px'
            }, 400)  
          }
        })
      }
    }) 
  },
  render: function(){
    var _this = this
    this.getData(function(data){
      data.channels.unshift({
      channel_id: 0,
      name: '我的最爱',
      cover_small: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-small',
      cover_middle: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-middle',
      cover_big: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-big',        
      })
      data.channels.forEach(function(channel){
        _this.$ul.append(_this.createNode(channel))
      })
      _this.setStyle()
    })
  },
  getData: function(callback){
    $.getJSON('http://api.jirengu.com/fm/getChannels.php')
      .done(function(ret){
        callback(ret)
      }).fail(function(){
        console.log('数据错误')
      })    
  },
  createNode: function(channel){
    var tpl = ''
    tpl += '<li channel_id='+ channel.channel_id + ' channel_name=' +  channel.name + '>'
    tpl += '<div class="cover" style="background-image:url('+ channel.cover_middle + ')">'
    tpl += '</div>'
    tpl += '<h3>' + channel.name + '</h3>'
    tpl += '</li>'
    return tpl
  },
  setStyle: function(){
    var count = this.$footer.find('li').length
    var width = this.$footer.find('li').outerWidth(true)
    this.$ul.css({
      width: count * width + 'px'
    })
  }
}

var Fm = {
  init: function(){
    this.audio = new Audio()
    this.audio.autoplay = true
    this.$bar = $('.detail .bar')
    this.$progress = $('.detail .bar-progress')
    this.$musicpage = $('#page-music')
    this.$pg = $('.pg')
    this.$btn = $('.btn-ctr')
    this.$btnnext = $('.icon-xiayishou')
    this.$curtime = $('.current-time')
    this.$lyric = $('.lyric>p')
    this.collections = this.loadFromLocal()
    this.bind()
    this.playinit()
  },
  playinit: function(){
    if(Object.keys(this.collections).length > 0) {
      console.log('fuck')
      EventCenter.fire('select-albumn',{
        channelId: '0',
        channel_name: '我的最爱' 
      })
    }
  },
  bind: function(){
    var _this = this
    EventCenter.on('select-albumn',function(e,channelObj){
      _this.channelId = channelObj.channelId
      _this.channel_name = channelObj.channel_name
      _this.loadMusic()
    })
    this.$bar.on('click', function(e){
      var percent = e.offsetX / $(this).width()
      _this.audio.currentTime = _this.audio.duration * percent
      _this.$progress.css({
        width: percent *100 + '%'
      })
      _this.upstate()
    })
    this.$btn.on('click', function(){
      if(_this.$btn.hasClass('icon-zanting')){
        _this.audio.play()
      }
      if(_this.$btn.hasClass('icon-bofang')){
        _this.audio.pause()
      }
    })
    this.$btnnext.on('click', function(){
      if(_this.channelId === null) return
      _this.loadMusic()
    })
    this.audio.addEventListener('play', function(){
      _this.clock = setInterval(function(){
        _this.upstate()
      },1000)
    })
    this.audio.addEventListener('pause', function(){
      clearInterval(_this.clock)
    })
    this.$musicpage.find('.btn-collect').on('click',function(){
      var $btn = $(this)
      if($btn.hasClass('active')){
        $btn.removeClass('active')
        delete _this.collections[_this.song.sid]
      }else{
        $btn.addClass('active')
        _this.collections[_this.song.sid] = _this.song
      }
      _this.saveToLocal()
    })
  },
  loadMusic: function(){
    var _this = this
    if(this.channelId === '0'){
      var keyArray = Object.keys(this.collections)
      if(keyArray.length === 0) return
      var randomIndex = Math.floor(Math.random()* keyArray.length)
      var randomSid = keyArray[randomIndex]
      this.song = this.collections[randomSid]
      _this.loadLyric()
      _this.setMusic()
    }else{
      $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:this.channelId})
      .done(function(ret){
        clearInterval(_this.clock)
        console.log(ret.song[0])
        _this.song = ret.song[0]
        _this.loadLyric()
        _this.setMusic()
      }).fail(function(){
        console.log('数据错误')
      })
    }
  },
  loadLyric:function(){
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:_this.song.sid})
      .done(function(ret){
        _this.lyricObj = {}
        var lyric = {}
        ret.lyric.split('\n').forEach(function(line){
          time = line.match(/\d{2}:\d{2}/g,'')
          str = line.replace(/\[\d{2}:\d{2}.\d{2}\]/g,'')
          if(Array.isArray(time) & str != ''){
            time.forEach(function(time){
              lyric[time] = str
            })
          }
          _this.lyric = lyric
        })
      }).fail(function(){
        console.log('歌词数据错误')
      })
  },
  setMusic: function(){
    var _this = this
    this.audio.src = this.song.url
    this.$musicpage.find('h1').text(this.song.title)
    this.$musicpage.find('.author').text(this.song.artist)
    this.$musicpage.find('.tag').text(this.channel_name)
    this.$pg.css('background-image','url(' + this.song.picture + ')' ) 
    this.$musicpage.find('figure').css('background-image','url(' + this.song.picture + ')' )
    if(this.$btn.hasClass('icon-bofang')) {
      _this.$btn.removeClass('icon-bofang').addClass('icon-zanting')
    }
    if(this.collections[this.song.sid]) {
      this.$musicpage.find('.btn-collect').addClass('active')
    }else{
      this.$musicpage.find('.btn-collect').removeClass('active')
    }
  },
  upstate: function(){
    var _this = this
    var min = Math.floor(this.audio.currentTime/60)
    var sec = Math.floor(this.audio.currentTime%60) + ''
    sec = sec.length === 2?sec:'0'+sec
    this.$curtime.text(min + ':' + sec)
    var percent = this.audio.currentTime/this.audio.duration
    this.$progress.css({
      width: percent *100 + '%'
    })
    if(this.lyric['0' + min + ':' + sec] != undefined) {
      _this.$lyric.text(_this.lyric['0' + min + ':' + sec])
      .boomText('fadeIn')
    }
  },
  loadFromLocal: function(){
    return JSON.parse(localStorage['collections'] || '{}')
  },
  saveToLocal: function(){
    localStorage['collections'] = JSON.stringify(this.collections)
  },
  loadCollection: function(){

  }
}

  $.fn.boomText = function(type) {
    type = type || 'rollIn'
    this.html(function(){
      var newarr = []
      var arr = $(this).text().split('').forEach(function(word){
        newarr.push('<span class="boomText" style="display:inline-block;" >' + word + '</span>')
      })
      return newarr.join('')
    })

    var index = 0
    var $boomText = $(this).find('span')
    var clock = setInterval(function(){
      $boomText.eq(index).addClass('animated ' + type)
      index++
      if(index >= $boomText.length){
        clearInterval(clock)
      }
    },200)
  }

footer.init()
Fm.init()