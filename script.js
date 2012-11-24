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
	this.size = { x: 480, y: 800 };
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
	if ( this.pos.x <= BALL.r || this.pos.x >= (board.size.x-BALL.r) )
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
	this.saveList = new Array;
	var data;
	for (var i=0; i<K.height; ++i) {
		this.list.push(new Array);
		for (var o=0; o<K.width; ++o) {
			if (i<6)
				data = { color: BALL.color[K.rand(BALL.color.length)],
						 pos: { x: o, y: i } };
			else data = false;
			if (o==K.width-1 && i%2!=0)
				data = false;
			this.list[i][o] = data;
		}
	}
}

piledBall.update = function() {
	this.move();
	this.addRm();
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
				if ( piledBall.list[i][o] == false || outCircle(i, o) )
					continue;
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
				piledBall.fall();
				return;
			}
		}
	}

	//TODO 上にボールがないとFieldを突き抜けてく

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
		//FIXME 奇数の右端に追加される
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
			if ( (!piledBall.overlap( dList, cur )) &&
				 (!piledBall.overlap( neiL, cur ))
			   )
				dList.push(cur);
			var colorN;
			for each ( var nei in piledBall.neiAry(cur[0], cur[1]) ) {
				if (nei[0] == K.height-1)
					continue;
				if (piledBall.list[ nei[0] ][ nei[1] ] == false)
					continue;
				colorN = piledBall.list[ nei[0] ][ nei[1] ].color;
				if ( color == colorN && !piledBall.overlap(dList, nei) && !piledBall.overlap(neiL, nei) )
					neiL.push(nei);
			}
			if (neiL.length == 0) return;
			makeDelList(dList, neiL, color);
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

piledBall.neiAry = function(y, x) {
	if ( (y == 0) && (x == 0) ) //top left
		return [ [y, x+1], [y+1, x] ];
	if ( (y == 0) && (x == K.width-1) ) //top right 
		return [ [y, x-1], [y+1, x-1] ];
	if (y == 0) //top
		return [ [y, x-1], [y, x+1], [y+1, x-1], [y+1, x] ];
	if (y%2 == 0) {
		if (x == 0) //left
			return [ [y-1, x], [y, x+1], [y+1, x] ];	
		if (x == K.width-1) //right
			return [ [y-1, x-1], [y, x-1], [y+1, x-1] ];	
		return [ [y-1, x-1], [y-1, x], [y, x-1], [y, x+1], [y+1, x-1], [y+1, x] ];
	} else {
		if (x == 0) //left
			return [ [y-1, x], [y-1, x+1], [y, x+1], [y+1, x], [y+1, x+1] ];
		if (x == K.width-2) //right
			return [ [y-1, x], [y-1, x+1], [y, x-1], [y+1, x], [y+1, x+1] ];
		return [ [y-1, x], [y-1, x+1], [y, x-1], [y, x+1], [y+1, x], [y+1, x+1] ];
	}
//一番下のチェック
/*
	if ( (i == K.height-1) && (x == 0) ) //under left
		return [ [i-1, x], [i, x+1] ];
	if ( (i == K.height-1) && (x == K.width-1) ) //under right
		return [ [i-1, x-1], [i, x-1] ];
	if (i == K.height-1) //under
		return [ [i-1, x-1], [i-1, x], [i, x-1], [i, x+1] ];
*/
}

piledBall.overlap = function(list, nei) {
	for each (var ary in list)
		if ( this.compare(ary, nei) ) return true;
	return false;
}

piledBall.compare = function(ary1, ary2) {
	for (var i=0; i<ary1.length; ++i) {
		if (ary1[i] != ary2[i])
			return false	
	}
	return true;
}

piledBall.fall = function() {
	this.saveList.length = 0;
	var cur;
	for (var o=0; o<K.width; ++o) {
		cur = piledBall.list[0][o];
		if (cur == false)
			continue;
		makeSaveList(piledBall.saveList, [[cur.pos.y, cur.pos.x]]);
	}
	//console.log(this.saveList);
	//console.log(this.saveList.length);
	sendFallBall(piledBall.saveList);

	function sendFallBall(saveList) {
		var curPos;
		for (var i=0; i<K.height; ++i) {
			for (var o=0; o<K.width; ++o) {
				if (piledBall.list[i][o] == false)
					continue;
				curPos = [piledBall.list[i][o].pos.y, piledBall.list[i][o].pos.x];
				if ( !contain(curPos, saveList) )
					fallBall.add(curPos);
			}
		}
	}
	
	function contain(elem, aryList) {
		for each (var ary in aryList) {
			if ( (elem[0] == ary[0]) && (elem[1] == ary[1]) )
				return true;
		}
		return false;
	}

	function makeSaveList(saveList, neiL) {
		var t = $.extend(true, [], neiL);
		//console.log(t);
		var cur = neiL.shift();
		if ( (!piledBall.overlap( saveList, cur )) &&
			 (!piledBall.overlap( neiL, cur ))
		   )
			saveList.push(cur);

		for each ( var nei in piledBall.neiAry(cur[0], cur[1]) ) {
			if ((nei[0] == K.height-1) ||
				(piledBall.list[ nei[0] ][ nei[1] ] == false)
			   )
				continue;
			//console.log("piled",piledBall.neiAry(cur[0], cur[1]));
			if ( (!piledBall.overlap( saveList, nei )) &&
				 (!piledBall.overlap( neiL, nei ))
			   ) {
				//console.log("nei追加されました",nei);
				neiL.push(nei);
			}
		}
		if (neiL.length == 0) return;
		t = $.extend(true, [], neiL);
		//console.log("l ",t);
		makeSaveList(saveList, neiL);
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
	console.log(pos, "が落ちます");
}

fallBall.draw = function() {

}

$(function() {
	manager.run();
});

