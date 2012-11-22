function ObjectModel() {}

ObjectModel.prototype.init = function(target) {
	this.canvas = document.getElementById(target);
	if (!this.canvas || !this.canvas.getContext) {
		alert("No Canvas support in your browser...");
		return;
	}
	this.context = this.canvas.getContext("2d");
}

var K = new function K() {
	this.fps = 48; // 60fps==16 30fps==32 20fps==48
	this.name = "sBD";
	this.width = 12;
	this.height = 24;
}

var BALL = new function BALL() {
	this.color = ["#e87812", "#ffd000", "#ff0000", "#dc00e0"];
	this.r = 20;
}

var manager = new ObjectModel();
var board = new ObjectModel();
var shooter = new ObjectModel();
var curBall = new ObjectModel();
var ballList = new ObjectModel();

manager.run = function() {
	$("#start").on("click", function() { 
		$(this).css({display: "none"});
		init();
		run();
	});
	$("#stop").on("click", function() { stop(); });
	$("#resume").on("click", function() { run(); });	

	function init() {
		board.init(K.name);
		shooter.init(K.name);
		curBall.init(K.name);
		ballList.init(K.name);
	}

	function run() {
		manager.Playing = true;
		shooter.run();
		manager.main();
	};

	function stop() { manager.Playing = false; };
}

manager.main = function() {
	if (manager.Playing)
		setTimeout(function() { manager.main(); }, K.fps);
	this.update();
}

manager.update = function() {
	board.update();
	shooter.update();
	curBall.update();
	ballList.update();
}

//==================================================

//OverRide
board.init = function(target) {
	ObjectModel.prototype.init(target);
	this.size = { x: 500, y: 800 };
}

board.update = function() {
	this.clear();
}

board.clear = function() {
	this.context.clearRect(0, 0, this.size.x, this.size.y);
}

//==================================================

//OverRide
shooter.init = function(target) {
	ObjectModel.prototype.init(target);
	this.pos = { x: board.size.x/2, y: 600 };
	this.posM = { x: board.size.x/2, y: 600 };
}

shooter.run = function() {
	$("#sBD").mousemove( function(e) {
		shooter.move(e);
	});

	$("#sBD").on("click", function(e) {
		curBall.init(K.name);
		curBall.run(shooter.posM);
	});
}

shooter.update = function() {
	this.draw();
}

shooter.move = function(e) {
	this.posM.x = e.pageX - $("#sBD").offset()["left"];
	this.posM.y = e.pageY - $("#sBD").offset()["top"];
}

shooter.draw = function() {
	$("#coords").text(shooter.posM.x + " " + shooter.posM.y);
	this.context.beginPath();
	this.context.moveTo(this.pos.x, this.pos.y);
	this.context.lineTo(this.posM.x, this.posM.y);
	this.context.stroke();
}

//==================================================

curBall.init = function(target) {
	ObjectModel.prototype.init(target);
	this.pos = { x: board.size.x/2, y: 600, spd: 12 };
}

curBall.run = function(pos) {
	this.Firing = true;
	this.pos.dx = Math.cos( Math.atan2(pos.y - this.pos.y,
				                       pos.x - this.pos.x) ) * this.pos.spd;
	this.pos.dy = Math.sin( Math.atan2(pos.y - this.pos.y,
									   pos.x - this.pos.x) ) * this.pos.spd;
}

curBall.update = function() {
	this.move();
	this.reflect();
	this.draw();
}

curBall.move = function() {
	if (!this.Firing) return;

	this.pos.x += this.pos.dx;
	this.pos.y += this.pos.dy;
}

curBall.reflect = function() {
	if (this.pos.x <= 0 || this.pos.x >= board.size.x)
		this.pos.dx = -this.pos.dx;
	if (this.pos.y >= board.size.y)
		this.pos.dy = -this.pos.dy;
}

curBall.draw = function() {
//	$("#ball").text(curBall.pos.x + " " + curBall.pos.y);
	this.context.beginPath();
	this.context.arc(this.pos.x, this.pos.y, BALL.r, 0, Math.PI*2, true);
	this.context.fill();
}

//==================================================

ballList.init = function(target) {
	ObjectModel.prototype.init(target);
	this.spd = 1000; // 1sec
	this.list = new Array;
	var data;
	for (var i=0; i<K.height; ++i) {
		this.list.push(new Array);
		for (var o=0; o<K.width; ++o) {
			if (i<6)
				data = { color: "#dc00e0", pos: { x: o, y: i } };
			else
				data = false;

			if (o==K.width-1 && i%2!=0)
				data = false;

			this.list[i][o] = data;
		}
	}
}

ballList.update = function() {
	this.move();
	this.add();
	this.draw();
}

ballList.move = function() {

}

ballList.add = function() {

}

ballList.draw = function() {
	for (var i=0; i<K.height; ++i) {
		for (var o=0; o<K.width; ++o) {
			if (this.list[i][o] != false) {
				this.context.beginPath();
				if (i%2==0)
					this.context.arc(this.list[i][o].pos.x*BALL.r*2 + BALL.r,
									 this.list[i][o].pos.y*BALL.r*2 + BALL.r,
									 BALL.r, 0, Math.PI*2, true);
				else
					this.context.arc(BALL.r + this.list[i][o].pos.x*BALL.r*2 + BALL.r,
									 this.list[i][o].pos.y*BALL.r*2 + BALL.r,
									 BALL.r, 0, Math.PI*2, true);

				this.context.fill();
			}
		}
	}
}

$(function() {
	manager.run();
});

//積もってくリスト作成(デフォルトで既にくっついてる)
//curBallを積もってくリストに追加
//積もってくリスト表示
//色指定
//そろったら積もってくリスト消すシステム
//全部消えたらクリア

