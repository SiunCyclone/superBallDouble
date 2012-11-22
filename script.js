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
	this.posM = { x: board.size.x/2, y: 0 };
}

shooter.run = function() {
	$("#sBD").mousemove( function(e) {
		shooter.move(e);
	});

	$("#sBD").on("click", function(e) {
		curBall.run();
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

curBall.Firing = false;
curBall.pos = new Object;

curBall.run = function() {
	this.Firing = true;
}

curBall.main = function() {
	if (manager.Playing)
		setTimeout(function() { curBall.main() } , FPS);
	this.update();
}

curBall.update = function() {
	this.clear();
	if ( this.canMove() )
		this.move();
	this.draw();
}

curBall.clear = function() {

}

curBall.canMove = function() {
	if (!this.Firing) return;
}

curBall.move = function() {

}

curBall.draw = function() {

}

//==================================================


$(function() {
	manager.run();
});

//shooter表示
//ボール表示
//ボールクリックで発射
//壁で反発
//積もってくリスト作成(デフォルトで既にくっついてる)
//curBallを積もってくリストに追加
//積もってくリスト表示
//色指定
//積もってくリスト消すシステム

