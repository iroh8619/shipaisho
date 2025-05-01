/* Street Pai Sho Tile */

import {
  BONUS_MOVEMENT_5,
  BONUS_MOVEMENT_BASED_ON_NUM_CAPTIVES,
  gameOptionEnabled,
} from '../GameOptions';
import { GUEST, HOST } from '../CommonNotationObjects';
import { debug } from '../GameData';
import { tileIdIncrement } from '../skud-pai-sho/SkudPaiShoTile';

export function StreetTile(ownerCode) {
	this.code = "L";
	this.ownerCode = ownerCode;
	if (this.ownerCode === 'G') {
		this.ownerName = GUEST;
	} else if (this.ownerCode === 'H') {
		this.ownerName = HOST;
	} else {
		debug("INCORRECT OWNER CODE");
	}
	this.id = tileIdIncrement();
	this.selectedFromPile = false;
}

StreetTile.baseMoveDistance = 4;

StreetTile.prototype.getConsoleDisplay = function() {
	return this.ownerCode + "" + this.code;
};

StreetTile.prototype.getImageName = function() {
	return this.ownerCode + "" + this.code;
};

StreetTile.prototype.getMoveDistance = function() {
	if (this.capturedTile) {
		if (gameOptionEnabled(BONUS_MOVEMENT_BASED_ON_NUM_CAPTIVES)) {
			return StreetTile.baseMoveDistance + this.getNumCaptivesInStack();
		} else if (gameOptionEnabled(BONUS_MOVEMENT_5)) {
			return 5;
		}
	}
	return StreetTile.baseMoveDistance;
};

StreetTile.prototype.getNumCaptivesInStack = function() {
	if (this.capturedTile) {
		return this.capturedTile.getNumCaptivesInStack() + 1;
	}
	return 0;
};

StreetTile.prototype.formsHarmonyWith = function(otherTile) {
	// Tiles must belong to same player
	if (otherTile.ownerName !== this.ownerName) {
		return false;
	}

	return true;
};

StreetTile.prototype.captureTile = function(otherTile) {
	if (this.capturedTile) {
		debug("Error - already has captured tile");
	}

	this.capturedTile = otherTile;
};

StreetTile.prototype.releaseCapturedTile = function() {
	var theCapturedTile = this.capturedTile;
	this.capturedTile = null;
	return theCapturedTile;
};

StreetTile.prototype.getName = function() {
	return StreetTile.getTileName(this.code);
};

StreetTile.getTileName = function(tileCode) {
	var name = "Tile";

	return name;
};

StreetTile.prototype.getCopy = function() {
	return new StreetTile(this.ownerCode);
};


