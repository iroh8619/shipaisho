/* Ginseng specific UI interaction logic */

import {
  BRAND_NEW,
  GameType,
  READY_FOR_BONUS,
  WAITING_FOR_ENDPOINT,
  callSubmitMove,
  clearMessage,
  createGameIfThatIsOk,
  finalizeMove,
  gameController,
  gameId,
  getCurrentPlayer,
  getGameOptionsMessageHtml,
  getOnlineGameOpponentUsername,
  getUsername,
  iAmPlayerInCurrentOnlineGame,
  isAnimationsOn,
  isInReplay,
  myTurn,
  onlinePlayEnabled,
  playingOnlineGame,
  quickFinalizeMove,
  refreshMessage,
  rerunAll,
  setGameTitleText,
  showResetMoveMessage,
  showSkipButtonMessage,
  userIsLoggedIn,
  usernameIsOneOf,
} from '../PaiShoMain';
import {
  DEPLOY,
  DRAW_ACCEPT,
  GUEST,
  HOST,
  MOVE,
  NotationPoint,
  PASS_TURN,
  SETUP,
} from '../CommonNotationObjects';
import {
  GINSENG_1_POINT_0,
  GINSENG_2_POINT_0,
  gameOptionEnabled,
} from '../GameOptions';
import { GinsengActuator } from './GinsengActuator';
import {
  GinsengGameManager,
  GinsengNotationAdjustmentFunction
} from './GinsengGameManager';
import { GinsengOptions } from './GinsengOptions';
import {
  GinsengTileCodes,
  GinsengTileInfo,
  GinsengTiles,
} from './GinsengTiles';
import { POSSIBLE_MOVE } from '../skud-pai-sho/SkudPaiShoBoardPoint';
import {
  TrifleGameNotation,
  TrifleNotationBuilder,
  TrifleNotationBuilderStatus,
} from '../trifle/TrifleGameNotation';
import { TrifleTile } from '../trifle/TrifleTile';
import { TrifleTileInfo } from '../trifle/TrifleTileInfo';
import { debug, debugOn } from '../GameData';
import { getPlayerCodeFromName } from '../pai-sho-common/PaiShoPlayerHelp';
import { setCurrentTileCodes, setCurrentTileMetadata } from '../trifle/PaiShoGamesTileMetadata';

export var GinsengConstants = {
	preferencesKey: "GinsengPreferencesKey"
};

export function GinsengController(gameContainer, isMobile) {
	new GinsengOptions();	// Initialize
	GinsengController.loadPreferences();
	this.gameContainer = gameContainer;
	this.isMobile = isMobile;
	this.createActuator();

	GinsengTileInfo.initializeTrifleData();
	setCurrentTileMetadata(GinsengTiles);
	setCurrentTileCodes(GinsengTileCodes);
	this.resetGameManager();
	this.resetGameNotation();
	this.resetNotationBuilder();

	this.hostAccentTiles = [];
	this.guestAccentTiles = [];

	this.isPaiShoGame = true;

	this.showDebugInfo = false;

	if (gameOptionEnabled(GINSENG_1_POINT_0)) {
		this.isInviteOnly = true;
	}
}

GinsengController.loadPreferences = function() {
	const preferences = localStorage.getItem(GinsengConstants.preferencesKey);
	if (preferences && preferences.length > 0) {
		try {
			GinsengOptions.Preferences = JSON.parse(preferences);
			return
		} catch(error) {
			debug("Error loading Ginseng preferences");
		}
	}
	GinsengOptions.Preferences = {
		customTilesUrl: ""
	};
};

GinsengController.prototype.createActuator = function() {
	this.actuator = new GinsengActuator(this.gameContainer, this.isMobile, isAnimationsOn());
	if (this.theGame) {
		this.theGame.updateActuator(this.actuator);
	}
};

GinsengController.prototype.getGameTypeId = function() {
	return GameType.Ginseng.id;
};

GinsengController.prototype.resetGameManager = function() {
	this.theGame = new GinsengGameManager(this.actuator);
};

GinsengController.prototype.resetNotationBuilder = function() {
	var offerDraw = false;
	if (this.notationBuilder) {
		offerDraw = this.notationBuilder.offerDraw;
	}
	this.notationBuilder = new TrifleNotationBuilder();
	this.notationBuilder.promptTargetData = {};
	if (offerDraw) {
		this.notationBuilder.offerDraw = true;
	}
	this.checkingOutOpponentTileOrNotMyTurn = false;

	this.notationBuilder.currentPlayer = this.getCurrentPlayer();
};

GinsengController.prototype.resetGameNotation = function() {
	this.gameNotation = this.getNewGameNotation();
};

GinsengController.prototype.getNewGameNotation = function() {
	return new TrifleGameNotation(GUEST);
};

GinsengController.getHostTilesContainerDivs = function() {
	return '';
}

GinsengController.getGuestTilesContainerDivs = function() {
	return '';
};

GinsengController.prototype.callActuate = function() {
	this.theGame.actuate();
};

GinsengController.prototype.resetMove = function(skipAnimation) {
	this.notationBuilder.offerDraw = false;
	if (this.notationBuilder.status === BRAND_NEW) {
		// Remove last move
		this.gameNotation.removeLastMove();
	} else if (this.notationBuilder.status === READY_FOR_BONUS) {
		// Just rerun
	}

	rerunAll(null, null, skipAnimation);
};

GinsengController.prototype.getDefaultHelpMessageText = function() {
	if (gameOptionEnabled(GINSENG_2_POINT_0) || !gameOptionEnabled(GINSENG_1_POINT_0)) {
		return '<h4>Ginseng Pai Sho</h4>'
			+ '<p><strong>Objective</strong></p>'
			+ '<ul>'
			+ '<li>Be the first player to move beyond the Border with your White Lotus tile to win the game. The Border is the midline between Host and Guest</li>'
			+ '</ul>'
			+ '<p><strong>Taking a turn</strong></p>'
			+ '<ul>'
			+ '<li>A turn consists of two phases: Movement Phase and Effect Phase. Hover over the different tiles to learn what they can do in these phases.</li>'
			+ '</ul>'
			+ '<p><strong>Important rules</strong></p>'
			+ '<p>White Lotus</p>'
			+ '<ul>'
			+ '<li>Capturing is only allowed when BOTH White Lotus tiles are outside Temples.</li>'
			+ '</ul>'
			+ '<p>The Temples</p>'
			+ '<ul>'
			+ '<li>Tiles inside Eastern and Western Temples are Ascended. Ascended tiles cannot be captured, trapped or moved by other tiles. A tile inside a Temple can still use its ability.</li>'
			+ '<li>Captured tiles can be retrieved at the Eastern or Western Temples by exchanging any tile for the retrieved tile.</li>'
			+ '</ul>'
			+ '<p>Dynamic or Static Abilities</p>'
			+ '<ul>'
			+ '<li>Dynamic Abilities are triggered by movement of the specific tile and only occur during the following Effect Phase.</li>'
			+ '<li>Static Abilities begin in the Effect Phase and continue until they are interrupted.</li>'
			+ '</ul>'
			+ '<p>For additional info, view the rule book <a href="https://skudpaisho.com/site/games/ginseng-pai-sho/" target="_blank">here</a>.</p>';
	} else {
		return "<h4>Ginseng Pai Sho</h4>"
			+ "<p>The first player to cross the Border with their White Lotus tile wins. The Border is the midline between Host and Guest tiles.</p><h4>Temple Rules</h4><p>Tiles are protected when inside of the Eastern or Western Temple. Protected tiles cannot be captured, trapped, or pushed. A tile inside of a Temple can still use its abilities.</p><h4>White Lotus Rules</h4><p>When your White Lotus is inside of a Temple:</p><ul><li>You cannot capture tiles by movement</li><li>Your tiles’ abilities are not in effect</li></ul><p>When only your White Lotus is outside of a Temple:</p><ul><li>You cannot capture tiles by movement</li><li>Your tiles’ abilities are in effect</li></ul><p>When both White Lotuses are outside of a Temple:</p><ul><li>You can capture tiles by movement</li><li>Your tiles’ abilities are in effect</li></ul>"
			+ "<p><a href='https://skudpaisho.com/site/games/ginseng-pai-sho/' target='_blank'>view the full rules</a>.</p>";
	}
};

GinsengController.prototype.gameNotBegun = function() {
	return this.gameNotation.moves.length === 0 
		|| (this.gameNotation.moves.length === 1 && this.gameNotation.moves[0].moveType === SETUP);
};

GinsengController.prototype.getAdditionalMessage = function() {
	var msg = "";
	
	if (this.gameNotBegun() && !playingOnlineGame()) {
		if (onlinePlayEnabled && gameId < 0 && userIsLoggedIn()) {
			msg += "Click <em>Join Game</em> above to join another player's game. Or, you can start a game that other players can join by clicking <strong>Start Online Game<strong> below.";
		} else {
			msg += "Sign in to enable online gameplay. Or, start playing a local game.";
		}

		msg += getGameOptionsMessageHtml(GameType.Ginseng.gameOptions);
	} else if (!this.theGame.hasEnded() && myTurn()) {
		if (this.gameNotation.lastMoveHasDrawOffer() && this.promptToAcceptDraw) {
			msg += "<br />Are you sure you want to accept the draw offer and end the game?<br />";
			msg += "<span class='skipBonus' onclick='gameController.confirmAcceptDraw();'>Yes, accept draw and end the game</span>";
			msg += "<br /><br />";
		} else if (this.gameNotation.lastMoveHasDrawOffer()) {
			msg += "<br />Your opponent is offering a draw. You may <span class='skipBonus' onclick='gameController.acceptDraw();'>Accept Draw</span> or make a move to refuse the draw offer.<br />";
		} else if (this.notationBuilder.offerDraw) {
			msg += "<br />Your opponent will be able to accept or reject your draw offer once you make your move. Or, you may <span class='skipBonus' onclick='gameController.removeDrawOffer();'>remove your draw offer</span> from this move.";
		} else {
			msg += "<br /><span class='skipBonus' onclick='gameController.offerDraw();'>Offer Draw</span><br />";
		}
	} else if (!myTurn()) {
		if (this.gameNotation.lastMoveHasDrawOffer()) {
			msg += "<br />A draw has been offered.<br />";
		}
	}

	if (!playingOnlineGame()) {
		// msg += getGameOptionsMessageHtml(GameType.Ginseng.gameOptions);	// For when there are game options
		if (onlinePlayEnabled && this.gameNotBegun()) {
			msg += "<br /><span class='skipBonus' onClick='gameController.startOnlineGame()'>Start Online Game</span><br />";
		}
	}

	return msg;
};

GinsengController.prototype.toggleDebug = function() {
	this.showDebugInfo = !this.showDebugInfo;
	clearMessage();
};

GinsengController.prototype.completeSetup = function() {
	// Create initial board setup
	if (gameOptionEnabled(GINSENG_1_POINT_0)) {
		this.addSetupMove();
	}

	// Finish with actuate
	rerunAll();
	this.callActuate();

	if (gameOptionEnabled(GINSENG_1_POINT_0)) {
		setGameTitleText("Ginseng Pai Sho 1.0");
	}
};

GinsengController.prototype.addSetupMove = function() {
	this.notationBuilder.moveType = SETUP;
	this.notationBuilder.boardSetupNum = 1;
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.theGame.runNotationMove(move);
	// Move all set. Add it to the notation!
	this.gameNotation.addMove(move);
};

GinsengController.prototype.startOnlineGame = function() {
	this.resetNotationBuilder();
	this.notationBuilder.currentPlayer = HOST;
	this.notationBuilder.moveType = PASS_TURN;

	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.theGame.runNotationMove(move);
	// Move all set. Add it to the notation!
	this.gameNotation.addMove(move);

	createGameIfThatIsOk(GameType.Ginseng.id);
};

GinsengController.prototype.getAdditionalHelpTabDiv = function() {
	var settingsDiv = document.createElement("div");

	var heading = document.createElement("h4");
	heading.innerText = "Ginseng Preferences:";

	settingsDiv.appendChild(heading);
	settingsDiv.appendChild(GinsengOptions.buildTileDesignDropdownDiv("Tile Designs"));

	if (!playingOnlineGame() || !iAmPlayerInCurrentOnlineGame() || getOnlineGameOpponentUsername() === getUsername()) {
		settingsDiv.appendChild(document.createElement("br"));
		settingsDiv.appendChild(GinsengOptions.buildToggleViewAsGuestDiv());
	}

	settingsDiv.appendChild(document.createElement("br"));

	if (usernameIsOneOf(["SkudPaiSho"]) || debugOn) {
		var toggleDebugText = "Enable debug Help display";
		if (this.showDebugInfo) {
			toggleDebugText = "Disable debug Help display";
		}
		var toggleDebugSpan = document.createElement("span");
		toggleDebugSpan.classList.add("skipBonus");
		toggleDebugSpan.setAttribute("onclick", "gameController.toggleDebug();");
		toggleDebugSpan.innerText = toggleDebugText;

		settingsDiv.appendChild(toggleDebugSpan);

		settingsDiv.appendChild(document.createElement("br"));
	}

	settingsDiv.appendChild(document.createElement("br"));

	return settingsDiv;
};

GinsengController.prototype.toggleViewAsGuest = function() {
	GinsengOptions.viewAsGuest = !GinsengOptions.viewAsGuest;
	this.createActuator();
	this.callActuate();
	clearMessage();
};

GinsengController.prototype.gameHasEndedInDraw = function() {
	return this.theGame.gameHasEndedInDraw;
};

GinsengController.prototype.acceptDraw = function() {
	if (myTurn()) {
		this.promptToAcceptDraw = true;
		refreshMessage();
	}
};

GinsengController.prototype.confirmAcceptDraw = function() {
	if (myTurn()) {
		this.resetNotationBuilder();
		this.notationBuilder.moveType = DRAW_ACCEPT;

		var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
		this.theGame.runNotationMove(move);
		// Move all set. Add it to the notation!
		this.gameNotation.addMove(move);

		if (playingOnlineGame()) {
			callSubmitMove();
		} else {
			finalizeMove();
		}
	}
};

GinsengController.prototype.offerDraw = function() {
	if (myTurn()) {
		this.notationBuilder.offerDraw = true;
		refreshMessage();
	}
};

GinsengController.prototype.removeDrawOffer = function() {
	if (myTurn()) {
		this.notationBuilder.offerDraw = false;
		refreshMessage();
	}
};

GinsengController.prototype.unplayedTileClicked = function(tileDiv) {
	this.promptToAcceptDraw = false;

	if (this.theGame.hasEnded() && this.notationBuilder.status !== READY_FOR_BONUS) {
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

	if ((tile && tile.ownerName !== getCurrentPlayer()) || !myTurn()) {
		this.checkingOutOpponentTileOrNotMyTurn = true;
	}

	/* if (this.theGame.playersAreSelectingTeams()) {
		var selectedTile = new Ginseng.Tile(tileCode, playerCode);
		if (tileDiv.classList.contains("selectedFromPile")) {
			var teamIsNowFull = this.theGame.addTileToTeam(selectedTile);
			if (teamIsNowFull) {
				this.notationBuilder.moveType = TEAM_SELECTION;
				this.notationBuilder.teamSelection = this.theGame.getPlayerTeamSelectionTileCodeList(player);
				this.completeMove();
			}
		} else if (!this.theGame.tileManager.playerTeamIsFull(selectedTile.ownerName)) {
			// Need to remove from team instead
			this.theGame.removeTileFromTeam(selectedTile);
		}
	} else  */
	if (this.notationBuilder.status === BRAND_NEW) {
		// new Deploy turn
		tile.selectedFromPile = true;

		this.notationBuilder.moveType = DEPLOY;
		this.notationBuilder.tileType = tileCode;
		this.notationBuilder.status = WAITING_FOR_ENDPOINT;

		this.theGame.revealDeployPoints(tile);
	} else if (this.notationBuilder.status === TrifleNotationBuilderStatus.PROMPTING_FOR_TARGET) {
		if (tile.tileIsSelectable) {
			if (!this.checkingOutOpponentTileOrNotMyTurn && !isInReplay) {
				var sourceTileKey = JSON.stringify(this.notationBuilder.neededPromptTargetInfo.sourceTileKey);
				if (!this.notationBuilder.promptTargetData[sourceTileKey]) {
					this.notationBuilder.promptTargetData[sourceTileKey] = {};
				}
				this.notationBuilder.promptTargetData[sourceTileKey][this.notationBuilder.neededPromptTargetInfo.currentPromptTargetId] = tile.getOwnerCodeIdObject();
				// TODO - Does move require user to choose targets?... 
				var notationBuilderSave = this.notationBuilder;
				this.resetMove(true);
				this.notationBuilder = notationBuilderSave;
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		}
	} else {
		this.theGame.hidePossibleMovePoints();
		this.resetNotationBuilder();
	}
}

GinsengController.prototype.pointClicked = function(htmlPoint) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	this.promptToAcceptDraw = false;

	if (this.theGame.hasEnded()) {
		return;
	}

	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
	var currentMovePath = boardPoint.buildMovementPath();

	if (this.notationBuilder.status === BRAND_NEW) {
		if (boardPoint.hasTile()) {
			if (boardPoint.tile.ownerName !== getCurrentPlayer() || !myTurn()) {
				debug("That's not your tile!");
				this.checkingOutOpponentTileOrNotMyTurn = true;
			}

			this.notationBuilder.status = WAITING_FOR_ENDPOINT;
			this.notationBuilder.moveType = MOVE;
			this.notationBuilder.startPoint = new NotationPoint(htmlPoint.getAttribute("name"));

			this.theGame.revealPossibleMovePoints(boardPoint);
		}
	} else if (this.notationBuilder.status === WAITING_FOR_ENDPOINT) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			// They're trying to move there! And they can! Exciting!
			// Need the notation!
			this.theGame.hidePossibleMovePoints();

			if (!this.checkingOutOpponentTileOrNotMyTurn && !isInReplay) {
				this.notationBuilder.endPoint = new NotationPoint(htmlPoint.getAttribute("name"));
				this.notationBuilder.endPointMovementPath = currentMovePath;	// TODO notation cleanup ?
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		} else {
			this.theGame.hidePossibleMovePoints();
			this.resetNotationBuilder();
		}
	} else if (this.notationBuilder.status === TrifleNotationBuilderStatus.PROMPTING_FOR_TARGET) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			this.theGame.hidePossibleMovePoints();

			if (!this.checkingOutOpponentTileOrNotMyTurn && !isInReplay) {
				var sourceTileKey = JSON.stringify(this.notationBuilder.neededPromptTargetInfo.sourceTileKey);
				if (!this.notationBuilder.promptTargetData[sourceTileKey]) {
					this.notationBuilder.promptTargetData[sourceTileKey] = {};
				}
				this.notationBuilder.promptTargetData[sourceTileKey][this.notationBuilder.neededPromptTargetInfo.currentPromptTargetId] = new NotationPoint(htmlPoint.getAttribute("name"));
				// TODO - Does move require user to choose targets?... 
				var notationBuilderSave = this.notationBuilder;
				this.resetMove(true);
				this.notationBuilder = notationBuilderSave;
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		} else {
			// this.theGame.hidePossibleMovePoints();
			// this.notationBuilder.status = ?
		}
	}
};

GinsengController.prototype.completeMove = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	var skipAnimation = this.notationBuilder.status === TrifleNotationBuilderStatus.PROMPTING_FOR_TARGET;
	var neededPromptTargetInfo = this.theGame.runNotationMove(move, true, null, skipAnimation);

	if (neededPromptTargetInfo) {
		debug("Prompting user for the rest of the move!");
		this.notationBuilder.status = TrifleNotationBuilderStatus.PROMPTING_FOR_TARGET;
		this.notationBuilder.neededPromptTargetInfo = neededPromptTargetInfo;
		
		if (neededPromptTargetInfo.sourceAbility.abilityInfo.optional) {
			refreshMessage();
			var abilityTitle = neededPromptTargetInfo.sourceAbility.abilityInfo.title;
			if (!abilityTitle) {
				abilityTitle = neededPromptTargetInfo.sourceAbility.abilityInfo.type;
			}
			showSkipButtonMessage("Skip ability: " + abilityTitle);
		}

		showResetMoveMessage();
	} else {
		this.gameNotation.addMove(move);
		if (playingOnlineGame()) {
			callSubmitMove();
		} else {
			// finalizeMove();
			quickFinalizeMove();
		}
	}
};

GinsengController.prototype.skipHarmonyBonus = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.gameNotation.addMove(move);
	if (playingOnlineGame()) {
		callSubmitMove();
	} else {
		finalizeMove();
	}
}

GinsengController.prototype.getTheMessage = function(tile, ownerName) {
	var message = [];

	var tileCode = tile.code;

	var heading = TrifleTile.getTileName(tileCode);

	message.push(TrifleTileInfo.getReadableDescription(tileCode));

	return {
		heading: heading,
		message: message
	}
}

GinsengController.prototype.getTileMessage = function(tileDiv) {
	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));
	var playerCode = divName.charAt(0);
	var tileCode = divName.substring(1);
	var tile = new TrifleTile(tileCode, playerCode);

	var ownerName = HOST;
	if (divName.startsWith('G')) {
		ownerName = GUEST;
	}

	return this.getTheMessage(tile, ownerName);
}

GinsengController.prototype.getPointMessage = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (boardPoint.hasTile()) {
		return this.getTheMessage(boardPoint.tile, boardPoint.tile.ownerName);
	} else if (this.showDebugInfo) {
		var messageLines = this.theGame.buildAbilitySummaryLines();
		return {
			heading: "Active Abilities",
			message: messageLines
		};
	}
}

GinsengController.prototype.playAiTurn = function(finalizeMove) {
	// 
};

GinsengController.prototype.startAiGame = function(finalizeMove) {
	// 
};

GinsengController.prototype.getAiList = function() {
	return [];
}

GinsengController.prototype.getCurrentPlayer = function() {
	if (this.gameNotBegun()) {
		return GUEST;
	} /* else if (this.gameNotation.moves.length > 0
			&& this.gameNotation.moves[0].moveType === PASS_TURN) {
		if (currentMoveIndex % 2 === 0) {
			return HOST;
		} else {
			return GUEST;
		}
	}  */
	else {
		var lastPlayer = this.gameNotation.moves[this.gameNotation.moves.length - 1].player;

		if (lastPlayer === HOST) {
			return GUEST;
		} else if (lastPlayer === GUEST) {
			return HOST;
		}
	}
};

GinsengController.prototype.cleanup = function() {
	// Nothing to do
};

GinsengController.prototype.isSolitaire = function() {
	return false;
};

GinsengController.prototype.setGameNotation = function(newGameNotation) {
	this.gameNotation.setNotationText(newGameNotation);
	if (playingOnlineGame() && iAmPlayerInCurrentOnlineGame() && getOnlineGameOpponentUsername() != getUsername()) {
		new GinsengOptions();	// To set perspective...
		this.createActuator();
		clearMessage();
	}
};

GinsengController.prototype.skipClicked = function() {
	var sourceTileKey = JSON.stringify(this.notationBuilder.neededPromptTargetInfo.sourceTileKey);
	if (!this.notationBuilder.promptTargetData[sourceTileKey]) {
		this.notationBuilder.promptTargetData[sourceTileKey] = {};
	}
	this.notationBuilder.promptTargetData[sourceTileKey].skipped = true;
	var notationBuilderSave = this.notationBuilder;
	this.resetMove();
	this.notationBuilder = notationBuilderSave;
	this.completeMove();
};

/* TODO Find more global way of doing RmbDown,etc methods? */

GinsengController.prototype.RmbDown = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	this.mouseStartPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
}

GinsengController.prototype.RmbUp = function(htmlPoint) {
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

GinsengController.prototype.buildNotationString = function(move) {
	var playerCode = getPlayerCodeFromName(move.player);
	var moveNum = move.moveNum;

	var moveNotation = moveNum + playerCode + ".";

	if (move.moveType === MOVE) {
		var startRowAndCol = new NotationPoint(move.startPoint).rowAndColumn;
		var endRowAndCol = new NotationPoint(move.endPoint).rowAndColumn;
		moveNotation += "(" + GinsengNotationAdjustmentFunction(startRowAndCol.row, startRowAndCol.col) + ")-";
		moveNotation += "(" + GinsengNotationAdjustmentFunction(endRowAndCol.row, endRowAndCol.col) + ")";

		if (move.promptTargetData) {
			Object.keys(move.promptTargetData).forEach((key, index) => {
				var promptDataEntry = move.promptTargetData[key];
				var keyObject = JSON.parse(key);
				if (promptDataEntry.movedTilePoint && promptDataEntry.movedTileDestinationPoint) {
					var movedTilePointRowAndCol = promptDataEntry.movedTilePoint.rowAndColumn;
					// TODO promptDataEntry field work needed
					var movedTileDestinationRowAndCol = promptDataEntry.movedTileDestinationPoint.rowAndColumn;
					moveNotation += "+";
					moveNotation += "(" + GinsengNotationAdjustmentFunction(movedTilePointRowAndCol.row, movedTilePointRowAndCol.col) + ")-";
					moveNotation += "(" + GinsengNotationAdjustmentFunction(movedTileDestinationRowAndCol.row, movedTileDestinationRowAndCol.col) + ")";
				} else if (promptDataEntry.chosenCapturedTile) {
					moveNotation += "+" + promptDataEntry.chosenCapturedTile.code;
				} else {
					moveNotation += " Ability?";
				}
			});
		}
	}

	return moveNotation;
};

GinsengController.prototype.setCustomTileDesignUrl = function(url) {
	GinsengOptions.Preferences.customTilesUrl = url;
	localStorage.setItem(GinsengConstants.preferencesKey, JSON.stringify(GinsengOptions.Preferences));
	localStorage.setItem(GinsengOptions.tileDesignTypeKey, 'custom');
	if (gameController && gameController.callActuate) {
		gameController.callActuate();
	}
};

GinsengController.isUsingCustomTileDesigns = function() {
	return localStorage.getItem(GinsengOptions.tileDesignTypeKey) === "custom";
};

GinsengController.getCustomTileDesignsUrl = function() {
	return GinsengOptions.Preferences.customTilesUrl;
};

