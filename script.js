function ObjectModel() {}

ObjectModel.prototype.init = function(target) {
	this.canvas = document.getElementById(target);
	if (!this.canvas || !this.canvas.getContext) {
		alert("No Canvas support in your browser...");
		return;
	}
	this.context = this.canvas.getContext("2d");
}

var manager = new ObjectModel();
var board = new ObjectModel();
var shooter = new ObjectModel();
var curBall = new ObjectModel();
var ballList = new ObjectModel();
var FPS = 16; // 1000/60 #=> 16.66...8

manager.run = function() {
	$("#start").on("click", function() { 
		$(this).css({display: "none"});
		init();
		run();
	});
	$("#stop").on("click", function() { stop(); });
	$("#resume").on("click", function() { run(); });	

	function init() {
		board.init("sBD");
		shooter.init("sBD");
		curBall.init("sBD");
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
		setTimeout(function() { manager.main(); }, FPS);
	this.update();
}

manager.update = function() {
	board.update();
	shooter.update();
	curBall.update();
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
		curBall.init("sBD");
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
	this.pos = { x: board.size.x/2, y: 600, spd: 2 };
}

curBall.run = function(pos) {
	this.Firing = true;
	this.pos.dx = Math.cos( Math.atan2(( pos.y - this.pos.y ), pos.x - this.pos.x) ) * this.pos.spd;
	this.pos.dy = Math.sin( Math.atan2(( pos.y - this.pos.y ), pos.x - this.pos.x) ) * this.pos.spd;
}

curBall.update = function() {
	if ( this.canMove() )
		this.move();
	this.draw();
}

curBall.canMove = function() {
	if (!this.Firing) return false;
	return true;
}

curBall.move = function() {
	this.pos.x += this.pos.dx;
	this.pos.y += this.pos.dy;

}

curBall.draw = function() {
	$("#ball").text(curBall.pos.x + " " + curBall.pos.y);
	this.context.beginPath();
	this.context.arc(this.pos.x, this.pos.y, 10, 0, Math.PI*2, true);
	this.context.fill();
}

//==================================================


$(function() {
	manager.run();
});

//DONE shooter表示
//DONE ボール表示
//DONE ボールクリックで発射
//壁で反発
//積もってくリスト作成(デフォルトで既にくっついてる)
//curBallを積もってくリストに追加
//積もってくリスト表示
//色指定
//積もってくリスト消すシステム

