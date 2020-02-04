var game = newGame();

function nextFrame(timeStamp) {
	let sinceLastFrame = timeStamp - lastFrame;
	let sinceLastSave = timeStamp - lastSave;
	if (sinceLastFrame >= game.updateSpeed) {
		lastFrame = timeStamp;
		game.progress += sinceLastFrame;
	}
	if (sinceLastSave >= game.autoSaveSpeed) {
		if (game.doAutoSave) {
			save();
		}
		lastSave = timeStamp;
	}
	window.requestAnimationFrame(nextFrame);
}

function save() {
	localStorage.setItem('twsave', JSON.stringify(game));
}

function load() {
	if (localStorage.getItem('twsave')) {
		let pastGame = JSON.parse(localStorage.getItem('twsave'));
		merge(game, pastGame);
	}
}

function merge(base, source) {
	for (let i in base) {
		if (source[i] != undefined) {
			if (typeof(base[i]) == "object" && typeof(source[i]) == "object") {
				merge(base[i], source[i]);
			} else {
				base[i] = source[i];
			}
		}
	}
}

function newGame() {
	return {
		updateSpeed: 50,
		doAutoSave: true,
		autoSaveSpeed: 1000,
		progress: 0
	};
}

load();

window.requestAnimationFrame(nextFrame);
