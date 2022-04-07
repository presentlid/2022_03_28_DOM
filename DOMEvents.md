<!-- 04.07: 1h -->
# DOM 事件与事件委托
``` html
    <div class='爷爷'>
        <div class='爸爸'>
            <div class='儿子'>
                内容
            </div>
        </div>
    </div>
```

上述 html 中，首先给三个 div 分别添加监听事件，然后在页面点击了“内容”，那么三个监听事件会按照什么顺序被调用？W3C 在 2002 年发布标准：浏览器同时支持两种调用顺序，
* “首先”按照“爷爷->爸爸->儿子”顺序看有没有函数监听。这叫“事件捕获”，意思是从外向内找监听函数。
* “然后”按照“儿子->爸爸->爷爷”顺序看有没有函数监听。这叫“事件冒泡”，意思是从内向外找监听函数。
* 有监听函数就调用，提供事件信息，没有就跳过。
* 开发者自行把监听函数放在捕获阶段还是冒泡阶段。当然，你作死把两个阶段都写上也行。
* 调用顺序特例：如果只有一个元素被监听，且该元素即写了了“捕获”函数和又写了“冒泡”函数，那么此时先“捕获”后“冒泡”准则失效，变成“先监听谁则先执行谁”。

## 事件绑定 API
* IE 5：baba.attachEvent('onclick', fn) // 冒泡
* 网景：baba.addEventListener('click',fn) // 捕获
* W3C：baba.addEventListener('click',fn,boolean)。boolean 不写，则默认为 falsy 值，默认则使用“事件冒泡”方式调用函数；boolean 赋值为 true，则使用“事件捕获”方式调用函数。

## target 和 currentTarget
定义：
* event.target 是用户操作的元素
* event.currentTarget 是程序员监听的元素
* 举例：div > span{内容}。用户点击内容。event.target 就是 span，event.currentTarget 就是 div。

## 取消冒泡
event.stopPropagation() 函数可以中断冒泡，浏览器到这个元素之后不再向上走，一般用于某些独立的组件。

mdn 在事件描述中：
* Bubble 意思是该事件是否冒泡，<strong>所有冒泡都可以取消</strong>。
* Cancelable 意思是开发者是否可以<strong>阻止默认事件</strong>，<strong>Cancelable 与冒泡无关</strong>。

