// Hexentafl Notation

// --------------------------------------------- // 

import { BRAND_NEW } from '../PaiShoMain';
import { GUEST, HOST, INITIAL_SETUP, MOVE } from '../CommonNotationObjects';
import { HexentaflVars, setHexentaflVars } from './HexentaflController';
import { debug } from '../GameData';

export function HexentaflNotationMove(text) {
	this.fullMoveText = text;
	this.analyzeMove();
}

HexentaflNotationMove.prototype.analyzeMove = function() {
	this.valid = true;

	// Get move number
	var parts = this.fullMoveText.split(".");

	var moveNumAndPlayer = parts[0];

	this.moveNum = parseInt(moveNumAndPlayer.slice(0, -1));
    this.playerCode = moveNumAndPlayer.charAt(moveNumAndPlayer.length - 1);

    // Get player (Attackers or Defenders)
	if (this.playerCode === 'A') {
		this.player = HexentaflVars.ATTACKERS_PLAYER;
	} else if (this.playerCode === 'D') {
		this.player = HexentaflVars.DEFENDERS_PLAYER;
	}

	var moveText = parts[1];

	// If no move text...
	if (!moveText) {
		this.valid = false;
		return;
	}

	if (moveText.includes('-')) {
		this.moveType = MOVE;
		// Move string like: 'Ka2-a1' or just 'a2-a1'
		parts = moveText.split('-');

		if (parts[0].charAt(0) === 'K') {
			this.isKingMove = true;
			parts[0] = parts[0].substring(1);
		}
		this.startPoint = parts[0];
		this.endPoint = parts[1];
	} else {
		this.moveType = INITIAL_SETUP;
		this.boardSetupCode = moveText;
	}
};

HexentaflNotationMove.prototype.isValidNotation = function() {
	return this.valid;
};

HexentaflNotationMove.prototype.equals = function(otherMove) {
	return this.fullMoveText === otherMove.fullMoveText;
};



// --------------------------------------- //

export function HexentaflNotationBuilder() {
	this.isKingMove;
	this.startPoint;
	this.endPoint;

	this.status = BRAND_NEW;
}

HexentaflNotationBuilder.prototype.getNotationMove = function(moveNum, player) {
	var playerChar = "A";
	if (player === HexentaflVars.DEFENDERS_PLAYER) {
		playerChar = "D";
	}
	var notationLine = moveNum + playerChar + ".";
	if (this.isKingMove) {
		notationLine += "K";
	}
	if (this.startPoint && this.endPoint) {
		notationLine += this.startPoint + "-" + this.endPoint;
	}
	
	return new HexentaflNotationMove(notationLine);
};

HexentaflNotationBuilder.prototype.moveComplete = function() {
	return this.startPoint && this.endPoint;
};

// --------------------------------------- //



export function HexentaflGameNotation() {
	this.notationText = "";
	this.moves = [];
}

HexentaflGameNotation.prototype.setNotationText = function(text) {
	this.notationText = text;
	this.loadMoves();
};

HexentaflGameNotation.prototype.addNotationLine = function(text) {
	this.notationText += ";" + text.trim();
	this.loadMoves();
};

HexentaflGameNotation.prototype.addMove = function(move) {
	if (this.notationText) {
		this.notationText += ";" + move.fullMoveText;
	} else {
		this.notationText = move.fullMoveText;
	}
	this.loadMoves();
};

HexentaflGameNotation.prototype.removeLastMove = function() {
	this.notationText = this.notationText.substring(0, this.notationText.lastIndexOf(";"));
	this.loadMoves();
};

HexentaflGameNotation.prototype.getPlayerMoveNum = function() {
	var moveNum = 0;
	var lastMove = this.moves[this.moves.length-1];

	if (lastMove) {
		moveNum = lastMove.moveNum;
		if (lastMove.player === GUEST) {
			moveNum++;
		}
	}
	return moveNum;
};

HexentaflGameNotation.prototype.getNotationMoveFromBuilder = function(builder) {
	var moveNum = 0;
	var player = HOST;

	var lastMove = this.moves[this.moves.length-1];

	if (lastMove) {
		moveNum = lastMove.moveNum;
		if (lastMove.player === GUEST) {
			moveNum++;
		} else {
			player = GUEST;
		}
	}

	return builder.getNotationMove(moveNum, player);
};

HexentaflGameNotation.prototype.loadMoves = function() {
	this.moves = [];
	var lines = [];
	if (this.notationText) {
		if (this.notationText.includes(';')) {
			lines = this.notationText.split(";");
		} else {
			lines = [this.notationText];
		}
	}

	var self = this;
	var lastPlayer = GUEST;
	var firstMove = new HexentaflNotationMove(lines[0]);
	if (firstMove.player === GUEST) {
		var newAttacker = HexentaflVars.DEFENDERS_PLAYER;
		var newDefender = HexentaflVars.ATTACKERS_PLAYER;
		setHexentaflVars({
			DEFENDERS_PLAYER: newDefender,
			ATTACKERS_PLAYER: newAttacker
		});
	}
	lines.forEach(function(line) {
		var move = new HexentaflNotationMove(line);
		if (move.isValidNotation() && move.player !== lastPlayer) {
			self.moves.push(move);
			lastPlayer = move.player;
		} else {
			debug("the player check is broken?");
		}
	});
};

HexentaflGameNotation.prototype.getNotationHtml = function() {
	var lines = [];
	if (this.notationText) {
		if (this.notationText.includes(';')) {
			lines = this.notationText.split(";");
		} else {
			lines = [this.notationText];
		}
	}

	var notationHtml = "";

	lines.forEach(function (line) {
		notationHtml += line + "<br />";
	});

	return notationHtml;
};

HexentaflGameNotation.prototype.notationTextForUrl = function() {
	var str = this.notationText;
	return str;
};

HexentaflGameNotation.prototype.getNotationForEmail = function() {
	var lines = [];
	if (this.notationText) {
		if (this.notationText.includes(';')) {
			lines = this.notationText.split(";");
		} else {
			lines = [this.notationText];
		}
	}

	var notationHtml = "";

	lines.forEach(function (line) {
		notationHtml += line + "[BR]";
	});

	return notationHtml;
};

HexentaflGameNotation.prototype.getLastMoveText = function() {
	return this.moves[this.moves.length - 1].fullMoveText;
};

HexentaflGameNotation.prototype.getLastMoveNumber = function() {
	return this.moves[this.moves.length - 1].moveNum;
};




