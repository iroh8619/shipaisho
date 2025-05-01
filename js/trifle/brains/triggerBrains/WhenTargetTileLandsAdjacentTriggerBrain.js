import { TrifleTriggerHelper } from '../TriggerHelper';

export function TrifleWhenTargetTileLandsAdjacentTriggerBrain(triggerContext) {
	this.targetTiles = [];
	this.targetTilePoints = [];
	this.board = triggerContext.board;
	this.triggerContext = triggerContext;

	this.possibleTargetTile = triggerContext.lastTurnAction.tileMovedOrPlaced;
	this.possibleTargetTileInfo = triggerContext.lastTurnAction.tileMovedOrPlacedInfo;
	this.possibleTargetTilePoint = triggerContext.lastTurnAction.boardPointEnd;

	this.thisTile = triggerContext.tile;
	this.thisTileInfo = triggerContext.tileInfo;
	this.thisTilePoint = triggerContext.pointWithTile;
}

TrifleWhenTargetTileLandsAdjacentTriggerBrain.prototype.isTriggerMet = function() {
	/* Look at the tile that moved, did it just land adjacent to this tile? Is it targeted? */

	if (this.possibleTargetTilePoint && this.possibleTargetTilePoint.tile === this.possibleTargetTile) {

		var adjacentPoints = this.board.getAdjacentPoints(this.thisTilePoint);

		var possibleTargetIsAdjacent = false;
		var self = this;
		adjacentPoints.forEach(function(adjacentPoint) {
			if (adjacentPoint === self.possibleTargetTilePoint) {
				possibleTargetIsAdjacent = true;
				return;
			}
		});

		if (possibleTargetIsAdjacent) {
			var triggerHelper = new TrifleTriggerHelper(this.triggerContext, this.possibleTargetTilePoint);
			if (triggerHelper.tileIsTargeted()) {
				this.targetTiles.push(this.possibleTargetTilePoint.tile);
				this.targetTilePoints.push(this.possibleTargetTilePoint);
			}
		}
	}

	return this.targetTiles.length > 0;
};
