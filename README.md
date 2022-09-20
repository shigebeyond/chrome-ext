[GitHub](https://github.com/shigebeyond/chrome-ext) | [Gitee](https://gitee.com/shigebeyond/chrome-ext) 

# 缘由
看知乎上有些回答挺好，想复制下来，结果被限制复制(禁止转载)。

但难不住作为程序员的我，通过在devtool中写js，也能打印出回答对应的html标签的内容。

但是每次都写js很繁琐，因此想做成chrome扩展，直接将回答文本复制到内存(剪切板)。

# 安装
1. 下载源码
```
git clone https://github.com/shigebeyond/chrome-ext.git
```

2. 将源码目录拖到chrome扩展程序页面

# 功能
1. 双击-复制知乎回答
![](img/zhihu-copy.png)

在打开知乎网页时自动注入复制脚本，后续通过双击某个回答，来将回答文本复制到内存(剪切板);

仅对知乎网站有效。

2. 右键菜单-网页剪报
![](img/web-clipper.png)

收集当前网页的title+url+选中文本，并提交到 http://localhost/note.php，以便记录到本地文件中。

其中 note.php 的实现可参考
```
<?php
$r = file_put_contents('/home/shi/note.txt', $_POST['note']."\n\n", FILE_APPEND);
echo $r ? 'true' : 'false';
```

3. 右键菜单-有道词典
![](img/dict-menu.png)

查找单词结果
![](img/dict-result.png)


4. 右键菜单-有道翻译
![](img/translate-menu.png)

翻译结果
![](img/translate-result.png)