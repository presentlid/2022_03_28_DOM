window.dom = {
    // 增：
    create(string) {
        // 等价于 create: function (string) {
        const container = document.createElement('template');
        // 只有 template 标签才能放入任意元素，比如 td，必须要在 tr 里边，但是 template 可以解除限制
        container.innerHTML = string.trim();
        // 截掉首尾空格、换行，否则有可能拿到文本
        return container.content.firstChild;
        // template 不能用 children[0] 来获取元素，必须用 firstChild
    },
    after(node, node2) {
        node.parentNode.insertBefore(node2, node.nextSibling);
    },
    before(node, node2) {
        node.parentNode.insertBefore(node2, node);
    },
    wrap(node, parent) {
        dom.before(node, parent);
        // 将 parent 放在 node 前面
        dom.append(parent, node);
        // 将 node 添加到 parent 子元素中
    },

    // 删：
    remove(node) {
        node.parentNode.removeChild(node);
        return node;
    },
    empty(node) {
        // const {childNodes} = node;
        // 等价于 const childNodes = node.childNodes;
        const arr = [];
        const temp = node.firstChild;
        while (temp) {
            arr.push(dom.remove(temp));
            temp = node.firstChild; // firstChild 被删了之后，firstChild 会实时改变为第二个
        }
        return arr;
    },

    // 改：
    attr(node, name, value) { // 重载
        if (arguments.length === 3) {
            node.setAttribute(name, value);
        } else if (arguments.length == 2) {
            return node.getAttribute(name);
        }
    },
    text(node, string) {
        if (arguments.length === 2) {
            if ('innerText' in node) { // 适配
                node.innerText = string; // ie 有
            } else {
                node.textContent = string; // fireFox 有
            }
        } else if (arguments.length === 1) {
            if ('innerText' in node) { // 适配
                return node.innerText; // ie 有
            } else {
                return node.textContent; // fireFox 有
            }
        }
    },
    html(node, string) {
        if (arguments.length === 2) {
            node.innerHTML = string;
        } else if (arguments.length === 1) {
            return node.innerHTML;
        }
    },
    style(node, name, value) {
        if (arguments.length === 3) {
            // interface: dom.style(div, color, 'red');
            node.style[name] = value;
        } else if (arguments.length === 2) {
            if (typeof name === String) {
                // interface: dom.style(div, color);
                return node.style[name];
            } else if (name instanceof Object) {
                // interface: dom.style(div, {color: 'red'});
                let obj = name;
                for (let key in obj) {
                    node.style[key] = obj[key];
                }
            }
        }
    },
    class: {
        add(node, className) {
            node.classList.add(className);
        },
        remove(node, className) {
            node.classList.remove(className);
        },
        has(node, className) {
            return node.classList.has(className);
        }
    },
    on(node, eventName, fn) {
        node.addEventListener(eventName, fn);
    },
    off(node, eventName, fn) {
        node.removeEventListener(eventName, fn);
    },

    // 查：
    find(selector, scope) {
        return (scope || document).querySelectorAll(selector);
        // 注意，1.如果写了scope，那么就在 scope 里搜索，默认使用 document，2.返回的是一个数组
    },
    parent(node) {
        return node.parentNode;
    },
    children(node) {
        return node.children;
    },
    siblings(node) {
        return Array.from(node.parentNode.children).filter(e => e !== node);
        // 从子元素中过滤 filter，不是 node 保留，否则删除
    },
    next(node) {
        let temp = node.nextSibling;
        while (temp && temp.nodeType === 3) {
            temp = temp.nextSibling;
        }
        return temp;
    },
    previous(node) {
        let temp = node.previousSibling;
        while (temp && temp.nodeType === 3) {
            temp = temp.previousSibling;
        }
        return temp;
    },
    each(nodeList, fn) {
        for (let i = 0; i < nodeList.length; i++) {
            fn.call(null, nodeList[i]);
        }
    },
    index(node) {
        const list = dom.children(node.parentNode);
        let i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === node) {
                break;
            }
        }
        return i;
    }
};


