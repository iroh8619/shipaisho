// Actuator

export function OvergrowthActuator(gameContainer, isMobile) {
	this.gameContainer = gameContainer;
	this.mobile = isMobile;

	var containers = setupPaiShoBoard(
		this.gameContainer, 
		OvergrowthController.getHostTilesContainerDivs(),
		OvergrowthController.getGuestTilesContainerDivs(), 
		false
	);

	this.boardContainer = containers.boardContainer;
	this.arrowContainer = containers.arrowContainer;
	this.hostTilesContainer = containers.hostTilesContainer;
	this.guestTilesContainer = containers.guestTilesContainer;
}

OvergrowthActuator.prototype.actuate = function(board, theGame, markingManager, drawnTile) {
	var self = this;

	window.requestAnimationFrame(function() {
		self.htmlify(board, theGame, markingManager, drawnTile);
	});
};

OvergrowthActuator.prototype.htmlify = function(board, theGame, markingManager, drawnTile) {
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
				self.addBoardPoint(cell);
			}
		});
	});

	// Draw all arrows
	for (var [_, arrow] of Object.entries(markingManager.arrows)) {
		this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]));
	}

	var fullTileSet = new OvergrowthTileManager(true);

	// Go through tile piles and clear containers
	fullTileSet.hostTiles.forEach(function(tile) {
		self.clearTileContainer(tile);
	});

	fullTileSet.guestTiles.forEach(function(tile) {
		self.clearTileContainer(tile);
	});

	// Add the randomTileContainer... wherever that tile comes from
	if (!theGame.getWinner() && drawnTile) {
		this.addTile(drawnTile);
	}
};

OvergrowthActuator.prototype.clearContainer = function (container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

OvergrowthActuator.prototype.clearTileContainer = function (tile) {
	var container = document.querySelector("." + tile.getImageName());
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

OvergrowthActuator.prototype.addTile = function(tile, mainContainer) {
	var self = this;

	var container = document.querySelector("." + tile.getImageName());

	var theDiv = document.createElement("div");

	theDiv.classList.add("point");
	theDiv.classList.add("hasTile");

	if (tile.selectedFromPile) {
		theDiv.classList.add("selectedFromPile");
		theDiv.classList.add("drained");
	}

	var theImg = document.createElement("img");
	
	var srcValue = getSkudTilesSrcPath();
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

OvergrowthActuator.prototype.addBoardPoint = function(boardPoint) {
	var self = this;

	var theDiv = createBoardPointDiv(boardPoint);
	
	if (!boardPoint.isType(NON_PLAYABLE)) {
		theDiv.classList.add("activePoint");
		if (boardPoint.isType(MARKED)) {
			theDiv.classList.add("markedPoint");
		}
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			theDiv.classList.add("possibleMove");
		} else if (boardPoint.betweenHarmony) {
			theDiv.classList.add("betweenHarmony");
			if (boardPoint.betweenHarmonyHost) {
				theDiv.classList.add("bhHost");
			}
			if (boardPoint.betweenHarmonyGuest) {
				theDiv.classList.add("bhGuest");
			}
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

	if (boardPoint.hasTile()) {
		theDiv.classList.add("hasTile");
		
		var theImg = document.createElement("img");

		var srcValue = getSkudTilesSrcPath();
		theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";
		
		if (boardPoint.tile.inHarmony) {
			theDiv.classList.add(HOST + "harmony");
		}
		if (boardPoint.tile.inClash) {
			theDiv.classList.add(GUEST + "harmony");
		}
		
		theDiv.appendChild(theImg);
	}

	this.boardContainer.appendChild(theDiv);

	if (boardPoint.betweenHarmony && boardPoint.col === 16) {
		var theBr = document.createElement("div");
		theBr.classList.add("clear");
		this.boardContainer.appendChild(theBr);
	}
};

OvergrowthActuator.prototype.printBoard = function(board) {

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

