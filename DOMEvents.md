<!-- 04.07: 1h -->
# DOM 事件与事件委托
## DOM 事件
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
* 调用顺序特例：如果只有一个元素被监听，且该元素即写了“捕获”函数和又写了“冒泡”函数，那么此时先“捕获”后“冒泡”准则失效，变成“先监听谁则先执行谁”。

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

## scroll 滚动事件
scroll 是“不可阻止默认动作”。要阻止滚动，先找准滚动条所在的元素，然后阻止 wheel 和 touchstart 的默认动作，以及 CSS 让滚动条 width: 0。

``` js
    elementId.addEventListener('scroll', (e)=>{
        e.stopPropagation();
        e.preventDefault();
    });
    // 无法阻止滚动

    styleId.innerHTML = `
        .element::webkit-scrollbar {
            width: 0 !important
        }
    `; // 不显示屏幕边边的滚动条
    elementId.addEventListener('wheel', (e)=>{
        e.preventDefault();
    }); // 阻止电脑端滚动
    elementId.addEventListener('touchstart', (e)=>{
        e.preventDefault();
    }); // 阻止手机端滚动
    // 成功阻止滚动
```

使用 overflow: hidden 可以直接取消滚动条，但此时 JS 依然可以修改 scrollTop。

## 更多事件
* 浏览器自带事件：超过100件事件，具体参考 <a href='https://developer.mozilla.org/zh-CN/docs/Web/Events'>mdn</a>。
* 开发者可以自定义事件，使用 CustomEvent 函数创建事件。

## 事件委托
``` html
<body>
    div>button{click $}*100
</body>
```
一，要给 100 个按钮添加点击事件，怎么办？一个一个写，但这样既繁琐又耗存储空间。参考：监听这 100 个按钮的父元素，冒泡的时候判断 target 是这 100 个按钮中的哪一个即可。这么做可以省内存。

``` js
    setTimeout(()=>{
        const b = document.createElement('button');
        b.textContent = 'button 1';
        document.body.appendChild(b);
    }, 1000) // 一秒后 button 元素才被创建出来
```
二，要监听的元素目前不存在？无法直接监听该元素，因为它此时不存在。参考：监听该元素的父元素，等事件触发、冒泡后判断 target 是不是想要监听的元素。这样就可以实现监听动态元素。

总结事件委托优点：1.省监听数，省内存；2.可以监听动态元素。

## 封装事件委托
要求：
* 写出函数 on('click','#testDiv','li',fn)
* 当用户点击 #testDiv 里的 li 元素时，调用 fn 函数
* 使用事件委托

面试满分答案：
``` js
    document.body.innerHTML = `
        <div id="testDiv">
            <li>li</li>
        </div>
    `;

    function on(eventType, elementScope, selector,fn) {
        const es = document.querySelector(elementScope);
        es.addEventListener(eventType, (item)=>{
            const t = item.target;
            if (t.matches(selector)) {
                fn.call(null, item, t);
            }
        });
    };

    on('click','#testDiv','li', (item)=>{
        console.log(item);
    });
```

上述代码面试没问题，我们改写一下 on 函数的形参内容：
``` js
    on('click','#testDiv','#testDiv', (item)=>{
        console.log(item);
    });
```

要求改为：当用户点击 #testDiv 元素或该元素的子元素时，调用 fn 函数。

此时，需要通过递归来实现功能：
``` js
    function on(eventType, elementScope, selector,fn) {
        const es = document.querySelector(elementScope);
        es.addEventListener(eventType, (item)=>{
            const t = item.target;
            let i = t;
            while (!i.matches(selector)) { 
                // 找爸爸，直到 elementScope 为止还找不到，那就不找了。
                if (i === item.currentTarget) {
                    i = null;
                    break;
                }
                i = i.parentNode;
            }
            i && fn.call(t, item.currentTarget, t)
        });
        return es;
    };
```



