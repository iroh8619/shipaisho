// Vababond Board Point

import {
  ACCENT_TILE,
  BASIC_FLOWER,
  SPECIAL_FLOWER,
  arrayIncludesOneOf,
  debug,
} from '../GameData';
import {
  GATE,
  NEUTRAL,
  NON_PLAYABLE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { GUEST, HOST, RowAndColumn } from '../CommonNotationObjects';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { BeyondTheMapsTileType } from '../beyond-the-maps/BeyondTheMapsTile';

export var TEMPLE = GATE;

export function TrifleBoardPoint() {
	this.types = [];
	this.row = -1;
	this.col = -1;
	this.possibleMoveTypes = [];
	this.moveDistanceRemaining = {};
	this.possibleMovementPaths = [];
	this.previousMovePointsForMovement = {};
	this.previousMovePoint = null;
}

TrifleBoardPoint.prototype.setRowAndCol = function(row, col) {
	this.row = row;
	this.col = col;
	this.rowAndCol = new RowAndColumn(this.row, this.col);
	this.rowAndColumn = this.rowAndCol;
};

TrifleBoardPoint.prototype.addType = function(type) {
	if (!this.types.includes(type)) {
		this.types.push(type);
	}
};

TrifleBoardPoint.prototype.removeType = function(type) {
	for (var i = 0; i < this.types.length; i++) {
		if (this.types[i] === type) {
			this.types.splice(i, 1);
		}
	}
};

// TrifleBoardPoint.prototype.getConsoleDisplay = function() {
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

TrifleBoardPoint.prototype.putTile = function(tile) {
	this.tile = tile;
};

TrifleBoardPoint.prototype.hasTile = function() {
	if (this.tile) {
		return true;
	}
	return false;
};

TrifleBoardPoint.prototype.isType = function(type) {
	return this.types.includes(type);
};

TrifleBoardPoint.prototype.isOneOrMoreOfTheseTypes = function(types) {
	return arrayIncludesOneOf(this.types, types);
};

TrifleBoardPoint.prototype.setPossibleForMovementType = function(movementInfo) {
	var movementTypeToAdd = TrifleBoardPoint.getMovementType(movementInfo);
	if (!this.possibleMoveTypes.includes(movementTypeToAdd)) {
		this.possibleMoveTypes.push(movementTypeToAdd);
	}
};
TrifleBoardPoint.prototype.isPossibleForMovementType = function(movementInfo) {
	var movementTypeToCheck = TrifleBoardPoint.getMovementType(movementInfo);
	return this.possibleMoveTypes.includes(movementTypeToCheck);
};
TrifleBoardPoint.prototype.clearPossibleMovementTypes = function() {
	this.possibleMoveTypes = [];
	this.moveDistanceRemaining = {};
	this.previousMovePointsForMovement = {};
	this.previousMovePoint = null;
};
TrifleBoardPoint.prototype.clearPossibleMovementPaths = function() {
	this.possibleMovementPaths = [];
	this.previousMovePointsForMovement = {};
	this.previousMovePoint = null;
};
TrifleBoardPoint.prototype.addPossibleMovementPath = function(movementPath) {
	this.possibleMovementPaths.push(movementPath);
};
TrifleBoardPoint.prototype.getOnlyPossibleMovementPath = function() {
	if (this.possibleMovementPaths && this.possibleMovementPaths.length === 1) {
		return this.possibleMovementPaths[0];
	}
};
TrifleBoardPoint.prototype.setMoveDistanceRemaining = function(movementInfo, distanceRemaining) {
	var movementType = TrifleBoardPoint.getMovementType(movementInfo);
	this.moveDistanceRemaining[movementType] = distanceRemaining;
};
TrifleBoardPoint.prototype.getMoveDistanceRemaining = function(movementInfo) {
	var movementType = TrifleBoardPoint.getMovementType(movementInfo);
	return this.moveDistanceRemaining[movementType];
};
TrifleBoardPoint.getMovementType = function(movementInfo) {
	return movementInfo.title ? movementInfo.title : movementInfo.type;
};
TrifleBoardPoint.prototype.setPreviousPointForMovement = function(movementInfo, previousPoint) {
	var movementType = TrifleBoardPoint.getMovementType(movementInfo);
	if (previousPoint !== this && previousPoint.previousMovePointsForMovement[movementType] !== this) {
		this.previousMovePointsForMovement[movementType] = previousPoint;
	}
};
TrifleBoardPoint.prototype.setPreviousPoint = function(previousPoint) {
	this.previousMovePoint = previousPoint;
};

TrifleBoardPoint.prototype.buildMovementPath = function() {
	this.movementPath = [];

	if (this.previousMovePoint) {
		this.movementPath = this.previousMovePoint.buildMovementPath().concat(this);
	} else {
		this.movementPath = [this];
	}

	return this.movementPath;
};

TrifleBoardPoint.prototype.buildMovementPathsInfo = function() {
	this.movementPathForMoveTypes = {};

	Object.keys(this.previousMovePointsForMovement).forEach((key,index) => {
		var prevPoint = this.previousMovePointsForMovement[key];
		if (prevPoint) {
			var prevPointMovePathInfo = prevPoint.buildMovementPathsInfo();
			var prevPointMovePath = prevPointMovePathInfo[key];
			if (prevPointMovePath) {
				this.movementPathForMoveTypes[key] = prevPointMovePath.concat(this);
			}
		} else {
			debug("bad?");
		}
	});

	return this.movementPathForMoveTypes;

	// var movementPaths = {};

	// Object.keys(this.previousMovePointsForMovement).forEach((key,index) => {
	// 	var prevPoint = this.previousMovePointsForMovement[key];
	// 	if (prevPoint && prevPoint !== this) {
	// 		var prevMovementPathsInfo = prevPoint.buildMovementPathsInfo();
	// 		if (prevMovementPathsInfo[key]) {
	// 			movementPaths[key] = prevMovementPathsInfo[key].concat(this);
	// 		}
	// 	} else {
	// 		movementPaths[key] = [this];
	// 	}
	// });

	// return movementPaths;
};

TrifleBoardPoint.prototype.isOpenGate = function() {
	return !this.hasTile() && this.types.includes(GATE);
};

TrifleBoardPoint.prototype.removeTile = function() {
	var theTile = this.tile;

	this.tile = null;

	return theTile;
};

TrifleBoardPoint.prototype.drainTile = function() {
	if (this.tile) {
		this.tile.drain();
	}
};

TrifleBoardPoint.prototype.restoreTile = function() {
	if (this.tile) {
		this.tile.restore();
	}
};

TrifleBoardPoint.prototype.canHoldTile = function(tile, ignoreTileCheck) {
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

TrifleBoardPoint.prototype.betweenPlayerHarmony = function(player) {
	if (player === GUEST) {
		return this.betweenHarmonyGuest;
	} else if (player === HOST) {
		return this.betweenHarmonyHost;
	}
	return false;
};

TrifleBoardPoint.prototype.getNotationPointString = function() {
	return this.rowAndCol.notationPointString;
};

TrifleBoardPoint.prototype.getCopy = function() {
	var copy = new TrifleBoardPoint();

	// this.types
	for (var i = 0; i < this.types.length; i++) {
		copy.types.push(this.types[i]);
	}

	copy.setRowAndCol(this.row, this.col);

	// tile
	if (this.hasTile()) {
		copy.tile = this.tile.getCopy();
	}

	return copy;
};

TrifleBoardPoint.prototype.getDebugPrintStr = function() {
	if (this.hasTile()) {
		if (this.tile.ownerName === GUEST) {
			if (this.tile.tileType === BeyondTheMapsTileType.LAND) {
				return "●";
			} else if (this.tile.tileType === BeyondTheMapsTileType.SHIP) {
				return '♞'; // 's'
			}
		} else if (this.tile.ownerName === HOST) {
			if (this.tile.tileType === BeyondTheMapsTileType.LAND) {
				return "◯";
			} else if (this.tile.tileType === BeyondTheMapsTileType.SHIP) {
				return '♘';	// 'S'
			}
		}
		return "X";
	} else {
		return "·";
	}
};



// Point makers

TrifleBoardPoint.neutral = function() {
	var point = new TrifleBoardPoint();
	point.addType(NEUTRAL);

	return point;
};

TrifleBoardPoint.gate = function() {
	var point = new TrifleBoardPoint();
	point.addType(GATE);

	return point;
};

TrifleBoardPoint.red = function() {
	var point = new TrifleBoardPoint();
	point.addType(RED);

	return point;
};

TrifleBoardPoint.white = function() {
	var point = new TrifleBoardPoint();
	point.addType(WHITE);

	return point;
};

TrifleBoardPoint.redWhite = function() {
	var point = new TrifleBoardPoint();
	point.addType(RED);
	point.addType(WHITE);

	return point;
};

TrifleBoardPoint.redWhiteNeutral = function() {
	var point = new TrifleBoardPoint();
	point.addType(RED);
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};

TrifleBoardPoint.redNeutral = function() {
	var point = new TrifleBoardPoint();
	point.addType(RED);
	point.addType(NEUTRAL);

	return point;
};

TrifleBoardPoint.whiteNeutral = function() {
	var point = new TrifleBoardPoint();
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};



