var EventCenter = {
  on: function(type, handler) {
    $(document).on(type, handler)
  },
  fire: function(type, data) {
    $(document).trigger(type, data)
  } 
}

$.fn.slipText = function(type) {
  type = type || "rollIn"
  this.html(function() {
    var arr = $(this).text()
      .split('').map(function(word) {
        return '<span class="slipText" style="display: inline-block">' + word + '</span>'
      })
      return arr.join('')
  })
  
  var index = 0
  var $slipText = $(this).find('span')
  var clock = setInterval(() => {
    $slipText.eq(index).addClass('animated '+ type)
    index ++

    if (index >= $slipText.length) {
      clearInterval(clock)
    }
  }, 300);
}

var footer = {
  init: function() {
    this.$footer = $('footer')
    this.$box = this.$footer.find('.box')
    this.$ul = this.$footer.find('ul')
    this.$arLeftBtn = this.$footer.find('.icon-arLeft')
    this.$arRightBtn = this.$footer.find('.icon-arRight')
    this.isAnimate = false
    this.isToEnd = false
    this.isToStart = true

    this.bind()
    this.getData()
  },
  bind: function() {
    var _this = this

    this.$footer.on('click', 'li', function(e) {
      console.log($(e.currentTarget).attr('id'))
      $(e.currentTarget).addClass('active')
        .siblings().removeClass('active')
      EventCenter.fire('select-album', {
        channelId: $(e.currentTarget).attr('id'),
        channelName: $(e.currentTarget).attr('data-title')
      })
    })

    this.$arRightBtn.on('click', function() {
      if (_this.isAnimate) return 
      var width = _this.$ul.find('li').outerWidth(true)
      var count = Math.floor(_this.$box.width() / width)
      var slipWidth = count * width
      
      if (!_this.isToEnd) {
        _this.isAnimate = true
        _this.isToStart = false
        _this.$ul.animate({
          left: '-=' + slipWidth
        }, 400, function() {
          if (slipWidth - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
            _this.isToEnd = true
          }
          _this.isAnimate = false
        })
      }
    })

    this.$arLeftBtn.on('click', function() {
      if (_this.isAnimate) return 
      var width = _this.$ul.find('li').outerWidth(true)
      var count = Math.floor(_this.$box.width() / width)
      var slipWidth = count * width
      
      if (!_this.isToStart) {
        _this.isAnimate = true
        _this.isToEnd = false
        _this.$ul.animate({
          left: '+=' + slipWidth
        }, 400, function() {
          if (parseFloat(_this.$ul.css('left')) >= -1) {
            _this.isToStart = true
          }
          _this.isAnimate = false
        })
      }
    })
  },
  getData: function() {
    var _this = this

    $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php')
      .done(function(ret) {
        console.log(ret)
        _this.renderAlbum(ret.channels)
        _this.setStyle()
      })
  },
  renderAlbum: function(data) {
    var html = ''
    data.forEach(function(song) {
      html += '<li id="' + song.channel_id + '" data-title="' + song.name + '">'
            +   '<div class="img" style="background-image: url(' + song.cover_small + ')"></div>'
            +   '<span>' + song.name + '</span>'
            + '</li>'
    })
    this.$ul.append($(html))
  },
  setStyle: function() {
    var count = this.$ul.find('li').length
    var width = this.$ul.find('li').outerWidth(true)
    this.$ul.css({
      width: count * width + 'px'
    })
  }
}

var Main = {
  init: function() {
    this.$container = $('#music-page')
    this.$bar_ct = this.$container.find('.bar-ct')
    this.$play_pause = this.$container.find('.action span').eq(1)
    this.$next = this.$container.find('.action .icon-next')
    this.$time = this.$bar_ct.find('.time')
    this.channelId = ''
    this.channelName = ''
    this.clock = null
    this.song = null
    this.lyricObj = {}
    this.audio = new Audio()
    this.audio.autoplay = true

    this.bind()
  },
  bind: function() {
    var _this = this

    EventCenter.on('select-album', function(e, data) {
      _this.channelId = data.channelId
      _this.channelName = data.channelName

      _this.getMusic()
    })

    this.audio.onplay = function() {
      _this.clock = setInterval(function() {
        var sec = Math.floor(_this.audio.currentTime % 60) + ''
        var min = Math.floor(_this.audio.currentTime / 60)
        sec = sec.length === 2 ? sec : '0' + sec
        _this.$bar_ct.find('.time').text(min + ':' + sec)
        var percent = (_this.audio.currentTime / _this.audio.duration) * 100 + '%'
        _this.$bar_ct.find('.progress').css({
          width: percent
        })

        _this.setLyric()
      }, 1000)
    }

    this.audio.onpause = function() {
      clearInterval(_this.clock)
    }

    this.audio.onended = function() {
      clearInterval(_this.clock)
      _this.getMusic()
    }

    this.$next.on('click', function() {
      _this.getMusic()
    })

    this.$bar_ct.find('.bar').on('click', function(e) {
      _this.audio.pause()
      var percent = e.offsetX / parseFloat($(this).css('width'))
      _this.audio.currentTime = _this.audio.duration * percent
      _this.audio.play()
    })

    this.$play_pause.on('click', function() {
      if (_this.audio.paused) {
        _this.audio.play()
        _this.$play_pause.addClass('icon-pause').removeClass('icon-play')
      } else {
        _this.audio.pause()
        _this.$play_pause.addClass('icon-play').removeClass('icon-pause')
      }
    })
  },
  getMusic: function() {
    var _this = this
    $.getJSON('https://jirenguapi.applinzi.com/fm/getSong.php', {channel: this.channelId})
      .done(function(ret) {
        _this.song = ret.song[0]
        _this.audio.src = _this.song.url
        _this.loadInfo()
        _this.loadLyric()
      }).fail(function() {
        console.log("error...")
      })
  },
  loadInfo: function() {
    $('.bgd').css('background', 'url('+ this.song.picture + ')')
    this.$play_pause.addClass('icon-pause').removeClass('icon-play')
    this.$container.find('figure').css('background', 'url('+ this.song.picture + ')')
    this.$container.find('.detail .album-name').text(this.channelName)
    this.$container.find('.detail .title').text(this.song.title)
    this.$container.find('.detail .singer').text(this.song.artist)
  },
  loadLyric: function() {
    this.lyricObj = {}
    var _this = this
    $.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php', {sid: this.song.sid})
      .done(function(ret) {
        var arrLyric = ret.lyric.split('\n')
        arrLyric.forEach(function(line) {
          var times = line.match(/\d{2}:\d{2}/g)
          var word = line.replace(/\[.+?\]/g, '')
          if (Array.isArray(times)) {
            times.forEach(function(time) {
              _this.lyricObj[time] = word
            })
          } else {
            _this.lyricObj[times] = word
          }
        })
      }).fail(function() {
        console.log("error...")
      })
  },
  setLyric: function() {
    if (this.lyricObj['0' + this.$time.text()]) {
      this.$container.find('.lyric')
        .text(this.lyricObj['0' + this.$time.text()])
        .slipText('tada')
    }
  }
}

footer.init()
Main.init()