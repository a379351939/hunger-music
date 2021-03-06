## 饥饿电台
  预览地址：https://a379351939.github.io/hunger-music/index.html

## 功能介绍
  这是一个音乐电台，可由特定频道获取相应歌曲。并可选择将歌曲保存。
  点击选择频道，即可获取该频道歌曲并返回展示于页面。点击下一曲按钮即可从该频道获取另一首歌曲。点击心型按钮即可将歌曲地址保存于本地，再次点击即删除。保存的歌曲由点击“我的最爱”频道或刷新页面获取。

## 技术细节
  利用饥人谷开放接口(API)所提供的数据制作响应式页面，用jQuery的getJSON方法向服务器请求JSON数据，当客户端收到响应后对JSON数据进行解析，并局部刷新将结果展示于页面。
  响应式使用了媒体查询@media，以及将元素宽高都使用vh为单位。页面宽高在一定范围的皆可正常显示。
  歌词动画效果由引入animate.css,将获取的歌词拆解单个字符，并使用定时器一个个添加动画效果。
  
  由于歌词，进度条等元素以及底下的频道元素是用float写得，当歌名字符特长或者演唱字符特长时会被频道的图片挤下去。
  于是使用flex属性替换了float属性解决这个问题。

## 项目收获
  学到了新的对数据进行过滤，解析，拼装的方法。如何在页面内实现多个元素的滚动，如何挨个对元素添加动画效果等。按照一定的顺序开发避免出现耦合。

## 技术栈
  jQuery、CSS3、响应式