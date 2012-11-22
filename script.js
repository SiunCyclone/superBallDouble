function ObjectModel() {}

ObjectModel.prototype.init = function(target) {
	this.canvas = document.getElementById(target);
	if (!this.canvas || !this.canvas.getContext) {
		alert("No Canvas support in your browser...");
		return;
	}
	this.context = this.canvas.getContext("2d");
}

var K = new function() {
	this.fps = 48; // 60fps:16 30fps:32 20fps:48 10fps:96
	this.name = "sBD";
	this.width = 12;
	this.height = 24;

	// return x < num
	this.rand = function(num) { return Math.random() * num | 0; }
}

var BALL = new function() {
	this.color = ["#e87812", "#ffd000", "#ff0000",
				  "#dc00e0", "#00ff00", "#0000eb", "#02e4e6"];
	this.r = 20;
}

var manager = new ObjectModel();
var board = new ObjectModel();
var shooter = new ObjectModel();
var curBall = new ObjectModel();
var nextBall = new ObjectModel();
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
		nextBall.init(K.name);
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
	nextBall.update();
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
		if (curBall.Firing) return;
		curBall.init(K.name);
		nextBall.rotate();
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
	this.pos = { x: board.size.x/2, y: 600, spd: 26 }; //spd:26
	this.color = nextBall.list[0].color;
}

curBall.run = function(pos) {
	this.Firing = true;
	this.pos.dx = Math.cos( Math.atan2(pos.y - this.pos.y,
				                       pos.x - this.pos.x) ) * this.pos.spd;
	this.pos.dy = Math.sin( Math.atan2(pos.y - this.pos.y,
									   pos.x - this.pos.x) ) * this.pos.spd;
}

curBall.update = function() {
	if (!this.Firing) return;
	this.move();
	this.reflect();
	this.draw();
}

curBall.move = function() {
	this.pos.x += this.pos.dx;
	this.pos.y += this.pos.dy;
}

curBall.reflect = function() {
	if (this.pos.x <= BALL.r || this.pos.x >= board.size.x-BALL.r)
		this.pos.dx = -this.pos.dx;
	if (this.pos.y >= board.size.y-BALL.r)
		this.pos.dy = -this.pos.dy;
}

curBall.draw = function() {
	this.context.beginPath();
	this.context.fillStyle = this.color;
	this.context.arc(this.pos.x, this.pos.y, BALL.r, 0, Math.PI*2, true);
	this.context.fill();
}

//==================================================

nextBall.init = function() {
	this.list = new Array;
	for (var i=0; i<3; ++i) {
		this.list.push({ color: BALL.color[K.rand(BALL.color.length)],
						 pos: { x: board.size.x/2 , y: 600 + i*BALL.r*2} });
	}
}

nextBall.update = function() {
	this.draw();
}

nextBall.rotate = function() {
	this.list.splice(0, 1);
	for (var i=0; i<this.list.length; ++i)
		this.list[i].pos.y -= BALL.r*2;
	this.list.push({ color: BALL.color[K.rand(BALL.color.length)],
					 pos: { x: board.size.x/2 , y: 600 + 2*BALL.r*2} });
}

nextBall.draw = function() {
	for (var i=0; i<this.list.length; ++i) {
		this.context.beginPath();
		this.context.fillStyle = this.list[i].color;
		this.context.arc(this.list[i].pos.x, this.list[i].pos.y, BALL.r, 0, Math.PI*2, true);
		this.context.fill();
	}
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
				data = { color: BALL.color[K.rand(BALL.color.length)],
						 pos: { x: o, y: i } };
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
//	if (curBall.pos
}

ballList.draw = function() {
	for (var i=0; i<K.height; ++i) {
		for (var o=0; o<K.width; ++o) {
			if (this.list[i][o] != false) {
				this.context.beginPath();
				this.context.fillStyle = this.list[i][o].color;
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

//curBallを積もってくリストに追加
//そろったら積もってくリスト消すシステム
//全部消えたらクリア

