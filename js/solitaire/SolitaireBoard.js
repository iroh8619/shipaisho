// Solitaire Board

import {
  ACCENT_TILE,
  BASIC_FLOWER,
  BOAT,
  KNOTWEED,
  ORCHID,
  ROCK,
  WHEEL,
  WHITE_LOTUS,
  boatOnlyMoves,
  debug,
  lotusNoCapture,
  newKnotweedRules,
  newOrchidVulnerableRule,
  newWheelRule,
  rocksUnwheelable,
  simpleRocks,
  simpleSpecialFlowerRule,
  simplest,
  superRocks,
} from '../GameData';
import {
  GATE,
  NON_PLAYABLE,
  POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { NotationPoint, RowAndColumn } from '../CommonNotationObjects';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { SolitaireBoardPoint } from './SolitaireBoardPoint';
import { SolitaireHarmony, SolitaireHarmonyManager } from './SolitaireHarmony';
import { SolitaireTile } from './SolitaireTile';
import { showBadMoveModal } from '../PaiShoMain';

export function SolitaireBoard() {
	this.size = new RowAndColumn(17, 17);
	this.cells = this.brandNew();

	this.harmonyManager = new SolitaireHarmonyManager();

	this.rockRowAndCols = [];
	this.playedWhiteLotusTiles = [];
	this.winners = [];
}

SolitaireBoard.prototype.brandNew = function () {
	var cells = [];

	cells[0] = this.newRow(9, 
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.gate(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[1] = this.newRow(11, 
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redWhiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(), 
		SolitaireBoardPoint.neutral()
		]);

	cells[2] = this.newRow(13, 
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.whiteNeutral(), 
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[3] = this.newRow(15,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.whiteNeutral(), 
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[4] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.whiteNeutral(), 
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[5] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.whiteNeutral(), 
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[6] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.whiteNeutral(), 
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[7] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.whiteNeutral(), 
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[8] = this.newRow(17,
		[SolitaireBoardPoint.gate(),
		SolitaireBoardPoint.redWhiteNeutral(), 
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.redWhiteNeutral(),
		SolitaireBoardPoint.gate()
		]);

	cells[9] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redNeutral(), 
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.whiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[10] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redNeutral(), 
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.whiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[11] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redNeutral(), 
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.whiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[12] = this.newRow(17,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redNeutral(), 
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.whiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[13] = this.newRow(15,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redNeutral(), 
		SolitaireBoardPoint.red(),
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.white(),
		SolitaireBoardPoint.whiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[14] = this.newRow(13,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redNeutral(), 
		SolitaireBoardPoint.redWhite(),
		SolitaireBoardPoint.whiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[15] = this.newRow(11,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.redWhiteNeutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	cells[16] = this.newRow(9,
		[SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.gate(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral(),
		SolitaireBoardPoint.neutral()
		]);

	for (var row = 0; row < cells.length; row++) {
		for (var col = 0; col < cells[row].length; col++) {
			cells[row][col].row = row;
			cells[row][col].col = col;
		}
	}

	return cells;
};

SolitaireBoard.prototype.newRow = function(numColumns, points) {
	var cells = [];

	var numBlanksOnSides = (this.size.row - numColumns) / 2;

	var nonPoint = new SolitaireBoardPoint();
	nonPoint.addType(NON_PLAYABLE);

	for (var i = 0; i < this.size.row; i++) {
		if (i < numBlanksOnSides) {
			cells[i] = nonPoint;
		} else if (i < numBlanksOnSides + numColumns) {
			if (points) {
				cells[i] = points[i - numBlanksOnSides];
			} else {
				cells[i] = nonPoint;
			}
		} else {
			cells[i] = nonPoint;
		}
	}

	return cells;
};

SolitaireBoard.prototype.placeTile = function(tile, notationPoint, extraBoatPoint) {
	// Commenting out For Solitaire
	// if (tile.type === ACCENT_TILE) {
		// if (tile.accentType === ROCK) {
			// this.placeRock(tile, notationPoint);
		// } else if (tile.accentType === WHEEL) {
			// this.placeWheel(tile, notationPoint);
		// } else if (tile.accentType === KNOTWEED) {
			// this.placeKnotweed(tile, notationPoint);
		// } else if (tile.accentType === BOAT) {
			// this.placeBoat(tile, notationPoint, extraBoatPoint);
		// }
	// } else {
		this.putTileOnPoint(tile, notationPoint);
		if (tile.specialFlowerType === WHITE_LOTUS) {
			this.playedWhiteLotusTiles.push(tile);
		}
	// }
	// Things to do after a tile is placed
	// this.flagAllTrappedAndDrainedTiles();	// Commenting out For Solitaire
	this.analyzeHarmonies();
};

SolitaireBoard.prototype.putTileOnPoint = function(tile, notationPoint) {
	var point = notationPoint.rowAndColumn;
	point = this.cells[point.row][point.col];
	
	point.putTile(tile);
};

SolitaireBoard.prototype.canPlaceRock = function(boardPoint) {
	if (boardPoint.hasTile()) {
		// debug("Rock cannot be played on top of another tile");
		return false;
	}
	if (boardPoint.isType(GATE)) {
		return false;
	}
	return true;
};

SolitaireBoard.prototype.placeRock = function(tile, notationPoint) {
	var rowAndCol = notationPoint.rowAndColumn;
	var boardPoint = this.cells[rowAndCol.row][rowAndCol.col];

	if (!this.canPlaceRock(boardPoint)) {
		return false;
	}

	if (!boardPoint.isType(GATE)) {
		boardPoint.putTile(tile);
		this.rockRowAndCols.push(rowAndCol);
	}
};

SolitaireBoard.prototype.canPlaceWheel = function(boardPoint) {
	if (boardPoint.hasTile()) {
		// debug("Wheel cannot be played on top of another tile");
		return false;
	}

	if (boardPoint.isType(GATE)) {
		return false;
	}

	// get surrounding RowAndColumn values
	var rowCols = this.getSurroundingRowAndCols(boardPoint);

	// Validate.. Wheel must not be next to a Gate, create Clash, or move tile off board

	for (var i = 0; i < rowCols.length; i++) {
		var bp = this.cells[rowCols[i].row][rowCols[i].col];
		if (bp.isType(GATE) && !newWheelRule) {
			// debug("Wheel cannot be played next to a GATE");
			return false;
		} else if (!newKnotweedRules && bp.hasTile() && (bp.tile.drained || bp.tile.accentType === KNOTWEED)) {
			// debug("wheel cannot be played next to drained tile or Knotweed");
			return false;
		} else if (newWheelRule) {
			if (bp.isType(GATE) && bp.hasTile()) {
				return false;	// Can't play Wheel next to Gate if Blooming tile
			}
		}

		if (rocksUnwheelable || simplest) {
			if (bp.hasTile() && bp.tile.accentType === ROCK) {
				return false; 	// Can't play Wheel next to Rock
			}
		}

		if (superRocks && bp.hasTile()) {
			// Tiles surrounding Rock cannot be moved by Wheel
			var moreRowCols = this.getSurroundingRowAndCols(bp);
			for (var j = 0; j < moreRowCols.length; j++) {
				var otherBp = this.cells[moreRowCols[j].row][moreRowCols[j].col];
				if (otherBp.hasTile() && otherBp.tile.accentType === ROCK) {
					return false;
				}
			}
		}

		// If a tile would be affected, verify the target
		if (bp.hasTile()) {
			var targetRowCol = this.getClockwiseRowCol(boardPoint, rowCols[i]);
			if (this.isValidRowCol(targetRowCol)) {
				var targetBp = this.cells[targetRowCol.row][targetRowCol.col];
				if (!targetBp.canHoldTile(bp.tile, true)) {
					return false;
				}
				if (targetBp.isType(GATE)) {
					return false;	// Can't move tile onto a Gate
				}
			} else {
				return false;	// Would move tile off board, no good
			}
		}
	}

	// Does it create Disharmony?
	var newBoard = this.getCopy();
	var notationPoint = new NotationPoint(new RowAndColumn(boardPoint.row, boardPoint.col).notationPointString);
	newBoard.placeWheel(new SolitaireTile('W', 'G'), notationPoint, true);
	if (newBoard.moveCreatesDisharmony(boardPoint, boardPoint)) {
		return false;
	}

	return true;
};

SolitaireBoard.prototype.isValidRowCol = function(rowCol) {
	return rowCol.row >= 0 && rowCol.col >= 0 && rowCol.row <= 16 && rowCol.col <= 16;
};

SolitaireBoard.prototype.placeWheel = function(tile, notationPoint, ignoreCheck) {
	var rowAndCol = notationPoint.rowAndColumn;
	var boardPoint = this.cells[rowAndCol.row][rowAndCol.col];

	// get surrounding RowAndColumn values
	var rowCols = this.getSurroundingRowAndCols(rowAndCol);

	if (!ignoreCheck && !this.canPlaceWheel(boardPoint)) {
		return false;
	}

	boardPoint.putTile(tile);

	// Perform rotation: Get results, then place all tiles as needed
	var results = [];
	for (var i = 0; i < rowCols.length; i++) {
		// Save tile and target rowAndCol
		var tile = this.cells[rowCols[i].row][rowCols[i].col].removeTile();
		var targetRowCol = this.getClockwiseRowCol(rowAndCol, rowCols[i]);
		if (this.isValidRowCol(targetRowCol)) {
			results.push([tile,targetRowCol]);
		}
	}

	// go through and place tiles in target points
	var self = this;
	results.forEach(function(result) {
		var bp = self.cells[result[1].row][result[1].col];
		bp.putTile(result[0]);
	});
	
	this.refreshRockRowAndCols();
};

SolitaireBoard.prototype.canPlaceKnotweed = function(boardPoint) {
	if (boardPoint.hasTile()) {
		// debug("Knotweed cannot be played on top of another tile");
		return false;
	}

	if (boardPoint.isType(GATE)) {
		return false;
	}

	if (!newKnotweedRules) {
		// Knotweed can be placed next to Gate in new knotweed rules
		var rowCols = this.getSurroundingRowAndCols(boardPoint);

		// Validate: Must not be played next to Gate
		for (var i = 0; i < rowCols.length; i++) {
			var bp = this.cells[rowCols[i].row][rowCols[i].col];
			if (bp.isType(GATE)) {
				// debug("Knotweed cannot be played next to a GATE");
				return false;
			}
		}
	}

	return true;
};

SolitaireBoard.prototype.placeKnotweed = function(tile, notationPoint) {
	var rowAndCol = notationPoint.rowAndColumn;
	var boardPoint = this.cells[rowAndCol.row][rowAndCol.col];

	var rowCols = this.getSurroundingRowAndCols(rowAndCol);

	if (!this.canPlaceKnotweed(boardPoint)) {
		return false;
	}

	// Place tile
	boardPoint.putTile(tile);

	// "Drain" surrounding tiles
	for (var i = 0; i < rowCols.length; i++) {
		var bp = this.cells[rowCols[i].row][rowCols[i].col];
		bp.drainTile();
	}
};

SolitaireBoard.prototype.canPlaceBoat = function(boardPoint, tile) {
	if (!boardPoint.hasTile()) {
		// debug("Boat always played on top of another tile");
		return false;
	}

	if (boardPoint.isType(GATE)) {
		return false;
	}

	if (boardPoint.tile.type === ACCENT_TILE && !boatOnlyMoves) {
		if (boardPoint.tile.accentType !== KNOTWEED && !simplest && !rocksUnwheelable) {
			if (rocksUnwheelable && boardPoint.tile.accentType !== ROCK) {
				return false;
			} else if (!rocksUnwheelable) {
				// debug("Not played on Knotweed tile");
				return false;
			}
		} else {
			// Ensure no Disharmony
			var newBoard = this.getCopy();
			var notationPoint = new NotationPoint(new RowAndColumn(boardPoint.row, boardPoint.col).notationPointString);
			newBoard.placeBoat(new SolitaireTile('B', 'G'), notationPoint, boardPoint, true);
			if (newBoard.moveCreatesDisharmony(boardPoint, boardPoint)) {
				return false;
			}
		}
	}

	return true;
};

SolitaireBoard.prototype.placeBoat = function(tile, notationPoint, extraBoatPoint, ignoreCheck) {
	// debug("extra boat point:");
	// debug(extraBoatPoint);
	var rowAndCol = notationPoint.rowAndColumn;
	var boardPoint = this.cells[rowAndCol.row][rowAndCol.col];

	if (!ignoreCheck && !this.canPlaceBoat(boardPoint, tile)) {
		return false;
	}

	if (boardPoint.tile.type === ACCENT_TILE && !boatOnlyMoves) {
		// Validated as Knotweed

		// Options for Boat behavior. Uncomment ONE

		// This line replaces the Knotweed with the Boat
		//boardPoint.putTile(tile);

		// This line follows the actual current rule: Both removed from board
		boardPoint.removeTile();

		var rowCols = this.getSurroundingRowAndCols(rowAndCol);
		// "Restore" surrounding tiles
		for (var i = 0; i < rowCols.length; i++) {
			var bp = this.cells[rowCols[i].row][rowCols[i].col];
			bp.restoreTile();
		}
		
		if (rocksUnwheelable) {
			this.refreshRockRowAndCols();
		}
	} else {
		// Can't move a tile to where it can't normally go
		var bpRowCol = extraBoatPoint.rowAndColumn;
		var destBoardPoint = this.cells[bpRowCol.row][bpRowCol.col];

		if (!destBoardPoint.canHoldTile(boardPoint.tile)) {
			debug("Boat cannot move that tile there!");
			return false;
		}

		destBoardPoint.putTile(boardPoint.removeTile());
		boardPoint.putTile(tile);
	}
};

SolitaireBoard.prototype.getClockwiseRowCol = function(center, rowCol) {
	if (rowCol.row < center.row && rowCol.col <= center.col) {
		return new RowAndColumn(rowCol.row, rowCol.col+1);
	} else if (rowCol.col > center.col && rowCol.row <= center.row) {
		return new RowAndColumn(rowCol.row+1, rowCol.col);
	} else if (rowCol.row > center.row && rowCol.col >= center.col) {
		return new RowAndColumn(rowCol.row, rowCol.col-1);
	} else if (rowCol.col < center.col && rowCol.row >= center.row) {
		return new RowAndColumn(rowCol.row-1, rowCol.col);
	} else {
		debug("ERROR CLOCKWISE CALCULATING");
	}
}

SolitaireBoard.prototype.getSurroundingRowAndCols = function(rowAndCol) {
	var rowAndCols = [];
	for (var row = rowAndCol.row - 1; row <= rowAndCol.row + 1; row++) {
		for (var col = rowAndCol.col - 1; col <= rowAndCol.col + 1; col++) {
			if ((row !== rowAndCol.row || col !== rowAndCol.col)	// Not the center given point
				&& (row >= 0 && col >= 0) && (row < 17 && col < 17)) {	// Not outside range of the grid
				var boardPoint = this.cells[row][col];
				if (!boardPoint.isType(NON_PLAYABLE)) {	// Not non-playable
					rowAndCols.push(new RowAndColumn(row, col));
				}
			}
		}
	}
	return rowAndCols;
};

SolitaireBoard.prototype.refreshRockRowAndCols = function() {
	this.rockRowAndCols = [];
	var self = this;

	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			if (boardPoint.hasTile() && boardPoint.tile.accentType === ROCK) {
				self.rockRowAndCols.push(boardPoint);
			}
		});
	});
};

SolitaireBoard.prototype.pointIsOpenGate = function(notationPoint) {
	var point = notationPoint.rowAndColumn;
	point = this.cells[point.row][point.col];

	return point.isOpenGate();
};

SolitaireBoard.prototype.moveTile = function(player, notationPointStart, notationPointEnd) {
	var startRowCol = notationPointStart.rowAndColumn;
	var endRowCol = notationPointEnd.rowAndColumn;

	if (startRowCol.row < 0 || startRowCol.row > 16 || endRowCol.row < 0 || endRowCol.row > 16) {
		debug("That point does not exist. So it's not gonna happen.");
		return false;
	}

	var boardPointStart = this.cells[startRowCol.row][startRowCol.col];
	var boardPointEnd = this.cells[endRowCol.row][endRowCol.col];

	if (!this.canMoveTileToPoint(player, boardPointStart, boardPointEnd)) {
		debug("Bad move bears");
		showBadMoveModal();
		return false;
	}

	var tile = boardPointStart.removeTile();

	if (!tile) {
		debug("Error: No tile to move!");
	}

	var error = boardPointEnd.putTile(tile);

	if (error) {
		debug("Error moving tile. It probably didn't get moved.");
		return false;
	}

	// Check for tile "trapped" by opponent Orchid
	this.flagAllTrappedAndDrainedTiles();

	// Check for harmonies
	return this.hasNewHarmony(player, tile, startRowCol, endRowCol);
};

SolitaireBoard.prototype.flagAllTrappedAndDrainedTiles = function() {
	// First, untrap
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.hasTile()) {
				bp.tile.trapped = false;
				if (newKnotweedRules) {
					bp.tile.drained = false;
				}
			}
		}
	}
	// Find Orchid tiles, then check surrounding opposite-player Basic Flower tiles and flag them
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (!bp.isType(GATE)) {
				this.trapTilesSurroundingPointIfNeeded(bp);
			}
			if (newKnotweedRules) {
				this.drainTilesSurroundingPointIfNeeded(bp);
			}
		}
	}
};

SolitaireBoard.prototype.drainTilesSurroundingPointIfNeeded = function(boardPoint) {
	if (!newKnotweedRules) {
		return;
	}
	if (!boardPoint.hasTile()) {
		return;
	}
	if (boardPoint.tile.accentType !== KNOTWEED) {
		return;
	}

	// get surrounding RowAndColumn values
	var rowCols = this.getSurroundingRowAndCols(boardPoint);

	for (var i = 0; i < rowCols.length; i++) {
		var bp = this.cells[rowCols[i].row][rowCols[i].col];
		if (bp.hasTile()) {
			bp.tile.drained = true;
		}
	}
};

SolitaireBoard.prototype.trapTilesSurroundingPointIfNeeded = function(boardPoint) {
	if (!boardPoint.hasTile()) {
		return;
	}
	if (boardPoint.tile.specialFlowerType !== ORCHID) {
		return;
	}

	var orchidOwner = boardPoint.tile.ownerName;

	// get surrounding RowAndColumn values
	var rowCols = this.getSurroundingRowAndCols(boardPoint);

	for (var i = 0; i < rowCols.length; i++) {
		var bp = this.cells[rowCols[i].row][rowCols[i].col];
		if (bp.hasTile() && !bp.isType(GATE)) {
			if (bp.tile.ownerName !== orchidOwner && bp.tile.type !== ACCENT_TILE) {
				bp.tile.trapped = true;
			}
		}
	}
};

SolitaireBoard.prototype.whiteLotusProtected = function(lotusTile) {
	if (lotusNoCapture || simplest) {
		return true;
	}

	if (simpleSpecialFlowerRule) {
		return true;	// Simplest? Cannot be captured.
	}

	// Testing Lotus never protected:
	return false;

	// ----------- //

	// Protected if: player also has Blooming Orchid 
	var isProtected = false;
	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			if (boardPoint.hasTile() && boardPoint.tile.specialFlowerType === ORCHID 
				&& boardPoint.tile.ownerName === lotusTile.ownerName 
				&& !boardPoint.isType(GATE)) {
				isProtected = true;
			}
		});
	});
	return isProtected;
};

SolitaireBoard.prototype.orchidCanCapture = function(orchidTile) {
	if (simpleSpecialFlowerRule || simplest) {
		return false;	// Simplest? Never can capture.
	}

	// Note: This method does not check if other tile is protected from capture.
	var orchidCanCapture = false;
	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			if (boardPoint.hasTile() && boardPoint.tile.specialFlowerType === WHITE_LOTUS 
				&& boardPoint.tile.ownerName === orchidTile.ownerName 
				&& !boardPoint.isType(GATE)) {
				orchidCanCapture = true;
			}
		});
	});
	return orchidCanCapture;
};

SolitaireBoard.prototype.orchidVulnerable = function(orchidTile) {
	if (newOrchidVulnerableRule) {
		var orchidVulnerable = false;
		// Orchid vulnerable if opponent White Lotus is on board
		this.cells.forEach(function(row) {
			row.forEach(function(boardPoint) {
				if (boardPoint.hasTile() && boardPoint.tile.specialFlowerType === WHITE_LOTUS 
					&& boardPoint.tile.ownerName !== orchidTile.ownerName) {
					orchidVulnerable = true;
				}
			});
		});
		return orchidVulnerable;
	}

	if (simpleSpecialFlowerRule) {
		return true;	// Simplest? Always vulnerable.
	}

	if (lotusNoCapture || simplest) {
		// Changing Orchid vulnerable when player has a Blooming Lotus
		var orchidVulnerable = false;
		this.cells.forEach(function(row) {
			row.forEach(function(boardPoint) {
				if (!boardPoint.isType(GATE) && boardPoint.hasTile() && boardPoint.tile.specialFlowerType === WHITE_LOTUS 
					&& boardPoint.tile.ownerName === orchidTile.ownerName) {
					orchidVulnerable = true;
				}
			});
		});
		return orchidVulnerable;
	}

	/* ======= Original Rules: ======= */

	var orchidVulnerable = false;
	this.playedWhiteLotusTiles.forEach(function(lotus) {
		if (lotus.ownerName === orchidTile.ownerName) {
			orchidVulnerable = true;
		}
	});
	if (orchidVulnerable) {
		return true;
	}
};

SolitaireBoard.prototype.canCapture = function(boardPointStart, boardPointEnd) {
	var tile = boardPointStart.tile;
	var otherTile = boardPointEnd.tile;

	if (tile.ownerName === otherTile.ownerName) {
		return false;	// Cannot capture own tile
	}

	// Is tile Orchid that can capture?
	// If so, Orchid can capture basic or special flower
	if (tile.specialFlowerType === ORCHID && otherTile.type !== ACCENT_TILE) {
		if (this.orchidCanCapture(tile)) {
			return true;
		}
	}

	// Check otherTile White Lotus protected from capture
	if (otherTile.specialFlowerType === WHITE_LOTUS) {
		if (this.whiteLotusProtected(otherTile)) {
			return false;	// Cannot capture otherTile any way at all
		} else if (tile.type === BASIC_FLOWER) {
			return true;	// If Lotus not protected, basic flower captures. Orchid handled in Orchid checks
		}
	}

	// Clashing Basic Flowers check
	if (tile.clashesWith(otherTile)) {
		return true;
	}

	// Orchid checks
	// Can otherTile Orchid be captured?
	// If vulnerable, it can be captured by any flower tile
	if (otherTile.specialFlowerType === ORCHID && tile.type !== ACCENT_TILE) {
		if (this.orchidVulnerable(otherTile)) {
			return true;
		}
	}
};

SolitaireBoard.prototype.canMoveTileToPoint = function(player, boardPointStart, boardPointEnd) {
	// start point must have a tile
	if (!boardPointStart.hasTile()) {
		return false;
	}

	// Tile must belong to player
	if (boardPointStart.tile.ownerName !== player) {
		return false;
	}

	// Cannot move drained or trapped tile
	if (boardPointStart.tile.trapped) {
		return false;
	}

	if (!newKnotweedRules && boardPointStart.tile.drained) {
		return false;
	}

	// If endpoint is a Gate, that's wrong.
	if (boardPointEnd.isType(GATE)) {
		return false;
	}
	
	var canCapture = false;
	if (boardPointEnd.hasTile()) {
		canCapture = this.canCapture(boardPointStart, boardPointEnd);
	}

	// If endpoint has a tile there that can't be captured, that is wrong.
	if (boardPointEnd.hasTile() && !canCapture) {
		return false;
	}

	if (!boardPointEnd.canHoldTile(boardPointStart.tile, canCapture)) {
		return false;
	}

	// If endpoint is too far away, that is wrong.
	var numMoves = boardPointStart.tile.getMoveDistance();
	if (Math.abs(boardPointStart.row - boardPointEnd.row) + Math.abs(boardPointStart.col - boardPointEnd.col) > numMoves) {
		// end point is too far away, can't move that far
		return false;
	} else {
		// Move may be possible. But there may be tiles in the way...
		if (!this.verifyAbleToReach(boardPointStart, boardPointEnd, numMoves)) {
			// debug("Tiles are in the way, so you can't reach that spot.");
			return false;
		}
	}

	// What if moving the tile there creates a Disharmony on the board? That can't happen!
	if (this.moveCreatesDisharmony(boardPointStart, boardPointEnd)) {
		return false;
	}

	// I guess we made it through
	return true;
};

SolitaireBoard.prototype.canTransportTileToPoint = function(boardPointStart, boardPointEnd) {
	// Transport Tile: used in Boat special ability

	// start point must have a tile
	if (!boardPointStart.hasTile()) {
		return false;
	}

	// If endpoint is a Gate, that's wrong.
	if (boardPointEnd.isType(GATE)) {
		return false;
	}

	// If endpoint has a tile, that is wrong.
	if (boardPointEnd.hasTile()) {
		return false;
	}

	if (!boardPointEnd.canHoldTile(boardPointStart.tile)) {
		return false;
	}

	// What if moving the tile there creates a Disharmony on the board? That can't happen!
	if (this.moveCreatesDisharmony(boardPointStart, boardPointEnd)) {
		return false;
	}

	// I guess we made it through
	return true;
};

SolitaireBoard.prototype.moveCreatesDisharmony = function(boardPointStart, boardPointEnd) {
	// Grab tile in end point and put the start tile there
	var endTile = boardPointEnd.removeTile();
	boardPointEnd.putTile(boardPointStart.removeTile());

	var clashFound = false;

	// Now, analyze board for disharmonies
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var boardPoint = this.cells[row][col];
			if (boardPoint.hasTile()) {
				// Check for Disharmonies!
				if (this.hasDisharmony(boardPoint)) {
					clashFound = true;
					break;
				}
			}
		}
	}

	// Put tiles back the way they were
	boardPointStart.putTile(boardPointEnd.removeTile());
	boardPointEnd.putTile(endTile);

	return clashFound;
};

SolitaireBoard.prototype.verifyAbleToReach = function(boardPointStart, boardPointEnd, numMoves) {
  // Recursion!
  return this.pathFound(boardPointStart, boardPointEnd, numMoves);
};

SolitaireBoard.prototype.pathFound = function(boardPointStart, boardPointEnd, numMoves) {
  if (!boardPointStart || !boardPointEnd) {
    return false; // start or end point not given
  }

  if (boardPointStart.isType(NON_PLAYABLE) || boardPointEnd.isType(NON_PLAYABLE)) {
  	return false;	// Paths must be through playable points
  }

  if (boardPointStart.row === boardPointEnd.row && boardPointStart.col === boardPointEnd.col) {
    return true; // Yay! start point equals end point
  }
  if (numMoves <= 0) {
    return false; // No more moves left
  }
  
  // Idea: Get min num moves necessary!
  var minMoves = Math.abs(boardPointStart.row - boardPointEnd.row) + Math.abs(boardPointStart.col - boardPointEnd.col);
  
  if (minMoves === 1) {
    return true; // Yay! Only 1 space away (and remember, numMoves is more than 0)
  }

  // Check moving UP
  var nextRow = boardPointStart.row - 1;
  if (nextRow >= 0) {
    var nextPoint = this.cells[nextRow][boardPointStart.col];
    if (!nextPoint.hasTile() && this.pathFound(nextPoint, boardPointEnd, numMoves - 1)) {
      return true; // Yay!
    }
  }

  // Check moving DOWN
  nextRow = boardPointStart.row + 1;
  if (nextRow < 17) {
    var nextPoint = this.cells[nextRow][boardPointStart.col];
    if (!nextPoint.hasTile() && this.pathFound(nextPoint, boardPointEnd, numMoves - 1)) {
      return true; // Yay!
    }
  }

  // Check moving LEFT
  var nextCol = boardPointStart.col - 1;
  if (nextCol >= 0) {
    var nextPoint = this.cells[boardPointStart.row][nextCol];
    if (!nextPoint.hasTile() && this.pathFound(nextPoint, boardPointEnd, numMoves - 1)) {
      return true; // Yay!
    }
  }

  // Check moving RIGHT
  nextCol = boardPointStart.col + 1;
  if (nextCol < 17) {
    var nextPoint = this.cells[boardPointStart.row][nextCol];
    if (!nextPoint.hasTile() && this.pathFound(nextPoint, boardPointEnd, numMoves - 1)) {
      return true; // Yay!
    }
  }
};

SolitaireBoard.prototype.rowBlockedByRock = function(rowNum) {
	if (simpleRocks || simplest) {
		return false;	// simpleRocks: Rocks don't disable Harmonies.
	}

	var blocked = false;
	this.rockRowAndCols.forEach(function(rowAndCol) {
		if (rowAndCol.row === rowNum) {
			blocked = true;
		}
	});
	return blocked;
};

SolitaireBoard.prototype.columnBlockedByRock = function(colNum) {
	if (simpleRocks || simplest) {
		return false;	// simpleRocks: Rocks don't disable Harmonies.
	}
	
	var blocked = false;
	this.rockRowAndCols.forEach(function(rowAndCol) {
		if (rowAndCol.col === colNum) {
			blocked = true;
		}
	});
	return blocked;
};

/* For Solitaire */
SolitaireBoard.prototype.markSpacesBetweenHarmonies = function() {
	// And Clashes!

	// Unmark all
	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			boardPoint.betweenHarmony = false;
			boardPoint.betweenHarmonyHost = false;	// Harmony
			boardPoint.betweenHarmonyGuest = false;	// Clash
		});
	});

	// Go through harmonies, mark the spaces between them
	var self = this;
	this.harmonyManager.harmonies.forEach(function(harmony) {
		// harmony.tile1Pos.row (for example)
		// Harmony will be in same row or same col
		if (harmony.tile1Pos.row === harmony.tile2Pos.row) {
			// Get smaller of the two
			var row = harmony.tile1Pos.row;
			var firstCol = harmony.tile1Pos.col;
			var lastCol = harmony.tile2Pos.col;
			if (harmony.tile2Pos.col < harmony.tile1Pos.col) {
				firstCol = harmony.tile2Pos.col;
				lastCol = harmony.tile1Pos.col;
			}
			for (var col = firstCol + 1; col < lastCol; col++) {
				self.cells[row][col].betweenHarmony = true;
				// if (harmony.ownerName === GUEST) {
				// 	self.cells[row][col].betweenHarmonyGuest = true;
				// } else if (harmony.ownerName === HOST) {
					self.cells[row][col].betweenHarmonyHost = true;
				// }
			}
		} else if (harmony.tile2Pos.col === harmony.tile2Pos.col) {
			// Get smaller of the two
			var col = harmony.tile1Pos.col;
			var firstRow = harmony.tile1Pos.row;
			var lastRow = harmony.tile2Pos.row;
			if (harmony.tile2Pos.row < harmony.tile1Pos.row) {
				firstRow = harmony.tile2Pos.row;
				lastRow = harmony.tile1Pos.row;
			}
			for (var row = firstRow + 1; row < lastRow; row++) {
				self.cells[row][col].betweenHarmony = true;
				// if (harmony.ownerName === GUEST) {
				// 	self.cells[row][col].betweenHarmonyGuest = true;
				// } else if (harmony.ownerName === HOST) {
					self.cells[row][col].betweenHarmonyHost = true;
				// }
			}
		}
	});

	this.harmonyManager.clashes.forEach(function(harmony) {
		// harmony.tile1Pos.row (for example)
		// Harmony will be in same row or same col
		if (harmony.tile1Pos.row === harmony.tile2Pos.row) {
			// Get smaller of the two
			var row = harmony.tile1Pos.row;
			var firstCol = harmony.tile1Pos.col;
			var lastCol = harmony.tile2Pos.col;
			if (harmony.tile2Pos.col < harmony.tile1Pos.col) {
				firstCol = harmony.tile2Pos.col;
				lastCol = harmony.tile1Pos.col;
			}
			for (var col = firstCol + 1; col < lastCol; col++) {
				self.cells[row][col].betweenHarmony = true;
				// if (harmony.ownerName === GUEST) {
					self.cells[row][col].betweenHarmonyGuest = true;
				// } else if (harmony.ownerName === HOST) {
					// self.cells[row][col].betweenHarmonyHost = true;
				// }
			}
		} else if (harmony.tile2Pos.col === harmony.tile2Pos.col) {
			// Get smaller of the two
			var col = harmony.tile1Pos.col;
			var firstRow = harmony.tile1Pos.row;
			var lastRow = harmony.tile2Pos.row;
			if (harmony.tile2Pos.row < harmony.tile1Pos.row) {
				firstRow = harmony.tile2Pos.row;
				lastRow = harmony.tile1Pos.row;
			}
			for (var row = firstRow + 1; row < lastRow; row++) {
				self.cells[row][col].betweenHarmony = true;
				// if (harmony.ownerName === GUEST) {
					self.cells[row][col].betweenHarmonyGuest = true;
				// } else if (harmony.ownerName === HOST) {
					// self.cells[row][col].betweenHarmonyHost = true;
				// }
			}
		}
	});
};

/* For Solitaire */
SolitaireBoard.prototype.analyzeHarmonies = function() {
	// We're going to find all harmonies on the board - And Disharmonies!

	// Check along all rows, then along all columns.. Or just check all tiles?
	this.harmonyManager.clearList();

	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var boardPoint = this.cells[row][col];
			if (boardPoint.hasTile()) {
				var tileHarmonies = this.getTileHarmonies(boardPoint.tile, new RowAndColumn(row, col));
				this.harmonyManager.addHarmonies(tileHarmonies);

				var tileClashes = this.getTileClashes(boardPoint.tile, new RowAndColumn(row, col));
				this.harmonyManager.addClashes(tileClashes);

				boardPoint.tile.inHarmony = tileHarmonies.length > 0;
				boardPoint.tile.inClash = tileClashes.length > 0;
			}
		}
	}

	this.markSpacesBetweenHarmonies();

	// this.winners = [];
	// var self = this;
	// var harmonyRingOwners = this.harmonyManager.harmonyRingExists();
	// if (harmonyRingOwners.length > 0) {
	// 	harmonyRingOwners.forEach(function(player) {
	// 		if (!self.winners.includes(player)) {
	// 			self.winners.push(player);
	// 		}
	// 	});
	// }
};

SolitaireBoard.prototype.getTileHarmonies = function(tile, rowAndCol) {
	var tileHarmonies = [];

	// if (this.cells[rowAndCol.row][rowAndCol.col].isType(GATE)) {
	// 	return tileHarmonies;
	// }

	if (!this.rowBlockedByRock(rowAndCol.row)) {
		var leftHarmony = this.getHarmonyLeft(tile, rowAndCol);
		if (leftHarmony) {
			tileHarmonies.push(leftHarmony);
		}

		var rightHarmony = this.getHarmonyRight(tile, rowAndCol);
		if (rightHarmony) {
			tileHarmonies.push(rightHarmony);
		}
	}

	if (!this.columnBlockedByRock(rowAndCol.col)) {
		var upHarmony = this.getHarmonyUp(tile, rowAndCol);
		if (upHarmony) {
			tileHarmonies.push(upHarmony);
		}

		var downHarmony = this.getHarmonyDown(tile, rowAndCol);
		if (downHarmony) {
			tileHarmonies.push(downHarmony);
		}
	}

	return tileHarmonies;
};

SolitaireBoard.prototype.getHarmonyLeft = function(tile, endRowCol) {
	var colToCheck = endRowCol.col - 1;

	while (colToCheck >= 0 && !this.cells[endRowCol.row][colToCheck].hasTile()) {
		colToCheck--;
	}

	if (colToCheck >= 0) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (tile.formsHarmonyWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(endRowCol.row, colToCheck));
			return harmony;
		}
	}
};

SolitaireBoard.prototype.getHarmonyRight = function(tile, endRowCol) {
	var colToCheck = endRowCol.col + 1;

	while (colToCheck <= 16 && !this.cells[endRowCol.row][colToCheck].hasTile()) {
		colToCheck++;
	}

	if (colToCheck <= 16) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (tile.formsHarmonyWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(endRowCol.row, colToCheck));
			return harmony;
		}
	}
};

SolitaireBoard.prototype.getHarmonyUp = function(tile, endRowCol) {
	var rowToCheck = endRowCol.row - 1;

	while (rowToCheck >= 0 && !this.cells[rowToCheck][endRowCol.col].hasTile()) {
		rowToCheck--;
	}

	if (rowToCheck >= 0) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (tile.formsHarmonyWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(rowToCheck, endRowCol.col));
			return harmony;
		}
	}
};

SolitaireBoard.prototype.getHarmonyDown = function(tile, endRowCol) {
	var rowToCheck = endRowCol.row + 1;

	while (rowToCheck <= 16 && !this.cells[rowToCheck][endRowCol.col].hasTile()) {
		rowToCheck++;
	}

	if (rowToCheck <= 16) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (tile.formsHarmonyWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(rowToCheck, endRowCol.col));
			return harmony;
		}
	}
};

/* For Solitaire */
SolitaireBoard.prototype.getTileClashes = function(tile, rowAndCol) {
	var tileHarmonies = [];

	if (!this.rowBlockedByRock(rowAndCol.row)) {
		var leftHarmony = this.getClashLeft(tile, rowAndCol);
		if (leftHarmony) {
			tileHarmonies.push(leftHarmony);
		}

		var rightHarmony = this.getClashRight(tile, rowAndCol);
		if (rightHarmony) {
			tileHarmonies.push(rightHarmony);
		}
	}

	if (!this.columnBlockedByRock(rowAndCol.col)) {
		var upHarmony = this.getClashUp(tile, rowAndCol);
		if (upHarmony) {
			tileHarmonies.push(upHarmony);
		}

		var downHarmony = this.getClashDown(tile, rowAndCol);
		if (downHarmony) {
			tileHarmonies.push(downHarmony);
		}
	}

	return tileHarmonies;
};

SolitaireBoard.prototype.getClashLeft = function(tile, endRowCol) {
	var colToCheck = endRowCol.col - 1;

	while (colToCheck >= 0 && !this.cells[endRowCol.row][colToCheck].hasTile()) {
		colToCheck--;
	}

	if (colToCheck >= 0) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (tile.clashesWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(endRowCol.row, colToCheck));
			return harmony;
		}
	}
};

SolitaireBoard.prototype.getClashRight = function(tile, endRowCol) {
	var colToCheck = endRowCol.col + 1;

	while (colToCheck <= 16 && !this.cells[endRowCol.row][colToCheck].hasTile()) {
		colToCheck++;
	}

	if (colToCheck <= 16) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (tile.clashesWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(endRowCol.row, colToCheck));
			return harmony;
		}
	}
};

SolitaireBoard.prototype.getClashUp = function(tile, endRowCol) {
	var rowToCheck = endRowCol.row - 1;

	while (rowToCheck >= 0 && !this.cells[rowToCheck][endRowCol.col].hasTile()) {
		rowToCheck--;
	}

	if (rowToCheck >= 0) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (tile.clashesWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(rowToCheck, endRowCol.col));
			return harmony;
		}
	}
};

SolitaireBoard.prototype.getClashDown = function(tile, endRowCol) {
	var rowToCheck = endRowCol.row + 1;

	while (rowToCheck <= 16 && !this.cells[rowToCheck][endRowCol.col].hasTile()) {
		rowToCheck++;
	}

	if (rowToCheck <= 16) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (tile.clashesWith(checkPoint.tile)) {
			var harmony = new SolitaireHarmony(tile, endRowCol, checkPoint.tile, new RowAndColumn(rowToCheck, endRowCol.col));
			return harmony;
		}
	}
};
/* ******************************* */

SolitaireBoard.prototype.hasNewHarmony = function(player, tile, startRowCol, endRowCol) {
	// To check if new harmony, first analyze harmonies and compare to previous set of harmonies
	var oldHarmonies = this.harmonyManager.harmonies;
	this.analyzeHarmonies();

	return this.harmonyManager.hasNewHarmony(player, oldHarmonies);
};

SolitaireBoard.prototype.hasDisharmony = function(boardPoint) {
	// if (boardPoint.isType(GATE)) {
	// 	return false;	// Gate never has disharmony
	// }	// For Solitaire

	var tile = boardPoint.tile;
	var clashFound = false;

	if (this.hasDisharmonyLeft(tile, boardPoint)) {
		clashFound = true;
	}

	if (this.hasDisharmonyRight(tile, boardPoint)) {
		clashFound = true;
	}

	if (this.hasDisharmonyUp(tile, boardPoint)) {
		clashFound = true;
	}

	if (this.hasDisharmonyDown(tile, boardPoint)) {
		clashFound = true;
	}

	return clashFound;
};

SolitaireBoard.prototype.hasDisharmonyLeft = function(tile, endRowCol) {
	var colToCheck = endRowCol.col - 1;

	while (colToCheck >= 0 && !this.cells[endRowCol.row][colToCheck].hasTile()) {
		colToCheck--;
	}

	if (colToCheck >= 0) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (tile.clashesWith(checkPoint.tile)) {
			// debug("CLASHES Left: " + tile.getConsoleDisplay() + " & " + checkPoint.tile.getConsoleDisplay());
			return true;
		}
	}
};

SolitaireBoard.prototype.hasDisharmonyRight = function(tile, endRowCol) {
	var colToCheck = endRowCol.col + 1;

	while (colToCheck <= 16 && !this.cells[endRowCol.row][colToCheck].hasTile()) {
		colToCheck++;
	}

	if (colToCheck <= 16) {
		var checkPoint = this.cells[endRowCol.row][colToCheck];
		if (tile.clashesWith(checkPoint.tile)) {
			// debug("CLASHES Right: " + tile.getConsoleDisplay() + " & " + checkPoint.tile.getConsoleDisplay());
			return true;
		}
	}
};

SolitaireBoard.prototype.hasDisharmonyUp = function(tile, endRowCol) {
	var rowToCheck = endRowCol.row - 1;

	while (rowToCheck >= 0 && !this.cells[rowToCheck][endRowCol.col].hasTile()) {
		rowToCheck--;
	}

	if (rowToCheck >= 0) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (tile.clashesWith(checkPoint.tile)) {
			// debug("CLASHES Up: " + tile.getConsoleDisplay() + " & " + checkPoint.tile.getConsoleDisplay());
			return true;
		}
	}
};

SolitaireBoard.prototype.hasDisharmonyDown = function(tile, endRowCol) {
	var rowToCheck = endRowCol.row + 1;

	while (rowToCheck <= 16 && !this.cells[rowToCheck][endRowCol.col].hasTile()) {
		rowToCheck++;
	}

	if (rowToCheck <= 16) {
		var checkPoint = this.cells[rowToCheck][endRowCol.col];
		if (tile.clashesWith(checkPoint.tile)) {
			// debug("CLASHES Down: " + tile.getConsoleDisplay() + " & " + checkPoint.tile.getConsoleDisplay());
			return true;
		}
	}
};

SolitaireBoard.prototype.setPossibleMovePoints = function(boardPointStart) {
	if (!boardPointStart.hasTile()) {
		return;
	}
	// Apply "possible move point" type to applicable boardPoints
	var player = boardPointStart.tile.ownerName;
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			if (this.canMoveTileToPoint(player, boardPointStart, this.cells[row][col])) {
				this.cells[row][col].addType(POSSIBLE_MOVE);
			}
		}
	}
};

SolitaireBoard.prototype.removePossibleMovePoints = function() {
	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			boardPoint.removeType(POSSIBLE_MOVE);
		});
	});
};

SolitaireBoard.prototype.setOpenGatePossibleMoves = function(player) {
	// Apply "open gate" type to applicable boardPoints
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.isOpenGate()) {
				this.cells[row][col].addType(POSSIBLE_MOVE);
			}
		}
	}
};

/* For Solitaire */
SolitaireBoard.prototype.setAllPossiblePointsOpen = function(tile) {
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.canHoldTile(tile)) {
				this.cells[row][col].addType(POSSIBLE_MOVE);
			}
		}
	}
};

// For Solitaire
SolitaireBoard.prototype.setHarmonyAndClashPointsOpen = function(tile) {
	var possibleMovesFound = false;

	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.canHoldTile(tile)) {
				var newBp = bp.getCopy();
				newBp.putTile(tile);
				if (this.hasDisharmony(newBp) || this.getTileHarmonies(newBp.tile, newBp).length > 0) {
					this.cells[row][col].addType(POSSIBLE_MOVE);
					possibleMovesFound = true;
				}
			}
		}
	}

	return possibleMovesFound;
};

SolitaireBoard.prototype.setSolitaireAccentPointsOpen = function(tile) {
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			
			var checkBps = [];

			// Check up and down
			if (row > 2) {
				checkBps.push(this.cells[row-2][col]);
			}
			if (row < 14) {
				checkBps.push(this.cells[row+2][col]);
			}

			// Check left and right
			if (col > 2) {
				checkBps.push(this.cells[row][col-2]);
			}
			if (col < 14) {
				checkBps.push(this.cells[row][col+2]);
			}

			var checkBpIsWithinGarden = false;
			for (var i = 0; i < checkBps.length; i++) {
				if (checkBps[i].isCompletelyWithinRedOrWhiteGarden()) {
					checkBpIsWithinGarden = true;
				}
			}

			if (bp.isType(RED) && bp.isType(WHITE)) {
				checkBpIsWithinGarden = true;
			}

			if (checkBpIsWithinGarden && bp.canHoldTile(tile)) {
				this.cells[row][col].addType(POSSIBLE_MOVE);
			}
		}
	}
};

SolitaireBoard.prototype.playerControlsLessThanTwoGates = function(player) {
	var count = 0;
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.isType(GATE) && bp.hasTile() && bp.tile.ownerName === player) {
				count++;
			}
		}
	}

	return count < 2;
};

SolitaireBoard.prototype.playerHasNoGrowingFlowers = function(player) {
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.isType(GATE) && bp.hasTile() && bp.tile.ownerName === player) {
				return false;
			}
		}
	}

	return true;
};

SolitaireBoard.prototype.revealSpecialFlowerPlacementPoints = function(player) {
	// Check each Gate for tile belonging to player, then check gate edge points
	var bpCheckList = [];
	
	var row = 0;
	var col = 8;
	var bp = this.cells[row][col];
	if (bp.hasTile() && bp.tile.ownerName === player) {
		bpCheckList.push(this.cells[row][col - 1]);
		bpCheckList.push(this.cells[row][col + 1]);
	}

	row = 16;
	var bp = this.cells[row][col];
	if (bp.hasTile() && bp.tile.ownerName === player) {
		bpCheckList.push(this.cells[row][col - 1]);
		bpCheckList.push(this.cells[row][col + 1]);
	}

	row = 8;
	col = 0;
	var bp = this.cells[row][col];
	if (bp.hasTile() && bp.tile.ownerName === player) {
		bpCheckList.push(this.cells[row - 1][col]);
		bpCheckList.push(this.cells[row + 1][col]);
	}

	col = 16;
	var bp = this.cells[row][col];
	if (bp.hasTile() && bp.tile.ownerName === player) {
		bpCheckList.push(this.cells[row - 1][col]);
		bpCheckList.push(this.cells[row + 1][col]);
	}

	bpCheckList.forEach(function(bp) {
		if (!bp.hasTile()) {
			bp.addType(POSSIBLE_MOVE);
		}
	});
};

SolitaireBoard.prototype.setGuestGateOpen = function() {
	var row = 16;
	var col = 8;
	if (this.cells[row][col].isOpenGate()) {
		this.cells[row][col].addType(POSSIBLE_MOVE);
	}
};

SolitaireBoard.prototype.revealPossiblePlacementPoints = function(tile) {
	var self = this;
	this.cells.forEach(function(row) {
		row.forEach(function(boardPoint) {
			var valid = false;

			if (tile.accentType === ROCK && self.canPlaceRock(boardPoint)) {
				valid = true;
			} else if (tile.accentType === WHEEL && self.canPlaceWheel(boardPoint)) {
				valid = true;
			} else if (tile.accentType === KNOTWEED && self.canPlaceKnotweed(boardPoint)) {
				valid = true;
			} else if (tile.accentType === BOAT && self.canPlaceBoat(boardPoint, tile)) {
				valid = true;
			}

			if (valid) {
				boardPoint.addType(POSSIBLE_MOVE);
			}
		});
	});
};

SolitaireBoard.prototype.revealBoatBonusPoints = function(boardPoint) {
	if (!boardPoint.hasTile()) {
		return;
	}
	
	var player = boardPoint.tile.ownerName;

	if (newKnotweedRules) {
		// New rules: All surrounding points
		var rowCols = this.getSurroundingRowAndCols(boardPoint);

		for (var i = 0; i < rowCols.length; i++) {
			var boardPointEnd = this.cells[rowCols[i].row][rowCols[i].col];
			// if (this.canMoveTileToPoint(player, boardPoint, boardPointEnd)) {
			if (this.canTransportTileToPoint(boardPoint, boardPointEnd)) {
				boardPointEnd.addType(POSSIBLE_MOVE);
			}
		}
		return;
	}
	// The rest is old and outdated...
	// Apply "possible move point" type to applicable boardPoints
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var boardPointEnd = this.cells[row][col];
			if (Math.abs(boardPoint.row - boardPointEnd.row) + Math.abs(boardPoint.col - boardPointEnd.col) === 1) {
				if (this.canMoveTileToPoint(player, boardPoint, boardPointEnd)) {
					boardPointEnd.addType(POSSIBLE_MOVE);
				}
			}
		}
	}
};

SolitaireBoard.prototype.getCopy = function() {
	var copyBoard = new SolitaireBoard();

	// cells
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			copyBoard.cells[row][col] = this.cells[row][col].getCopy();
		}
	}

	// playedWhiteLotusTiles
	for (var i = 0; i < this.playedWhiteLotusTiles.length; i++) {
		copyBoard.playedWhiteLotusTiles.push(this.playedWhiteLotusTiles[i].getCopy());
	}

	// Everything else...
	copyBoard.refreshRockRowAndCols();
	copyBoard.analyzeHarmonies();
	
	return copyBoard;
};

SolitaireBoard.prototype.numTilesInGardensForPlayer = function(player) {
	var count = 0;
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.types.length === 1 && bp.hasTile()) {
				if (bp.isType(bp.tile.basicColorName)) {
					count++;
				}
			}
		}
	}
	return count;
};

SolitaireBoard.prototype.numTilesOnBoardForPlayer = function(player) {
	var count = 0;
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.hasTile() && bp.tile.ownerName === player) {
				count++;
			}
		}
	}
	return count;
};

SolitaireBoard.prototype.getSurroundness = function(player) {
	var up = 0;
	var hasUp = 0;
	var down = 0;
	var hasDown = 0;
	var left = 0;
	var hasLeft = 0;
	var right = 0;
	var hasRight = 0;
	for (var row = 0; row < this.cells.length; row++) {
		for (var col = 0; col < this.cells[row].length; col++) {
			var bp = this.cells[row][col];
			if (bp.hasTile() && bp.tile.ownerName === player) {
				if (bp.row > 8) {
					down++;
					hasDown = 1;
				}
				if (bp.row < 8) {
					up++;
					hasUp = 1;
				}
				if (bp.col < 8) {
					left++;
					hasLeft = 1;
				}
				if (bp.col > 8) {
					right++;
					hasRight = 1;
				}
			}
		}
	}
	// Get lowest...
	var lowest = up;
	if (down < lowest) {
		lowest = down;
	}
	if (left < lowest) {
		lowest = left;
	}
	if (right < lowest) {
		lowest = right;
	}

	if (lowest === 0) {
		return hasUp + hasDown + hasLeft + hasRight;
	} else {
		return lowest * 4;
	}
};


