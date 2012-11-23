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
	this.cnt = 0;

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
var piledBall = new ObjectModel();
var fallBall = new ObjectModel();

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
		curBall.init(K.name);
		piledBall.init(K.name);
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
	piledBall.update();
	++K.cnt;
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
		curBall.run(shooter.posM);
		nextBall.rotate();
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
	this.context.beginPath();
	this.context.moveTo(this.pos.x, this.pos.y);
	this.context.lineTo(this.posM.x, this.posM.y);
	this.context.stroke();
}

//==================================================

curBall.init = function(target) {
	ObjectModel.prototype.init(target);
	this.pos = { x: board.size.x/2, y: 600, spd: 18};
}

curBall.run = function(pos) {
	this.color = nextBall.list[0].color;
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

piledBall.init = function(target) {
	ObjectModel.prototype.init(target);
	this.spd = 32; // 5sec
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

piledBall.update = function() {
	this.move();
	this.addRm();
	this.fall();
	this.draw();
}

//unfinished
piledBall.move = function() {
/*
	if (K.cnt != 0 && K.cnt % this.spd == 0) {
		for (var i=0; i<K.height; ++i) {
			for (var o=0; o<K.width; ++o) {
				if (this.list[i][o] == false) continue;
				this.list[i][o].pos.y += 1;
			}
		}
	}
*/
}

piledBall.addRm = function() {
	main();

	function main() {
		var l;
		for (var i=0; i<K.height; ++i) {
			for (var o=0; o<K.width; ++o) {
				if ( piledBall.list[i][o] == false || outCircle(i, o) ) continue;

				l = curBall.pos.y - (piledBall.list[i][o].pos.y * BALL.r*2 + BALL.r);
				if ( Math.abs(l) < BALL.r )
					addSide(i, o);
				else {
					if (l < 0)
						addUpper(i, o);
					else
						addUnder(i, o);
				}
				
				curBall.Firing = false;
				curBall.init(K.name);
				return;
			}
		}
	}

	function addUpper(i, o) {
		var t;
		if (i%2==0) {
			if ( 0 > (curBall.pos.x - ( piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r )) )
				t = o-1;
			else t = o;
		} else {
			if ( 0 > (curBall.pos.x - ( piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r*2 )) )
				t = o-1;
			else t = o+1;
		}

		piledBall.list[i-1][t] = { color: curBall.color, pos: { x: t, y: i-1 } };
		remove(i, t);	
	}

	function addSide(i, o) {
		var t;
		if (i%2==0) {
			if ( 0 > (curBall.pos.x - ( piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r )) )
				t = o-1;
			else t = o+1;
		} else {
			if ( 0 > (curBall.pos.x - ( piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r*2 )) )
				t = o-1;
			else t = o+1;
		}

		piledBall.list[i][t] = { color: curBall.color, pos: { x: t, y: i } };
		remove(i, t);	
	}

	function addUnder(i, o) {
		var t;
		if (i%2==0) {
			if ( 0 > (curBall.pos.x - ( piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r )) )
				t = o-1;
			else t = o;
		} else {
			if ( 0 > (curBall.pos.x - ( piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r*2 )) )
				t = o;
			else t = o+1;
		}
		piledBall.list[i+1][t] = { color: curBall.color, pos: { x: t, y: i+1 } };
		remove(i+1, t);	
	}

	function remove(curY, curX) {
		var color = piledBall.list[curY][curX].color;
		var dList = new Array;
		makeDelList(dList, [[curY, curX]], color);
		
		if (dList.length < 3) return;
		for each (var io in dList)
			piledBall.list[ io[0] ][ io[1] ] = false;

		function makeDelList(dList, neiL, color) {
			var cur = neiL.shift();
			dList.push(cur);

			var colorN;
			for each ( var nei in neiAry(cur[0], cur[1]) ) {
				//はじっこ以外。
				if (nei[0]<=0 || nei[1]<=0 || nei[0]>=K.height || nei[1]>=K.width)
					return;

				if (piledBall.list[ nei[0] ][ nei[1] ] == false)
					continue;

				colorN = piledBall.list[ nei[0] ][ nei[1] ].color;

				if ( color == colorN && !overlap(dList, nei) && !overlap(neiL, nei) )
					neiL.push(nei);
			}
			
			if (neiL.length == 0) return;

			makeDelList(dList, neiL, color);
		}

		function overlap(list, nei) {
			for each (var ary in list)
				if ( compare(ary, nei) ) return true;
			return false;
		}

		function compare(ary1, ary2) {
			for (var i=0; i<ary1.length; ++i) {
				if (ary1[i] != ary2[i])
					return false	
			}
			return true;
		}

		function neiAry(i, o) {
			var ary; 
			if (i%2==0) {
				ary = [ [i-1, o-1], [i-1, o],
						[i, o-1], [i, o+1],
						[i+1, o-1], [i+1, o]
					  ]
			} else {
				ary = [ [i-1, o], [i-1, o+1],
						[i, o-1], [i, o+1],
						[i+1, o], [i+1, o+1]
					  ]
			}
			return ary;
		}
	}

	function outCircle(i, o) {
		var d;
		if (i%2==0) {
			d = ( curBall.pos.x - (piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r) ) *
				( curBall.pos.x - (piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r) ) +
				( curBall.pos.y - (piledBall.list[i][o].pos.y * BALL.r*2 + BALL.r) ) *
				( curBall.pos.y - (piledBall.list[i][o].pos.y * BALL.r*2 + BALL.r) );
		} else {
			d = ( curBall.pos.x - (piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r*2) ) *
				( curBall.pos.x - (piledBall.list[i][o].pos.x * BALL.r*2 + BALL.r*2) ) +
				( curBall.pos.y - (piledBall.list[i][o].pos.y * BALL.r*2 + BALL.r) ) *
				( curBall.pos.y - (piledBall.list[i][o].pos.y * BALL.r*2 + BALL.r) );
		}
		var r = BALL.r*2 * BALL.r*2;
		if (d < r)
			return false;
		return true;
	}
}

piledBall.fall = function() {
	var saveList = new Array;

	makeSaveList(saveList);
	sendFallBall(saveList);

	function sendFallBall(saveList) {
		var curPos;
		for (var i=0; i<K.height; ++i) {
			for (var o=0; o<K.width; ++o) {
				if (piledBall.list[i][o] == false) continue;

				curPos = [piledBall.list[i][o].pos.x, piledBall.list[i][o].pos.y];
				if ( !contain(curPos, saveList) )
					fallBall.add(curPos);
			}
		}
	}
	
	function contain(elem, aryList) {
		for each (var ary in aryList) {
			for each (var pos in ary) {
				if ( (elem[0] == x[0]) && (elem[1] == x[1]) )
					return true;
			}
		}
		return false;
	}

	function makeSaveList(saveList) {
		var curX, curY;
		for (var o=0; o<K.width; ++o) {
			if (piledBall.list[0][o] == false)
				continue;
			curX = piledBall.list[0][o].pos.x;
			curY = piledBall.list[0][o].pos.y;
			spread(saveList, [[curX, curY]]);
		//#TODO
		//spread
		}

		function spread(saveList, neiL) {
		}
	}
}

piledBall.draw = function() {
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
					this.context.arc(this.list[i][o].pos.x*BALL.r*2 + BALL.r*2,
									 this.list[i][o].pos.y*BALL.r*2 + BALL.r,
									 BALL.r, 0, Math.PI*2, true);

				this.context.fill();
			}
		}
	}
}

//==================================================

fallBall.init = function() {

}

fallBall.update = function() {
	this.move();
	this.draw();
}

fallBall.move = function() {

}

fallBall.add = function(pos) {

}

fallBall.draw = function() {

}

$(function() {
	manager.run();
});

