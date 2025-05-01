// Tile

import {
  ACCENT_TILE,
  BASIC_FLOWER,
  BOAT,
  KNOTWEED,
  ORCHID,
  ROCK,
  SPECIAL_FLOWER,
  WHEEL,
  WHITE_LOTUS,
  debug,
} from '../GameData';
import { GUEST, HOST } from '../CommonNotationObjects';
import { RED, WHITE, tileIdIncrement } from '../skud-pai-sho/SkudPaiShoTile';
import { UNDERGROWTH_SIMPLE, gameOptionEnabled } from '../GameOptions';

export const UndergrowthSIMPLE_TILE = "SimpleTile";

export function UndergrowthTile(code, ownerCode, isSimple) {
	this.code = code;
	this.ownerCode = ownerCode;
	if (this.ownerCode === 'G') {
		this.ownerName = GUEST;
		this.opponentName = HOST;
	} else if (this.ownerCode === 'H') {
		this.ownerName = HOST;
		this.opponentName = GUEST;
	} else {
		debug("INCORRECT OWNER CODE");
	}
	this.id = tileIdIncrement();
	this.drained = false;
	this.selectedFromPile = false;

	if (isSimple && gameOptionEnabled(UNDERGROWTH_SIMPLE)) {
		this.type = UndergrowthSIMPLE_TILE;
	} else if (this.code.length === 2 && (this.code.includes('R') || this.code.includes('W'))) {
		this.type = BASIC_FLOWER;
		this.basicColorCode = this.code.charAt(0);
		this.basicValue = this.code.charAt(1);
		if (this.basicColorCode === 'R') {
			this.basicColorName = RED;
		} else if (this.basicColorCode === 'W') {
			this.basicColorName = WHITE;
		}
	} else if (this.code === 'L' || this.code === 'O') {
		this.type = SPECIAL_FLOWER;
		this.setSpecialFlowerInfo();
	} else if (this.code === 'R' || this.code === 'W' || this.code === 'K' || this.code === 'B') {
		this.type = ACCENT_TILE;
		this.setAccentInfo();
	} else {
		debug("Error: Unknown tile type");
	}
}

UndergrowthTile.prototype.setAccentInfo = function() {
	if (this.code === 'R') {
		this.accentType = ROCK;
	} else if (this.code === 'W') {
		this.accentType = WHEEL;
	} else if (this.code === 'K') {
		this.accentType = KNOTWEED;
	} else if (this.code === 'B') {
		this.accentType = BOAT;
	}
};

UndergrowthTile.prototype.setSpecialFlowerInfo = function() {
	if (this.code === 'L') {
		this.specialFlowerType = WHITE_LOTUS;
	} else if (this.code === 'O') {
		this.specialFlowerType = ORCHID;
	}
};

UndergrowthTile.prototype.getConsoleDisplay = function() {
	if (!this.drained) {
		return this.ownerCode + "" + this.code;
	} else {
		return "*" + this.code;
	}
};

UndergrowthTile.prototype.getImageName = function() {
	return this.ownerCode + "" + this.code;
};

UndergrowthTile.prototype.formsHarmonyWith = function(otherTile) {
	if (!otherTile) {
		return false;
	}

	if (gameOptionEnabled(UNDERGROWTH_SIMPLE)) {
		if (this.ownerCode === otherTile.ownerCode) {
			return true;
		} else {
			return false;
		}
	}

	if ((this.code === 'L' && otherTile.code === 'O') 
		|| (otherTile.code === 'L' && this.code === 'O')) {
		return true;
	}

	if (!(this.type === BASIC_FLOWER || this.code === 'L' || this.code === 'O')
		|| !(otherTile.type === BASIC_FLOWER || otherTile.code === 'L' || this.code === 'O')) {
		// debug("One of the tiles must be Basic Flower to form Harmony");
		return false;
	}

	if ((this.code === 'L' && otherTile.type !== BASIC_FLOWER)
		|| (otherTile.code === 'L' && this.type !== BASIC_FLOWER)) {
		return false;
	}

	// Check White Lotus (Lotus can belong to either player)
	if ((this.code === 'L' && otherTile.type !== ACCENT_TILE) 
		|| (otherTile.code === 'L' && this.type !== ACCENT_TILE)) {
		return true;
	}

	// For normal Harmonies, tiles must belong to same player
	if (otherTile.ownerName !== this.ownerName) {
		return false;
	}

	/* Orchid harmonizes with all same-player's tiles */
	if ((this.code === 'O' && otherTile.type !== ACCENT_TILE) 
		|| (otherTile.code === 'O' && this.type !== ACCENT_TILE)) {
		return true;
	}

	// Same color and number difference of 1
	if (this.basicColorCode === otherTile.basicColorCode && Math.abs(this.basicValue - otherTile.basicValue) === 1) {
		return true;
		// if not that, check different color and number difference of 2?
	} else if (this.basicColorCode !== otherTile.basicColorCode && Math.abs(this.basicValue - otherTile.basicValue) === 2) {
		return true;
	}

	if (this.type !== otherTile.type) {
		// If tiles are different types, then one must be a lotus and the other not
		return true;
	}
};

UndergrowthTile.prototype.clashesWith = function(otherTile) {
	if (!otherTile) {
		return false;
	}

	if (gameOptionEnabled(UNDERGROWTH_SIMPLE)) {
		return this.ownerCode !== otherTile.ownerCode;
	}
	
	if (this.type === ACCENT_TILE || otherTile.type === ACCENT_TILE) {
		return false;
	}
	
	if (this.specialFlowerType === ORCHID || otherTile.specialFlowerType === ORCHID) {
		return true;
	}

	return (this.type === BASIC_FLOWER && otherTile.type === BASIC_FLOWER 
		&& this.basicValue === otherTile.basicValue);
};

UndergrowthTile.prototype.getName = function() {
	return UndergrowthTile.getTileName(this.code);
};

UndergrowthTile.prototype.getCopy = function() {
	return new UndergrowthTile(this.code, this.ownerCode);
};


UndergrowthTile.getTileName = function(tileCode) {
	var name = "";
	
	if (tileCode.length > 1) {
		var colorCode = tileCode.charAt(0);
		var tileNum = tileCode.charAt(1);

		if (colorCode === 'R') {
			if (tileNum === '3') {
				name = "Rose";
			} else if (tileNum === '4') {
				name = "Chrysanthemum";
			} else if (tileNum === '5') {
				name = "Rhododendron";
			}
			name += " (Red " + tileNum + ")";
		} else if (colorCode === 'W') {
			if (tileNum === '3') {
				name = "Jasmine";
			} else if (tileNum === '4') {
				name = "Lily";
			} else if (tileNum === '5') {
				name = "White Jade";
			}
			name += " (White " + tileNum + ")";
		}
	} else {
		if (tileCode === 'R') {
			name = "Rock";
		} else if (tileCode === 'W') {
			name = "Wheel";
		} else if (tileCode === 'K') {
			name = "Knotweed";
		} else if (tileCode === 'B') {
			name = "Boat";
		} else if (tileCode === 'O') {
			name = "Orchid";
		} else if (tileCode === 'L') {
			name = "White Lotus";
		}
	}

	return name;
};






