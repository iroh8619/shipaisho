// Trifle Actuator

import { ElementStyleTransform } from '../util/ElementStyleTransform';
import { GUEST, HOST } from '../CommonNotationObjects';
import {
  MARKED,
  NON_PLAYABLE,
  POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { TrifleController } from './TrifleController';
import {
  RmbDown,
  RmbUp,
  clearMessage,
  pieceAnimationLength,
  showTileMessage,
  unplayedTileClicked,
} from '../PaiShoMain';
import { TrifleAttributeType } from './TrifleTileInfo';
import { TrifleTile } from './TrifleTile';
import { TrifleTileCodes } from './TrifleTiles';
import {
  cos45,
  createBoardArrow,
  createBoardPointDiv,
  setupPaiShoBoard,
  sin45,
} from '../ActuatorHelp';
import { debug } from '../GameData';
import {
  guestPlayerCode,
  hostPlayerCode,
} from '../pai-sho-common/PaiShoPlayerHelp';

export function TrifleActuator(gameContainer, isMobile) {
	this.gameContainer = gameContainer;
	this.mobile = isMobile;

	var containers = setupPaiShoBoard(
		this.gameContainer, 
		TrifleController.getHostTilesContainerDivs(),
		TrifleController.getGuestTilesContainerDivs(), 
		true
	);

	this.boardContainer = containers.boardContainer;
	this.arrowContainer = containers.arrowContainer;
	this.hostTilesContainer = containers.hostTilesContainer;
	this.guestTilesContainer = containers.guestTilesContainer;
}

// TrifleActuator.imagePath = "images/Trifle/standard/";
TrifleActuator.imagePath = "images/Trifle/chuji/";
TrifleActuator.hostTeamTilesDivId = "hostTilesContainer";
TrifleActuator.guestTeamTilesDivId = "guestTilesContainer";

TrifleActuator.prototype.actuate = function(board, tileManager, markingManager) {
	var self = this;

	// self.printBoard(board);

	window.requestAnimationFrame(function () {
		self.htmlify(board, tileManager, markingManager);
	});
};

TrifleActuator.prototype.htmlify = function(board, tileManager, markingManager) {
	this.clearContainer(this.boardContainer);
	this.clearContainer(this.arrowContainer);

	var self = this;

	board.cells.forEach(function(column) {
		column.forEach(function(cell) {
			if (markingManager.pointIsMarked(cell) && !cell.isType(MARKED)){
				cell.addType(MARKED);
			}
			else if (!markingManager.pointIsMarked(cell) && cell.isType(MARKED)){
				cell.removeType(MARKED);
			}
			if (cell) {
				self.addBoardPoint(cell, board);
			}
		});
	});

	// Draw all arrows
	for (var [_, arrow] of Object.entries(markingManager.arrows)) {
		this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]));
	}

	/* Player Tiles */
	/* Team Tiles */
	// Go through tile piles and clear containers
	self.clearContainerWithId(TrifleActuator.hostTeamTilesDivId);
	self.clearContainerWithId(TrifleActuator.guestTeamTilesDivId);
	if (tileManager.playersAreSelectingTeams() && !tileManager.hostTeamIsFull()
			|| !tileManager.playersAreSelectingTeams()) {
		tileManager.hostTiles.forEach(function(tile) {
			self.addTeamTile(tile, HOST);
		});
	}
	if (tileManager.playersAreSelectingTeams() && !tileManager.guestTeamIsFull()
			|| !tileManager.playersAreSelectingTeams()) {
		tileManager.guestTiles.forEach(function(tile) {
			self.addTeamTile(tile, GUEST);
		});
	}

	/* Team Selection Area */
	if (!tileManager.hostTeamIsFull()) {
		this.addLineBreakInTilePile(HOST);
		this.addLineBreakInTilePile(HOST);
		Object.keys(TrifleTileCodes).forEach(function(key,index) {
			if (PaiShoGames.currentTileMetadata[key] && PaiShoGames.currentTileMetadata[key].available) {
				self.addTeamTile(new TrifleTile(TrifleTileCodes[key], hostPlayerCode), HOST, true);
			}
		});
	} else if (!tileManager.guestTeamIsFull()) {
		this.addLineBreakInTilePile(GUEST);
		this.addLineBreakInTilePile(GUEST);
		Object.keys(TrifleTileCodes).forEach(function(key,index) {
			if (PaiShoGames.currentTileMetadata[key] && PaiShoGames.currentTileMetadata[key].available) {
				self.addTeamTile(new TrifleTile(TrifleTileCodes[key], guestPlayerCode), GUEST, true);
			}
		});
	}
};

TrifleActuator.prototype.clearContainer = function (container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

TrifleActuator.prototype.clearContainerWithId = function(containerIdName) {
	var container = document.getElementById(containerIdName);
	if (container) {
		this.clearContainer(container);
	}
};

// TrifleActuator.prototype.clearTileContainer = function(tile) {
// 	var container = document.querySelector("." + tile.getImageName());
// 	while (container.firstChild) {
// 		container.removeChild(container.firstChild);
// 	}
// };

TrifleActuator.prototype.addLineBreakInTilePile = function(player) {
	var containerDivId = player === HOST 
								? TrifleActuator.hostTeamTilesDivId
								: TrifleActuator.guestTeamTilesDivId;
	var container = document.getElementById(containerDivId);

	var theBr = document.createElement("br");
	theBr.classList.add("clear");
	container.appendChild(theBr);
};

TrifleActuator.prototype.addTeamTile = function(tile, player, isForTeamSelection) {
	var self = this;

	var containerDivId = player === HOST 
								? TrifleActuator.hostTeamTilesDivId
								: TrifleActuator.guestTeamTilesDivId;
	var container = document.getElementById(containerDivId);

	var theDiv = document.createElement("div");

	theDiv.classList.add("point");
	theDiv.classList.add("hasTile");

	if (isForTeamSelection) {
		theDiv.classList.add("selectedFromPile");
	} else if (tile.selectedFromPile) {
		theDiv.classList.add("selectedFromPile");
		theDiv.classList.add("drained");
	}

	var theImg = document.createElement("img");

	var srcValue = TrifleActuator.imagePath;

	theImg.src = srcValue + tile.getImageName() + ".png";
	theDiv.appendChild(theImg);

	theDiv.setAttribute("name", tile.getImageName());
	theDiv.setAttribute("id", tile.id);

	if (this.mobile) {
		theDiv.addEventListener('click', () => {
				unplayedTileClicked(this);
				showTileMessage(this);
			});
	} else {
		theDiv.addEventListener('click', () => unplayedTileClicked(this));
		theDiv.addEventListener('mouseover', () => showTileMessage(this));
		theDiv.addEventListener('mouseout', clearMessage);
	}

	container.appendChild(theDiv);
};

TrifleActuator.prototype.addBoardPoint = function(boardPoint, board) {
	var self = this;

	var theDiv = createBoardPointDiv(boardPoint);

	if (!boardPoint.isType(NON_PLAYABLE)) {
		theDiv.classList.add("activePoint");
		theDiv.classList.add("vagabondPointRotate");
		if (boardPoint.isType(MARKED)) {
			theDiv.classList.add("markedPoint");
		}	
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			theDiv.classList.add("possibleMove");
			if (board.currentlyDeployingTileInfo && board.currentlyDeployingTileInfo.attributes
					&& board.currentlyDeployingTileInfo.attributes.includes(TrifleAttributeType.gigantic)) {
				// Gigantic!
				this.adjustBoardPointForGiganticDeploy(theDiv, boardPoint);
			}

			theDiv.style.zIndex = 95;
		}
		
		if (this.mobile) {
			theDiv.setAttribute("onclick", "pointClicked(this); showPointMessage(this);");
		} else {
			theDiv.setAttribute("onclick", "pointClicked(this);");
			theDiv.setAttribute("onmouseover", "showPointMessage(this);");
			theDiv.addEventListener('mouseout', clearMessage);
			theDiv.addEventListener('mousedown', e => {
				 // Right Mouse Button
				if (e.button == 2) {
					RmbDown(theDiv);
				}
			});
			theDiv.addEventListener('mouseup', e => {
				 // Right Mouse Button
				if (e.button == 2) {
					RmbUp(theDiv);
				}
			});
			theDiv.addEventListener('contextmenu', e => {
					e.preventDefault();
			});
		}
	}

	if (boardPoint.hasTile() && !boardPoint.occupiedByAbility) {
		theDiv.classList.add("hasTile");
		
		var theImg = document.createElement("img");
		theImg.elementStyleTransform = new ElementStyleTransform(theImg);
		theImg.elementStyleTransform.setValue("rotate", 315, "deg");

		var moveToAnimate = null;
		if (moveToAnimate || boardPoint.tile.isGigantic) {
			this.doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv);
		}

		var srcValue = TrifleActuator.imagePath;
		
		theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";
		
		theDiv.appendChild(theImg);
	}

	if (boardPoint.occupiedByAbility) {
		theDiv.classList.remove("activePoint");
	}

	this.boardContainer.appendChild(theDiv);

	if (boardPoint.betweenHarmony && boardPoint.col === 16) {
		var theBr = document.createElement("div");
		theBr.classList.add("clear");
		this.boardContainer.appendChild(theBr);
	}
};

TrifleActuator.prototype.adjustBoardPointForGiganticDeploy = function(theDiv, boardPoint) {
	var x = boardPoint.col, y = boardPoint.row, ox = x, oy = y;

	var pointSizeMultiplierX = 34;
	var pointSizeMultiplierY = pointSizeMultiplierX;
	var unitString = "px";

	/* For small screen size using dynamic vw units */
	if (window.innerWidth <= 612) {
		pointSizeMultiplierX = 5.5555;
		pointSizeMultiplierY = 5.611;
		unitString = "vw";
	}

	var scaleValue = 1;

	var left = (x - ox);
	var top = (y - oy);

	left += 0.7;
	// top += 0.5;
	
	theDiv.style.left = ((left * cos45 - top * sin45) * pointSizeMultiplierX) + unitString;
	theDiv.style.top = ((top * cos45 + left * sin45) * pointSizeMultiplierY) + unitString;

	theDiv.style.transform = "scale(" + scaleValue + ")";
};

TrifleActuator.prototype.doAnimateBoardPoint = function(boardPoint, moveToAnimate, theImg, theDiv) {
	// if (!this.animationOn) return;

	var x = boardPoint.col, y = boardPoint.row, ox = x, oy = y;

	/* if (moveToAnimate.moveType === MOVE && boardPoint.tile) {
		if (isSamePoint(moveToAnimate.endPoint, x, y)) {// Piece moved
			x = moveToAnimate.startPoint.rowAndColumn.col;
			y = moveToAnimate.startPoint.rowAndColumn.row;
			theImg.style.transform = "scale(1.2)";	// Make the pieces look like they're picked up a little when moving, good idea or no?
			theDiv.style.zIndex = 99;	// Make sure "picked up" pieces show up above others
		}
	} else if (moveToAnimate.moveType === DEPLOY) {
		if (isSamePoint(moveToAnimate.endPoint, ox, oy)) {// Piece planted
			if (piecePlaceAnimation === 1) {
				theImg.style.transform = "scale(2)";
				theDiv.style.zIndex = 99;
				requestAnimationFrame(function() {
					theImg.style.transform = "scale(1)";
				});
			}
		}
	} */

	var pointSizeMultiplierX = 34;
	var pointSizeMultiplierY = pointSizeMultiplierX;
	var unitString = "px";

	/* For small screen size using dynamic vw units */
	if (window.innerWidth <= 612) {
		pointSizeMultiplierX = 5.5555;
		pointSizeMultiplierY = 5.611;
		unitString = "vw";
	}

	var scaleValue = 1;

	if (boardPoint.tile.isGigantic) {
		scaleValue = 2;
	}

	var finalLeft = 0;
	var finalTop = 0;

	var left = (x - ox);
	var top = (y - oy);
	if (boardPoint.tile.isGigantic) {
		// left += 0.5;
		// top += 0.5;
		// finalLeft += 0.5;
		// finalTop += 0.5;

		left += 0.7;
		// top += 0.5;
		finalLeft += 0.7;
		// finalTop += 0.5;

		theDiv.style.zIndex = 90;
	}
	theDiv.style.left = ((left * cos45 - top * sin45) * pointSizeMultiplierX) + unitString;
	theDiv.style.top = ((top * cos45 + left * sin45) * pointSizeMultiplierY) + unitString;

	theDiv.style.transform = "scale(" + scaleValue + ")";

	requestAnimationFrame(function() {
		theDiv.style.left = ((finalLeft * cos45 - finalTop * sin45) * pointSizeMultiplierX) + unitString;
		theDiv.style.top = ((finalTop * cos45 + finalLeft * sin45) * pointSizeMultiplierY) + unitString;
	});
	setTimeout(function() {
		requestAnimationFrame(function() {
			theDiv.style.transform = "scale(" + scaleValue + ")";	// This will size back to normal after moving
		});
	}, pieceAnimationLength);
};

TrifleActuator.prototype.printBoard = function(board) {

	debug("");
	var rowNum = 0;
	board.cells.forEach(function (row) {
		var rowStr = rowNum + "\t: ";
		row.forEach(function (boardPoint) {
			var str = boardPoint.getConsoleDisplay();
			if (str.length < 3) {
				rowStr += " ";
			}
			rowStr = rowStr + str;
			if (str.length < 2) {
				rowStr = rowStr + " ";
			}
			
		});
		debug(rowStr);
		rowNum++;
	});
	debug("");
};

