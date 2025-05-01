import { debug } from '../../../GameData';

export function TrifleMoveTileToRecordedPointAbilityBrain(abilityObject) {
	this.abilityObject = abilityObject;
}

TrifleMoveTileToRecordedPointAbilityBrain.prototype.activateAbility = function() {
	var targetTilePoint = this.abilityObject.abilityTargetTilePoints[0];
	var targetTile = this.abilityObject.abilityTargetTiles[0];

	var recordedPointType = this.abilityObject.abilityInfo.recordedPointType;

	if (recordedPointType) {
		var destinationPoint = this.abilityObject.board.recordedTilePoints[recordedPointType][targetTile.getOwnerCodeIdObjectString()];
		this.abilityObject.board.placeTile(targetTile, destinationPoint);
		this.abilityObject.boardChanged = true;

		if (targetTile.beingCaptured || targetTile.beingCapturedByAbility) {
			targetTile.beingCaptured = null;
			targetTile.beingCapturedByAbility = null;
		}

		return {
			tileMoved: targetTile
		};
	} else {
		debug("No recorded point type defined");
	}
};
