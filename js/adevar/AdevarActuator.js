// Actuator

import { ADEVAR_GUEST_ROTATE, ADEVAR_ROTATE } from '../GameOptions';
import { AdevarController } from './AdevarController';
import { AdevarOptions } from './AdevarOptions';
import { AdevarTileType } from './AdevarTile';
import { DEPLOY, GUEST, HOST, MOVE } from '../CommonNotationObjects';
import { ElementStyleTransform } from '../util/ElementStyleTransform';
import {
  MARKED,
  NON_PLAYABLE,
  POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import {
  RmbDown,
  RmbUp,
  clearMessage,
  getUsername,
  pieceAnimationLength,
  piecePlaceAnimation,
  pointClicked,
  showPointMessage,
  showTileMessage,
  unplayedTileClicked,
} from '../PaiShoMain';
import {
  createBoardArrow,
  createBoardPointDiv,
  getTilesForPlayer,
  isSamePoint,
  setupPaiShoBoard,
} from '../ActuatorHelp';

export function AdevarActuator(gameContainer, isMobile, enableAnimations) {
	this.gameContainer = gameContainer;
	this.mobile = isMobile;

	this.animationOn = enableAnimations;

	this.orientalLilyDivs = [];

	var containers = setupPaiShoBoard(
		this.gameContainer, 
		AdevarController.getHostTilesContainerDivs(),
		AdevarController.getGuestTilesContainerDivs(), 
		true, 
		AdevarOptions.viewAsGuest ? ADEVAR_GUEST_ROTATE : ADEVAR_ROTATE,
		true
	);

	this.boardContainer = containers.boardContainer;
	this.arrowContainer = containers.arrowContainer;
	this.hostTilesContainer = containers.hostTilesContainer;
	this.guestTilesContainer = containers.guestTilesContainer;
}

AdevarActuator.hostTeamTilesDivId = "hostTilesContainer";
AdevarActuator.guestTeamTilesDivId = "guestTilesContainer";

AdevarActuator.spaceTilesScaleMultiplier = 1;

AdevarActuator.prototype.setAnimationOn = function(isOn) {
	this.animationOn = isOn;
};

AdevarActuator.prototype.actuate = function(board, tileManager, markingManager, capturedTiles, moveToAnimate) {
	var self = this;
	this.orientalLilyDivs = [];

	window.requestAnimationFrame(function () {
		self.htmlify(board, tileManager, markingManager, moveToAnimate, capturedTiles);
	});
};

AdevarActuator.prototype.htmlify = function(board, tileManager, markingManager, moveToAnimate, capturedTiles) {
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
				self.addBoardPoint(cell, moveToAnimate);
			}
		});
	});

	// Draw all arrows
	for (var [_, arrow] of Object.entries(markingManager.arrows)) {
		this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]));
	}

	self.clearContainerWithId(AdevarActuator.hostTeamTilesDivId);
	self.clearContainerWithId(AdevarActuator.guestTeamTilesDivId);

	// Host Tile Reserve
	var hostTileReserveContainer = document.createElement("span");
	hostTileReserveContainer.classList.add("tileLibraryNoMargin");
	// var hostReserveLabel = document.createElement("span");
	// hostReserveLabel.innerText = "--Host Tile Reserve--";
	// hostTileReserveContainer.appendChild(hostReserveLabel);
	hostTileReserveContainer.appendChild(document.createElement("br"));
	this.hostTilesContainer.appendChild(hostTileReserveContainer);

	var hostCapturedTiles = getTilesForPlayer(capturedTiles, HOST);
	var guestCapturedTiles = getTilesForPlayer(capturedTiles, GUEST);

	var showHostCapturedTiles = hostCapturedTiles.length > 0;
	if (showHostCapturedTiles) {
		var hostCapturedTilesContainer = document.createElement("span");
		hostCapturedTilesContainer.classList.add("tileLibrary");
		var capturedTileLabel = document.createElement("span");
		capturedTileLabel.innerText = "--Captured Tiles--";
		hostCapturedTilesContainer.appendChild(capturedTileLabel);
		hostCapturedTilesContainer.appendChild(document.createElement("br"));
		this.hostTilesContainer.appendChild(hostCapturedTilesContainer);
	}

	// Guest Tile Reserve
	var guestTileReserveContainer = document.createElement("span");
	guestTileReserveContainer.classList.add("tileLibraryNoMargin");
	// var guestReserveLabel = document.createElement("span");
	// guestReserveLabel.innerText = "--Guest Tile Reserve--";
	// guestTileReserveContainer.appendChild(guestReserveLabel);
	guestTileReserveContainer.appendChild(document.createElement("br"));
	this.guestTilesContainer.appendChild(guestTileReserveContainer);

	var showGuestCapturedTiles = guestCapturedTiles.length > 0;
	if (showGuestCapturedTiles) {
		var guestCapturedTilesContainer = document.createElement("span");
		guestCapturedTilesContainer.classList.add("tileLibrary");
		var capturedTileLabel = document.createElement("span");
		capturedTileLabel.innerText = "--Captured Tiles--";
		guestCapturedTilesContainer.appendChild(capturedTileLabel);
		guestCapturedTilesContainer.appendChild(document.createElement("br"));
		this.guestTilesContainer.appendChild(guestCapturedTilesContainer);
	}

	var prevTile = null;
	tileManager.hostTiles.forEach(function(tile) {
		if (getUsername() === 'SkudPaiSho' && prevTile && (prevTile.type !== tile.type
				|| (prevTile.type === AdevarTileType.basic && prevTile.code !== tile.code) 
				|| (prevTile.type === AdevarTileType.gate && prevTile.code !== tile.code))) {
			var theP = document.createElement("br");
			theP.style.clear = "both";
			hostTileReserveContainer.appendChild(theP);
		}
		self.addTile(tile, hostTileReserveContainer);
		prevTile = tile;
	});
	prevTile = null;
	tileManager.guestTiles.forEach(function(tile) {
		if (getUsername() === 'SkudPaiSho' && prevTile && (prevTile.type !== tile.type
				|| (prevTile.type === AdevarTileType.basic && prevTile.code !== tile.code))) {
			var theP = document.createElement("br");
			theP.style.clear = "both";
			guestTileReserveContainer.appendChild(theP);
		}
		self.addTile(tile, guestTileReserveContainer);
		prevTile = tile;
	});
	if (showHostCapturedTiles) {
		hostCapturedTiles.forEach(function(tile) {
			self.addTile(tile, hostCapturedTilesContainer, true);
		});
	}
	if (showGuestCapturedTiles) {
		guestCapturedTiles.forEach(function(tile) {
			self.addTile(tile, guestCapturedTilesContainer, true);
		});
	}
};

AdevarActuator.prototype.clearContainer = function (container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

AdevarActuator.prototype.clearContainerWithId = function(containerIdName) {
	var container = document.getElementById(containerIdName);
	if (container) {
		this.clearContainer(container);
	}
};

AdevarActuator.prototype.clearTileContainer = function (tile) {
	var container = document.querySelector("." + tile.getNotationName());
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

AdevarActuator.prototype.addTile = function(tile, tileContainer, isCaptured) {
	if (!tile) {
		return;
	}
	var theDiv = document.createElement("div");

	theDiv.classList.add("point");
	theDiv.classList.add("hasTile");

	if (tile.selectedFromPile) {
		theDiv.classList.add("selectedFromPile");
		theDiv.classList.add("drained");
	}

	var theImg = document.createElement("img");

	var scaleMultiplier = 1;
	if (AdevarOptions.isSpaceTiles()) {
		// scaleMultiplier = 1.2;
		theDiv.classList.add("pointSquare");
	}
	theImg.style.transform = AdevarActuator.buildScaleString(1, scaleMultiplier);
	
	var srcValue = this.getTileSrcPath(tile);
	theImg.src = srcValue + tile.getImageName() + ".png";
	theDiv.appendChild(theImg);

	theDiv.setAttribute("name", tile.getNotationName());
	theDiv.setAttribute("id", tile.id);

	if (!isCaptured) {
		if (this.mobile) {
			// theDiv.setAttribute("onclick", "unplayedTileClicked(this); showTileMessage(this);");
			theDiv.addEventListener('click', () => {
				unplayedTileClicked(theDiv);
				showTileMessage(theDiv);
			});
		} else {
			// theDiv.setAttribute("onclick", "unplayedTileClicked(this);");
			theDiv.addEventListener('click', () => unplayedTileClicked(theDiv));
			
			// theDiv.setAttribute("onmouseover", "showTileMessage(this);");
			theDiv.addEventListener('mouseover', () => showTileMessage(theDiv));
			
			// theDiv.setAttribute("onmouseout", "clearMessage();");
			theDiv.addEventListener('mouseout', clearMessage);
		}
	}

	tileContainer.appendChild(theDiv);
};

AdevarActuator.prototype.getTileSrcPath = function(tile) {
	var srcValue = "images/";
	var gameImgDir = "Adevar/" + localStorage.getItem(AdevarOptions.tileDesignTypeKey);
	srcValue = srcValue + gameImgDir + "/";
	return srcValue;
};

AdevarActuator.prototype.addBoardPoint = function(boardPoint, moveToAnimate) {
	var self = this;

	var useSquareSpaces = AdevarOptions.isSpaceTiles();
	var theDiv = createBoardPointDiv(boardPoint, useSquareSpaces);
	
	if (!boardPoint.isType(NON_PLAYABLE)) {
		theDiv.classList.add("activePoint");
		if (boardPoint.isType(MARKED)) {
			theDiv.classList.add("markedPoint");
		}	
		if (AdevarOptions.viewAsGuest) {
			theDiv.classList.add("adevarGuestPointRotate");
		} else {
			theDiv.classList.add("adevarPointRotate");
		}

		if (boardPoint.isType(POSSIBLE_MOVE)) {
			theDiv.classList.add("possibleMove");
		}
		
		if (this.mobile) {
			theDiv.addEventListener("click", () => { pointClicked(theDiv); showPointMessage(theDiv);});
		} else {
			theDiv.addEventListener("click", () => { pointClicked(theDiv);});
			theDiv.addEventListener("mouseover", () => { showPointMessage(theDiv);});
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

	if (boardPoint.gardenHighlightNumbers.length > 0) {
		boardPoint.gardenHighlightNumbers.forEach(function(number) {
			theDiv.classList.add("adevar_highlight" + number);
		});
		this.orientalLilyDivs.push(theDiv);
	}

	if (boardPoint.hasTile()) {
		theDiv.classList.add("hasTile");
		
		var theImg = document.createElement("img");
		theImg.elementStyleTransform = new ElementStyleTransform(theImg);

		if (AdevarOptions.isSpaceTiles()) {
			theImg.elementStyleTransform.setValue("scale", AdevarActuator.spaceTilesScaleMultiplier);
			if (boardPoint.tile.ownerName === HOST) {
				theImg.elementStyleTransform.setValue("rotate", 180, "deg");
			}
		} else {
			theImg.elementStyleTransform.setValue("rotate", 225, "deg");
			if (AdevarOptions.viewAsGuest) {
				theImg.elementStyleTransform.adjustValue("rotate", 180, "deg");
			}
		}

		if (moveToAnimate) {
			this.doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv);
		}

		var srcValue = this.getTileSrcPath(boardPoint.tile);

		var tileMoved = boardPoint.tile;

		var showMovedTileDuringAnimation = this.animationOn && moveToAnimate && moveToAnimate.moveTileResults && moveToAnimate.moveTileResults.tileMoved
											&& isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row);
		if (showMovedTileDuringAnimation) {
			tileMoved = moveToAnimate.moveTileResults.tileMoved;
		}

		if (this.animationOn && moveToAnimate && moveToAnimate.moveTileResults && isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row)
				&& moveToAnimate.moveTileResults.tileMoved !== moveToAnimate.moveTileResults.tileInEndPoint) {
			/* This is when a SF tile attempts to capture wrong HT */

			/* Set actual moved tile */
			tileMoved = moveToAnimate.moveTileResults.tileMoved;

			/* Show HT at end point until animation is over (show it like a captured tile would be shown) */
			var theImgCaptured = document.createElement("img");
			theImgCaptured.elementStyleTransform = new ElementStyleTransform(theImgCaptured);
			theImgCaptured.src = srcValue + moveToAnimate.moveTileResults.tileInEndPoint.getImageName() + ".png";
			theImgCaptured.classList.add("underneath");

			if (AdevarOptions.isSpaceTiles()) {
				theImgCaptured.elementStyleTransform.setValue("scale", AdevarActuator.spaceTilesScaleMultiplier);
				if (moveToAnimate.moveTileResults.tileInEndPoint.ownerName === HOST) {
					theImgCaptured.elementStyleTransform.setValue("rotate", 180, "deg");
				}
			} else {
				theImgCaptured.elementStyleTransform.setValue("rotate", 225, "deg");
			}

			theDiv.appendChild(theImgCaptured);

			/* After animation, hide moved tile */
			setTimeout(function() {
				requestAnimationFrame(function() {
					theImg.style.visibility = "hidden";
				});
			}, pieceAnimationLength * 1.6);
		}

		theImg.src = srcValue + tileMoved.getImageName() + ".png";
		
		theDiv.appendChild(theImg);

		var capturedTile = this.getCapturedTileFromMoveToAnimate(moveToAnimate);

		if (showMovedTileDuringAnimation) {
			setTimeout(function() {
				requestAnimationFrame(function(){
					theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";
				});
			}, pieceAnimationLength);
		}

		if (this.animationOn && moveToAnimate && capturedTile && isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row)) {
			var theImgCaptured = document.createElement("img");
			theImgCaptured.elementStyleTransform = new ElementStyleTransform(theImgCaptured);
			theImgCaptured.src = srcValue + capturedTile.getImageName() + ".png";
			theImgCaptured.classList.add("underneath");

			if (AdevarOptions.isSpaceTiles()) {
				theImgCaptured.elementStyleTransform.setValue("scale", AdevarActuator.spaceTilesScaleMultiplier);
				if (capturedTile.ownerName === HOST) {
					theImgCaptured.elementStyleTransform.setValue("rotate", 180, "deg");
				}
			} else {
				theImgCaptured.elementStyleTransform.setValue("rotate", 225, "deg");
			}

			theDiv.appendChild(theImgCaptured);

			/* After animation, hide captured tile */
			setTimeout(function() {
				requestAnimationFrame(function() {
					theImgCaptured.style.visibility = "hidden";
				});
			}, pieceAnimationLength);
		}
	}

	this.boardContainer.appendChild(theDiv);
};

AdevarActuator.prototype.getCapturedTileFromMoveToAnimate = function(moveToAnimate) {
	if (moveToAnimate && moveToAnimate.placeTileResults) {
		return moveToAnimate.placeTileResults.capturedTile;
	} else if (moveToAnimate && moveToAnimate.moveTileResults) {
		return moveToAnimate.moveTileResults.capturedTile;
	}
};

AdevarActuator.prototype.doAnimateBoardPoint = function(boardPoint, moveToAnimate, theImg, theDiv) {
	if (!this.animationOn) return;

	var scaleMultiplier = 1;
	if (AdevarOptions.isSpaceTiles()) {
		scaleMultiplier = AdevarActuator.spaceTilesScaleMultiplier;
	}

	var x = boardPoint.col, y = boardPoint.row, ox = x, oy = y;

	if (moveToAnimate.moveType === MOVE && boardPoint.tile) {
		if (isSamePoint(moveToAnimate.endPoint, x, y)) {// Piece moved
			x = moveToAnimate.startPoint.rowAndColumn.col;
			y = moveToAnimate.startPoint.rowAndColumn.row;
			// theImg.style.transform = AdevarActuator.buildScaleString(1.2, scaleMultiplier) + " " + theImg.transformRotate;	// Make the pieces look like they're picked up a little when moving, good idea or no?
			theImg.elementStyleTransform.setValue("scale", 1.2 * scaleMultiplier);
			theDiv.style.zIndex = 99;	// Make sure "picked up" pieces show up above others
		}
	} else if (moveToAnimate.moveType === DEPLOY) {
		if (isSamePoint(moveToAnimate.endPoint, ox, oy)) {// Piece planted
			if (piecePlaceAnimation === 1) {
				// theImg.style.transform = AdevarActuator.buildScaleString(2, scaleMultiplier) + " " + theImg.transformRotate; // "scale(2)";
				theImg.elementStyleTransform.setValue("scale", 2 * scaleMultiplier);
				theDiv.style.zIndex = 99;
				requestAnimationFrame(function() {
					// theImg.style.transform = AdevarActuator.buildScaleString(1, scaleMultiplier) + " " + theImg.transformRotate; // "scale(1)";
					theImg.elementStyleTransform.setValue("scale", scaleMultiplier);
				});
			}
		}
	}

	var pointSizeMultiplierX = 34;
	var pointSizeMultiplierY = pointSizeMultiplierX;
	var unitString = "px";

	/* For small screen size using dynamic vw units */
	if (window.innerWidth <= 612) {
		pointSizeMultiplierX = 5.5555;
		pointSizeMultiplierY = 5.611;
		unitString = "vw";
	}

	var left = (x - ox);
	var top = (y - oy);
	if (AdevarOptions.viewAsGuest) {
		// theImg.style.left = ((left * -cos135 - top * -sin135) * pointSizeMultiplierX) + unitString;
		// theImg.style.top = ((top * -cos135 + left * -sin135) * pointSizeMultiplierY) + unitString;
		theImg.style.left = ((x - ox) * pointSizeMultiplierX) + unitString;
		theImg.style.top = ((y - oy) * pointSizeMultiplierY) + unitString;
	} else {
		// theImg.style.left = ((left * cos135 - top * sin135) * pointSizeMultiplierX) + unitString;
		// theImg.style.top = ((top * cos135 + left * sin135) * pointSizeMultiplierY) + unitString;
		theImg.style.left = (left * pointSizeMultiplierX) + unitString;
		theImg.style.top = (top * pointSizeMultiplierY) + unitString;
	}

	requestAnimationFrame(function() {
		theImg.style.left = "0px";
		theImg.style.top = "0px";
	});
	setTimeout(function() {
		requestAnimationFrame(function() {
			// theImg.style.transform = AdevarActuator.buildScaleString(1, scaleMultiplier) + " " + theImg.transformRotate; //"scale(1)";	// This will size back to normal after moving
			theImg.elementStyleTransform.setValue("scale", scaleMultiplier);
		});
	}, pieceAnimationLength);
};

AdevarActuator.buildScaleString = function(baseScale, scaleMultiplier) {
	var scaleValue = baseScale * scaleMultiplier;
	return "scale(" + scaleValue + ")";	
};

AdevarActuator.prototype.showOrientalLilyHighlights = function(player, gardenIndex) {
	var gardenDivs = this.orientalLilyDivs;
	if (player && gardenIndex >= 0) {
		var numberOffset = 1;
		if (player === GUEST) {
			numberOffset = 4;
		}
		gardenDivs = [];
		this.orientalLilyDivs.forEach(function(lilyDiv){
			if (lilyDiv.classList.contains("adevar_highlight" + (numberOffset + gardenIndex))) {
				gardenDivs.push(lilyDiv);
			}
		});
	}
	gardenDivs.forEach(function(theDiv) {
		theDiv.classList.add("adevar_highlightOn");
	});
};

AdevarActuator.prototype.hideOrientalLilyHighlights = function() {
	this.orientalLilyDivs.forEach(function(theDiv) {
		theDiv.classList.remove("adevar_highlightOn");
	});
};

