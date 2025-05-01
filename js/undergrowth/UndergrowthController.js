/* Undergrowth Pai Sho specific UI interaction logic */

import {
  BRAND_NEW,
  GameType,
  READY_FOR_BONUS,
  WAITING_FOR_ENDPOINT,
  callSubmitMove,
  createGameIfThatIsOk,
  currentMoveIndex,
  finalizeMove,
  getCurrentPlayer,
  getGameOptionsMessageHtml,
  getNeutralPointMessage,
  getRedPointMessage,
  getRedWhitePointMessage,
  getResetMoveText,
  getWhitePointMessage,
  isAnimationsOn,
  myTurn,
  onlinePlayEnabled,
  playingOnlineGame,
  refreshMessage,
  toHeading,
} from '../PaiShoMain';
import {
  GATE,
  NEUTRAL,
  POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { GUEST, HOST, NotationPoint, PLANTING } from '../CommonNotationObjects';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { UNDERGROWTH_SIMPLE, gameOptionEnabled } from '../GameOptions';
import { UndergrowthActuator } from './UndergrowthActuator';
import { UndergrowthGameManager } from './UndergrowthGameManager';
import {
  UndergrowthGameNotation,
  UndergrowthNotationBuilder,
  UndergrowthNotationVars,
} from './UndergrowthGameNotation';
import { UndergrowthTile } from './UndergrowthTile';
import { debug } from '../GameData';
import { getOpponentName } from '../pai-sho-common/PaiShoPlayerHelp';

export function UndergrowthController(gameContainer, isMobile) {
	this.actuator = new UndergrowthActuator(gameContainer, isMobile, isAnimationsOn());

	this.resetGameNotation();	// First

	this.resetGameManager();
	this.resetNotationBuilder();

	this.isPaiShoGame = true;
}

UndergrowthController.prototype.getGameTypeId = function() {
	return GameType.Undergrowth.id;
};

UndergrowthController.prototype.resetGameManager = function() {
	this.theGame = new UndergrowthGameManager(this.actuator);
};

UndergrowthController.prototype.resetNotationBuilder = function() {
	this.notationBuilder = new UndergrowthNotationBuilder();
};

UndergrowthController.prototype.resetGameNotation = function() {
	this.gameNotation = this.getNewGameNotation();
};

UndergrowthController.prototype.getNewGameNotation = function() {
	return new UndergrowthGameNotation();
};

UndergrowthController.getHostTilesContainerDivs = function() {
	var divs = '<div class="HR3"></div> <div class="HR4"></div> <div class="HR5"></div> <div class="HW3"></div> <div class="HW4"></div> <div class="HW5"></div> <br class="clear" /> <div class="HL"></div> <div class="HO"></div>';
	return divs;
}

UndergrowthController.getGuestTilesContainerDivs = function() {
	var divs = '<div class="GR3"></div> <div class="GR4"></div> <div class="GR5"></div> <div class="GW3"></div> <div class="GW4"></div> <div class="GW5"></div> <br class="clear" /> <div class="GL"></div> <div class="GO"></div>';
	return divs;
};

UndergrowthController.prototype.callActuate = function() {
	this.theGame.actuate();
};

UndergrowthController.prototype.resetMove = function() {
	if (this.notationBuilder.status === BRAND_NEW) {
		// Remove last move
		this.gameNotation.removeLastMove();
	} else if (this.notationBuilder.status === READY_FOR_BONUS) {
		// Just rerun
	}
};

UndergrowthController.prototype.getDefaultHelpMessageText = function() {
	return "<h4>Undergrowth Pai Sho</h4> <p>A placement game based on the Skud Pai Sho harmony system. Read the <a href='https://skudpaisho.com/site/games/undergrowth-pai-sho/' target='_blank'>rules page</a> to get started. Summary of the rules are below.</p>"
	+ "<p>Two tiles are placed each turn, except the Host's first turn, where only one tile is placed.</p>"
	+ "<p>First, Gates are filled. Then tiles are placed elsewhere on the board.</p>"
	+ "<p>When placing a tile onto the board, tiles are placed on any point where a) the tile forms Harmony with the player’s own tile(s) and b) the placed tile does not interrupt an existing Harmony or Disharmony on the board.</p>"
	+ "<p>After a tile is placed, remove any tile with two or more Disharmonies from the board.</p>"
	+ "<p>A player may also pass if they have no available moves.</p>"
	+ "<p>After the last piece is played or both players pass in succession, the game ends. The player with the most tiles in or touching the Central Gardens on the board wins.</p>"
	+ "<p>Same/alike tiles form Disharmony with each other.</p>"
	+ "<p>Tiles in Gates do not form Disharmony.</p>"
	+ "<p>The Orchid harmonizes with all friendly Flower Tiles, but also forms Disharmony with everything at the same time.</p>";
};

UndergrowthController.prototype.getAdditionalMessage = function() {
	var msg = "";
	if (this.gameNotation.moves.length === 0) {
		msg += getGameOptionsMessageHtml(GameType.Undergrowth.gameOptions);
	}

	if (gameOptionEnabled(UNDERGROWTH_SIMPLE)) {
		msg += "<br />Simplicity Rules: Your pieces form harmony with each other and disharmony with opponent's pieces.<br />";
	}

	if (!this.theGame.getWinner()) {
		msg += "<strong>" + this.theGame.getScoreSummary() + "</strong>";
	}

	if (this.notationBuilder.status === UndergrowthNotationBuilder.WAITING_FOR_SECOND_MOVE
			|| this.notationBuilder.status === UndergrowthNotationBuilder.WAITING_FOR_SECOND_ENDPOINT) {
		if (this.theGame.tileManager.playerIsOutOfTiles(getCurrentPlayer())) {
			msg += "<br />Place second tile or <span class='clickableText' onclick='gameController.skipSecondTile();'>skip</span>";
		} else {
			msg += "<br />Place second tile";
		}
		msg += getResetMoveText();
	} else {
		if (this.theGame.passInSuccessionCount === 1) {
			msg += "<br />" + getOpponentName(this.getCurrentPlayer()) + " has passed. Passing now will end the game.";
		}
		if (this.gameNotation.moves.length > 2 && myTurn() && !this.theGame.getWinner()) {
			msg += "<br /><span class='skipBonus' onclick='gameController.passTurn();'>Pass turn</span><br />";
		}
	}

	return msg;
};

UndergrowthController.prototype.passTurn = function() {
	if (this.gameNotation.moves.length > 2) {
		this.notationBuilder.passTurn = true;
		this.notationBuilder.moveType = UndergrowthNotationVars.PASS_TURN;
		this.completeMove();
	}
};

UndergrowthController.prototype.skipSecondTile = function() {
	this.completeMove();
};

UndergrowthController.prototype.completeMove = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.gameNotation.addMove(move);

	var moveAnimationBeginStep = 0;
	if (this.notationBuilder.endPoint) {
		moveAnimationBeginStep = 1;
	}

	if (playingOnlineGame()) {
		callSubmitMove(moveAnimationBeginStep);
	} else {
		finalizeMove(moveAnimationBeginStep);
	}
};

UndergrowthController.prototype.unplayedTileClicked = function(tileDiv) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	if (!myTurn()) {
		return;
	}
	if (currentMoveIndex !== this.gameNotation.moves.length) {
		debug("Can only interact if all moves are played.");
		return;
	}

	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));
	var playerCode = divName.charAt(0);
	var tileCode = divName.substring(1);

	var player = GUEST;
	if (playerCode === 'H') {
		player = HOST;
	}

	var tile = this.theGame.tileManager.peekTile(player, tileCode, tileId);

	if (tile.ownerName !== getCurrentPlayer()) {
		// debug("That's not your tile!");
		return;
	}

	if (this.notationBuilder.status === BRAND_NEW) {
		tile.selectedFromPile = true;

		this.notationBuilder.moveType = PLANTING;
		this.notationBuilder.plantedFlowerType = tileCode;
		this.notationBuilder.status = WAITING_FOR_ENDPOINT;

		this.theGame.setAllLegalPointsOpen(getCurrentPlayer(), tile);
	} else if (this.notationBuilder.status === UndergrowthNotationBuilder.WAITING_FOR_SECOND_MOVE) {
		tile.selectedFromPile = true;
		this.notationBuilder.plantedFlowerType2 = tileCode;
		this.notationBuilder.status = UndergrowthNotationBuilder.WAITING_FOR_SECOND_ENDPOINT;

		this.theGame.setAllLegalPointsOpen(getCurrentPlayer(), tile);
	} else {
		this.theGame.hidePossibleMovePoints();
		if (this.notationBuilder.status === WAITING_FOR_ENDPOINT) {
			this.notationBuilder = new UndergrowthNotationBuilder();
		} else if (this.notationBuilder.status === UndergrowthNotationBuilder.WAITING_FOR_SECOND_ENDPOINT) {
			this.notationBuilder.status = UndergrowthNotationBuilder.WAITING_FOR_SECOND_MOVE;
		}
	}
};

UndergrowthController.prototype.RmbDown = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	this.mouseStartPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
}

UndergrowthController.prototype.RmbUp = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var mouseEndPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (mouseEndPoint == this.mouseStartPoint) {
		this.theGame.markingManager.toggleMarkedPoint(mouseEndPoint);
	}
	else if (this.mouseStartPoint) {
		this.theGame.markingManager.toggleMarkedArrow(this.mouseStartPoint, mouseEndPoint);
	}
	this.mouseStartPoint = null;

	this.callActuate();
}

UndergrowthController.prototype.pointClicked = function(htmlPoint) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	if (currentMoveIndex !== this.gameNotation.moves.length) {
		debug("Can only interact if all moves are played.");
		return;
	}

	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (this.notationBuilder.status === WAITING_FOR_ENDPOINT) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			this.theGame.hidePossibleMovePoints();
			this.notationBuilder.endPoint = new NotationPoint(htmlPoint.getAttribute("name"));
			
			var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
			this.theGame.runNotationMove(move, true);

			if (this.gameNotation.moves.length === 0) {
				this.gameNotation.addMove(move);
				if (onlinePlayEnabled) {
					createGameIfThatIsOk(GameType.Undergrowth.id);
				} else {
					finalizeMove();
				}
			} else {
				this.notationBuilder.status = UndergrowthNotationBuilder.WAITING_FOR_SECOND_MOVE;
				if (this.theGame.tileManager.playerIsOutOfTiles(getCurrentPlayer())) {
					this.completeMove();
				} else {
					refreshMessage();
				}
			}
		} else {
			this.theGame.hidePossibleMovePoints();
			this.notationBuilder = new UndergrowthNotationBuilder();
		}
	} else if (this.notationBuilder.status === UndergrowthNotationBuilder.WAITING_FOR_SECOND_ENDPOINT) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			this.theGame.hidePossibleMovePoints();
			this.notationBuilder.endPoint2 = new NotationPoint(htmlPoint.getAttribute("name"));
			
			this.completeMove();
		} else {
			this.theGame.hidePossibleMovePoints();
			this.notationBuilder.status = UndergrowthNotationBuilder.WAITING_FOR_SECOND_MOVE;
		}
	}
};

UndergrowthController.prototype.getTileMessage = function(tileDiv) {
	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));

	var tile = new UndergrowthTile(divName.substring(1), divName.charAt(0));

	var message = [];

	var ownerName = HOST;
	if (divName.startsWith('G')) {
		ownerName = GUEST;
	}
	
	var tileCode = divName.substring(1);

	var heading = UndergrowthTile.getTileName(tileCode);

	return {
		heading: heading,
		message: message
	}
}

UndergrowthController.prototype.getPointMessage = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	var message = [];
	if (boardPoint.hasTile()) {
		message.push(toHeading(boardPoint.tile.getName()));
	} else {
		if (boardPoint.isType(NEUTRAL)) {
			message.push(getNeutralPointMessage());
		} else if (boardPoint.isType(RED) && boardPoint.isType(WHITE)) {
			message.push(getRedWhitePointMessage());
		} else if (boardPoint.isType(RED)) {
			message.push(getRedPointMessage());
		} else if (boardPoint.isType(WHITE)) {
			message.push(getWhitePointMessage());
		} else if (boardPoint.isType(GATE)) {
			message.push(getNeutralPointMessage());
		}
	}

	return {
		heading: null,
		message: message
	}
}

UndergrowthController.prototype.playAiTurn = function(finalizeMove) {
	// 
};

UndergrowthController.prototype.startAiGame = function(finalizeMove) {
	// 
};

UndergrowthController.prototype.getAiList = function() {
	return [];
}

UndergrowthController.prototype.getCurrentPlayer = function() {
	if (this.gameNotation.moves.length % 2 === 0) {
		return HOST;
	} else {
		return GUEST;
	}
};

UndergrowthController.prototype.cleanup = function() {
	// 
};

UndergrowthController.prototype.isSolitaire = function() {
	return false;
};

UndergrowthController.prototype.setGameNotation = function(newGameNotation) {
	this.gameNotation.setNotationText(newGameNotation);
};


