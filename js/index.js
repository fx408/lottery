var canvas = document.getElementById('tutorial');
var ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'lighter';
canvas.height = 700;
canvas.width = 700;

var db = new localDatabase();
var lottery = new lotteryProject();
lottery.init();

$(function() {
	$("#stop_button").click(function() {
		if(lottery.allowStop) {
			$(this).find("a").html("在来一次").css({"font-size":"80px", "margin-top":"35px"});
			
			lottery.stop();
		} else if(!lottery.runing) {
			$(this).find("a").html("STOP").css({"font-size":"120px", "margin-top":"5px"});
			
			lottery.run();
		}
		
		return false;
	});
	
	$("#clear").click(function() {
		$(this).miniConfirm({
			msg:"确认清空名单吗?",
			callback: function() {
				db.clear();
				$("#winner_list .winner_table tbody").empty();
				$.fn.closePublicBox(0);
			}
		});
	});
	
	$("#winner_list a.del").live('click', function() {
		var $this = $(this);
		
		$this.miniConfirm({
			msg:"确认删除获奖者吗?",
			callback: function() {
				var n = $this.parents("tr").find("td:eq(0)").attr("name");
				
				db.del(n);
				$this.parents("tr").remove();
				$.fn.closePublicBox(0);
			}
		});
		
		return false;
	});
	
	$("select.level").live("change", function() {
		var n = $(this).parents("tr").find("td:eq(0)").attr("name"),
				l = $(this).val();

		db.set(n, {name:n, level:l});
	});
	
	$("#winner_list .winner_title").click(function() {
		var tab = $("#winner_list .winner_table"),
				$this = $(this);
		
		if(tab.is(":visible")) {
			tab.slideUp(200, function() {
				$this.animate({"left":"0px"}, 300);
				$("#winner_list").animate({"right":"-180px"}, 300);
			});
		} else {
			$this.animate({"left":"90px"}, 300);
			$("#winner_list").animate({"right":"20px"}, 300, function() {
				tab.slideDown(200);
			});
		}
	});
	
	// 开始抽奖
	$("#start_button_up, #start_button_bottom").click(function() {
		
		$("#cover_up").animate({"height":"0px"}, 550);
		$("#cover_bottom").animate({"top":$(window).height()+"px"}, 500, function() {
			$("#stop_button").trigger("click");
			$("#cover_up, #cover_bottom").hide();
			//showCover();
		});
	}).mouseover(function() {
		$("#start_button_up, #start_button_bottom").css("color", "#FFF4C8");
	}).mouseout(function() {
		$("#start_button_up, #start_button_bottom").css("color", "#fff");
	});
	
	initCover();
	$(window).resize(function() {
		if($("#cover_up").is(":visible")) initCover();
	});
});

function initCover() {
	var winWidth = $(window).width(), winHeight = $(window).height();
	
	var h = winHeight/2 - 50;
	
	$("#cover_up, #cover_bottom").css({"width": winWidth+"px", "height":h+"px"});
	$("#cover_bottom").css({"top":h+"px", "height":(h+100)+"px"});
	
	
	var sbw = $("#start_button_up").width(), sbh = $("#start_button_up").height();
	var sbl = (winWidth - sbw) / 2 - 30;
	$("#start_button_up, #start_button_bottom").css({"left":sbl+"px"});
}

function showCover() {
	var winHeight = $(window).height(), h = winHeight/2 - 50;
	
	$("#cover_up").animate({"height":h+"px"}, 550);
	$("#cover_bottom").animate({"top":h+"px"}, 500, function() {
		
	});
}

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
}

function dechex(num) {
	var r = Math.round(num).toString(16);
	return r.length == 1 ? '0'+r : r;
}

createColor();
