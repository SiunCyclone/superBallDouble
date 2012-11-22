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
var Playing = false;

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
		Playing = true;
		board.run();
		shooter.run();
	};

	function stop() { Playing = false; };
}

//==================================================

//OverRide
board.init = function() {
	ObjectModel.prototype.init("sBD");
	this.fps = 1000;
}

board.run = function() {
	setTimeout(function() { board.main() } , board.fps);
}

board.main = function() {
	if (Playing)
		setTimeout(function() { board.main() } , board.fps);
	this.update();
}

board.update = function() {
	console.log("boardUpdate");
}

//==================================================

shooter.pos = new Object;

shooter.run = function() {
	$("#sBD").mousemove( function(e) {
		shooter.pos.x = e.pageX - $("#sBD").offset()["left"];
		shooter.pos.y = e.pageY - $("#sBD").offset()["top"];

		shooter.main();
	});
}

shooter.main = function() {
	this.draw();
}

shooter.draw = function() {
	$("#coords").text(shooter.pos.x + " " + shooter.pos.y);
}


$(function() {
	manager.run();
});

