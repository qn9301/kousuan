;(function (global){
	/**
	 * 节点
	 * 只做最终的数据存储
	 */
	function Node() {
		var node = [];
		var value = 0;
		var hasBracket = false;
		var num = 0;
		this.bracket = function (){
			if (node.length > 0) {
				if (hasBracket) {
					// 判断noed的前一个括弧是否影响现在的结果
					node = this.validateBracket();
				}
				node.unshift("(");
				node.push(")")
				hasBracket = true;
			}
			return this;
		}
		// 去除最外侧两边的()对node节点的结果是否有作用;
		this.validateBracket = function () {
			var tmp_node = node;
			var new_arr = [];
			var meet = false;
			for (var i=0;i<node.length;i++) {
				if (!meet && node[i] == "(") {
					meet = true;
				} else {
					new_arr.push(node[i]);
				}
			}
			meet = false;
			tmp_node = [];
			for (var i=new_arr.length-1;i>=0;i--) {
				if (!meet && new_arr[i] == ")") {
					meet = true;
				} else {
					tmp_node.unshift(new_arr[i]);
				}
			}
			if (eval(tmp_node.join("")) == eval(node.join(""))) {
				return tmp_node;
			}
			return node;
		}
		this.unshift = function (n) {
			if (n instanceof Node) {
				// 如果是node
				node = n.concat(node);
				num += n.getNum();
			} else {
				if (isNum(n)) {
					num++;
				}
				node.unshift(n);
			}
			return this;
		}
		this.push = function (n) {
			if (n instanceof Node) {
				// 如果是node
				node = node.concat(n);
				num += n.getNum();
			} else {
				if (isNum(n)) {
					num++;
				}
				node.push(n);
			}
			return this;
		}
		this.getValue = function () {
			return value;
		}
		// 计算，得到最终结果
		this.done = function () {
			value = eval(node.join(''));
			return this;
		}
		this.hasBracket = function (){
			return hasBracket;
		}
		this.getNum = function () {
			return num;
		}
		function isNum(s) {
			if (s !== null && s !== '') {
				return !isNaN (s);
			}
			return false;
		}
		this.getNode = function () {
			if (hasBracket) {
				// 判断noed的前一个括弧是否影响现在的结果
				node = this.validateBracket();
			}
			return node;
		}
		this.toString = function () {
			if (hasBracket) {
				// 判断noed的前一个括弧是否影响现在的结果
				node = this.validateBracket();
			}
			return node.join("") + "=" + value;
		}
	}

	/**
	 * 最大位数 最小位数
	 * 运算个数 是否带括号
	 * 加减乘除 位数限制 进退位
	 */ 		
	var generater = {
		maxLen: 2,
		minLen: 1,
		num: 4,
		needBracket: true,
		jinwei: true,
		tuiwei: true,
		symbol: parseInt(1111, 2), // 1 加 10->2 减 100->4 乘 1000->8 除
		tryTime: 10
	};
	// 设置数字最大长度
	generater.setMaxLen = function (max){
		if (max < 1) {
			console.error("最大长度不得小于1！");
			return;
		}
		this.maxLen = max;
	}
	// 设置数字最小长度
	generater.setMinLen = function (min){
		if (min < 1) {
			console.error("最小长度不得小于1！");
			return;
		}
		this.minLen = min;
	}
	// 设置个数
	generater.setNum = function (num) {
		if (num < 2) {
			console.error("最小位数不得小于2位！");
			return;
		}
		this.num = num;
	}
	// 是否带括号
	generater.setBracket = function (bool){
		this.needBracket = !!bool;
	}
	generater.setJinwei = function (bool) {
		this.jinwei = !!bool;
	}
	generater.setTuiwei = function (bool) {
		this.tuiwei = !!bool;
	}
	generater.setSymbol = function (symbol) {
		var bit = parseInt(1111, 2);
		if (symbol | bit == bit) {
			this.symbol = symbol;
		} else {
			console.error("无效的运算符组合！")
		}
	}
	// 生成式子
	/** 
	 * @return node
	 */
	generater.make = function (){
		var func = [];
		if ((this.symbol & 1) == 1) {
			func.push(this.getPlus.bind(this))
		} 
		// 减法
		if ((this.symbol & 1 << 1) == 1 << 1) {
			func.push(this.getMinus.bind(this))
		}
		// 乘法
		if ((this.symbol & 1 << 2) == 1 << 2) {
			func.push(this.getMultiply.bind(this))
		}
		// 除法
		if ((this.symbol & 1 << 3) == 1 << 3) {
			func.push(this.getDivide.bind(this))
		}
		console.log(func);
		return this.do(func);
	}

	generater.do = function (func) {
		var num = this.getNumber(this.maxLen, this.minLen);
		// 加法
		var node = this.transToNode(num);
		for (var i=1;i < this.num;i++) {
			node = func[Math.floor(Math.random() * func.length)](node)
			// 保证生成符合条件的node
			if (node === false) {
				this.tryTime --;
				if (this.tryTime <= 0) {
					throw new Error("生成式子失败");
				}
				return this.do(func);
			}
		}
		return node;
	}

	// 将一个数字转换成Node类
	generater.transToNode = function (num){
		var node = new Node();
		node.push(num).done();
		return node;
	}
	// 得到一个加法的式子
	generater.getPlus = function (node) {
		if (node instanceof Node) {
			// 如果是Nodedui'xiang
			// 不允许进位
			if (this.jinwei === false) {
				var val = this.makeUpperNumber(node.getValue());
			} else {
				do {
					var val = this.getNumber(this.maxLen, this.minLen);
				} while((node.getValue() + val).length > this.maxLen)
			}
			node.push("+").push(val).done();
			if (this.needBracket && !node.hasBracket() 
				&& Math.random() > 0.5 && node.getNum() < this.num) {
				node.bracket();
			}
			return node;
		}
	}
	/**
	 * 减法
	 * 不能生成负数
	 */
	generater.getMinus = function (node) {
		if (node instanceof Node) {
			// 如果是Nodedui'xiang
			// 不允许进位
			if (this.tuiwei === false) {
				var val = this.makeLowEqualNumber(node.getValue());
			} else {
				do {
					var val = this.getNumber(this.maxLen, this.minLen);
				} while((node.getValue() - val).length < this.minLen)
			}
			if (node.getValue() - val < 0) {
				node.unshift("-").unshift(val).done();
			} else {
				node.push("-").push(val).done();
			}
			if (this.needBracket && !node.hasBracket() 
				&& Math.random() > 0.5 && node.getNum() < this.num) {
				node.bracket();
			}
			return node;
		}
	}
	// 乘法
	generater.getMultiply = function (node) {
		if (node instanceof Node) {
			// 如果是Nodedui'xiang
			// 不允许进位
			var val = this.getNumber(this.maxLen, this.minLen);
			node.push("*").push(val).done();
			if (this.needBracket && node.hasBracket() 
				&& Math.random() > 0.5 && node.getNum() < this.num) {
				node.bracket();
			}
			return node;
		}
	}
	// 除法
	generater.getDivide = function (node) {
		if (node instanceof Node) {
			// 如果是Nodedui'xiang
			// 不允许进位
			var val = this.getNumber(this.maxLen, this.minLen);
			val = node.getValue() * val;
			node.bracket().unshift("/").unshift(val).done();
			if (this.needBracket && node.hasBracket() 
				&& Math.random() > 0.5 && node.getNum() < this.num) {
				node.bracket();
			}
			return node;
		}
	}

	generater.makeUpperNumber = function (num) {
		var arg = num.toString().split("");
		var val = '';
		for (var i=0;i<arg.length;i++) {
			val += Math.floor(Math.random() * (10 - +arg[i])).toString();
		}
		return +val;
	}
	generater.makeLowEqualNumber = function (num) {
		var arg = num.toString().split("");
		var val = '';
		for (var i=0;i<arg.length;i++) {
			val += Math.round(Math.random() * +arg[i]).toString();
		}
		if (+val === 0) {
			return this.makeLowEqualNumber(num)
		}
		return +val;
	}
	// 得到一个数
	generater.getNumber = function (max, min){
		return Math.floor(Math.random() * (Math.pow(10, max) - Math.pow(10, min-1))) + Math.pow(10, min-1);
	}
	global.$Z_KS = generater;
})(window);