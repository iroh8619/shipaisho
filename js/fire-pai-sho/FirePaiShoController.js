/* Skud Pai Sho specific UI interaction logic */

export function FirePaiShoController(gameContainer, isMobile) {
	this.actuator = new FirePaiShoActuator(gameContainer, isMobile, isAnimationsOn());
	this.gameContainer = gameContainer;
	this.resetGameManager();
	this.resetNotationBuilder();
	this.resetGameNotation();

	this.hostAccentTiles = [];
	this.guestAccentTiles = [];

	this.isPaiShoGame = true;
}

FirePaiShoController.prototype.createActuator = function() {
	this.actuator = new FirePaiShoActuator(this.gameContainer, this.isMobile, isAnimationsOn());
	if (this.theGame) {
		this.theGame.updateActuator(this.actuator);
	}
};

FirePaiShoController.hideHarmonyAidsKey = "HideHarmonyAids";

FirePaiShoController.boardRotationKey = "BoardRotation";

FirePaiShoController.prototype.getGameTypeId = function() {
	return GameType.FirePaiSho.id;
};

FirePaiShoController.prototype.completeSetup = function() {
	this.createActuator();
	this.callActuate();
};

FirePaiShoController.prototype.resetGameManager = function() {
	this.theGame = new FirePaiShoGameManager(this.actuator);
};

FirePaiShoController.prototype.resetNotationBuilder = function() {
	if (this.notationBuilder && this.notationBuilder.status !== BRAND_NEW) {
		this.lastNotationBuilder = this.notationBuilder;
	}
	this.notationBuilder = new FirePaiShoNotationBuilder();
};

FirePaiShoController.prototype.resetGameNotation = function() {
	this.gameNotation = this.getNewGameNotation();
};

FirePaiShoController.prototype.getMoveNumber = function() {
	/* Function needed to support randomizer */
	return this.gameNotation.moves.length;
};

FirePaiShoController.prototype.getNewGameNotation = function() {
	return new FirePaiShoGameNotation();
};

FirePaiShoController.getHostTilesContainerDivs = function() {
	return '';
};

FirePaiShoController.getGuestTilesContainerDivs = function() {
	return '';
};

FirePaiShoController.prototype.callActuate = function() {
	this.theGame.actuate();
};

FirePaiShoController.prototype.resetMove = function() {
	if (this.notationBuilder.status === BRAND_NEW 
			&& this.lastNotationBuilder && this.lastNotationBuilder.bonusEndPoint) {
		/* Only undo the bonus placement - Need to get the last move and keep the first half */

		// Now recreate the first part of the move...
		var newNotationBuilder = new FirePaiShoNotationBuilder();
		newNotationBuilder.moveType = this.lastNotationBuilder.moveType;
		newNotationBuilder.plantedFlowerType = this.lastNotationBuilder.plantedFlowerType;
		newNotationBuilder.startPoint = this.lastNotationBuilder.startPoint;
		newNotationBuilder.endPoint = this.lastNotationBuilder.endPoint;

		newNotationBuilder.bonusTileCode = this.lastNotationBuilder.bonusTileCode;
		newNotationBuilder.bonusTile = this.lastNotationBuilder.bonusTile;

		// New notation builder is ready. Remove last move and rerun.
		this.gameNotation.removeLastMove();
		rerunAll();

		this.notationBuilder = newNotationBuilder;

		var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
		this.theGame.hidePossibleMovePoints(false, move);
		this.theGame.runNotationMove(move);

		this.showHarmonyBonusMessage();
		this.theGame.revealPossiblePlacementPoints(this.notationBuilder.bonusTile);
		this.notationBuilder.status = WAITING_FOR_BONUS_ENDPOINT;

		this.callActuate();
		return true;
	} else if (this.notationBuilder.status === BRAND_NEW
			&& this.lastNotationBuilder && !this.lastNotationBuilder.bonusEndPoint) {
		// Remove last move
		this.gameNotation.removeLastMove();
	} else if (this.notationBuilder.status === READY_FOR_BONUS) {
		// Just rerun
	}

};

FirePaiShoController.prototype.undoMoveAllowed = function() {
	/* 
	Can undo move if no harmony formed.
	Can undo _only_ placing the bonus tile.
	*/
	// return !this.notationBuilder.bonusTileCode && this.lastNotationBuilder;

	return this.notationBuilder.status === BRAND_NEW
			&& this.lastNotationBuilder && this.lastNotationBuilder.endPoint;
}

FirePaiShoController.prototype.getDefaultHelpMessageText = function() {
	return "<h4>Fire Pai Sho</h4> <p>Pai Sho is a game of harmony. The goal is to arrange your Flower Tiles to create a ring of Harmonies that surrounds the center of the board.</p> <p>Harmonies are created when two of a player's harmonious tiles are on the same line with nothing in between them. But be careful; tiles that clash can never be lined up on the board.</p> <p>Select tiles or points on the board to learn more.</p>";
};

FirePaiShoController.prototype.getAdditionalMessage = function() {
	var msg = "";

	msg += "<p>Host reserve tiles: " + this.theGame.tileManager.hostReserveTiles.length + "<br>Guest reserve tiles: " + this.theGame.tileManager.guestReserveTiles.length + "</p>";

	if (this.gameNotation.moves.length === 0) {
		if (onlinePlayEnabled && gameId < 0 && userIsLoggedIn()) {
				msg += "Click <em>Join Game</em> above to join another player's game. Or, you can start a game that other players can join by selecting Start Online Game below.<br />";
			}

		if (!playingOnlineGame()) {
			msg += getGameOptionsMessageHtml(GameType.FirePaiSho.gameOptions);
			if (onlinePlayEnabled && this.gameNotation.moves.length === 0) {
				msg += "<br><span class='skipBonus' onClick='gameController.startOnlineGame()'>Start Online Game</span><br />";
			}
		}
	}

	return msg;
};

FirePaiShoController.prototype.startOnlineGame = function() {
	createGameIfThatIsOk(GameType.FirePaiSho.id);
};

FirePaiShoController.getTileNameFromCode = function(code) {
	if (code === "W3") {
		return "White 3 Jasmine";
	}
	else if (code === "W4") {
		return "White 4 Lily";
	}
	else if (code === "W5") {
		return "White 5 White Jade";
	}
	else if (code === "R3") {
		return "Red 3 Rose";
	}
	else if (code === "R4") {
		return "Red 4 Chrysanthemum";
	}
	else if (code === "R5") {
		return "Red 5 Rhododendron";
	}
	else if (code === "R") {
		return "Rock";
	}
	else if (code === "B") {
		return "Boat";
	}
	else if (code === "K") {
		return "Knotweed";
	}
	else if (code === "W") {
		return "Wheel";
	}
	else if (code === "O") {
		return "Orchid";
	}
	else if (code === "L") {
		return "White Lotus";
	}
	else {
		return "unkown tile code";
	}
};

FirePaiShoController.getFireGatePointMessage = function() {
	var msg = "<h4>Gate</h4>";
	msg += '<p>This point is a Gate. Tiles may not be played or moved here, and harmonies cannot pass though a gate.</p>';
	return msg;
}

FirePaiShoController.prototype.getExtraHarmonyBonusHelpText = function() {

	var retstring = " <br /> Your bonus tile is: ";
	retstring += FirePaiShoController.getTileNameFromCode(this.notationBuilder.bonusTileCode);
	return retstring; 
};

FirePaiShoController.prototype.showHarmonyBonusMessage = function() {
	document.querySelector(".gameMessage").innerHTML = "Harmony Bonus! Play a random tile from your reserve!"
	+ this.getExtraHarmonyBonusHelpText()
	+ getResetMoveText();
};

FirePaiShoController.prototype.unplayedTileClicked = function(tileDiv) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	if (this.theGame.getWinner() && this.notationBuilder.status !== READY_FOR_BONUS) {
		return;
	}
	if (!myTurn()) {
		return;
	}
	
	if (currentMoveIndex !== this.gameNotation.moves.length) {
		//console.log("Can only interact if all moves are played.");
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

	var bonus = false;
	if (this.notationBuilder.status === READY_FOR_BONUS){
		bonus = true;
	}

	if (bonus){
		if (player === HOST){
			correctPile = this.theGame.tileManager.hostReserveTiles;
		}
		else {
			correctPile = this.theGame.tileManager.guestReserveTiles;
		}
	} else {
		if (player === HOST){
			correctPile = this.theGame.tileManager.hostLibraryTiles;
		}
		else {
			correctPile = this.theGame.tileManager.guestLibraryTiles;
		}
	}

	//console.log("Current player is " + playerCode + ", peeking at " + tileCode + ". Notation builder status: " + this.notationBuilder.status + ". Turn no: " + currentMoveIndex + "," + this.gameNotation.moves.length);
	

	var tile = this.theGame.tileManager.peekTile(player, tileCode, tileId, bonus);

	if (!correctPile.includes(tile)){
		//console.log("Correct pile doesn't include he one selected. aborting the click");
		return;
	}

	if (tile.ownerName !== getCurrentPlayer()) {
		// debug("That's not your tile!");
		return;
	}

	if (this.notationBuilder.status === BRAND_NEW) {

		tile.selectedFromPile = true;

		this.notationBuilder.moveType = PLANTING;
		this.notationBuilder.plantedFlowerType = tileCode;
		this.notationBuilder.status = WAITING_FOR_ENDPOINT;

		if (this.gameNotation.moves.length === 0)
		{
			this.theGame.revealFirstMovePlacement();
		} else{
		this.theGame.revealPossiblePlacementPoints(tile);
		}

	} else if (this.notationBuilder.status === READY_FOR_BONUS) {

	} else if (this.notationBuilder.status === WAITING_FOR_BONUS_ENDPOINT
			|| this.notationBuilder.status === WAITING_FOR_BOAT_BONUS_POINT) {
			//this.notationBuilder.status = READY_FOR_BONUS;
			//this.showHarmonyBonusMessage();
		} else {
			this.theGame.hidePossibleMovePoints();
			this.resetNotationBuilder();
	}
};

FirePaiShoController.prototype.RmbDown = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	this.mouseStartPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
}

FirePaiShoController.prototype.RmbUp = function(htmlPoint) {
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

FirePaiShoController.prototype.pointClicked = function(htmlPoint) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	if (this.theGame.getWinner() && this.notationBuilder.status !== WAITING_FOR_BONUS_ENDPOINT
			&& this.notationBuilder.status !== WAITING_FOR_BOAT_BONUS_POINT) {
		return;
	}
	if (!myTurn()) {
		return;
	}
	if (currentMoveIndex !== this.gameNotation.moves.length) {
		debug("Can only interact if all moves are played.");
		return;
	}

	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (this.notationBuilder.status === BRAND_NEW) {
		//console.log("Brand new click on board");
		if (boardPoint.hasTile()) {
			if (boardPoint.tile.ownerName !== getCurrentPlayer()) {
				debug("That's not your tile!");
				return;
			}

			if (boardPoint.tile.type === ACCENT_TILE) {
				return;
			}

			if (boardPoint.tile.trapped) {
				return;
			}

			this.notationBuilder.status = WAITING_FOR_ENDPOINT;
			this.notationBuilder.moveType = ARRANGING;
			//console.log("Waiting for endpoint on an arrange move");
			this.notationBuilder.startPoint = new NotationPoint(htmlPoint.getAttribute("name"));

			this.theGame.revealPossibleMovePoints(boardPoint);
		}
	} else if (this.notationBuilder.status === WAITING_FOR_ENDPOINT) {
		//console.log("Was waiting for an endpoint and you clicked one!");
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			//console.log("And that was a legit move.");
			// They're trying to move there! And they can! Exciting!
			// Need the notation!
			this.notationBuilder.endPoint = new NotationPoint(htmlPoint.getAttribute("name"));

			var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
			//console.log("Here's the notation move: " + move);
			this.theGame.hidePossibleMovePoints(false, move);
			var bonusAllowed = this.theGame.runNotationMove(move);
			
			//If you moved a dragon, capture all legal adjacent tiles.


			if (!bonusAllowed) {
				// Move all set. Add it to the notation!
				//console.log("about to add the move to the game notation");
				this.gameNotation.addMove(move);
				if (playingOnlineGame()) {
					callSubmitMove();
				} else {
					//console.log("Now we're all set, so we're finalizing the move");
					finalizeMove();
				}
			} else {
				this.notationBuilder.status = READY_FOR_BONUS;
				
				var tile = this.notationBuilder.bonusTileCode;	// <-- Just don't want to redraw if any undo changes cause this code to run
				if (!tile) {
					tile = this.theGame.drawReserveTileFromTileManager(getCurrentPlayer());
				}
				tile.selectedFromPile = true;
				
				var tileCode = tile.code;
				//console.log("Was ready for a bonus tile and now you selected one: " + tileCode + "and if it's an accent tile: " + tile.accentType);
				
				this.notationBuilder.bonusTileCode = tileCode;
				this.notationBuilder.bonusTile = tile;	// Keep track of for undoing
				this.showHarmonyBonusMessage();
				this.theGame.revealPossiblePlacementPoints(tile);
				this.notationBuilder.status = WAITING_FOR_BONUS_ENDPOINT;
			}
		} else {

			//console.log("And that was totally NOT a legit move.");
			this.theGame.hidePossibleMovePoints();
			this.resetNotationBuilder();
		}
	} else if (this.notationBuilder.status === WAITING_FOR_BONUS_ENDPOINT) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {

			this.theGame.hidePossibleMovePoints();
			this.notationBuilder.bonusEndPoint = new NotationPoint(htmlPoint.getAttribute("name"));

			// If we're placing a boat, and boardPoint is not an accent...
			if (this.notationBuilder.bonusTileCode.endsWith("B") && (boatOnlyMoves || boardPoint.tile.type !== ACCENT_TILE)) {
				// Boat played on flower, need to pick flower endpoint
				this.notationBuilder.status = WAITING_FOR_BOAT_BONUS_POINT;
				this.theGame.revealBoatBonusPoints(boardPoint);
			} else {
				var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);

				this.gameNotation.addMove(move);
				this.theGame.clearDrawnReserveTile();
				if (playingOnlineGame()) {
					callSubmitMove(1);
				} else {
					finalizeMove(1);
				}
			}
		} else {
			//this.theGame.hidePossibleMovePoints();
			//this.notationBuilder.status = READY_FOR_BONUS;
		}
	} else if (this.notationBuilder.status === WAITING_FOR_BOAT_BONUS_POINT) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {

			this.notationBuilder.status = MOVE_DONE;

			this.theGame.hidePossibleMovePoints();
			this.notationBuilder.boatBonusPoint = new NotationPoint(htmlPoint.getAttribute("name"));
			var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
			this.gameNotation.addMove(move);
			this.theGame.clearDrawnReserveTile();
			if (playingOnlineGame()) {
				callSubmitMove(1);
			} else {
				finalizeMove(1);
			}
		} else {
			//IF IT AS IN ILLEGAL MOVE, LET THE BOAT CHOOSE ITS PLACEMENT AGAIN
			this.theGame.hidePossibleMovePoints();
			this.notationBuilder.status = WAITING_FOR_BONUS_ENDPOINT;
			console.log(this.notationBuilder.bonusTile.code);
			this.theGame.revealPossiblePlacementPoints(this.notationBuilder.bonusTile);
		}
	}
};

FirePaiShoController.prototype.skipHarmonyBonus = function() {
	if (this.notationBuilder.status !== MOVE_DONE) {
		this.notationBuilder.status = MOVE_DONE;
		this.notationBuilder.bonusEndPoint = null;
		var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
		this.gameNotation.addMove(move);
		if (playingOnlineGame()) {
			callSubmitMove(1);
		} else {
			finalizeMove(1);
		}
	}
};

FirePaiShoController.prototype.getTileMessage = function(tileDiv) {
	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));

	var tile = new FirePaiShoTile(divName.substring(1), divName.charAt(0));

	var tileMessage = this.getHelpMessageForTile(tile);

	return {
		heading: tileMessage.heading,
		message: tileMessage.message
	}
};

FirePaiShoController.prototype.getPointMessage = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	var heading;
	var message = [];
	if (boardPoint.hasTile()) {
		var tileMessage = this.getHelpMessageForTile(boardPoint.tile);
		tileMessage.message.forEach(function(messageString){
			message.push(messageString);
		});
		heading = tileMessage.heading;
		// Specific tile message
		/**
		Rose
		* In Harmony with Chrysanthemum to the north
		* Trapped by Orchid
		*/
		var tileHarmonies = this.theGame.board.harmonyManager.getHarmoniesWithThisTile(boardPoint.tile);
		if (tileHarmonies.length > 0) {
			var bullets = [];
			tileHarmonies.forEach(function(harmony) {
				var otherTile = harmony.getTileThatIsNotThisOne(boardPoint.tile);
				bullets.push(otherTile.getName()
					+ " to the " + harmony.getDirectionForTile(boardPoint.tile));
			});
			message.push("<strong>Currently in Harmony with: </strong>" + toBullets(bullets));
		}

		// boosted? Ethereal?
		if (boardPoint.tile.boosted) {
			message.push("Currently <em>boosted</em> by a Knotweed.");
		}
		if (boardPoint.tile.ethereal) {
			message.push("Tile is currently ethereal. Harmony may pass through it.")
		}
	}
	
	if (boardPoint.isType(NEUTRAL)) {
		message.push(getNeutralPointMessage());
	} else if (boardPoint.isType(RED) && boardPoint.isType(WHITE)) {
		message.push(getRedWhitePointMessage());
	} else if (boardPoint.isType(RED)) {
		message.push(getRedPointMessage());
	} else if (boardPoint.isType(WHITE)) {
		message.push(getWhitePointMessage());
	} else if (boardPoint.isType(GATE)) {
		message.push(FirePaiShoController.getFireGatePointMessage());
	}

	return {
		heading: heading,
		message: message
	}
};

FirePaiShoController.prototype.getHelpMessageForTile = function(tile) {
	var message = [];

	var tileCode = tile.code;

	var heading = FirePaiShoTile.getTileName(tileCode);

	message.push(tile.ownerName + "'s tile");

	if (tileCode.length > 1) {
		var colorCode = tileCode.charAt(0);
		var tileNum = parseInt(tileCode.charAt(1));

		var harmTileNum = tileNum - 1;
		var harmTileColor = colorCode;
		if (harmTileNum < 3) {
			harmTileNum = 5;
			if (colorCode === 'R') {
				harmTileColor = 'W';
			} else {
				harmTileColor = 'R';
			}
		}

		var harmTile1 = FirePaiShoTile.getTileName(harmTileColor + harmTileNum);

		harmTileNum = tileNum + 1;
		harmTileColor = colorCode;
		if (harmTileNum > 5) {
			harmTileNum = 3;
			if (colorCode === 'R') {
				harmTileColor = 'W';
			} else {
				harmTileColor = 'R';
			}
		}

		var harmTile2 = FirePaiShoTile.getTileName(harmTileColor + harmTileNum);

		harmTileNum = tileNum;
		if (colorCode === 'R') {
			harmTileColor = 'W';
		} else {
			harmTileColor = 'R';
		}
		var clashTile = FirePaiShoTile.getTileName(harmTileColor + harmTileNum);

		message.push("Basic Flower Tile");
		message.push("Can move up to " + tileNum + " spaces");
		message.push("Forms Harmony with " + harmTile1 + " and " + harmTile2);
		message.push("Clashes with " + clashTile);
	} else {
		if (tileCode === 'R') {
			heading = "Accent Tile: Rock";
			if (simplest) {
				message.push("The Rock creates Harmonies along its lines and cannot be moved by a Wheel.");
			} else if (rocksUnwheelable) {
				if (simpleRocks) {
					message.push("The Rock creates Harmonies along its lines and cannot be moved by a Wheel.");
				} else {
					message.push("The Rock creates Harmonies for same-player tiles on horizontal and vertical lines it lies on. A Rock cannot be moved by a Wheel.");
				}
			} else {
				message.push("The Rock Rock creates Harmonies along its lines vertical lines it lies on.");
			}
		} else if (tileCode === 'W') {
			heading = "Accent Tile: Wheel";
			if (rocksUnwheelable || simplest) {
				message.push("The Wheel rotates all surrounding tiles one space clockwise but cannot move a Rock.");
			}
		} else if (tileCode === 'K') {
			heading = "Accent Tile: Knotweed";
			if (newKnotweedRules) {
				message.push("The Knotweed boosts surrounding Flower Tiles so they will form harmony with all other same-player tiles.");
			} else {
				message.push("The Knotweed boosts surrounding Flower Tiles so they will form harmony with all other same-player tiles.");
			}
		} else if (tileCode === 'B') {
			heading = "Accent Tile: Boat";
			if (simplest || rocksUnwheelable) {
				message.push("The Boat moves a Flower Tile to a surrounding space or removes an Accent tile.");
			} else if (rocksUnwheelable) {
				message.push("The Boat moves a Flower Tile to a surrounding space or removes a Rock or Knotweed tile.");
			} else {
				message.push("The Boat moves a Flower Tile to a surrounding space or removes a Knotweed tile.");
			}
		} else if (tileCode === 'L') {
			heading = "Special Flower: White Lotus";
			message.push("Can move up to 2 spaces");
			message.push("Forms Harmony with all non-Lotus Flower Tiles of either player");
		} else if (tileCode === 'O') {
			heading = "Special Flower: Orchid";
			message.push("Can move up to 6 spaces");
			message.push("Forms no natural Harmony of its own, but can form harmony using the special powers of other tiles.");

		} else if (tileCode === 'T') {
			heading = "Original Bender: Lion Turtle";
			message.push("Can move up to 2 spaces");
			message.push("Forms no natural Harmony of its own, but can form harmony using the special powers of other tiles.");
			message.push("Original benders may be placed adjacent to the Lion Turtle or move as if their move started at the Lion Turtle.");
		} else if (tileCode === 'Y') {
			heading = "Original Bender: Koi";
			message.push("Can move up to 2 spaces");
			message.push("Forms Harmony with all same-player white flowers, and can form harmony using the special powers of other tiles.");
			message.push("The Koi and all adjacent tiles are ethereal: Harmony lines may pass through them.");
		} else if (tileCode === 'G') {
			heading = "Original Bender: Badgermole";
			message.push("Can move up to 2 spaces");
			message.push("Forms Harmony with all same-player white flowers, and can form harmony using the special powers of other tiles.");
			message.push("After placement or movement, the Badgermole rotates all surrounding tiles one space counterclockwise, if possible, and cannot move a Boat.");
		} else if (tileCode === 'D') {
			heading = "Original Bender: Dragon";
			message.push("Can move up to 2 spaces");
			message.push("Forms Harmony with all same-player red flowers, and can form harmony using the special powers of other tiles.");
			message.push("After placement or movement, the Dragon removes all surrounding accent tiles and Original Benders, if possible, starting with the north piece and moving clockwise.");
		} else if (tileCode === 'F') {
			heading = "Original Bender: Flying Bison";
			message.push("Can move up to 2 spaces");
			message.push("Forms Harmony with all same-player red flowers, and can form harmony using the special powers of other tiles.");
			message.push("After placement or movement, the Bison pushes all tiles one space away from it, if possible, starting with the north piece and moving clockwise.");
		}
		
	}
	return {
		heading: heading,
		message: message
	}
};

FirePaiShoController.prototype.playAiTurn = function(finalizeMove) {
	if (this.theGame.getWinner()) {
		return;
	}
	var theAi = activeAi;
	if (activeAi2) {
		if (activeAi2.player === getCurrentPlayer()) {
			theAi = activeAi2;
		}
	}

	var playerMoveNum = this.gameNotation.getPlayerMoveNum();

//	if (playerMoveNum === 1 && getCurrentPlayer() === HOST) {
//		// Auto mirror guest move
//		// Host auto-copies Guest's first Plant
//		var hostMoveBuilder = this.notationBuilder.getFirstMoveForHost(this.gameNotation.moves[this.gameNotation.moves.length - 1].plantedFlowerType);
//		this.gameNotation.addMove(this.gameNotation.getNotationMoveFromBuilder(hostMoveBuilder));
//		finalizeMove();
//	} else 
	
	if (playerMoveNum < 3) {
		var move = theAi.getMove(this.theGame.getCopy(), playerMoveNum);
		if (!move) {
			debug("No move given...");
			return;
		}
		this.gameNotation.addMove(move);
		finalizeMove();
	} else {
		var self = this;
		setTimeout(function(){
			var move = theAi.getMove(self.theGame.getCopy(), playerMoveNum);
			if (!move) {
				debug("No move given...");
				return;
			}
			self.gameNotation.addMove(move);
			finalizeMove();
		}, 10);
	}
};

FirePaiShoController.prototype.startAiGame = function(finalizeMove) {
	this.playAiTurn(finalizeMove);
	if (this.gameNotation.getPlayerMoveNum() === 1) {
		this.playAiTurn(finalizeMove);
	}
	if (this.gameNotation.getPlayerMoveNum() === 1) {
		// Host auto-copies Guest's first Plant
		var hostMoveBuilder = this.notationBuilder.getFirstMoveForHost(this.gameNotation.moves[this.gameNotation.moves.length - 1].plantedFlowerType);
		this.gameNotation.addMove(this.gameNotation.getNotationMoveFromBuilder(hostMoveBuilder));
		finalizeMove();
	}
	if (this.gameNotation.getPlayerMoveNum() === 2 && getCurrentPlayer() === GUEST) {
		this.playAiTurn(finalizeMove);
	}
};

FirePaiShoController.prototype.getAiList = function() {
	return [];
};

FirePaiShoController.prototype.getCurrentPlayer = function() {
//	if (this.gameNotation.moves.length <= 1) {
//		if (this.gameNotation.moves.length === 0) {
//			return HOST;
//		} else {
//			return GUEST;
//		}
//	}
	if (this.gameNotation.moves.length == 0) {
		return GUEST;
	}
	var lastPlayer = this.gameNotation.moves[this.gameNotation.moves.length - 1].player;

	if (lastPlayer === HOST) {
		return GUEST;
	} else if (lastPlayer === GUEST) {
		return HOST;
	}
};

FirePaiShoController.prototype.cleanup = function() {
	// Nothing.
};

FirePaiShoController.prototype.isSolitaire = function() {
	return false;
};

FirePaiShoController.prototype.setGameNotation = function(newGameNotation) {
	this.gameNotation.setNotationText(newGameNotation);
};

FirePaiShoController.prototype.getAdditionalHelpTabDiv = function() {
	var settingsDiv = document.createElement("div");

	var heading = document.createElement("h4");
	heading.innerText = "Fire Pai Sho Preferences:";

	settingsDiv.appendChild(heading);
	settingsDiv.appendChild(FirePaiShoController.buildTileDesignDropdownDiv());

	settingsDiv.appendChild(document.createElement("br"));

	settingsDiv.appendChild(this.buildToggleHarmonyAidsDiv());

	settingsDiv.appendChild(document.createElement("br"));

	settingsDiv.appendChild(this.buildBoardRotateDiv());

	settingsDiv.appendChild(document.createElement("br"));

	return settingsDiv;
};

FirePaiShoController.buildTileDesignDropdownDiv = function(alternateLabelText) {
	var labelText = alternateLabelText ? alternateLabelText : "Tile Designs";
	return buildDropdownDiv("FirePaiShoTileDesignDropdown", labelText + ":", tileDesignTypeValues,
							localStorage.getItem(tileDesignTypeKey),
							function() {
								setSkudTilesOption(this.value);
							});
};

FirePaiShoController.prototype.buildToggleHarmonyAidsDiv = function() {
	var div = document.createElement("div");
	var onOrOff = getUserGamePreference(FirePaiShoController.hideHarmonyAidsKey) !== "true" ? "on" : "off";
	div.innerHTML = "Harmony aids are " + onOrOff + ": <span class='skipBonus' onclick='gameController.toggleHarmonyAids();'>toggle</span>";
	if (gameOptionEnabled(NO_HARMONY_VISUAL_AIDS)) {
		div.innerHTML += " (Will not affect games with " + NO_HARMONY_VISUAL_AIDS + " game option)";
	}
	return div;
};

FirePaiShoController.prototype.buildBoardRotateDiv = function() {
	var div = document.createElement("div");
	var orientation = getUserGamePreference(FirePaiShoController.boardRotationKey) !== "true" ? "Desert" : "Skud";
	div.innerHTML = "Board orientation: " + orientation + ": <span class='skipBonus' onclick='gameController.toggleBoardRotation();'>toggle</span>";
	return div;
};

FirePaiShoController.prototype.toggleHarmonyAids = function() {
	setUserGamePreference(FirePaiShoController.hideHarmonyAidsKey, 
		getUserGamePreference(FirePaiShoController.hideHarmonyAidsKey) !== "true");
	clearMessage();
	this.callActuate();
};


FirePaiShoController.prototype.toggleBoardRotation = function() {
	setUserGamePreference(FirePaiShoController.boardRotationKey, 
		getUserGamePreference(FirePaiShoController.boardRotationKey) !== "true");
	clearMessage();
	this.createActuator();
	this.callActuate();
	refreshMessage();
};

FirePaiShoController.prototype.setAnimationsOn = function(isAnimationsOn) {
	this.actuator.setAnimationOn(isAnimationsOn);
};

