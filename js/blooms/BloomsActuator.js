/* Create boardContainer, hostTilesContainer, and guestTilesContainer */
import { BloomsBoardPoint } from './BloomsBoardPoint';
import {
  EIGHT_SIDED_BOARD,
  HEXHEX_10,
  SIX_SIDED_BOARD,
  gameOptionEnabled,
} from '../GameOptions';
import {
  createDivWithClass,
  createDivWithId,
  removeChildren,
} from '../ActuatorHelp';
import { gameController } from '../PaiShoMain';

export function BloomsActuator(gameContainer, isMobile, hostTilesContainerDivs, guestTilesContainerDivs) {
	this.gameContainer = gameContainer;
	this.isMobile = isMobile;

	removeChildren(gameContainer);

	var boardContainer = createDivWithClass("bloomsBoard");

	var boardClass;
	if (gameOptionEnabled(SIX_SIDED_BOARD)) {
		boardClass = "blooms6perSide";
	} else if (gameOptionEnabled(EIGHT_SIDED_BOARD)) {
		boardClass = "blooms8perSide";
	} else if (gameOptionEnabled(HEXHEX_10)) {
		boardClass = "blooms10perSide";
	}
	if (boardClass) {
		boardContainer.classList.add(boardClass);
	}

	var hostTilesContainer = createDivWithClass("hostTilesContainer");
	var guestTilesContainer = createDivWithClass("guestTilesContainer");

	var bcontainer = createDivWithClass("board-container");

	if (boardClass) {
		bcontainer.classList.add(boardClass+"bottomMargin");
	}

	bcontainer.appendChild(boardContainer);

	var response = createDivWithId("response");
	var gameMessage = createDivWithClass("gameMessage");
	var tilePileContainer = createDivWithClass("tilePileContainer");
	var gameMessage2 = createDivWithClass("gameMessage2");

	var hostTilesContainerDivs = hostTilesContainerDivs;
	var guestTilesContainerDivs = guestTilesContainerDivs;
	hostTilesContainer.innerHTML = hostTilesContainerDivs;
	guestTilesContainer.innerHTML = guestTilesContainerDivs;

	tilePileContainer.appendChild(response);
	tilePileContainer.appendChild(gameMessage);
	tilePileContainer.appendChild(hostTilesContainer);
	tilePileContainer.appendChild(guestTilesContainer);
	tilePileContainer.appendChild(gameMessage2);

	gameContainer.appendChild(bcontainer);
	gameContainer.appendChild(tilePileContainer);

	var containers = {
		boardContainer: boardContainer,
		hostTilesContainer: hostTilesContainer,
		guestTilesContainer: guestTilesContainer
	}

	this.boardContainer = containers.boardContainer;
	this.hostTilesContainer = containers.hostTilesContainer;
	this.guestTilesContainer = containers.guestTilesContainer;
}

BloomsActuator.prototype.actuate = function(board) {
	var self = this;

	window.requestAnimationFrame(function () {
		self.htmlify(board);
	});
};

BloomsActuator.prototype.htmlify = function(board) {
	removeChildren(this.boardContainer);

	var self = this;

	var rowNum = 0;
	if (board.cells[-1]) {
		var rowDiv = self.buildRowDiv(1);
		var column = board.cells[-1];

		column.forEach(function(cell) {
			if (cell) {
				self.addBoardPoint(rowDiv, cell);
			}
		});
		self.boardContainer.appendChild(rowDiv);
	}
	board.cells.forEach(function(column) {
		var rowDiv = self.buildRowDiv(rowNum);
		rowNum++;
		column.forEach(function(cell) {
			if (cell) {
				self.addBoardPoint(rowDiv, cell);
			}
		});
		self.boardContainer.appendChild(rowDiv);
	});
};

BloomsActuator.prototype.buildRowDiv = function(rowNum) {
	var rowDiv = createDivWithClass("hexRow");
	if (rowNum % 2 === 1) {
		rowDiv.classList.add("hexRowIndented");
	}
	return rowDiv;
};

BloomsActuator.prototype.addBoardPoint = function(rowDiv, boardPoint) {
	// var theDiv = this.createBoardPointDiv(boardPoint);
	var theDiv = document.createElement("div");

	if (boardPoint.types.includes(BloomsBoardPoint.Types.normal)) {
		var notationPointString = boardPoint.getNotationPointString();
		theDiv.setAttribute("name", notationPointString);
		theDiv.setAttribute("title", notationPointString);
	}

	var theSpan = document.createElement("span");
	theDiv.appendChild(theSpan);

	if (this.isMobile) {
		theDiv.classList.add("mobile");
	} else {
		theDiv.classList.add("desktop");
	}

	if (boardPoint.types.includes(BloomsBoardPoint.Types.nonPlayable)) {
		theDiv.classList.add("hexagonNoShow");
	} else {
		theDiv.classList.add("hexagon");

		if (boardPoint.types.includes(BloomsBoardPoint.Types.normal)) {
			if (this.isMobile) {
				theDiv.setAttribute("onclick", "gameController.pointClicked(this," + boardPoint.bloomId + "); showPointMessage(this);");
			} else {
				theDiv.setAttribute("onclick", "pointClicked(this);");
				theDiv.setAttribute("onmouseover", "showPointMessage(this); gameController.revealBloom(" + boardPoint.bloomId + ");");
				
				var onmouseoutText = "clearMessage()";
				if (boardPoint.hasTile()) {
					onmouseoutText += ";gameController.clearRevealedBloomId(" + boardPoint.bloomId + ")";
				}
				onmouseoutText += ";";
				theDiv.setAttribute("onmouseout", onmouseoutText);
			}
		}

		if (boardPoint.hasTile()) {
			theDiv.classList.add("blooms" + boardPoint.tile);
			if (boardPoint.showRevealEffect) {
				theDiv.classList.add("bloomsRevealEffect");
			}
		}
	}

	/* Show Score */
	var scoreNeededToWin = gameController.theGame.board.scoreNeededToWin;
	var hostScore = gameController.theGame.hostScore;
	var guestScore = scoreNeededToWin - gameController.theGame.guestScore;	/* Guest starts scoring from his side */

	if (hostScore > scoreNeededToWin) {
		hostScore = scoreNeededToWin;
	}
	if (guestScore < 0) {
		guestScore = 0;
	}

	var hostScoreString = hostScore.toString();
	var guestScoreString = guestScore.toString();
	
	if (boardPoint.types.includes(BloomsBoardPoint.Types.scoreTrack)) {
		theDiv.classList.add("hexagonScore");

		if (hostScoreString === boardPoint.scoreTrackString) {
			theDiv.classList.add("hexScoreHost");
		}
		if (guestScoreString === boardPoint.scoreTrackString) {
			theDiv.classList.add("hexScoreGuest");
		}
	}

	/* Add div to row */
	rowDiv.appendChild(theDiv);
};

/*BloomsActuator.prototype.createBoardPointDiv = function(boardPoint) {
	var theDiv = document.createElement("div");

	if (boardPoint.types.includes(BloomsBoardPoint.Types.normal)) {
		var notationPointString = boardPoint.getNotationPointString();
		theDiv.setAttribute("name", notationPointString);
		theDiv.setAttribute("title", notationPointString);
	}

	var theSpan = document.createElement("span");
	theDiv.appendChild(theSpan);

	return theDiv;
};*/

