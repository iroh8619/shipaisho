/* Beyond The Maps Board */

import { EDGES_12x12_GAME, gameOptionEnabled } from '../GameOptions';
import {
  GUEST,
  HOST,
  NotationPoint,
  RowAndColumn,
} from '../CommonNotationObjects';
import {
  NON_PLAYABLE,
  POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { TrifleBoardPoint } from '../trifle/TrifleBoardPoint';
import {
  arrayContainsDuplicates,
  debug,
  getShortestArrayFromArrayOfArrays,
} from '../GameData';
import {
  getOpponentName,
  getPlayerCodeFromName,
} from '../pai-sho-common/PaiShoPlayerHelp';
import { showBadMoveModal } from '../PaiShoMain';
import BeyondTheMapsTile, { BeyondTheMapsTileType } from './BeyondTheMapsTile';

const FULL_BOARD_SIZE_LENGTH = 18;

export class BeyondTheMapsBoard {
	constructor() {
		if (gameOptionEnabled(EDGES_12x12_GAME)) {
			this.size = new RowAndColumn(12, 12);
			this.cells = this.brandNewForFullGridSpaces();
			this.guestStartingPoint = this.cells[3][3];
			this.hostStartingPoint = this.cells[14][14];
		} else {
			this.size = new RowAndColumn(FULL_BOARD_SIZE_LENGTH, FULL_BOARD_SIZE_LENGTH);
			this.cells = this.brandNewForFullGridSpaces();
			this.guestStartingPoint = this.cells[0][0];
			this.hostStartingPoint = this.cells[17][17];
		}

		this.winners = [];
		this.seaGroups = [];
		this.knownSeaPoints = [];
	}

	getArrayOfBoardPoints() {
		var boardPoints = [];

		for (var i = 0; i < this.size.col; i++) {
			boardPoints.push(new TrifleBoardPoint());
		}

		return boardPoints;
	}

	brandNewForFullGridSpaces() {
		var cells = [];

		for (var row = 0; row < FULL_BOARD_SIZE_LENGTH; row++) {
			cells[row] = this.newRow(row, this.getArrayOfBoardPoints());
		}

		for (var row = 0; row < cells.length; row++) {
			for (var col = 0; col < cells[row].length; col++) {
				cells[row][col].row = row;
				cells[row][col].col = col;
				cells[row][col].setRowAndCol(row, col);
			}
		}

		return cells;
	}

	newRow(rowNum, points) {
		var cells = [];

		var numBlanksOnSides = (FULL_BOARD_SIZE_LENGTH - this.size.row) / 2;

		var nonPoint = new TrifleBoardPoint();
		nonPoint.addType(NON_PLAYABLE);

		for (var i = 0; i < FULL_BOARD_SIZE_LENGTH; i++) {
			if (i < numBlanksOnSides || rowNum < numBlanksOnSides || rowNum >= (FULL_BOARD_SIZE_LENGTH - numBlanksOnSides)) {
				cells[i] = nonPoint;
			} else if (i < numBlanksOnSides + this.size.col || numBlanksOnSides === 0) {
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
	}

	placeTile(tile, notationPoint) {
		var point = this.getBoardPointFromNotationPoint(notationPoint);

		var capturedTile = point.tile;

		this.putTileOnPoint(tile, notationPoint);

		return capturedTile;
	}

	putTileOnPoint(tile, notationPoint) {
		var point = this.getBoardPointFromNotationPoint(notationPoint);

		point.putTile(tile);
	}

	isValidRowCol(rowCol) {
		return rowCol.row >= 0 
			&& rowCol.col >= 0 
			&& rowCol.row <= FULL_BOARD_SIZE_LENGTH - 1 
			&& rowCol.col <= FULL_BOARD_SIZE_LENGTH - 1;
	}

	getSurroundingRowAndCols(rowAndCol) {
		var rowAndCols = [];
		for (var row = rowAndCol.row - 1; row <= rowAndCol.row + 1; row++) {
			for (var col = rowAndCol.col - 1; col <= rowAndCol.col + 1; col++) {
				if ((row !== rowAndCol.row || col !== rowAndCol.col)	// Not the center given point
					&& (row >= 0 && col >= 0) && (row < FULL_BOARD_SIZE_LENGTH && col < FULL_BOARD_SIZE_LENGTH)) {	// Not outside range of the grid
					var boardPoint = this.cells[row][col];
					if (!boardPoint.isType(NON_PLAYABLE)) {	// Not non-playable
						rowAndCols.push(new RowAndColumn(row, col));
					}
				}
			}
		}
		return rowAndCols;
	}

	moveTile(notationPointStart, notationPointEnd) {
		var startRowCol = notationPointStart.rowAndColumn;
		var endRowCol = notationPointEnd.rowAndColumn;

		if (!this.isValidRowCol(startRowCol) || !this.isValidRowCol(endRowCol)) {
			debug("That point does not exist. So it's not gonna happen.");
			return false;
		}

		var boardPointStart = this.cells[startRowCol.row][startRowCol.col];
		var boardPointEnd = this.cells[endRowCol.row][endRowCol.col];

		var tile = boardPointStart.removeTile();

		if (!tile) {
			debug("Error: No tile to move!");
		}

		var capturedTile = boardPointEnd.removeTile();
		var error = boardPointEnd.putTile(tile);

		if (error) {
			debug("Error moving tile. It probably didn't get moved.");
			return false;
		}

		return capturedTile;
	}

	removeTile(notationPoint) {
		var rowCol = notationPoint.rowAndColumn;
		var boardPoint = this.cells[rowCol.row][rowCol.col];
		return boardPoint.removeTile();
	}

	canMoveTileToPoint(player, boardPointStart, boardPointEnd) {
		return boardPointStart !== boardPointEnd;
	}

	setPossibleMovePoints(boardPointStart, moveDistance) {
		if (boardPointStart.hasTile()) {
			this.setPossibleMovesForMovement({ title: "Btm", distance: moveDistance }, boardPointStart);
			boardPointStart.addType(POSSIBLE_MOVE);
		}
	}

	getAdjacentPointsPotentialPossibleMoves = function(pointAlongTheWay, originPoint, mustPreserveDirection, movementInfo) {
		var potentialMovePoints = [];
	
		if (!pointAlongTheWay) {
			pointAlongTheWay = originPoint;
		}
		var rowDifference = originPoint.row - pointAlongTheWay.row;
		var colDifference = originPoint.col - pointAlongTheWay.col;
	
		if (pointAlongTheWay.row > 0) {
			potentialMovePoints.push(this.cells[pointAlongTheWay.row - 1][pointAlongTheWay.col]);
		}
		if (pointAlongTheWay.row < FULL_BOARD_SIZE_LENGTH - 1) {
			potentialMovePoints.push(this.cells[pointAlongTheWay.row + 1][pointAlongTheWay.col]);
		}
		if (pointAlongTheWay.col > 0) {
			potentialMovePoints.push(this.cells[pointAlongTheWay.row][pointAlongTheWay.col - 1]);
		}
		if (pointAlongTheWay.col < FULL_BOARD_SIZE_LENGTH - 1) {
			potentialMovePoints.push(this.cells[pointAlongTheWay.row][pointAlongTheWay.col + 1]);
		}
	
		var finalPoints = [];
	
		var slopeOriginal = this.calculateSlopeBetweenPoints(originPoint, pointAlongTheWay);
		potentialMovePoints.forEach(potentialMovePoint => {
			if (!potentialMovePoint.isType(NON_PLAYABLE)) {
				var slopePotential = this.calculateSlopeBetweenPoints(pointAlongTheWay, potentialMovePoint);
				if (!mustPreserveDirection
						|| slopeOriginal === slopePotential
				) {
					finalPoints.push(potentialMovePoint);
				}
			}
		});
	
		return finalPoints;
	}

	calculateSlopeBetweenPoints = function(p1, p2) {
		var rise = p2.row - p1.row;
		var run = p2.col - p1.col;

		if (rise === 0) {
			if (run > 0) {
				return "PosRun";
			} else if (run < 0) {
				return "NegRun";
			}
		} else if (run === 0) {
			if (rise > 0) {
				return "PosRise";
			} else if (rise < 0) {
				return "NegRise";
			}
		}

		var slope = run === 0 ? 0 : rise / run;
		return slope;
	}

	calculateSlopeObjBetweenPoints = function(p1, p2) {
		var rise = p2.row - p1.row;
		var run = p2.col - p1.col;
		var slope = run === 0 ? 0 : rise / run;
		return {
			rise: rise,
			run: run,
			slope: slope
		};
	}

	couldMoveTileToPoint = function(tile, boardPointStart, boardPointEnd) {
		var canCapture = false;
	
		// If endpoint has a tile there that can't be captured, that is wrong.
		if (boardPointEnd.hasTile() && !canCapture) {
			return false;
		}
	
		// if (!boardPointEnd.canHoldTile(boardPointStart.tile, canCapture)) {
		// 	return false;
		// }
	
		// I guess we made it through
		return true;
	}

	tileCanMoveOntoPoint(tile, movementInfo, targetPoint, fromPoint, originPoint) {
		return this.couldMoveTileToPoint(tile, fromPoint, targetPoint);
	}

	static standardMovementFunction(board, originPoint, boardPointAlongTheWay, movementInfo, moveStepNumber) {
		var mustPreserveDirection = false; //TrifleTileInfo.movementMustPreserveDirection(movementInfo);
		return board.getAdjacentPointsPotentialPossibleMoves(boardPointAlongTheWay, originPoint, mustPreserveDirection, movementInfo);
	}

	setPossibleMovesForMovement(movementInfo, boardPointStart) {
		this.inceptionCount = 0;
		this.setPossibleMovementPointsFromMovePointsOnePathAtATime(
			BeyondTheMapsBoard.standardMovementFunction,
			boardPointStart.tile,
			movementInfo,
			boardPointStart,
			boardPointStart,
			movementInfo.distance,
			0,
			[boardPointStart]);
		// debug("Inception Count: " + this.inceptionCount);
	}

	setPossibleMovementPointsFromMovePointsOnePathAtATime = function(nextPossibleMovementPointsFunction,
																		tile,
																		movementInfo,
																		originPoint,
																		recentPoint,
																		distanceRemaining,
																		moveStepNumber,
																		currentMovementPath) {
		this.inceptionCount++;
		if (distanceRemaining === 0) {
			return;	// Complete
		}
		var self = this;
		var nextPossiblePoints = nextPossibleMovementPointsFunction(self, originPoint, recentPoint, movementInfo, moveStepNumber, currentMovementPath);
		originPoint.setMoveDistanceRemaining(movementInfo, distanceRemaining);
		nextPossiblePoints.forEach(function(adjacentPoint) {
			self.movementPointChecks++;
			var canMoveThroughPoint = self.tileCanMoveThroughPoint(tile, movementInfo, adjacentPoint, recentPoint);
			if (canMoveThroughPoint) {
				adjacentPoint.addPossibleMovementPath(currentMovementPath);
			}
			if (self.tileCanMoveOntoPoint(tile, movementInfo, adjacentPoint, recentPoint)) {
				var movementOk = self.setPointAsPossibleMovement(adjacentPoint, originPoint.tile, originPoint);
				if (movementOk) {
					adjacentPoint.setPossibleForMovementType(movementInfo);
					if (!adjacentPoint.hasTile() || canMoveThroughPoint) {
						self.setPossibleMovementPointsFromMovePointsOnePathAtATime(
							nextPossibleMovementPointsFunction,
							tile,
							movementInfo,
							originPoint,
							adjacentPoint,
							distanceRemaining - 1,
							moveStepNumber + 1,
							currentMovementPath.concat([adjacentPoint])
						);
					}
				}
			} else if (canMoveThroughPoint) {
				self.setPossibleMovementPointsFromMovePointsOnePathAtATime(
					nextPossibleMovementPointsFunction,
					tile,
					movementInfo,
					originPoint,
					adjacentPoint,
					distanceRemaining - 1,
					moveStepNumber + 1,
					currentMovementPath.concat([adjacentPoint])
				);
			}
		});
	}

	// setPossibleMovementPointsFromMovePoints(movePoints, nextPossibleMovementPointsFunction, tile, movementInfo, originPoint, distanceRemaining, moveStepNumber) {
	// 	if (distanceRemaining === 0
	// 			|| !movePoints
	// 			|| movePoints.length <= 0) {
	// 		return;	// Complete
	// 	}
	
	// 	var self = this;
	// 	var nextPointsConfirmed = [];
	// 	movePoints.forEach(function(recentPoint) {
	// 		var nextPossiblePoints = nextPossibleMovementPointsFunction(self, originPoint, recentPoint, movementInfo, moveStepNumber);
	// 		nextPossiblePoints.forEach(function(adjacentPoint) {
	// 			//if (!self.canMoveHereMoreEfficientlyAlready(adjacentPoint, distanceRemaining, movementInfo)) {
	// 				adjacentPoint.setMoveDistanceRemaining(movementInfo, distanceRemaining);
					
	// 				var canMoveThroughPoint = self.tileCanMoveThroughPoint(tile, movementInfo, adjacentPoint, recentPoint);
					
	// 				/* If cannot move through point, then the distance remaining is 0, none! */
	// 				if (!canMoveThroughPoint) {
	// 					adjacentPoint.setMoveDistanceRemaining(movementInfo, 0);
	// 				}
					
	// 				if (self.tileCanMoveOntoPoint(tile, movementInfo, adjacentPoint, recentPoint, originPoint)) {
	// 					var movementOk = self.setPointAsPossibleMovement(adjacentPoint, tile, originPoint);
	// 					if (movementOk) {
	// 						if (!adjacentPoint.hasTile() || canMoveThroughPoint) {
	// 							nextPointsConfirmed.push(adjacentPoint);
	// 						}
	// 					}
	// 				} else if (canMoveThroughPoint) {
	// 					nextPointsConfirmed.push(adjacentPoint);
	// 				}
	// 			//}
	// 		});
	// 	});
	
	// 	this.setPossibleMovementPointsFromMovePoints(nextPointsConfirmed,
	// 		nextPossibleMovementPointsFunction, 
	// 		tile, 
	// 		movementInfo, 
	// 		originPoint,
	// 		distanceRemaining - 1,
	// 		moveStepNumber + 1);
	// }

	setPointAsPossibleMovement = function(targetPoint, tileBeingMoved, originPoint) {
		targetPoint.addType(POSSIBLE_MOVE);
		return true;
	}

	canMoveHereMoreEfficientlyAlready(boardPoint, distanceRemaining, movementInfo) {
		return boardPoint.getMoveDistanceRemaining(movementInfo) >= distanceRemaining;
	}

	tileCanMoveThroughPoint(tile, movementInfo, targetPoint, fromPoint) {
		return !targetPoint.hasTile() || targetPoint.tile.tileType === BeyondTheMapsTileType.SHIP;
	}

	removePossibleMovePoints() {
		this.cells.forEach(function(row) {
			row.forEach(function(boardPoint) {
				boardPoint.removeType(POSSIBLE_MOVE);
				boardPoint.clearPossibleMovementTypes();
				boardPoint.clearPossibleMovementPaths();
			});
		});
	}

	getBoardPointFromNotationPoint(notationPoint) {
		if (typeof notationPoint === 'string') {
			notationPoint = new NotationPoint(notationPoint);
		}
		var rowAndCol = notationPoint.rowAndColumn;

		if (!this.isValidRowCol(rowAndCol)) {
			debug("That point does not exist. So it's not gonna happen.");
			return false;
		}

		return this.cells[rowAndCol.row][rowAndCol.col];
	}

	moveShip(notationPointStart, notationPointEnd, landNotationPoint) {
		var boardPointStart = this.getBoardPointFromNotationPoint(notationPointStart);
		var boardPointEnd = this.getBoardPointFromNotationPoint(notationPointEnd);

		var tile = boardPointStart.removeTile();

		if (tile) {

			var error = boardPointEnd.putTile(tile);

			if (error) {
				debug("Error moving tile. It probably didn't get moved.");
				return false;
			}

			if (landNotationPoint) {
				this.placeLandPiecesForPlayer(tile.ownerName, [landNotationPoint]);
			}
		} else {
			debug("Error: No tile to move!");
			showBadMoveModal();
		}
	}

	placeLandPiecesForPlayer(playerName, landNotationPoints) {
		if (landNotationPoints && landNotationPoints.length > 0) {
			landNotationPoints.forEach(landNotationPoint => {
				var tile = new BeyondTheMapsTile(BeyondTheMapsTileType.LAND, getPlayerCodeFromName(playerName));
				this.placeTile(tile, landNotationPoint);
			});
		}
	}

	findPathForMovement(notationPointStart, notationPointEnd, notationPointLand, moveDistance) {
		var startPoint = this.getBoardPointFromNotationPoint(notationPointStart);
		var endPoint = this.getBoardPointFromNotationPoint(notationPointEnd);

		if (startPoint === endPoint) {
			return [];
		}

		var landPoint = notationPointLand ? this.getBoardPointFromNotationPoint(notationPointLand) : null;
		this.setPossibleMovePoints(startPoint, moveDistance - 1);

		var pointWithPossiblePaths = endPoint;

		if (landPoint) {
			pointWithPossiblePaths = this.getPointOpposite(endPoint, landPoint);

			pointWithPossiblePaths.possibleMovementPaths.forEach(path => {
				path.push(pointWithPossiblePaths);
				path.push(endPoint);
			});
		} else {
			endPoint.possibleMovementPaths.forEach(path => {
				path.push(endPoint);
			});
		}

		var movementPath = this.decidePathToUse(pointWithPossiblePaths.possibleMovementPaths);

		/* Done using marked points, clear now */
		this.removePossibleMovePoints();

		return movementPath;
	}

	decidePathToUse(possibleMovementPaths) {
		var pathsWithoutDuplicates = [];
		possibleMovementPaths.forEach(path => {
			if (!arrayContainsDuplicates(path)) {
				pathsWithoutDuplicates.push(path);
			}
		});
		if (pathsWithoutDuplicates.length > 0) {
			return getShortestArrayFromArrayOfArrays(pathsWithoutDuplicates);
		} else {
			return getShortestArrayFromArrayOfArrays(possibleMovementPaths);
		}
	}

	getPointOpposite(centerPoint, knownSidePoint) {
		if (centerPoint.row === knownSidePoint.row) {
			var row = centerPoint.row;
			var col = centerPoint.col + (centerPoint.col - knownSidePoint.col);
			return this.cells[row][col];
		} else if (centerPoint.col === knownSidePoint.col) {
			var col = centerPoint.col;
			var row = centerPoint.row + (centerPoint.row - knownSidePoint.row);
			return this.cells[row][col];
		}
	}

	markLandPointAtEndOfPathPossibleMove(moveEndPoint, lastStepPoint, player) {
		// Get "next/facing" point
		var landPoint = null;
		var nextPointArr = this.getAdjacentPointsPotentialPossibleMoves(moveEndPoint, lastStepPoint, true, null);
		if (nextPointArr && nextPointArr.length > 0) {
			var possibleLandPoint = nextPointArr[0];
			if ((!possibleLandPoint.hasTile() && !this.placingLandSeparatesShipsWithoutSurroundingEnemy(possibleLandPoint, player))
				|| (possibleLandPoint.hasTile() && possibleLandPoint.tile.tileType === BeyondTheMapsTileType.LAND && possibleLandPoint.tile.ownerName !== player)
			) {
				landPoint = possibleLandPoint;
				landPoint.addType(POSSIBLE_MOVE);
			}
		}
		return landPoint;
	}

	markLandPointsPossibleMovesForNoMovement(moveEndPoint, player) {
		var landPoints = [];
		var nextPointArr = this.getAdjacentPointsPotentialPossibleMoves(moveEndPoint, moveEndPoint, false, null);
		if (nextPointArr && nextPointArr.length > 0) {
			nextPointArr.forEach(possibleLandPoint => {
				if ((!possibleLandPoint.hasTile() && !this.placingLandSeparatesShipsWithoutSurroundingEnemy(possibleLandPoint, player))
					|| (possibleLandPoint.hasTile() && possibleLandPoint.tile.tileType === BeyondTheMapsTileType.LAND && possibleLandPoint.tile.ownerName !== player)
				) {
					landPoints.push(possibleLandPoint);
					possibleLandPoint.addType(POSSIBLE_MOVE);
				}
			});
		}
		return landPoints;
	}

	placingLandSeparatesShipsWithoutSurroundingEnemy(boardPoint, player) {
		var newBoard = this.getCopy();

		newBoard.placeLandPiecesForPlayer(HOST, [boardPoint]);
		newBoard.analyzeSeaAndLandGroups();

		return newBoard.shipsSeparatedAndPlayerHasNotBeenSurrounded(getOpponentName(player));
		// return newBoard.shipsSeparatedAndAShipHasNotBeenSurrounded(); // maybe this?
	}

	placingLandSeparatesShipsWithoutSurroundingOne(boardPoint) {
		var newBoard = this.getCopy();

		newBoard.placeLandPiecesForPlayer(HOST, [boardPoint]);
		newBoard.analyzeSeaAndLandGroups();

		return newBoard.shipsSeparatedAndAShipHasNotBeenSurrounded();
	}

	shipsSeparatedAndAShipHasNotBeenSurrounded() {
		var hostSeaGroupId = this.shipPoints[HOST] && this.shipPoints[HOST].seaGroupId;
		var guestSeaGroupId = this.shipPoints[GUEST] && this.shipPoints[GUEST].seaGroupId;
		var bothShipsPresent = hostSeaGroupId >= 0 && guestSeaGroupId >= 0;
		return (
			bothShipsPresent && hostSeaGroupId !== guestSeaGroupId)		// Ships separated and present
			&& !(														// AND NOT:
				!bothShipsPresent		 								// (A ship has been captured
				|| this.aShipIsSurrounded()								// OR a ship is cannot move)
			);
	}

	shipsSeparatedAndPlayerHasNotBeenSurrounded(player) {
		var hostSeaGroupId = this.shipPoints[HOST] && this.shipPoints[HOST].seaGroupId;
		var guestSeaGroupId = this.shipPoints[GUEST] && this.shipPoints[GUEST].seaGroupId;
		var bothShipsPresent = hostSeaGroupId >= 0 && guestSeaGroupId >= 0;
		return (
			bothShipsPresent && hostSeaGroupId !== guestSeaGroupId)		// Ships separated and present
			&& !(														// AND NOT:
				!bothShipsPresent		 								// (A ship has been captured
				|| this.playerShipSurrounded(player)					// OR a ship is cannot move)
			);
	}

	aShipIsSurrounded() {
		var playersSurrounded = [];
		if (this.playerShipSurrounded(HOST)) {
			playersSurrounded.push(HOST);
		}
		if (this.playerShipSurrounded(GUEST)) {
			playersSurrounded.push(GUEST);
		}
		return playersSurrounded.length > 0 && playersSurrounded;
	}

	playerShipSurrounded(playerName) {
		/* A ship is surrounded if all adjacent points are land or the sea with both ships in it is size 2 */

		/* Check if surrounded by land */
		var allAdjacentPointsAreLand = false;
		if (this.shipPoints) {
			var shipPoint = this.shipPoints[playerName];
			if (shipPoint) {
				var adjacentPoints = this.getAdjacentPoints(shipPoint);
				var allAdjPointsFilled = true;
				adjacentPoints.forEach(adjPoint => {
					if (!(adjPoint.hasTile() && adjPoint.tile.tileType === BeyondTheMapsTileType.LAND)) {
						allAdjPointsFilled = false;
					}
				});
				allAdjacentPointsAreLand = allAdjPointsFilled;
			} else {
				return true;	// No ship, must have been captured (counts as surrounded)
			}
		}

		/* Ships in sea of size 2 (they cannot move past each other and both are trapped) */
		var shipSeaIsSmallAsCanBe = false;
		var hostSeaGroupId = this.shipPoints[HOST] && this.shipPoints[HOST].seaGroupId;
		var guestSeaGroupId = this.shipPoints[GUEST] && this.shipPoints[GUEST].seaGroupId;
		var shipsInSameSea = hostSeaGroupId === guestSeaGroupId;
		shipSeaIsSmallAsCanBe = shipsInSameSea && this.seaGroups[hostSeaGroupId].length === 2;

		return allAdjacentPointsAreLand || shipSeaIsSmallAsCanBe;
	}

	setPossibleExploreLandPointsForPlayer(playerName) {
		var possibleLandPointsFound = false;
		// Get all "peninsulas"
		var peninsulaPoints = [];
		this.forEachBoardPointWithTile(pointWithTile => {
			if (this.pointIsPeninsulaForPlayer(pointWithTile, playerName)) {
				peninsulaPoints.push(pointWithTile);
			}
		});

		if (peninsulaPoints.length) {
			peninsulaPoints.forEach(peninsulaPoint => {
				var adjacentPoints = this.getAdjacentPoints(peninsulaPoint);
				adjacentPoints.forEach(adjacentPoint => {
					if (!adjacentPoint.hasTile() && !this.placingLandSeparatesShipsWithoutSurroundingEnemy(adjacentPoint, playerName)) {
						adjacentPoint.addType(POSSIBLE_MOVE);
						possibleLandPointsFound = true;
					}
				});
			});
		}

		return possibleLandPointsFound;
	}

	setPossibleContinueExploreLandPointsForPlayer(playerName, boardPoint) {
		var possiblePointsFound = false;
		var adjacentPoints = this.getAdjacentPoints(boardPoint);
		adjacentPoints.forEach(adjacentPoint => {
			if (!adjacentPoint.hasTile() && !this.placingLandSeparatesShipsWithoutSurroundingEnemy(adjacentPoint, playerName)) {
				adjacentPoint.addType(POSSIBLE_MOVE);
				possiblePointsFound = true;
			}
		});
		return possiblePointsFound;
	}

	pointIsPeninsulaForPlayer(boardPoint, playerName) {
		if (boardPoint.hasTile() 
				&& boardPoint.tile.tileType === BeyondTheMapsTileType.LAND
				&& boardPoint.tile.ownerName === playerName) {
			// if adjacent to <= 1 lands of same player, yes
			var adjacentFriendlyLandCount = 0;
			this.getAdjacentPoints(boardPoint).forEach(adjacentPoint => {
				if (adjacentPoint.hasTile() 
						&& adjacentPoint.tile.tileType === BeyondTheMapsTileType.LAND
						&& adjacentPoint.tile.ownerName === playerName) {
					adjacentFriendlyLandCount++;
				}
			});
			return adjacentFriendlyLandCount <= 1;
		}
		return false;
	}

	seaGroupIsSurroundedByAPlayer(seaGroup) {
		var surroundedCheckResults = this.getSurroundingInfo(seaGroup);

		return !surroundedCheckResults.touchesEdge 
			&& surroundedCheckResults.surroundingPlayers.size === 1;
	}

	seaGroupIsSurroundedByCertainPlayer(seaGroup, playerName) {
		var surroundedCheckResults = this.getSurroundingInfo(seaGroup);

		return !surroundedCheckResults.touchesEdge 
			&& surroundedCheckResults.surroundingPlayers.size === 1
			&& surroundedCheckResults.surroundingPlayers.has(playerName);
	}

	getSurroundingInfo(seaGroup) {
		var surroundingPlayers = new Set();
		var touchesEdge = false;
		seaGroup.forEach(seaPoint => {
			if (!touchesEdge) {
				var adjacentPoints = this.getAdjacentPoints(seaPoint);
				if (adjacentPoints.length !== 4) {
					// debug("Group touches edge, means it is not surrounded");
					touchesEdge = true;
				} else {
					adjacentPoints.forEach(adjacentPoint => {
						if (!seaGroup.includes(adjacentPoint)
								&& adjacentPoint.hasTile() && adjacentPoint.tile.tileType === BeyondTheMapsTileType.LAND
								&& !surroundingPlayers.has(adjacentPoint.tile.ownerName)) {
							surroundingPlayers.add(adjacentPoint.tile.ownerName);
						}
					});
				}
			}
		});

		return {
			surroundingPlayers: surroundingPlayers,
			touchesEdge: touchesEdge
		}
	}

	fillEnclosedLandForPlayer(playerName) {
		var landfillPoints = [];

		this.analyzeSeaAndLandGroups();

		this.seaGroups.forEach(seaGroup => {
			if (this.seaGroupIsSurroundedByCertainPlayer(seaGroup, playerName)) {
				this.placeLandPiecesForPlayer(playerName, seaGroup);
				landfillPoints = landfillPoints.concat(seaGroup);
			}
		});

		// Check for captures.... yay
		landfillPoints = landfillPoints.concat(this.processCaptures(playerName));

		return landfillPoints;
	}

	processCaptures(capturingPlayer) {
		var landfillPoints = [];
		var playerBeingCaptured = getOpponentName(capturingPlayer);
		/* Check for Host lands + seas it is touching, see if that is surrounded by Guest */

		/* For each land group, group it together with any seas it is touching,
		then check to see if that land+seas group is surrounded by opponent of land group. */
		
		this.landGroups.forEach(landGroup => {
			var groupOwner = landGroup[0].tile.ownerName;
			if (groupOwner === playerBeingCaptured) {
				var landAndSeasGroup = this.buildLandAndSeasGroup(landGroup);
				var groupIsSurrounded = false;
				var surroundedCheckResults = this.getSurroundingInfo(landAndSeasGroup);
				groupIsSurrounded = surroundedCheckResults.surroundingPlayers.has(capturingPlayer)
									&& !surroundedCheckResults.surroundingPlayers.has(playerBeingCaptured)
									&& !surroundedCheckResults.touchesEdge;
				if (groupIsSurrounded) {
					debug("OH mana alaskdfj;alk group surrounded!");
					landfillPoints = landfillPoints.concat(this.doCaptureGroup(landAndSeasGroup, capturingPlayer));
				}
			}
		});

		return landfillPoints;
	}

	doCaptureGroup(landAndSeasGroup, capturingPlayer) {
		var landfillPoints = [];

		/* Fill in spaces and capture ships first */
		landAndSeasGroup.forEach(point => {
			if (this.pointIsEmptyOrShip(point)) {
				this.placeLandPiecesForPlayer(capturingPlayer, [point]);
				landfillPoints.push(point);
			}
		});

		landfillPoints = landfillPoints.concat(this.capturePeninsulasInGroup(landAndSeasGroup, capturingPlayer, []));

		return landfillPoints;
	}

	capturePeninsulasInGroup(landAndSeasGroup, capturingPlayer, landfillPoints) {
		var captureHappened = false;
		landAndSeasGroup.forEach(point => {
			if (this.pointIsPeninsulaForPlayer(point, getOpponentName(capturingPlayer))) {
				this.placeLandPiecesForPlayer(capturingPlayer, [point]);
				landfillPoints.push(point);
				captureHappened = true;
			}
		});

		if (captureHappened) {
			return this.capturePeninsulasInGroup(landAndSeasGroup, capturingPlayer, landfillPoints);
		} else {
			// Done with recursion
			return landfillPoints;
		}
	}

	buildLandAndSeasGroup(landGroup) {
		var touchingSeaGroupIds = this.getSeaGroupIdsTouchingLandGroup(landGroup);

		/* If no touching sea groups (land is completely surrounded), return landGroup */
		if (touchingSeaGroupIds.length === 0) {
			return landGroup;
		}

		var groupOwner = landGroup[0].tile.ownerName;

		var touchingLandGroupIds = new Set();

		var landAndSeasGroup = [];

		for (var i = 0; i < touchingSeaGroupIds.length; i++) {
			var seaGroupId = touchingSeaGroupIds[i];

			var seaGroup = this.seaGroups[seaGroupId];
			landAndSeasGroup = landAndSeasGroup.concat(seaGroup);

			var newLandGroupIds = this.getLandGroupIdsTouchingSeaGroup(seaGroup, groupOwner);
			newLandGroupIds.forEach(landGroupId => touchingLandGroupIds.add(landGroupId));

			newLandGroupIds.forEach(landGroupId => {
				var moreSeaGroupIds = this.getSeaGroupIdsTouchingLandGroup(this.landGroups[landGroupId]);
				moreSeaGroupIds.forEach(anotherSeaGroupId => {
					if (!touchingSeaGroupIds.includes(anotherSeaGroupId)) {
						touchingSeaGroupIds.push(anotherSeaGroupId);
					}
				});
			});
		}

		touchingLandGroupIds.forEach(landGroupId => landAndSeasGroup = landAndSeasGroup.concat(this.landGroups[landGroupId]));

		return landAndSeasGroup;
	}

	getSeaGroupIdsTouchingLandGroup(landGroup) {
		var touchingSeaIds = [];
		landGroup.forEach(landPoint => {
			var adjacentPoints = this.getAdjacentPoints(landPoint);
			adjacentPoints.forEach(adjacentPoint => {
				if (this.pointIsEmptyOrShip(adjacentPoint)
						&& !touchingSeaIds.includes(adjacentPoint.seaGroupId)) {
					touchingSeaIds.push(adjacentPoint.seaGroupId);
				}
			});
		});
		return touchingSeaIds;
	}

	getLandGroupIdsTouchingSeaGroup(seaGroup, landOwnerName) {
		var touchingLandIds = [];
		seaGroup.forEach(seaPoint => {
			var adjacentPoints = this.getAdjacentPoints(seaPoint);
			adjacentPoints.forEach(adjacentPoint => {
				if (this.pointIsLandForPlayer(adjacentPoint, landOwnerName)
						&& !touchingLandIds.includes(adjacentPoint.landGroupId)) {
					touchingLandIds.push(adjacentPoint.landGroupId);
				}
			});
		});
		return touchingLandIds;
	}

	analyzeSeaAndLandGroups() {
		this.analyzeSeaGroups();	// It does both, don't tell anyone :D
	}

	analyzeSeaGroups() {
		this.seaGroups = [];
		this.knownSeaPoints = [];
		this.shipPoints = {};

		this.landGroups = [];
		this.knownLandPoints = [];

		this.forEachBoardPoint(bp => {
			if (this.pointIsEmptyOrShip(bp)) {
				this.landGroupId = null;
				if (!this.knownSeaPoints.includes(bp.getNotationPointString())) {
					var seaGroup = [];

					if (bp.hasTile()) {
						this.shipPoints[bp.tile.ownerName] = bp;
					}

					seaGroup.push(bp);
					bp.seaGroupId = this.seaGroups.length;

					this.knownSeaPoints.push(bp.getNotationPointString());

					this.collectAdjacentPointsInSeaGroup(bp, seaGroup);

					this.seaGroups.push(seaGroup);
				}
			} else if (bp.hasTile() && bp.tile.tileType === BeyondTheMapsTileType.LAND) {
				bp.seaGroupId = null;
				if (!this.knownLandPoints.includes(bp.getNotationPointString())) {
					var landGroup = [];

					landGroup.push(bp);
					bp.landGroupId = this.landGroups.length;

					this.knownLandPoints.push(bp.getNotationPointString());

					this.collectAdjacentPointsInLandGroup(bp, landGroup);

					this.landGroups.push(landGroup);
				}
			} else {
				// Not ever happen, eh?
				bp.seaGroupId = null;
				bp.landGroupId = null;
			}
		});
	
		// debug("# of Sea Groups: " + this.seaGroups.length);
		// debug("# of Land Groups: " + this.landGroups.length);
		// debug("Ship Points:");
		// debug(this.shipPoints);
	}

	collectAdjacentPointsInSeaGroup(bp, seaGroup) {
		var adjacentPoints = this.getAdjacentPoints(bp);

		adjacentPoints.forEach(nextPoint => {
			if (!this.knownSeaPoints.includes(nextPoint.getNotationPointString())
					&& this.pointIsEmptyOrShip(nextPoint)) {
				if (nextPoint.hasTile()) {
					this.shipPoints[nextPoint.tile.ownerName] = nextPoint;
				}
				seaGroup.push(nextPoint);
				nextPoint.seaGroupId = bp.seaGroupId;
				this.knownSeaPoints.push(nextPoint.getNotationPointString());
				this.collectAdjacentPointsInSeaGroup(nextPoint, seaGroup);
			}
		});
	}

	collectAdjacentPointsInLandGroup(bp, landGroup) {
		var adjacentPoints = this.getAdjacentPoints(bp);

		adjacentPoints.forEach(nextPoint => {
			if (!this.knownLandPoints.includes(nextPoint.getNotationPointString())
					&& nextPoint.hasTile() && nextPoint.tile.tileType === BeyondTheMapsTileType.LAND
					&& nextPoint.tile.ownerName === bp.tile.ownerName) {
				landGroup.push(nextPoint);
				nextPoint.landGroupId = bp.landGroupId;
				this.knownLandPoints.push(nextPoint.getNotationPointString());
				this.collectAdjacentPointsInLandGroup(nextPoint, landGroup);
			}
		});
	}

	pointIsEmptyOrShip(point) {
		return !point.hasTile()
			|| (point.hasTile() && point.tile.tileType === BeyondTheMapsTileType.SHIP);
	}

	pointIsLandForPlayer(point, ownerName) {
		return point.hasTile() 
			&& point.tile.tileType === BeyondTheMapsTileType.LAND
			&& point.tile.ownerName === ownerName;
	}

	countPlayerLandPieces(playerName) {
		var landCount = 0;
		this.forEachBoardPointWithTile(bp => {
			if (bp.tile.ownerName === playerName && bp.tile.tileType === BeyondTheMapsTileType.LAND) {
				landCount++;
			}
		});
		return landCount;
	}

	getAdjacentRowAndCols(rowAndCol) {
		var rowAndCols = [];
	
		if (rowAndCol.row > 0) {
			var adjacentPoint = this.cells[rowAndCol.row - 1][rowAndCol.col];
			if (!adjacentPoint.isType(NON_PLAYABLE)) {
				rowAndCols.push(adjacentPoint);
			}
		}
		if (rowAndCol.row < FULL_BOARD_SIZE_LENGTH - 1) {
			var adjacentPoint = this.cells[rowAndCol.row + 1][rowAndCol.col];
			if (!adjacentPoint.isType(NON_PLAYABLE)) {
				rowAndCols.push(adjacentPoint);
			}
		}
		if (rowAndCol.col > 0) {
			var adjacentPoint = this.cells[rowAndCol.row][rowAndCol.col - 1];
			if (!adjacentPoint.isType(NON_PLAYABLE)) {
				rowAndCols.push(adjacentPoint);
			}
		}
		if (rowAndCol.col < FULL_BOARD_SIZE_LENGTH - 1) {
			var adjacentPoint = this.cells[rowAndCol.row][rowAndCol.col + 1];
			if (!adjacentPoint.isType(NON_PLAYABLE)) {
				rowAndCols.push(adjacentPoint);
			}
		}
	
		return rowAndCols;
	}
	getAdjacentPoints(boardPointStart) {
		return this.getAdjacentRowAndCols(boardPointStart);
	}

	forEachBoardPoint(forEachFunc) {
		this.cells.forEach(function(row) {
			row.forEach(function(boardPoint) {
				if (!boardPoint.isType(NON_PLAYABLE)) {
					forEachFunc(boardPoint);
				}
			});
		});
	}
	forEachBoardPointDoMany(forEachFuncList) {
		this.cells.forEach(function(row) {
			row.forEach(function(boardPoint) {
				if (!boardPoint.isType(NON_PLAYABLE)) {
					forEachFuncList.forEach(function(forEachFunc) {
						forEachFunc(boardPoint);
					});
				}
			});
		});
	}
	forEachBoardPointWithTile(forEachFunc) {
		this.forEachBoardPoint(function(boardPoint) {
			if (boardPoint.hasTile()) {
				forEachFunc(boardPoint);
			}
		});
	}

	getCopy() {
		var copyBoard = new BeyondTheMapsBoard();

		for (var row = 0; row < this.cells.length; row++) {
			for (var col = 0; col < this.cells[row].length; col++) {
				copyBoard.cells[row][col] = this.cells[row][col].getCopy();
			}
		}

		copyBoard.shipPoints = { ...this.shipPoints };

		return copyBoard;
	}

}
