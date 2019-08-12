## Web hunger music

大屏适配的分类音乐页面
- 针对高度撑满，对页面进行单位换算 使用单位 vh 实现自动等比的缩放
（即使不同屏高度不同，同样撑满然后其他因为使用vh自动等比缩放）
- 宽度加一点响应式

## 发布-订阅模式
1. 设立事件中心
```
var EventCenter = {
  on: function(type, handler){
    $(document).on(type, handler)
  },
  fire: function(type, data){
    $(document).trigger(type, data)
  }
}
```
2. footer底部的专辑部分跟上面音乐播放部分音乐不耦合，当专辑被点击时，向事件中心发送 “选择某专辑” 消息，通过data传递专辑的信息（id），同时可以存储所选专辑名称为自定义属性

3. 播放音乐部分监听 “选择专辑” 消息，并获取到被选专辑信息，获取数据并播放，并对播放进行控制和展示。对歌词进行正则处理和存储，通过时间匹配歌词进行展示

4. jQuery插件开发 酷炫歌词效果
```
$.fn.slipText = function(type) {
	type = type || "rollIn"
	this.html(function() {
		var arr = $(this).split('')
			.map(function(word) {
				return '<span class="slipText" style="display: inline-block">' + word + '</span>'
			})
		return arr.join('')
	})

	var index = 0
	var $slipText = $(this).find('span')
	var clock = setInterval(function() {
		$slipText.eq(index).addClass('animated '+type)
		index ++
		if (index >= $slipText.length) {
			clearInterval(clock)
		}	
	},300)
}
```

**通过事件中心实现上下交互**
