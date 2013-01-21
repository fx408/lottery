var lotteryProject = function() {
	this.users = [];
	this.count = 0;
	this.history = {};
	this.userSize = 12;
	this.usernames = [];
	
	this.levels = ['幸运奖', '三等奖', '二等奖', '一等奖', '特等奖'];
	this.nowLevel = 0;
	
	this.mx = canvas.width/2;
	this.my = canvas.height/2;
	this.radius = this.mx-20;
	this.fSize = 26;
	this.word = {width:27, height:32}; // 文字宽度 和 高度
	
	this.arcRecoup = -0.078;
	this.proportion = 3/2;
	
	this.winner = -1;
	
	this.nowIndex = 0;
	this.minSpeed = 1000;
	this.maxSpeed = 40;
	this.acceleration = 80;
	this.speedMode = true;
	this.speed = this.minSpeed;
	this.runing = false;
	this.allowStop = false;
	
	this.colors = [
		"#50BEFA", "#CE52F8", "#CE52F8",
		"#50BEFA", "#CE52F8", "#CE52F8",
		"#50BEFA", "#CE52F8", "#CE52F8",
		"#50BEFA", "#CE52F8", "#CE52F8"
	];

	this.init = function() {
		this.users = users.split(",");
		
		var winnerList = db.list();
		for(var i = 0, l = winnerList.length; i < l; i++) {
			this.winnerListAdd(winnerList[i]);
		}
		
		this.count = this.users.length;
	};
}

lotteryProject.prototype = {
	// 随机出 12个用户
	randUsers: function() {
		var i = 0;
		this.usernames = [];
		var keys = {};
		
		while(true) {
			var k = Math.floor( Math.random()*this.count );
			var u = this.users[k];
			
			if(!keys[k] && !localStorage.getItem[u]) {
				this.usernames.push(u);
				keys[k] = k;
				i++;
			}
			
			if(i >= this.userSize) break;
		}
		
		console.log(this.usernames);
	},
	
	// 绘制格子
	create: function(i, color, isWin) {
		var start = 0.1666*i+this.arcRecoup,
				finish = 0.1666*(i+1)-0.01+this.arcRecoup; 
		
		var s1 = Math.sin(Math.PI*start), c1 = Math.cos(Math.PI*start),
				s2 = Math.sin(Math.PI*finish), c2 = Math.cos(Math.PI*finish);
		
		var point = {x:this.mx+this.radius/this.proportion*c1, y:this.my+this.radius/this.proportion*s1},
				lineTo1 = {x:this.mx+this.radius*c1, y:this.my+this.radius*s1},
				lineTo2 = {x:this.mx+this.radius/this.proportion*c2, y:this.my+this.radius/this.proportion*s2};
		
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(lineTo1.x, lineTo1.y);
		ctx.arc(this.mx, this.my, this.radius, Math.PI*start, Math.PI*finish); // 外圈
		ctx.lineTo(lineTo2.x, lineTo2.y);
		ctx.arc(this.mx, this.my, this.radius/this.proportion, Math.PI*finish, Math.PI*start, true); // 内圈
		ctx.lineTo(point.x, point.y);
		ctx.fill();
		
		this.drawFont(i, start, isWin);
	},
	
	// 绘制文字
	drawFont: function(i, start, isWin) {
		ctx.fillStyle = isWin ? "#f00" : "#333";
		ctx.font='bold '+this.fSize+'px Microsoft YaHei';
	  ctx.textBaseline='top';
	  
		var nameLen = this.usernames[i].length;
		var wordWidth = nameLen > 3 ? this.word.width*4 : this.word.width*nameLen;
		wordWidth = 0;
		for(var k = 0; k < nameLen; k++) {
			var chr = this.usernames[i].charCodeAt(k);
			if(chr > 47 && chr < 58) wordWidth += this.word.width/2;
			else wordWidth += this.word.width;
		}
		
		var fontCoordinate = {};
		fontCoordinate.x = this.mx+this.radius*(0.5 + 0.5/this.proportion) * Math.cos(Math.PI*(start-this.arcRecoup)) - wordWidth/2;
		fontCoordinate.y = this.my+this.radius*(0.5 + 0.5/this.proportion) * Math.sin(Math.PI*(start-this.arcRecoup)) - this.word.height/2;
    
    ctx.fillText(this.usernames[i], fontCoordinate.x, fontCoordinate.y);
	},
	
	// 旋转
	whirling: function() {
		this.nowIndex = this.nowIndex%12;
		var fontIndex = this.nowIndex == 0 ? 11 : this.nowIndex-1;
		
		if(this.speedMode == true) { // 加速
			this.speed -= this.acceleration;
			if(this.speed < this.maxSpeed) {
				this.allowStop = true;
				this.speed = this.maxSpeed;
			}
		} else { // 减速
			this.speed += this.acceleration;
			if(this.speed > this.minSpeed) {
				this.winner = this.nowIndex;
			}
		}
		
		this.create(fontIndex, this.colors[fontIndex]);
		this.create(this.nowIndex, this.createHoverColor());
		this.nowIndex++;
		
		var _this = this;
		if(this.winner != -1) {
			setTimeout(function() {
				_this.runing = false;
				_this.showWinner();
			}, 1000);
			return false;
		}
		
		autoTime = setTimeout(function() {
			_this.whirling();
		}, this.speed);
	},
	
	nowColorIndex: 0,
	createHoverColor: function() {
		this.nowColorIndex++;
		if(this.nowColorIndex >= colorCount) this.nowColorIndex = 0;
		return colorList[this.nowColorIndex];
	},
	
	// 显示获胜者
	showWinner: function() {
		var winColors = ['#ff00ff', '#ffff00', '#00ffff', '#ff0000', '#35E854', '#4E8FFE'];
		var _this = this;
		
		var i = 0, r = 0, time = 0;
		time = setInterval(function() {
			_this.create(_this.winner, winColors[i%6]);
			i++;
			if(i%6 == 0) r++;
			
			if(r > 3) {
				clearTimeout(time);
				_this.create(_this.winner, winColors[1], true);
			}
		}, 100);
		
		this.winnerListAdd({name:this.usernames[this.winner], level:this.nowLevel}, true);
	},
	
	winnerListAdd: function(obj, saveToDb) {
		if( $("#winner_list .list div[name='"+obj.name+"']").length ) return;
		
		var html = '<tr><td name="'+obj.name+'">'
				+ obj.name
				+ '</td>'
				+ '<td><select name="level" class="level">';
				
				for(var i = 0, l = this.levels.length; i < l; i++) {
					var s = i == obj.level ? ' selected="selected"' : '';
					html += '<option value="'+i+'"'+s+'>'+this.levels[i]+'</option>';
				}
				
				html += '</select></td>'
				+ '<td><a href="javascript:;" class="del">删除</a>'
				+ '</td></tr>';
		
		$("#winner_list .list").prepend(html);
		
		saveToDb && db.set(obj.name, obj);
	},
	
	// 绘制
	draw: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		var m = 12, _this = this, k = 0;
		for(var i = 0; i < m; i++) {
			setTimeout(function() {
				_this.create(k, _this.colors[k]);
				k++;
				if(k == 12) {
					setTimeout(function() {
						_this.whirling();
					}, 500);
				}
			}, 700*i);
		}
	},
	
	run: function() {
		if(this.runing) return;
		this.runing = true;
		
		this.acceleration = Math.floor( Math.random()*60+60 ); // 加速度 60-120
		this.speedMode = true;
		this.allowStop = false;
		this.winner = -1;
		this.speed = this.minSpeed;
		
		this.randUsers();
		this.draw();
	},
	
	stop: function() {
		if(!this.allowStop) return false;
		this.speedMode = false;
	}
};

// 本地 key-value 数据库操作
var localDatabase = function() {
	
	
}

localDatabase.prototype.item = function(k) {
	var val = localStorage.getItem(k);
	if(!val) return null;
	
	try{
		val = JSON.parse(val);
	} catch(e) {
		console.log(e);
		val = val;
	}
	
	return val;
};

localDatabase.prototype.set = function(k, val) {
	try{
		if(typeof(val) != 'string') val = JSON.stringify(val);
		
		localStorage.setItem(k, val);
	} catch(e) {
		console.log(e);
	}
};

localDatabase.prototype.list = function() {
	var k = '', val = null, rList = [];
	for(var i = 0, l = localStorage.length; i < l; i++) {
		k = localStorage.key(i);
		val = this.item(k);
		if(val) rList.push(val);
	}
	
	return rList;
};

localDatabase.prototype.clear = function() {
	localStorage.clear();
};

localDatabase.prototype.del = function(k) {
	localStorage.removeItem(k);
};

// 创建 渐变颜色列表
var colorList = [];
var colorCount = 0;

function createColor() {
	var colors = {"r":['ff'], "b":['ff'], "g":['ff']};
	colors.c = ['g', 'b', 'g', 'r', 'b', 'g', 'r'];
	colors.n = [255, 255, 0, 255, 0, 255, 0];
	
	// 颜色压缩
	var ratio = 8, len = 256 / ratio;
	
	// 定义基础颜色
	var r=255, g=255, b=255, rgb = {"r":"", "g":"", "b":""};
	
	var n = 0, color = '';
	for(var k in colors.c) {
		
		if(k == 3) continue;
		
		// 记录RBG 颜色变化流程
		for(var rgbk in rgb) {
			colors[rgbk][k*1+1] = rgbk == colors.c[k] ? dechex(255 - colors.n[k]) : colors[rgbk][k];
		}
	
		// 绘制渐变线条
		for(var i = colors.n[k]; i > -1 && i < 256;) {
			if(k == 0 && i > 128) i = 128;

			switch(colors.c[k]) {
				case 'r': r = i; break;
				case 'b': b = i; break;
				case 'g': g = i; break;
			}
			
			color = 'rgb('+r+','+b+','+g+')';
			
			if(colors.n[k] == 255) i -= ratio;
			else i += ratio;
			
			colorList.push(color);
		}
	}
	colorCount = colorList.length;
	console.log(colorList);
}

function dechex(num) {
	var r = Math.round(num).toString(16);
	return r.length == 1 ? '0'+r : r;
}

createColor();