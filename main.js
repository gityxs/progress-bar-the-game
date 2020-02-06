var lastFrame = 0;
var lastSave = 0;
var game = newGame();

const upgrade = {
	basePrice: [1, 1, 2, 3],
	priceGrowth: [5, 5, 7, 6],
	limit: [Infinity,Infinity,Infinity,9]
};

function nextFrame(timeStamp) {
	let sinceLastFrame = timeStamp - lastFrame;
	let sinceLastSave = timeStamp - lastSave;
	if (sinceLastFrame >= game.updateSpeed) {
		lastFrame = timeStamp;
		game.lifetimeProgress += sinceLastFrame * getBarSpeed();
		game.progress += sinceLastFrame * getBarSpeed();
		updateProgress();
	}
	if (sinceLastSave >= game.autoSaveInterval) {
		if (game.doAutoSave) {
			save();
		}
		lastSave = timeStamp;
	}
	window.requestAnimationFrame(nextFrame);
}

function save(auto = true) {
	localStorage.setItem('twsave', JSON.stringify(deinfinify(game)));
	if (!auto) {
		document.getElementById("saveButton").style.backgroundColor = "green";
		setTimeout(function(){
			document.getElementById("saveButton").style.backgroundColor = "";
		}, 250);
	}
}

function load(auto = true) {
	if (localStorage.getItem('twsave')) {
		let pastGame = infinify(JSON.parse(localStorage.getItem('twsave')));
		merge(game, pastGame);
		if (!auto) {
			document.getElementById("loadButton").style.backgroundColor = "green";
			setTimeout(function(){
				document.getElementById("loadButton").style.backgroundColor = "";
			}, 250);
		}
	}
}

function exportSave() {
	document.getElementById("exportArea").classList.remove('hidden');
	document.getElementById("exportArea").innerHTML = btoa(JSON.stringify(deinfinify(game)));
	document.getElementById("exportArea").select();
	document.execCommand("copy");
	document.getElementById("exportArea").classList.add('hidden');
	document.getElementById("exportButton").style.backgroundColor = "green";
	setTimeout(function(){
		document.getElementById("exportButton").style.backgroundColor = "";
	}, 250);
}

function importSave() {
	let save = prompt("Please enter export text.\nWarning: Your current save will be over-written.");
	if (save != null) {
		let err = false;
		try {
			localStorage.setItem('twsave', atob(save));
			load();
		} catch(yeet) {
			err = true;
			document.getElementById("importButton").style.backgroundColor = "red";
		}
		if (!err) document.getElementById("importButton").style.backgroundColor = "green";
		setTimeout(function(){
			document.getElementById("importButton").style.backgroundColor = "";
		}, 250);
	}
}

function wipe() {
	if (confirm("Are you sure you want to wipe your save?")) {
		game = newGame(); 
		save();
		updateAll();
		document.getElementById("saveMenu").style.width = "0px";
		document.getElementById("openSaveMenu").style.right = "0px";
		document.getElementById("upgMenu").style.height = "0px";
		document.getElementById("openUpgMenu").style.top = "0px";
		document.getElementById("wipeButton").style.backgroundColor = "red";
		setTimeout(function(){
			document.getElementById("wipeButton").style.backgroundColor = "";
		}, 250);
	}
}

function merge(base, source) {
	for (i in base) {
		if (source[i] != undefined) {
			if (typeof(base[i]) == "object" && typeof(source[i]) == "object") {
				merge(base[i], source[i]);
			} else {
				base[i] = source[i];
			}
		}
	}
}

function deinfinify(object) {
	let o = {...object};
	for (let i in o) {
		if (o[i] === Infinity) {
			o[i] = "Infinity";
		}
		if (typeof(o[i]) == "object") {
			o[i] = deinfinify(o[i]);
		}
	}
	return o;
}

function infinify(object) {
	let o = {...object};
	for (let i in o) {
		if (o[i] === "Infinity") {
			o[i] = Infinity;
		}
		if (typeof(o[i]) == "object") {
			o[i] = infinify(o[i]);
		}
	}
	return o;
}

function toggleAutoSave() {
	game.doAutoSave = !game.doAutoSave;
	document.getElementById("autoSaveToggleButton").innerHTML = game.doAutoSave ? "Auto Save<br>ON" : "Auto Save<br>OFF";
	document.getElementById("autoSaveToggleButton").style.backgroundColor = game.doAutoSave ? "green" : "red";
	setTimeout(function(){
		document.getElementById("autoSaveToggleButton").style.backgroundColor = "";
	}, 250);
}

function changeAutoSaveInterval() {
	let newInterval = prompt("Please enter new auto-save speed in seconds.\n(Number from 0.2 to 300, inclusive)");
	if (newInterval != null) {
		newInterval = Number(newInterval);
		if (!isNaN(newInterval) && newInterval >= 0.2 && newInterval <= 300) {
			let newIntervalMs = newInterval * 1000
			game.autoSaveInterval = newIntervalMs;
			document.getElementById("autoSaveIntervalButton").innerHTML = "Auto Save<br>Interval<br>"+newInterval+"s";
			document.getElementById("autoSaveIntervalButton").style.backgroundColor = "green";
		} else {
			document.getElementById("autoSaveIntervalButton").style.backgroundColor = "red";
		}
	}
	setTimeout(function(){
		document.getElementById("autoSaveIntervalButton").style.backgroundColor = "";
	}, 250);
}

function toggleSaveMenu() {
	if (document.getElementById("saveMenu").style.width == "0px" || document.getElementById("saveMenu").style.width == "" ) {
		document.getElementById("saveMenu").style.width = "280px";
		document.getElementById("openSaveMenu").style.right = "280px";
	} else {
		document.getElementById("saveMenu").style.width = "0px";
		document.getElementById("openSaveMenu").style.right = "0px";
	}
}

function toggleUpgMenu() {
	if (document.getElementById("upgMenu").style.height == "0px" || document.getElementById("upgMenu").style.height == "" ) {
		document.getElementById("upgMenu").style.height = "200px";
		document.getElementById("openUpgMenu").style.top = "200px";
	} else {
		document.getElementById("upgMenu").style.height = "0px";
		document.getElementById("openUpgMenu").style.top = "0px";
	}
}

function pluralCheck(n) {
	return n == 1 ? "" : "s";
}

function newGame() {
	return {
		speed: 1,
		updateSpeed: 50,
		doAutoSave: true,
		autoSaveInterval: 1000,
		lifetimeProgress: 0,
		progress: 0,
		lifetimePoints: 0,
		timewallPoint: 0,
		upgradeAmount: [0,0,0,0],
	};
}

function redeemPoints() {
	if (game.progress >= getBarLength()) {
		game.timewallPoint += getPointGain();
		game.lifetimePoints += getPointGain();
		game.progress = mod(game.progress, getBarLength());
		updatePoints();
		updateUpg();
	}
}

function mod(a, b) {
	return a - Math.floor(a / b) * b;
}

function getUpgPrice(n) {
	return game.upgradeAmount[n] < upgrade.limit[n] ? upgrade.basePrice[n] * Math.pow(upgrade.priceGrowth[n], game.upgradeAmount[n]) : Infinity;
}

function buyUpgrade(n) {
	if (game.timewallPoint >= getUpgPrice(n) && game.upgradeAmount[n] < upgrade.limit[n]) {
		game.timewallPoint -= getUpgPrice(n);
		game.upgradeAmount[n]++;
		updateUpg();
		updatePoints();
	}
}

function getBarLength() {
	return 3.6e6 / Math.pow(2, game.upgradeAmount[0]);
}

function getBarSpeed() {
	return Math.pow(2, game.upgradeAmount[1]) / (game.progress < getBarLength() ? 1 : 10 - game.upgradeAmount[3]) * game.speed;
}

function getPointGain() {
	return Math.floor(game.progress / getBarLength() * Math.pow(2, game.upgradeAmount[2]));
}

function updateAll() {
	document.getElementById("autoSaveToggleButton").innerHTML = game.doAutoSave ? "Auto Save<br>ON" : "Auto Save<br>OFF";
	updateProgress();
	updatePoints();
	updateUpg();
}

function updateProgress() {
	document.getElementById("progressBar").value = game.progress;
	document.getElementById("progressBarLabel").innerHTML = format((game.progress / getBarLength() * 100)) + "%";
	document.getElementById("redeemButton").classList[game.lifetimeProgress >= getBarLength() ? "remove" : "add"]("hidden");
	document.getElementById("redeemButton").classList[game.progress >= getBarLength() ? "remove" : "add"]("disabled");
}

function updatePoints() {
	document.getElementById("timewallPoint").innerHTML = "You have "+format(game.timewallPoint)+" timewall point"+pluralCheck(game.timewallPoint)+".";
	document.getElementById("timewallPoint").classList[game.lifetimePoints >= 1 ? "remove" : "add"]("hidden");
	document.getElementById("openUpgMenu").classList[game.lifetimePoints >= 1 ? "remove" : "add"]("hidden");
}

function updateUpg() {
	for (let i = 0; i < 4; i++) {
		let newDesc = (getUpgPrice(i) != Infinity ? "Cost: "+format(getUpgPrice(i))+" Timewall Point"+pluralCheck(getUpgPrice(i)) : "Maxed Out")+"<br>Currently: ";
		if (getUpgPrice(i) == Infinity) setTimeout(function(){document.getElementById("upg"+i).style.maxWidth = 0;},1000);
		switch(i) {
			case 0:
				newDesc += "/" + format(Math.pow(2, game.upgradeAmount[0]));
				break;
			case 1:
			case 2:
				newDesc += format(Math.pow(2, game.upgradeAmount[i])) + "x";
				break;
			case 3:
				newDesc += "/" + format((10 - game.upgradeAmount[3]));
		}
		document.getElementById("upgDesc"+i).innerHTML = newDesc;
		document.getElementById("upg"+i).style.backgroundColor = "rgba(255,"+(game.timewallPoint>getUpgPrice(i)?"255,255":"200,200")+","+(isEven(i)?0.5:0.2)+")";
	}
	document.getElementById("progressBar").max = getBarLength();
}

function isEven(n) {
	return Math.floor(n/2) == n/2;
}

function format(n) {
	if (n == "Infinity") return Infinity;
	else if (n < 1e3) return n.toFixed(4);
	return n.toPrecision(5).replace("+","");
}

load();

updateAll();

window.requestAnimationFrame(nextFrame);
