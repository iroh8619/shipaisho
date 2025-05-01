// Board Point

// var NON_PLAYABLE = "Non-Playable";
// var NEUTRAL = "Neutral";
// var RED = "Red";
// var WHITE = "White";
// var GATE = "Gate";

// var POSSIBLE_MOVE = "Possible Move";
// var OPEN_GATE = "OPEN GATE";

// var thinDot = "·";
// var thickDot = "•";
// var whiteDot = "◦";
// var gateDot = "⟡";

import { ACCENT_TILE, BASIC_FLOWER, SPECIAL_FLOWER } from '../GameData';
import {
  GATE,
  NEUTRAL,
  NON_PLAYABLE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { GUEST, HOST } from '../CommonNotationObjects';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';

export function CaptureBoardPoint() {
	this.types = [];
	this.row = -1;
	this.col = -1;
}

CaptureBoardPoint.prototype.addType = function(type) {
	if (!this.types.includes(type)) {
		this.types.push(type);
	}
};

CaptureBoardPoint.prototype.removeType = function(type) {
	for (var i = 0; i < this.types.length; i++) {
		if (this.types[i] === type) {
			this.types.splice(i, 1);
		}
	}
};

// CaptureBoardPoint.prototype.getConsoleDisplay = function() {
// 	if (this.tile) {
// 		return this.tile.getConsoleDisplay();
// 	} else {
// 		var consoleDisplay = thinDot;

// 		if (this.types.includes(NON_PLAYABLE)) {
// 			consoleDisplay = " ";
// 		}

// 		var str = "";

// 		if (this.types.includes(RED)) {
// 			str = "R";
// 			consoleDisplay = thickDot;
// 		}
// 		if (this.types.includes(WHITE)) {
// 			str += "W";
// 			consoleDisplay = whiteDot;
// 		}
// 		if (this.types.includes(NEUTRAL)) {
// 			str += "N";
// 		}

// 		if (this.types.includes(GATE)) {
// 			str = "G";
// 			consoleDisplay = gateDot;
// 		}

// 		if (str.length > 1) {
// 			consoleDisplay = "+";
// 		}

// 		return consoleDisplay;
// 	}
// };

CaptureBoardPoint.prototype.putTile = function(tile) {
	this.tile = tile;
};

CaptureBoardPoint.prototype.hasTile = function() {
	if (this.tile) {
		return true;
	}
	return false;
};

CaptureBoardPoint.prototype.isType = function(type) {
	return this.types.includes(type);
};

CaptureBoardPoint.prototype.isOpenGate = function() {
	return !this.hasTile() && this.types.includes(GATE);
};

CaptureBoardPoint.prototype.removeTile = function() {
	var theTile = this.tile;

	this.tile = null;

	return theTile;
};

CaptureBoardPoint.prototype.drainTile = function() {
	if (this.tile) {
		this.tile.drain();
	}
};

CaptureBoardPoint.prototype.restoreTile = function() {
	if (this.tile) {
		this.tile.restore();
	}
};

CaptureBoardPoint.prototype.canHoldTile = function(tile, ignoreTileCheck) {
	// Validate this point's ability to hold given tile

	if (this.isType(NON_PLAYABLE)) {
		return false;
	}

	if (!ignoreTileCheck && this.hasTile()) {
		// This function does not take into account capturing abilities
		return false;
	}

	if (tile.type === BASIC_FLOWER) {
		if (!(this.isType(NEUTRAL) || this.isType(tile.basicColorName))) {
			// Opposing colored point
			return false;
		}

		if (this.isType(GATE)) {
			return false;
		}

		return true;
	} else if (tile.type === SPECIAL_FLOWER) {
		return true;
	} else if (tile.type === ACCENT_TILE) {
		return true;
	}

	return false;
};

CaptureBoardPoint.prototype.betweenPlayerHarmony = function(player) {
	if (player === GUEST) {
		return this.betweenHarmonyGuest;
	} else if (player === HOST) {
		return this.betweenHarmonyHost;
	}
	return false;
};

CaptureBoardPoint.prototype.getCopy = function() {
	var copy = new CaptureBoardPoint();

	// this.types
	for (var i = 0; i < this.types.length; i++) {
		copy.types.push(this.types[i]);
	}

	// this.row
	copy.row = this.row;
	// this.col
	copy.col = this.col;

	// tile
	if (this.hasTile()) {
		copy.tile = this.tile.getCopy();
	}

	return copy;
};



// Point makers

CaptureBoardPoint.neutral = function() {
	var point = new CaptureBoardPoint();
	point.addType(NEUTRAL);

	return point;
};

CaptureBoardPoint.gate = function() {
	var point = new CaptureBoardPoint();
	point.addType(GATE);

	return point;
};

CaptureBoardPoint.red = function() {
	var point = new CaptureBoardPoint();
	point.addType(RED);

	return point;
};

CaptureBoardPoint.white = function() {
	var point = new CaptureBoardPoint();
	point.addType(WHITE);

	return point;
};

CaptureBoardPoint.redWhite = function() {
	var point = new CaptureBoardPoint();
	point.addType(RED);
	point.addType(WHITE);

	return point;
};

CaptureBoardPoint.redWhiteNeutral = function() {
	var point = new CaptureBoardPoint();
	point.addType(RED);
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};

CaptureBoardPoint.redNeutral = function() {
	var point = new CaptureBoardPoint();
	point.addType(RED);
	point.addType(NEUTRAL);

	return point;
};

CaptureBoardPoint.whiteNeutral = function() {
	var point = new CaptureBoardPoint();
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};



