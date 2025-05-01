
// NOTE: File not completed

import { debug } from "../GameData"
import { NEUTRAL, NON_PLAYABLE, POSSIBLE_MOVE } from "../skud-pai-sho/SkudPaiShoBoardPoint"
import { RowAndColumn } from "../CommonNotationObjects";
import { ShiBoardPoint } from "./ShiBoardPoint";
import { NON_PLAYABLE } from "../skud-pai-sho/SkudPaiShoBoardPoint";
import { LOTUSPATH, ELEMENTALGATE, CELESTIALGATE } from "./ShiBoardPoint"
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { ShiTileManager } from "./ShiTileManager"
import { GUEST, HOST } from "../CommonNotationObjects.js";
import { debug } from "../GameData.js";
import { showBadMoveModal } from "../PaiShoMain.js";

/**
 * Util function that gets a set of tile types
 * @param {Array<GodaiTile>} tiles 
 * @returns {Set<string>} Set of tile types
 */
// Helper function
function isElorCelTileCode(code) {
	return ["W", "E", "F", "A", "S", "M", "L"].includes(code);
}

function getSetOfTileTypes(tiles) {
    let set = new Set([""])
    set.delete("")
    tiles.map(tile => tile.code).forEach( type => set.add(type) )
    return set
}

export class ShiBoard {
    /** @type {RowAndColumn} */ size;
    /** @type {Array<Array<ShiBoardPoint>>} */ cells;
    /** @type {Array<string>} */ winners;
    /** @type {string} */ winnerReason = "";

    constructor() {
        // NOTE: If your variant is played on intersections, then keep the size as it is.
        // If it is instead played in spaces like in Adevar, then change it to 18x18
        this.size = new RowAndColumn(17, 17);
        this.cells = this.brandNew();
        this.winners = [];
    }

    // NOTE: The whole reason this class is so bloated and is around 600 lines long
    brandNew() {
		var cells = [];

		cells[0] = this.newRow(9,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.elementalgate(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[1] = this.newRow(11,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[2] = this.newRow(13,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[3] = this.newRow(15,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[4] = this.newRow(17,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[5] = this.newRow(17,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[6] = this.newRow(17,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[7] = this.newRow(17,
			[ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath()
			]);

		cells[8] = this.newRow(17,
			[ShiBoardPoint.elementalgate(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.celestialgate(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.elementalgate()
			]);

		cells[9] = this.newRow(17,
			[ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath()
			]);

		cells[10] = this.newRow(17,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[11] = this.newRow(17,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[12] = this.newRow(17,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[13] = this.newRow(15,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.red(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.white(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[14] = this.newRow(13,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[15] = this.newRow(11,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		cells[16] = this.newRow(9,
			[ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.elementalgate(),
			ShiBoardPoint.lotuspath(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral(),
			ShiBoardPoint.neutral()
			]);

		for (var row = 0; row < cells.length; row++) {
			for (var col = 0; col < cells[row].length; col++) {
				cells[row][col].row = row;
				cells[row][col].col = col;
			}
		}

		return cells;
	}

    /**
     * Taken from SpiritBoard.js
     * @param {number} numColumns Number of Columns to add. They're added from the center
     * @param {Array<ShiBoardPoint>} points points to add, from left to right
     * @returns {Array<ShiBoardPoint>}
     */
    
	newRow(numColumns, points) {
		let cells = [];
		const numBlanksOnSides = (this.size.row - numColumns) / 2;
	
		for (let i = 0; i < this.size.row; i++) {
			if (i < numBlanksOnSides || i >= numBlanksOnSides + numColumns) {
				// Outside playable range — create a fresh NON_PLAYABLE for each
				let bp = new ShiBoardPoint();
				bp.addType(NON_PLAYABLE);
				cells[i] = bp;
			} else {
				// Playable area
				if (points && points[i - numBlanksOnSides]) {
					// Use the provided point
					cells[i] = points[i - numBlanksOnSides];
				} else {
					// Safety: if points missing, still fill with NON_PLAYABLE
					let bp = new ShiBoardPoint();
					bp.addType(NON_PLAYABLE);
					cells[i] = bp;
				}
			}
		}
	
		return cells;
	}
	

	_getGatePoints() {
        return [
            this.cells[0][8],
            this.cells[8][0],
            this.cells[8][16],
            this.cells[16][8],
        ]
    }

	_getCelestialGatePoints() {
        return [
            this.cells[8][8],
        ]
    }

    /**
     * Taken from VagabondBoard.js
     * @param {ShiBoardPoint} bpStart
     * @param {ShiBoardPoint} bpEnd
     * @param {number} numMoves
     */

	_isPathClear(bpStart, bpEnd) {
		if (bpStart.row === bpEnd.row) {
			// Horizontal move
			const [startCol, endCol] = bpStart.col < bpEnd.col ? [bpStart.col + 1, bpEnd.col] : [bpEnd.col, bpStart.col - 1];
			for (let col = startCol; col <= endCol; col++) {
				if (this.cells[bpStart.row][col].hasTile()) return false;
			}
		} else if (bpStart.col === bpEnd.col) {
			// Vertical move
			const [startRow, endRow] = bpStart.row < bpEnd.row ? [bpStart.row + 1, bpEnd.row] : [bpEnd.row, bpStart.row - 1];
			for (let row = startRow; row <= endRow; row++) {
				if (this.cells[row][bpStart.col].hasTile()) return false;
			}
		} else {
			return false; // Not a straight line
		}
		return true;
	}
	

	_canMoveTileToPoint(player, bpStart, bpEnd) {
		if (!bpStart.hasTile() || !bpEnd) return false;
		if (bpStart.tile.ownerName !== player) return false;
	
		// 🔥 Allow moving FROM a Gate or Celestial Gate, but never INTO a Gate or Celestial Gate
		if (bpEnd.isType(ELEMENTALGATE) || bpEnd.isType(CELESTIALGATE)) return false;
	
		const tile = bpStart.tile;
		const deltaRow = bpEnd.row - bpStart.row;
		const deltaCol = bpEnd.col - bpStart.col;
	
		const distance = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
		const moveRange = tile.getMoveDistance();
		if (distance > moveRange) return false;
	
		let stepRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow);
		let stepCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol);
	
		// 🌀 Elementals: strictly orthogonal movement
		if (tile.isElementalTile()) {
			if (deltaRow !== 0 && deltaCol !== 0) {
				return false; // Elementals no diagonal
			}
		}
	
		// 🌕 Celestials: strict line movement (straight or perfect diagonal only)
		if (tile.isCelestialTile()) {
			const isStraight = deltaRow === 0 || deltaCol === 0;
			const isDiagonal = Math.abs(deltaRow) === Math.abs(deltaCol);
			if (!isStraight && !isDiagonal) return false;
		
			// ❌ Prevent stepping between orthogonal neighbors of Celestial Gate
			const celestialGateAdjacents = [
				{ row: 7, col: 8 },
				{ row: 8, col: 7 },
				{ row: 8, col: 9 },
				{ row: 9, col: 8 },
			];
			const fromIndex = celestialGateAdjacents.findIndex(p => p.row === bpStart.row && p.col === bpStart.col);
			const toIndex = celestialGateAdjacents.findIndex(p => p.row === bpEnd.row && p.col === bpEnd.col);
			if (fromIndex !== -1 && toIndex !== -1) {
				return false; // stepping between orthogonal neighbors of center — disallowed
			}
		
			// ❌ Prevent pivoting around garden cross centers (0,±5), (±5,0)
			const shiStart = { r: bpStart.col - 8, c: 8 - bpStart.row };
			const shiEnd = { r: bpEnd.col - 8, c: 8 - bpEnd.row };
			
			const forbiddenGardenCorners = [
				// Around vertical crossbars at (0,±5)
				{ center: { r: 0, c: -5 }, ends: [{ r: -1, c: -6 }, { r: 1, c: -6 }] },
				{ center: { r: 0, c: 5 },  ends: [{ r: -1, c: 6 }, { r: 1, c: 6 }] },
			
				// Around horizontal crossbars at (±5,0)
				{ center: { r: -5, c: 0 }, ends: [{ r: -6, c: -1 }, { r: -6, c: 1 }] },
				{ center: { r: 5, c: 0 },  ends: [{ r: 6, c: -1 }, { r: 6, c: 1 }] },
			];
			
			for (const { center, ends } of forbiddenGardenCorners) {
				const matchCenter = shiEnd.r === center.r && shiEnd.c === center.c;
				const matchStartEnd = ends.some(p => shiStart.r === p.r && shiStart.c === p.c);
				const matchReverse = shiStart.r === center.r && shiStart.c === center.c &&
					ends.some(p => shiEnd.r === p.r && shiEnd.c === p.c);
				if ((matchCenter && matchStartEnd) || matchReverse) {
					return false;
				}
			}
		}
	
		// Walk the path to validate terrain and obstructions
		let currentRow = bpStart.row;
		let currentCol = bpStart.col;
	
		for (let i = 1; i <= distance; i++) {
			currentRow += stepRow;
			currentCol += stepCol;
			const currentBP = this.cells[currentRow]?.[currentCol];
	
			if (!currentBP) return false;
			if (i !== distance && currentBP.hasTile()) return false;
	
			if (tile.isElementalTile()) {
				if (!currentBP.isType(NEUTRAL) && !currentBP.isType(RED) && !currentBP.isType(WHITE) && !currentBP.isType(LOTUSPATH)) {
					return false;
				}
			}
			else if (tile.isCelestialTile()) {
				if (tile.code === "L") {
					if (!currentBP.isType(LOTUSPATH)) return false;
				} else if (tile.code === "S") {
					if (!currentBP.isType(LOTUSPATH) && !currentBP.isType(WHITE)) return false;
			
					if (currentBP.isType(WHITE)) {
						if (Math.abs(stepRow) !== 0 && Math.abs(stepCol) !== 0) {
							return false;
						}
					}
			
					// ❌ Prevent diagonal transition between WHITE and LOTUSPATH
					const prevBP = this.cells[currentRow - stepRow]?.[currentCol - stepCol];
					if (
						(currentBP.isType(LOTUSPATH) && prevBP?.isType(WHITE)) ||
						(currentBP.isType(WHITE) && prevBP?.isType(LOTUSPATH))
					) {
						if (Math.abs(stepRow) !== 0 && Math.abs(stepCol) !== 0) {
							return false;
						}
					}
				} else if (tile.code === "M") {
					if (!currentBP.isType(LOTUSPATH) && !currentBP.isType(RED)) return false;
			
					if (currentBP.isType(RED)) {
						if (Math.abs(stepRow) !== 0 && Math.abs(stepCol) !== 0) {
							return false;
						}
					}
			
					// ❌ Prevent diagonal transition between RED and LOTUSPATH
					const prevBP = this.cells[currentRow - stepRow]?.[currentCol - stepCol];
					if (
						(currentBP.isType(LOTUSPATH) && prevBP?.isType(RED)) ||
						(currentBP.isType(RED) && prevBP?.isType(LOTUSPATH))
					) {
						if (Math.abs(stepRow) !== 0 && Math.abs(stepCol) !== 0) {
							return false;
						}
					}
				}
			}
			
		}
	
		if (bpEnd.hasTile()) {
			if (!this._canTileStartCaptureEnd(bpStart, bpEnd)) {
				return false;
			}
		}
	
		return true;
	}
	


	
	_canTileStartCaptureEnd(bpStart, bpEnd) {
		if (!bpStart.tile || !bpEnd.tile) {
			return false; // Need two tiles
		}
	
		const attacker = bpStart.tile;
		const defender = bpEnd.tile;
	
		// Cannot capture own tile
		if (attacker.ownerName === defender.ownerName) {
			return false;
		}
	
		// Make sure both Lotuses are on the board and outside gates
		const lotusTiles = this.getTilesOnBoard().filter(tile => tile.code === "L");
		if (lotusTiles.length !== 2) {
			return false;
		}
		for (const lotus of lotusTiles) {
			const lotusPos = this._getTilePosition(lotus);
			if (!lotusPos) return false;
			const lotusPoint = this.cells[lotusPos.row][lotusPos.col];
			if (lotusPoint.isType(ELEMENTALGATE)) {
				return false;
			}
			// 🔥 NEW: if Lotus is at center (8,8), capture not allowed
			if (lotusPos.row === 8 && lotusPos.col === 8) {
				return false;
			}
		}
	
		// Elemental capturing Elemental
		if (attacker.isElementalTile() && defender.isElementalTile()) {
			return attacker.canCapture(defender);
		}
	
		// Celestial capturing Celestial
		if (attacker.isCelestialTile() && defender.isCelestialTile()) {
			return attacker.canCapture(defender);
		}
	
		return false; // No cross-type capturing allowed
	}
	
	
	
	
	
	
	
	
    /**
     * Taken from VagabondBoard.js
     *
     * NOTE: This method, along with others that were made exclusively for this one,
     * are the *second* reason why this class is so bloated
     * @param {ShiBoardPoint} bpStart
     * @param {ShiBoardPoint} bpEnd
     * @param {number} numMoves
     */
    _verifyAbleToReach(bpStart, bpEnd, numMoves) {
        // Recursion!
        return this._pathFound(bpStart, bpEnd, numMoves, bpStart);
    }
    _pathFound(bpStart, bpEnd, numMoves, trueStartingBP) {
        if (!bpStart || !bpEnd) {
            return false
        }

        if (bpStart.isType(NON_PLAYABLE) || bpEnd.isType(NON_PLAYABLE)) {
            return false // Paths must be through playable points
        }

        if (bpStart.row === bpEnd.row && bpStart.col === bpEnd.col) {
            return false // Moving to the same point, very funny
        }

        if (numMoves <= 0) {
            return false // No more recursiveness
        }

        let minMoves = Math.abs(bpStart.row - bpEnd.row) + Math.abs(bpStart.col - bpEnd.col)
        if (minMoves === 1) {
            return this._couldStepIntoNext(bpStart, bpEnd, trueStartingBP) // Only one space away
        }

        // Check move UP
        let nextRow = bpStart.row - 1
        if (nextRow >= 0) {
            let nextPoint = this.cells[nextRow][bpStart.col]
            if (!nextPoint.hasTile()
                && this._couldStepIntoNext(bpStart, nextPoint, trueStartingBP)
                && this._pathFound(nextPoint, bpEnd, numMoves - 1, trueStartingBP)) {
                return true
            }
        }

        // Check move DOWN
        nextRow = bpStart.row + 1
        if (nextRow < 17) {
            let nextPoint = this.cells[nextRow][bpStart.col]
            if (!nextPoint.hasTile()
                && this._couldStepIntoNext(bpStart, nextPoint, trueStartingBP)
                && this._pathFound(nextPoint, bpEnd, numMoves - 1, trueStartingBP)) {
                return true
            }
        }

        // Check move LEFT
        let nextCol = bpStart.col - 1
        if (nextCol >= 0) {
            let nextPoint = this.cells[bpStart.row][nextCol]
            if (!nextPoint.hasTile()
                && this._couldStepIntoNext(bpStart, nextPoint, trueStartingBP)
                && this._pathFound(nextPoint, bpEnd, numMoves - 1, trueStartingBP)) {
                return true
            }
        }

        // Check move LEFT
        nextCol = bpStart.col + 1
        if (nextCol < 17) {
            let nextPoint = this.cells[bpStart.row][nextCol]
            if (!nextPoint.hasTile()
                && this._couldStepIntoNext(bpStart, nextPoint, trueStartingBP)
                && this._pathFound(nextPoint, bpEnd, numMoves - 1, trueStartingBP)) {
                return true
            }
        }
    }
    /**
     * @param {string} playerCode GUEST or HOST
     * @param {NotationPoint} notationPointStart
     * @param {NotationPoint} notationPointEnd
     */
	moveTile(playerCode, notationPointStart, notationPointEnd) {
		const start = notationPointStart.rowAndColumn;
		const end = notationPointEnd.rowAndColumn;
	
		if (start.row < 0 || start.row > 16 || end.row < 0 || end.row > 16) {
			debug("That point does not exist. So it's not gonna happen.");
			return false;
		}
	
		const bpStart = this.cells[start.row][start.col];
		const bpEnd = this.cells[end.row][end.col];
	
		if (!this._canMoveTileToPoint(playerCode, bpStart, bpEnd)) {
			debug("Bad move bears");
			showBadMoveModal();
			return false;
		}
	
		const movingTile = bpStart.tile;
		if (!movingTile) {
			debug("Error: No tile to move!");
			return false;
		}
	
		const wasStartingGate = bpStart.isType(ELEMENTALGATE); // ⭐⭐
	
		let capturedTile = null;
	
		if (bpEnd.hasTile()) {
			if (!this._canTileStartCaptureEnd(bpStart, bpEnd)) {
				debug("Cannot capture that tile!");
				return false;
			}
	
			capturedTile = bpEnd.tile;
	
			// 💥 SUPER IMPORTANT: Remove captured tile
			bpEnd.removeTile();
		}
	
		// 🛠️ Now move the movingTile to destination
		bpStart.removeTile();
		bpStart.removeType(ELEMENTALGATE);
		bpStart.removeType(CELESTIALGATE);
		bpEnd.putTile(movingTile);
	
		return {
			movedTile: movingTile,
			capturedTile: capturedTile,
			startPoint: notationPointStart,
			endPoint: notationPointEnd,
			wasStartingGate: wasStartingGate
		};
	}
	
	
	
	
	
	
		
	
	
	
	
	
    /**
     * Taken from VagabondBoard.js
     * @param {ShiBoardPoint} boardPointStart
     */
	setPossibleMovePoints(boardPointStart) {
		if (!boardPointStart.hasTile()) return;
	
		let player = boardPointStart.tile.ownerName;
	
		for (const row of this.cells) {
			for (const bp of row) {
				if (!bp || bp === boardPointStart) continue; // 🔥 Don't highlight your own starting point
				if (!bp.isType(NON_PLAYABLE)) {
					if (this._canMoveTileToPoint(player, boardPointStart, bp)) {
						bp.addType(POSSIBLE_MOVE);
					}
				}
			}
		}
	}
	
	
	
	isInsideBoard(row, col) {
		return row >= 0 && col >= 0 && row < this.size.row && col < this.size.col;
	}
	

    /**
     * @param {string} player HOST or GUEST
     * @param {string} tileCode
     * @returns
     */
    /**
     * Sets the possible deployment points for a tile based on Shi Pai Sho rules.
     * @param {string} player The player deploying the tile.
     * @param {string} tileCode The code of the tile being deployed.
     */

	
	setDeployPointsPossibleMoves(player, tileCode, isBonusDeploy = false) {
		const gatePoints = this._getGatePoints();
		const celestialGatePoints = this._getCelestialGatePoints();
	
		const isElemental = ["W", "E", "F", "A"].includes(tileCode);
		const isCelestial = ["S", "M", "L"].includes(tileCode);
	
		if (!isElemental && !isCelestial) return;
	
		const playerGateTileCount = gatePoints.filter(point =>
			point.hasTile() && point.tile.ownerName === player
		).length;
	
		const firstTurn = playerGateTileCount < 2;
	
		if (isElemental && playerGateTileCount < 2) {
			for (const gate of gatePoints) {
				if (!gate.hasTile()) {
					gate.addType(POSSIBLE_MOVE);
				}
			}
		}
		
	
		else if (isCelestial) {
			for (const center of celestialGatePoints) {
				if (!center.hasTile()) {
					center.addType(POSSIBLE_MOVE);
				}
			}
		}
	}
	
	
	
	
	
	

    removePossibleMovePoints() {
        this.cells.forEach((row) => {
            row.forEach((bp) => bp.removeType(POSSIBLE_MOVE));
        });
    }

    /**
     *
     * @param {ShiTile} tile
     * @param {NotationPoint} notationPoint
     */
    placeTile(tile, notationPoint) {
        this.putTileOnPoint(tile, notationPoint);

        // Things to do after a tile is placed

        // Nothing :)
    }

    putTileOnPoint(tile, notationPoint) {
        let p = notationPoint.rowAndColumn;
        let point = this.cells[p.row][p.col];
        point.putTile(tile)
    }

	formatPlayerDisplay(code) {
		return code === "GUEST" ? "Guest" : "Host";
	}
	
	
	// Only Solar Eclipse allows HOST to win
	// Only Lunar Eclipse allows GUEST to win

    /**
     * Checks whether a player has won, and adds it as a winner and the reason why.
     * @param {ShiTileManager} tileManager Contains all the tiles neccesary to check if a player has won
	 * @param {string} player - Either "HOST" or "GUEST".
     */
    /**
     * Checks whether a player has won, and adds it as a winner and the reason why.
     * @param {ShiTileManager} tileManager Contains all the tiles neccesary to check if a player has won
     */
	checkForEndGame(tileManager, player) {
		const capturedCount = tileManager.getCapturedElementalCount(player);
		const celestialTiles = this.getCelestialTilesForPlayer(player);
	
		this.logCelestialPositionsInShiCoordinates();
	
		if (
			capturedCount >= 6 &&
			celestialTiles.length === 3 &&
			this.areTilesAligned(celestialTiles) &&
			this.areCelestialsProperlyPlaced(celestialTiles) &&
			this.areCelestialsUnobstructed(celestialTiles)
		) {
			const eclipseType = this.getEclipseType(celestialTiles, player);
	
			if ((player === "HOST" && eclipseType === "Solar") || 
				(player === "GUEST" && eclipseType === "Lunar")) {
	
				this.winners = [player]; // "HOST" or "GUEST"
				this.winnerReason = `${player} has formed a ${eclipseType} Eclipse and won the game!`;
					
			}
		}
	}

	areCelestialsUnobstructed(celestialTiles) {
		const positions = celestialTiles.map(t => this._getTilePosition(t));
		if (positions.includes(null)) return false;
	
		// Check all pairs for clear paths
		const tileIds = celestialTiles.map(t => t.id);
		const [a, b, c] = positions;
	
		const paths = [
			this._getLinePointsBetween(a, b),
			this._getLinePointsBetween(a, c),
			this._getLinePointsBetween(b, c),
		];
	
		for (const path of paths) {
			for (const { row, col } of path) {
				const bp = this.cells[row][col];
				if (!bp || !bp.hasTile()) continue;
	
				const tile = bp.tile;
				if (!tileIds.includes(tile.id)) {
					console.warn("Obstruction found on eclipse path:", tile.code);
					return false;
				}
			}
		}
	
		return true;
	}

	_getLinePointsBetween(a, b) {
		const points = [];
	
		const dRow = b.row - a.row;
		const dCol = b.col - a.col;
	
		const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
		const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);
		const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
	
		let r = a.row + stepRow;
		let c = a.col + stepCol;
	
		while (r !== b.row || c !== b.col) {
			points.push({ row: r, col: c });
			r += stepRow;
			c += stepCol;
		}
	
		return points;
	}
	
	
	
	
	

	areCelestialsProperlyPlaced(celestialTiles) {
		for (const tile of celestialTiles) {
			const pos = this._getTilePosition(tile);
			if (!pos) return false;
	
			const point = this.cells[pos.row][pos.col];
	
			// ❌ If any Celestial is still on the Celestial Gate (center), instant fail
			if (pos.row === 8 && pos.col === 8) {
				console.warn("Celestial tile still at Celestial Gate!");
				return false;
			}
	
			if (tile.code === "S") { // Sun
				if (!point.isType(WHITE)) {
					console.warn("Sun is not inside White Garden!");
					return false;
				}
			} else if (tile.code === "M") { // Moon
				if (!point.isType(RED)) {
					console.warn("Moon is not inside Red Garden!");
					return false;
				}
			} else if (tile.code === "L") { // Lotus
				if (!point.isType(LOTUSPATH)) {
					console.warn("Lotus is not inside Lotus Path!");
					return false;
				}
			}
		}
	
		return true;
	}

    /**
     * NOTE: This methods will be useful when calculating possible moves,
     * be sure to look at the boards to see any other methods used for unortodox movements!
     * @param {RowAndColumn} rowAndCol
     * @returns {Array<RowAndColumn>}
     */
    getSurroundingBoardPoints(initialBoardPoint) {
        var surroundingPoints = [];
        for (
            var row = initialBoardPoint.row - 1;
            row <= initialBoardPoint.row + 1;
            row++
        ) {
            for (
                var col = initialBoardPoint.col - 1;
                col <= initialBoardPoint.col + 1;
                col++
            ) {
                if (
                    (row !== initialBoardPoint.row ||
                        col !== initialBoardPoint.col) && // Not the center given point
                    row >= 0 &&
                    col >= 0 &&
                    row < 17 &&
                    col < 17
                ) {
                    // Not outside range of the grid
                    var boardPoint = this.cells[row][col];
                    if (!boardPoint.isType(NON_PLAYABLE)) {
                        // Not non-playable
                        surroundingPoints.push(boardPoint);
                    }
                }
            }
        }
        return surroundingPoints;
    }

	getTilesOnBoard() {
		let tiles = [];
	
		for (let row = 0; row < this.size.row; row++) {
			for (let col = 0; col < this.size.col; col++) {
				const bp = this.cells[row]?.[col];
				if (!bp || bp.isType(NON_PLAYABLE)) continue;
				if (bp.hasTile()) {
					tiles.push(bp.tile);
				}
			}
		}
	
		return tiles;
	}
	
	getCelestialTilesForPlayer(player) {
		const celestialCodes = ["L", "S", "M"];
		const playerCelestials = [];
	
		for (const tile of this.getTilesOnBoard()) {
			if (celestialCodes.includes(tile.code) && tile.ownerName === player) {
				playerCelestials.push(tile);
			}
		}
	
		// Must have exactly one of each type: L, S, M
		const hasL = playerCelestials.some(t => t.code === "L");
		const hasS = playerCelestials.some(t => t.code === "S");
		const hasM = playerCelestials.some(t => t.code === "M");
	
		if (hasL && hasS && hasM) {
			return playerCelestials;
		}
	
		// ❌ If not exactly 1 Lotus, 1 Sun, 1 Moon => not valid
		return [];
	}

	areTilesAligned(tiles) {
		if (tiles.length !== 3) return false;
	
		const positions = tiles.map(t => this._getTilePosition(t));
		const [a, b, c] = positions;
	
		const rowAligned = a.row === b.row && b.row === c.row;
		const colAligned = a.col === b.col && b.col === c.col;
		const diag1 = a.row - a.col === b.row - b.col && b.row - b.col === c.row - c.col;
		const diag2 = a.row + a.col === b.row + b.col && b.row + b.col === c.row + c.col;
	
		return rowAligned || colAligned || diag1 || diag2;
	}
	_getTilePosition(tile) {
		for (let row = 0; row < this.size.row; row++) {
			for (let col = 0; col < this.size.col; col++) {
				const bp = this.cells[row]?.[col];
				if (!bp || bp.isType(NON_PLAYABLE)) continue;
				if (bp.hasTile() && bp.tile.id === tile.id) {
					return { row, col };
				}
			}
		}
		return null;
	}
	
	// Solar Eclipse = Sun–Moon–Lotus
	// Lunar Eclipse = Moon–Lotus–Sun
	getEclipseType(tiles, player) {
		const sun = tiles.find(t => t.code === "S");
		const moon = tiles.find(t => t.code === "M");
		const lotus = tiles.find(t => t.code === "L");
	
		if (!sun || !moon || !lotus) return "Unknown";
	
		const pos = {
			S: this._getTilePosition(sun),
			M: this._getTilePosition(moon),
			L: this._getTilePosition(lotus),
		};
	
		if (!pos.S || !pos.M || !pos.L) return "Unknown";
	
		const isWhite = this.cells[pos.S.row][pos.S.col]?.isType(WHITE);
		const isRed = this.cells[pos.M.row][pos.M.col]?.isType(RED);
		const isLotus = this.cells[pos.L.row][pos.L.col]?.isType(LOTUSPATH);
		if (!isWhite || !isRed || !isLotus) return "Invalid";
	
		// All aligned?
		const aligned =
			(pos.S.row === pos.M.row && pos.M.row === pos.L.row) ||
			(pos.S.col === pos.M.col && pos.M.col === pos.L.col) ||
			(pos.S.row - pos.S.col === pos.M.row - pos.M.col && pos.M.row - pos.M.col === pos.L.row - pos.L.col) ||
			(pos.S.row + pos.S.col === pos.M.row + pos.M.col && pos.M.row + pos.M.col === pos.L.row + pos.L.col);
		if (!aligned) return "Unknown";
	
		// Identify the middle tile
		const distances = {
			SM: Math.abs(pos.S.row - pos.M.row) + Math.abs(pos.S.col - pos.M.col),
			SL: Math.abs(pos.S.row - pos.L.row) + Math.abs(pos.S.col - pos.L.col),
			ML: Math.abs(pos.M.row - pos.L.row) + Math.abs(pos.M.col - pos.L.col),
		};
	
		let middle = null;
		if (distances.SM > distances.SL && distances.SM > distances.ML) {
			middle = "L"; // Lotus is between Sun and Moon
		} else if (distances.SL > distances.SM && distances.SL > distances.ML) {
			middle = "M";
		} else if (distances.ML > distances.SM && distances.ML > distances.SL) {
			middle = "S";
		}
	
		if (middle === "L" && player === "GUEST") return "Lunar";
		if (middle === "M" && player === "HOST") return "Solar";
	
		return "Unknown";
	}
	
	
	getTilesInElementalGates(playerCode) {
		const points = this._getGatePoints();
		return points
			.filter(p => p.hasTile() && p.tile.ownerName === playerCode)
			.map(p => p.tile);
	}
	
	
	
	
	
	logCelestialPositionsInShiCoordinates() {
		const celestialTiles = this.getTilesOnBoard().filter(tile => ["L", "S", "M"].includes(tile.code));
	
		//console.log("=== Celestial Tiles (Shi Coordinates) ===");
	
		for (const tile of celestialTiles) {
			const pos = this._getTilePosition(tile);
			if (pos) {
				const shiX = pos.col - 8; // col - center col (8)
				const shiY = 8 - pos.row; // center row (8) - row
	
				console.log(`Tile ${tile.code} (${tile.ownerName}) at Shi coordinates: (${shiX}, ${shiY})`);
			} else {
				console.log(`Tile ${tile.code} (${tile.ownerName}) - position NOT FOUND`);
			}
		}
	
		//console.log("=========================================");
	}
	
	
	
	
	
	
}