import { AdevarOptions } from './AdevarOptions';
import { AdevarTileManager } from './AdevarTileManager';
import { GUEST, HOST } from '../CommonNotationObjects';
import { tileIdIncrement } from "../skud-pai-sho/SkudPaiShoTile";

export var AdevarTileType = {
	basic: "Basic",
	gate: "Gate",
	hiddenTile: "Hidden Tile",
	secondFace: "Second Face",
	vanguard: "Vanguard",
	reflection: "Reflection"
};

export var AdevarTileCode = {
	blankHiddenTile: "HiddenTile",
	lilac: "Lilac",
	zinnia: "Zinnia",
	foxglove: "Foxglove",
	gate: "Gate",
	gateHome: "GateHome",
	gateAway: "GateAway",
	vanguard: "Vanguard",
	reflection: "WatersReflection",
	iris: "Iris",
	irisSF: "IrisSecondFace",
	orientalLily: "OrientalLily",
	orientalLilySF: "OrientalLilySecondFace",
	echeveria: "Echeveria",
	echeveriaSF: "EcheveriaSecondFace",
	whiteLotus: "WhiteLotus",
	whiteLotusSF: "WhiteLotusSecondFace",
	birdOfParadise: "BirdOfParadise",
	birdOfParadiseSF: "BirdOfParadiseSecondFace",
	// echinacea: "Echinacea",
	// echinaceaSF: "EchinaceaSecondFace",
	whiteRose: "WhiteRose",
	whiteRoseSF: "WhiteRoseSecondFace",
	blackOrchid: "BlackOrchid",
	blackOrchidSF: "BlackOrchidSecondFace"
};

export var AdevarTileNames = {
	blankHiddenTile: "Hidden Tile",
	lilac: "Lilac",
	zinnia: "Zinnia",
	foxglove: "Foxglove",
	gate: "Gate",
	gateHome: "Home Gate",
	gateAway: "Away Gate",
	vanguard: "Vanguard",
	reflection: "Water's Reflection",
	iris: "Iris",
	irisSF: "Iris Second Face",
	orientalLily: "Oriental Lily",
	orientalLilySF: "Oriental Lily Second Face",
	echeveria: "Echeveria",
	echeveriaSF: "Echeveria Second Face",
	whiteLotus: "White Lotus",
	whiteLotusSF: "White Lotus Second Face",
	birdOfParadise: "Bird Of Paradise",
	birdOfParadiseSF: "Bird Of Paradise Second Face",
	// echinacea: "Echinacea",
	// echinaceaSF: "Echinacea Second Face",
	whiteRose: "White Rose",
	whiteRoseSF: "White Rose Second Face",
	blackOrchid: "Black Orchid",
	blackOrchidSF: "Black Orchid Second Face"
};

export var AdevarInSpaceAlternateNames = {
	blankHiddenTile: "Hidden Tile",
	lilac: "A-3 \"Lilac\"",
	zinnia: "P-4 \"Zinnia\"",
	foxglove: "S-5 \"Foxglove\"",
	gate: "Space-Gate Station",
	gateHome: "Home Space-Gate Station",
	gateAway: "Away Space-Gate Station",
	vanguard: "Vanguard Moon",
	reflection: "Reflection Comet",
	iris: "Saturn: Mission \"Iris\"",
	irisSF: "Saturn's Dark Side: \"Iris\"",
	orientalLily: "Venus: Mission \"Oriental Lily\"",
	orientalLilySF: "Venus's Dark Side: \"Oriental Lily\"",
	echeveria: "Mars: Mission \"Echeveria\"",
	echeveriaSF: "Mars' Dark Side: \"Echeveria\"",
	whiteLotus: "Earth: Mission \"White Lotus\"",
	whiteLotusSF: "Earth's Dark Side: \"White Lotus\"",
	birdOfParadise: "Uranus: Mission \"Bird Of Paradise\"",
	birdOfParadiseSF: "Uranus' Dark Side: \"Bird Of Paradise\"",
	whiteRose: "Mercury: Mission \"White Rose\"",
	whiteRoseSF: "Mercury's Dark Side: \"White Rose\"",
	blackOrchid: "Jupiter: Mission \"Black Orchid\"",
	blackOrchidSF: "Jupiter's Dark Side: \"Black Orchid\""
};

export function AdevarTile(code, ownerCode) {
	this.code = code;
	this.ownerCode = ownerCode;
	if (this.ownerCode === 'G') {
		this.ownerName = GUEST;
	} else if (this.ownerCode === 'H') {
		this.ownerName = HOST;
	}
	this.id = tileIdIncrement();
	this.drained = false;
	this.selectedFromPile = false;
	this.hidden = false;

	switch (code) {
		case AdevarTileCode.blankHiddenTile:
		case AdevarTileCode.iris:
		case AdevarTileCode.orientalLily:
		case AdevarTileCode.whiteLotus:
		case AdevarTileCode.birdOfParadise:
		case AdevarTileCode.blackOrchid:
		case AdevarTileCode.whiteRose:
		case AdevarTileCode.echeveria:
			this.type = AdevarTileType.hiddenTile;
			break;
		case AdevarTileCode.irisSF:
		case AdevarTileCode.orientalLilySF:
		case AdevarTileCode.whiteLotusSF:
		case AdevarTileCode.birdOfParadiseSF:
		case AdevarTileCode.blackOrchidSF:
		case AdevarTileCode.whiteRoseSF:
		case AdevarTileCode.echeveriaSF:
			this.type = AdevarTileType.secondFace;
			break;
		case AdevarTileCode.lilac:
		case AdevarTileCode.zinnia:
		case AdevarTileCode.foxglove:
			this.type = AdevarTileType.basic;
			break;
		case AdevarTileCode.gate:
			this.type = AdevarTileType.gate;
			break;
		case AdevarTileCode.gateHome:
			this.type = AdevarTileType.gate;
			break;
		case AdevarTileCode.gateAway:
			this.type = AdevarTileType.gate;
			break;
		case AdevarTileCode.vanguard:
			this.type = AdevarTileType.vanguard;
			break;
		case AdevarTileCode.reflection:
			this.type = AdevarTileType.reflection;
			break;
	}
	
}

AdevarTile.prototype.getConsoleDisplay = function() {
	return this.ownerCode + "" + this.code;
};

AdevarTile.prototype.getImageName = function() {
	var codeToUse = this.hidden ? "Back" : this.code;
	if (codeToUse === AdevarTileCode.gateHome || codeToUse === AdevarTileCode.gateAway) {
		codeToUse = AdevarTileCode.gate;
	}
	return this.ownerCode + "" + codeToUse;
};

AdevarTile.prototype.getNotationName = function() {
	return this.ownerCode + "" + this.code;
};

AdevarTile.prototype.getMovementInfo = function() {
	return {
		distance: this.getMoveDistance()
	}
};

AdevarTile.prototype.getMoveDistance = function() {
	if (this.code === AdevarTileCode.foxglove) {	// Gives the Foxglove 5 spaces of movement
		return 5;
	} else if (this.code === AdevarTileCode.zinnia) {	// Gives the Zinnia 4 spaces of movement
		return 4;
	} else if (this.code === AdevarTileCode.lilac) {		// Gives the Lilac 3 spaces of movement
		return 3;
	} else if (this.type === AdevarTileType.reflection) {
		return 5;
	} else if (this.type === AdevarTileType.secondFace) {	// Gives the Second Faces tiles 7 spaces of movement
		return 7;
	}
	return 0;	// Other tiles cannot move
};

AdevarTile.prototype.canCapture = function(targetTile) {
	if (this.ownerName !== targetTile.ownerName) {
		if (this.type === AdevarTileType.basic
				&& targetTile.type === AdevarTileType.basic
				&& targetTile.code !== this.code) {
			return true;
		} else if (this.code === AdevarTileCode.foxglove
				&& targetTile.type === AdevarTileType.reflection) {
			return true;
		} else if (this.type === AdevarTileType.reflection
				&& targetTile.type === AdevarTileType.secondFace) {
			return true;
		} else if (this.type === AdevarTileType.secondFace
				&& targetTile.type === AdevarTileType.vanguard) {
			return true;
		} else if (this.type === AdevarTileType.secondFace
				&& targetTile.type === AdevarTileType.hiddenTile
				&& AdevarTile.hiddenTileMatchesSecondFace(targetTile, this)) {
			return true;
		}
	} else if (this.type === AdevarTileType.reflection 
				&& targetTile.code === AdevarTileCode.gateAway) {
		return true;
	}

	return false;
};

AdevarTile.hiddenTileMatchesSecondFace = function(hiddenTile, secondFaceTile) {
	return AdevarTileManager.htSfMap.lookup(hiddenTile.code) === secondFaceTile.code;
};

AdevarTile.prototype.reveal = function() {
	this.hidden = false;
};

AdevarTile.prototype.getName = function() {
	return AdevarTile.getTileName(this.code);
};

AdevarTile.prototype.formsHarmonyWith = function(otherTile) {
	return otherTile 
		&& this.type === AdevarTileType.basic && otherTile.type === AdevarTileType.basic
		&& this.ownerName === otherTile.ownerName
		&& this.getMoveDistance() !== otherTile.getMoveDistance();
};

AdevarTile.prototype.getCopy = function() {
	return new AdevarTile(this.code, this.ownerCode);
};

AdevarTile.getTileCodeKey = function(tileCode) {
	var tileCodeKey = null;
	Object.keys(AdevarTileCode).forEach(function(key,index) {
		if (AdevarTileCode[key] === tileCode) {
			tileCodeKey = key;
		}
	});
	return tileCodeKey;
};

AdevarTile.getTileName = function(tileCode) {
	var tileName = AdevarTileNames[AdevarTile.getTileCodeKey(tileCode)];

	if (AdevarOptions.isSpaceTiles()) {
		tileName = AdevarInSpaceAlternateNames[AdevarTile.getTileCodeKey(tileCode)];
	}

	return tileName;
};
