// Capture Pai Sho Tile


import { GUEST, HOST } from '../CommonNotationObjects';
import { debug } from '../GameData';
import { tileId, tileIdIncrement } from '../skud-pai-sho/SkudPaiShoTile';

export function CaptureTile(code, ownerCode) {
	this.code = code;
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

CaptureTile.prototype.getImageName = function() {
	return this.ownerCode + "" + this.code;
};

CaptureTile.prototype.getMoveDistance = function() {
	return 3;
};

CaptureTile.prototype.getName = function() {
	return CaptureTile.getTileName(this.code);
};

CaptureTile.prototype.canCapture = function(otherTile) {
	if (otherTile.ownerCode !== this.ownerCode) {
		// Can only capture other player's tiles...
		var tileOrder = ['A','V','B','P','F','U','K','L','D','M','T','O'];
		var thisIndex = tileOrder.indexOf(this.code);
		// If index of otherTile is one of the next three, then capture
		var otherIndex = tileOrder.indexOf(otherTile.code);

		if (thisIndex > otherIndex) {
			otherIndex += tileOrder.length;
		}

		return otherIndex !== thisIndex && otherIndex - thisIndex <= 3;
	} else {
		return false;
	}
};

CaptureTile.prototype.getCopy = function() {
	return new CaptureTile(this.code, this.ownerCode);
};


CaptureTile.getTileName = function(tileCode) {
	var name = "";
	
	if (tileCode === 'A') {
		name = "Dai Li Agent";
	} else if (tileCode === 'V') {
		name = "Vaatu";
	} else if (tileCode === 'B') {
		name = "Flying Boar";
	} else if (tileCode === 'P') {
		name = "Piandao";
	} else if (tileCode === 'F') {
		name = "Spirit Oasis Fish";
	} else if (tileCode === 'U') {
		name = "Unagi";
	} else if (tileCode === 'K') {
		name = "Kyoshi Warrior";
	} else if (tileCode === 'L') {
		name = "Lotus";
	} else if (tileCode === 'D') {
		name = "Dragon";
	} else if (tileCode === 'M') {
		name = "Air Monk";
	} else if (tileCode === 'T') {
		name = "Tree of Time";
	} else if (tileCode === 'O') {
		name = "Owl Spirit";
	}

	return name;
};


