const MEDIATYPE = document.getElementById("MediaType");
const WRITTENREVIEW = document.getElementById("Review");
const TITLE = document.getElementById("Title");
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const MIDDLE = 260;
const POPUPSIZE = {
	w: 160,
	h: 160
};
function reviewscale (n) {
	n = Math.round(n);
	let x = ((n % (MIDDLE/11)) < ((MIDDLE/11)/2)) ? n - (n%(MIDDLE/11)) : n + ((MIDDLE/11)-(n%(MIDDLE/11)));
	let review = Math.round(x/(MIDDLE/11));
	return review - 11;
}

const image = new Image();
image.src="/reviews/image.jpg";
class Snowflake {
	constructor(worker, process, parse) {
		this.worker = this.safeParse(worker || Math.floor(Math.random() * 32, 5));
		this.process = this.safeParse(process || Math.floor(Math.random() * 32), 5);
		this.parse = parse;
		this.generated = 0;
	}
	safeParse(num, req) {
		let bin = num.toString(2);
		const len = bin.length;
		let sho;
		if (bin.length < req) {
			bin = bin.padStart(req - len, "0");
			sho = bin;
		}
		else {
			sho = bin.slice(len - req, len);
		}

		const res = parseInt(sho, 2);
		return res;
	}
	gen() {
		let ts = this.safeParse(Date.now(), 41);
		//console.log(ts);
		let gen;
		if (this.parse) gen = parseInt(`${ts}${this.worker}${this.process}${this.generated}`);
		else gen = `${ts}${this.worker}${this.process}${this.generated}`;
		this.generated++;
		this.generated = this.safeParse(this.generated, 12);
		//console.log(this.generated);
		return gen;
	}
	tie(flake, username, socket) {
		this.sessions[flake] = socket;
		this.utf[username] = flake;
		this.ftu[flake] = username;
	}
	extract(num) {
		let ts = num.slice(0, 13);
		return { date: new Date(parseInt(ts)), ts };
	}
}
const gen = new Snowflake();
const MOUSE = {
	x: 0, y: 0, realX: 0, realY: 0,offsetX: 0, offsetY: 0, edit: true
};
const posdict = {};
let folders = {};
CANVAS.onscroll = function (evt) {
	console.log(evt);
}
function getColors (x,y) {
	const data = CTX.getImageData(x-12, y-12, 24, 24).data;
	console.log(data);
	const pixels = [];
	for (let xi = 0; xi < 24; xi++) {
		for (let yi = 0; yi < 24; yi++) {
			const i = 4*(xi+24*yi); // 
			const color = [data[i],data[i+1],data[i+2],data[i+3]];
			pixels.push(color);
		}
	}
	return pixels;
}

CANVAS.addEventListener('contextmenu', async event => {
	event.preventDefault();
	if (!folders[`${MOUSE.realX}-${MOUSE.realY}`] && !CANVAS.style.cursor) return;

	if (!CANVAS.style.cursor) CANVAS.style.cursor = "none";
	else CANVAS.style.cursor = "";
	
});

CANVAS.onclick = function (evt) {
	//console.log(evt);
	//sCANVAS.style.cursor = "none";
	if (!MEDIATYPE.value || !TITLE.value || !WRITTENREVIEW.value) {
		console.log();
		if (!posdict[`${MOUSE.realX}-${MOUSE.realY}`]) posdict[`${MOUSE.realX}-${MOUSE.realY}`] = 0;
		if(!folders[`${MOUSE.realX}-${MOUSE.realY}`]) return;
		if (!evt.shiftKey) posdict[`${MOUSE.realX}-${MOUSE.realY}`]++;
		else posdict[`${MOUSE.realX}-${MOUSE.realY}`]--;
		if (posdict[`${MOUSE.realX}-${MOUSE.realY}`] === folders[`${MOUSE.realX}-${MOUSE.realY}`].length) posdict[`${MOUSE.realX}-${MOUSE.realY}`] = 0;
		else if (posdict[`${MOUSE.realX}-${MOUSE.realY}`] < 0) posdict[`${MOUSE.realX}-${MOUSE.realY}`] = folders[`${MOUSE.realX}-${MOUSE.realY}`].length-1;
		return;
	}
	//const X = evt.offsetX - MIDDLE;
	//const Y = evt.offsetY < MIDDLE ? MIDDLE - evt.offsetY : -(evt.offsetY - MIDDLE);
	const POS = {
		//x:X,y:Y,
		realX: MOUSE.realX,
		realY: MOUSE.realY,
		quality: -(reviewscale(MOUSE.realY)), 
		reaction: reviewscale(MOUSE.realX), 
		type: MEDIATYPE.value, 
		review: WRITTENREVIEW.value, 
		title:TITLE.value
	};
	POS.id = gen.gen();
	POS.overall = (POS.quality+POS.reaction)/2;
	posdict[POS.id] = POS;
	//console.log(POS);
	if(!folders[`${POS.realX}-${POS.realY}`]) folders[`${POS.realX}-${POS.realY}`] = [POS.id], console.log("made!");
	else folders[`${POS.realX}-${POS.realY}`].push(POS.id);
	//console.log(POS.realX, POS.realY, folders[`${POS.realX}-${POS.realY}`]);
	MEDIATYPE.value = "";
	TITLE.value = "";
	WRITTENREVIEW.value = "";
	//positions.push(POS);
}

canvas.onmousemove = function (evt) {
	if (CANVAS.style.cursor === "none") return;
	const X = ((evt.offsetX % (MIDDLE/11)) < ((MIDDLE/11)/2)) ? evt.offsetX - (evt.offsetX%(MIDDLE/11)) : evt.offsetX + ((MIDDLE/11)-(evt.offsetX%(MIDDLE/11)));
	const Y = ((evt.offsetY % (MIDDLE/11)) < ((MIDDLE/11)/2)) ? evt.offsetY - (evt.offsetY%(MIDDLE/11)) : evt.offsetY + ((MIDDLE/11)-(evt.offsetY%(MIDDLE/11)));
	//console.log(X, Y)
	MOUSE.x = X - MIDDLE;
	MOUSE.y = Y < MIDDLE ? MIDDLE - Y : -(Y - MIDDLE);
	MOUSE.realX = +X.toFixed(2);
	MOUSE.realY = +Y.toFixed(2);
	document.getElementById("reaction").innerText = reviewscale(MOUSE.realX);
	document.getElementById("quality").innerText = -(reviewscale(MOUSE.realY));
	if (MOUSE.realX > MIDDLE) MOUSE.offsetX = -(1);
	else MOUSE.offsetX = (0);
	if (MOUSE.realY > MIDDLE) MOUSE.offsetY = -(1);
	else MOUSE.offsetY = (0);
	//console.log(X, Y);
	//(X/(MIDDLE))/REVIEWSCALE,(Y/(MIDDLE))/REVIEWSCALE
	//console.log(X,Y,MOUSE.x, MOUSE.y, MOUSE.x, );
}

function render(){
	MOUSE.hovering = false;
	CTX.clearRect(0, 0, canvas.width, canvas.height);
	if (CANVAS.style.cursor === "none") {
		CTX.lineWidth = 1;
		CTX.font = "bold 24px arial"
		const POS = posdict[folders[`${MOUSE.realX}-${MOUSE.realY}`][posdict[`${MOUSE.realX}-${MOUSE.realY}`] || 0]];
		CTX.fillStyle = "black";
		CTX.fillText(POS.title, 10,40);
		CTX.fillText(POS.type, 10,80);
		CTX.fillText("Reaction: " + POS.reaction, 10,120);
		CTX.fillText("Quality: " + POS.quality, 10,160);
		CTX.fillText("Folder Position: " + ((posdict[`${MOUSE.realX}-${MOUSE.realY}`] || 0) + 1) +"/"+ folders[`${MOUSE.realX}-${MOUSE.realY}`].length, 10,200);
		CTX.font = "italic bold 15px arial";
		let temp = "";
		let splittext = ('"' + POS.review + '"').split("");
		let screentext = [];
		let possible = true;
		for (let i = 0; i < splittext.length; i++) {
			if (CTX.measureText(temp+splittext[i]).width < 450) temp += splittext[i];
			else screentext.push(temp), temp = ""+(splittext[i]||'');
		}
		screentext.push(temp)
		for (let i = 0; i < screentext.length; i++ ) {
			CTX.fillText(screentext[i], 10,240 + (i*20));
		}
		CTX.drawImage(image, 360, 0, 120, 180);
		return window.requestAnimationFrame(render);
	}
	CTX.lineWidth = 1;
	//folders = {};
	CTX.strokeStyle = "black";
	CTX.beginPath();
	CTX.moveTo(0,MIDDLE);
	CTX.lineTo(MIDDLE*2,MIDDLE);
	CTX.closePath();
	CTX.stroke();
	CTX.beginPath();
	CTX.moveTo(MIDDLE, 0);
	CTX.lineTo(MIDDLE, MIDDLE*2);
	CTX.closePath();
	CTX.stroke();
	CTX.beginPath();
	CTX.fillStyle = "white";
	CTX.strokeStyle = "black";
	CTX.arc(MOUSE.realX, MOUSE.realY, 3, 0, 2*Math.PI);
	CTX.closePath();
	CTX.stroke();
	CTX.fill();
	for (const folder of Object.keys(folders)) {
		CTX.lineWidth = 1;
		CTX.beginPath();
		CTX.fillStyle = "black";
		let [x, y] = folder.split("-");
		x = +x;
		y = +y;
		if (MOUSE.realX > (x-13) && MOUSE.realX < (x+13) && MOUSE.realY > (y-13) && MOUSE.realY < (y+13)) CTX.strokeStyle = "cyan", CTX.lineWidth = 4, MOUSE.hovering = true;
		else CTX.strokeStyle = "black";
		//if(!folders[`${POS.realX}-${POS.realY}`]) folders[`${POS.realX}-${POS.realY}`] = [];
		//if (folders[`${POS.realX}-${POS.realY}`]) {
			
		if (folders[folder].length > 1) CTX.rect(x-6.5, y-6.5, 13, 13);//, console.log("ye");
		//}
		else CTX.arc(x, y, 10, 0, 2*Math.PI);
		CTX.closePath();
		CTX.stroke();
		CTX.fill();
	}
	if (MOUSE.hovering) {
		CTX.beginPath();
		CTX.fillStyle = "gray";
		CTX.strokeStyle = "gray";
		CTX.rect(MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w), MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h), POPUPSIZE.w, POPUPSIZE.h);
		CTX.closePath();
		CTX.stroke();
		CTX.fill();
		CTX.fillStyle = "black";
		//console.log(folders[`${MOUSE.realX}-${MOUSE.realY}`][0])
		CTX.font = "12px arial"
		const POS = posdict[folders[`${MOUSE.realX}-${MOUSE.realY}`][posdict[`${MOUSE.realX}-${MOUSE.realY}`] || 0]];
		CTX.fillText(POS.title, MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w)+5, MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h)+15, 130);
		CTX.fillText(POS.type, MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w)+5, MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h)+27, 130);
		CTX.fillText("Reaction: " + POS.reaction, MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w)+5, MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h)+39, 130);
		CTX.fillText("Quality: " + POS.quality, MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w)+5, MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h)+51, 130);
		CTX.fillText("Folder Position: " + ((posdict[`${MOUSE.realX}-${MOUSE.realY}`] || 0) + 1) +"/"+ folders[`${MOUSE.realX}-${MOUSE.realY}`].length, MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w)+5, MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h)+63, 130);
		CTX.drawImage(image, MOUSE.realX+(MOUSE.offsetX*POPUPSIZE.w)+5, MOUSE.realY+(MOUSE.offsetY*POPUPSIZE.h)+69, 60, 90);
		
	}
	window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);