import {
  TrifleAbilitiesForType,
  TrifleAbilityName,
  TrifleAbilityType,
  TrifleTileTeam
} from './TrifleTileInfo';
import { debug } from '../GameData';

export function TrifleAbilityManager(board, customAbilityActivationOrder) {
	this.board = board;
	this.tileManager = board.tileManager;
	this.abilities = [];
	this.readyAbilities = {};
	this.abilitiesWithPromptTargetsNeeded = {};
	this.abilityActivationOrder = customAbilityActivationOrder;
}

TrifleAbilityManager.prototype.setReadyAbilities = function(readyAbilities) {
	this.readyAbilities = readyAbilities;
};

TrifleAbilityManager.prototype.setAbilitiesWithPromptTargetsNeeded = function(abilitiesWithPromptTargetsNeeded) {
	this.abilitiesWithPromptTargetsNeeded = abilitiesWithPromptTargetsNeeded;
};

TrifleAbilityManager.prototype.activateReadyAbilitiesOrPromptForTargets = function() {
	var activateObj = this.activateReadyAbilities();
	this.ensurePromptsStillNeeded();
	if (this.abilitiesWithPromptTargetsNeeded && this.abilitiesWithPromptTargetsNeeded.length > 0) {
		// return this.promptForNextNeededTargets();
		var promptOjb = this.promptForNextNeededTargets();
		return Object.assign(activateObj, promptOjb);
	} else {
		// return this.activateReadyAbilities();
		return activateObj;
	}
};

TrifleAbilityManager.prototype.ensurePromptsStillNeeded = function() {
	if (this.abilitiesWithPromptTargetsNeeded && this.abilitiesWithPromptTargetsNeeded.length > 0) {
		var index = 0;
		var removeThese = [];
		this.abilitiesWithPromptTargetsNeeded.forEach(ability => {
			if (this.abilityIsCanceled(ability)) {
				removeThese.push(index);
			}
			index++;
		});
		if (removeThese.length > 0) {
			for (var i = removeThese.length - 1; i >= 0; i--) {
				var indexToRemove = removeThese[i];
				var abilityRemoved = this.abilitiesWithPromptTargetsNeeded.splice(indexToRemove, 1)[0];
				debug("No need to prompt for ability: ");
				debug(abilityRemoved);
			}
		}
	}
};

TrifleAbilityManager.prototype.activateReadyAbilities = function() {
	var boardHasChanged = false;
	var tileRecords = {
		capturedTiles: [],
		tilesMovedToPiles: []
	};
	var abilitiesActivated = [];
	var self = this;

	/* Mark all existing abilities as do not preserve */
	this.abilities.forEach(function(existingAbility) {
		existingAbility.preserve = false;
	});

	/* Mark abilities to preserve based on matching ready abilities */
	Object.values(this.readyAbilities).forEach(function(abilityList) {
		abilityList.forEach(function(ability) {
			self.markExistingMatchingAbility(ability);
		});
	});

	/* Deactivate abilities. New ability list is the ones that are not deactivated. */
	var newAbilities = [];
	this.abilities.forEach(function(existingAbility) {
		if (existingAbility.preserve && !self.abilityIsCanceled(existingAbility)) {
			newAbilities.push(existingAbility);	// Commenting this out... ability activation priority should take care of this now
												// NOOOOOO We need this!
		} else {
			existingAbility.deactivate();
		}
	});
	this.abilities = newAbilities;

	/* Activate abilities! */

	// Priority abilities first
	var currentPriority = 1;
	var priorityAbilityFound = true;
	while (priorityAbilityFound) {
		priorityAbilityFound = false;
		
		Object.values(this.readyAbilities).every(abilityList => {
			abilityList.every(ability => {
				if (ability.isPriority(currentPriority)) {
					priorityAbilityFound = true;
					debug("!!!!Priority " + currentPriority + " Ability!!!! " + ability.getTitle());
					boardHasChanged = self.doTheActivateThing(ability, tileRecords, abilitiesActivated);
					return !boardHasChanged;	// Continue if board has not changed
				}
			});
			return !boardHasChanged;	// Continue if board has not changed
		});
		
		currentPriority++;
	}

	if (!boardHasChanged) {
		// Default ability activation order
		var abilityActivationOrder = [
			TrifleAbilityName.cancelAbilities,
			TrifleAbilityName.cancelAbilitiesTargetingTiles
		];

		if (this.abilityActivationOrder) {
			abilityActivationOrder = this.abilityActivationOrder;
		}

		abilityActivationOrder.every(abilityName => {
			var readyAbilitiesOfType = self.readyAbilities[abilityName];
			if (readyAbilitiesOfType && readyAbilitiesOfType.length) {
				readyAbilitiesOfType.every(ability => {
					boardHasChanged = self.doTheActivateThing(ability, tileRecords, abilitiesActivated);
					return !boardHasChanged;	// Continue if board has not changed
				});
			}
			return !boardHasChanged;	// Continue if board has not changed
		});

		if (!boardHasChanged) {
			Object.values(this.readyAbilities).every(abilityList => {
				abilityList.every(ability => {
					boardHasChanged = self.doTheActivateThing(ability, tileRecords, abilitiesActivated);
					return !boardHasChanged;	// Continue if board has not changed
				});
				return !boardHasChanged;	// Continue if board has not changed
			});
		}
	}

	return {
		abilitiesActivated: abilitiesActivated,
		boardHasChanged: boardHasChanged,
		tileRecords: tileRecords
	};
};

TrifleAbilityManager.prototype.doTheActivateThing = function(ability, tileRecords, abilitiesActivated) {
	var capturedTiles = tileRecords.capturedTiles;
	var tilesMovedToPiles = tileRecords.tilesMovedToPiles;

	var abilitiesTriggeredBySameAction = [];

	var boardHasChanged = false;
	if (!ability.activated
			// && ability.triggerStillMet()	// I guess not this
			&& !this.abilitiesWithPromptTargetsNeeded.includes(ability)) {
		var abilityIsReadyToActivate = this.addNewAbility(ability);
		if (abilityIsReadyToActivate) {
			abilitiesTriggeredBySameAction = this.getReadyAbilitiesWithTriggeringActions(ability.getTriggeringActions());

			abilitiesActivated.push(ability);
			ability.activateAbility();

			if (ability.abilityActivatedResults
					&& ability.abilityActivatedResults.capturedTiles 
					&& ability.abilityActivatedResults.capturedTiles.length) {
				ability.abilityActivatedResults.capturedTiles.forEach((capturedTile) => {
					capturedTiles.push(capturedTile);
				});
			}

			if (ability.abilityActivatedResults
					&& ability.abilityActivatedResults.tilesMovedToPiles
					&& ability.abilityActivatedResults.tilesMovedToPiles.length) {
				ability.abilityActivatedResults.tilesMovedToPiles.forEach((movedTile) => {
					tilesMovedToPiles.push(movedTile);
				});
			}
		}
		if (ability.boardChangedAfterActivation()) {
			boardHasChanged = true;
		}

		// Now activate abilities triggered by same event
		if (abilitiesTriggeredBySameAction && abilitiesTriggeredBySameAction.length > 0) {
			abilitiesTriggeredBySameAction.forEach(otherAbility => {
				this.doTheActivateThing(otherAbility, tileRecords, abilitiesActivated);
			});
		}

		// If this is a cancelAbilities ability.. should it cancel some ability that's already active?
		if (ability.abilityType === TrifleAbilityName.cancelAbilities) {
			this.abilities.forEach(existingAbility => {
				if (existingAbility.activated && this.abilityIsCanceled(existingAbility)) {
					debug("Freshly canceled ability: " + existingAbility.abilityType + " from " + existingAbility.sourceTile.ownerCode + existingAbility.sourceTile.code);
					existingAbility.deactivate();
				}
			});
		}
	}
	return boardHasChanged;
};

TrifleAbilityManager.prototype.getReadyAbilitiesWithTriggeringActions = function(triggeringActions) {
	var matchingReadyAbilities = [];

	if (triggeringActions && triggeringActions.length > 0) {
		Object.values(this.readyAbilities).forEach(abilityList => {
			abilityList.forEach(readyAbility => {
				if (!readyAbility.activated) {
					var readyAbilityTriggeringActions = readyAbility.getTriggeringActions();
					if (readyAbilityTriggeringActions && readyAbilityTriggeringActions.length > 0) {
						readyAbilityTriggeringActions.forEach(triggeringAction => {
							triggeringActions.forEach(tAction1 => {
								if (JSON.stringify(tAction1) == JSON.stringify(triggeringAction)) {
									matchingReadyAbilities.push(readyAbility);
								}
							});
						});
					}
				}
			});
		});
	}

	return matchingReadyAbilities;
};

/**
 * Return `true` if ability is new and not already active, aka ability is ready to activate.
 * @param {*} ability 
 */
TrifleAbilityManager.prototype.addNewAbility = function(ability) {
	var added = false;

	if (!this.abilitiesAlreadyIncludes(ability) && !this.abilityIsCanceled(ability)) {
		this.abilities.push(ability);
		added = true;
	} else {
		// debug("No need to add ability");
	}

	return added;
};

TrifleAbilityManager.prototype.markExistingMatchingAbility = function(otherAbility) {
	this.abilities.forEach(function(existingAbility) {
		if (existingAbility.appearsToBeTheSameAs(otherAbility)) {
			existingAbility.preserve = true;
			return;
		}
	});
};

TrifleAbilityManager.prototype.abilitiesAlreadyIncludes = function(otherAbility) {
	var abilityFound = false;
	this.abilities.forEach(function(existingAbility) {
		if (existingAbility.appearsToBeTheSameAs(otherAbility)) {
			abilityFound = true;
			return;
		}
	});
	return abilityFound;
};

TrifleAbilityManager.prototype.abilityTargetingTileExists = function(abilityName, tile) {
	var targetsTile = false;
	this.abilities.forEach(function(ability) {
		if (ability.abilityType === abilityName
				&& ability.abilityTargetsTile(tile)) {
			targetsTile = true;
			return;
		}
	});
	return targetsTile;
};

TrifleAbilityManager.prototype.getAbilitiesTargetingTile = function(abilityName, tile) {
	var abilitiesTargetingTile = [];
	this.abilities.forEach(function(ability) {
		if (ability.abilityType === abilityName
				&& ability.activated
				&& ability.abilityTargetsTile(tile)) {
			abilitiesTargetingTile.push(ability);
		}
	});
	return abilitiesTargetingTile;
};

TrifleAbilityManager.prototype.getAbilitiesTargetingTileFromSourceTile = function(abilityName, tile, sourceTile) {
	var abilitiesTargetingTile = [];
	this.abilities.forEach(function(ability) {
		if (ability.abilityType === abilityName
				&& ability.sourceTile === sourceTile
				&& ability.abilityTargetsTile(tile)) {
			abilitiesTargetingTile.push(ability);
		}
	});
	return abilitiesTargetingTile;
};

TrifleAbilityManager.prototype.abilityIsCanceled = function(abilityObject) {
	var isCanceled = false;
	var affectingCancelAbilities = this.getAbilitiesTargetingTile(TrifleAbilityName.cancelAbilities, abilityObject.sourceTile);

	affectingCancelAbilities.forEach(function(cancelingAbility) {
		// Does canceling ability affecting tile cancel this kind of ability?
		if (cancelingAbility.abilityInfo.targetAbilityTypes.includes(TrifleAbilityType.all)) {
			isCanceled = true;
		}

		cancelingAbility.abilityInfo.targetAbilityTypes.forEach(function(canceledAbilityType) {
			var abilitiesForType = TrifleAbilitiesForType[canceledAbilityType];
			if (abilitiesForType && abilitiesForType.length && abilitiesForType.includes(abilityObject.abilityInfo.type)) {
				isCanceled = true;
			} else if (abilityObject.abilityInfo.type === canceledAbilityType) {
				isCanceled = true;
			}
		});
	});

	return isCanceled;
};

TrifleAbilityManager.prototype.targetingIsCanceled = function(abilitySourceTile, abilityType, possibleTargetTile) {
	var isCanceled = false;
	var affectingCancelAbilities = this.getAbilitiesTargetingTile(TrifleAbilityName.cancelAbilitiesTargetingTiles, possibleTargetTile);

	affectingCancelAbilities.forEach(function(cancelingAbility) {
		if (!cancelingAbility.abilityInfo.cancelAbilitiesFromTeam
			|| (
				(cancelingAbility.abilityInfo.cancelAbilitiesFromTeam === TrifleTileTeam.enemy && cancelingAbility.sourceTile.ownerName !== abilitySourceTile.ownerName)
				|| (cancelingAbility.abilityInfo.cancelAbilitiesFromTeam === TrifleTileTeam.friendly && cancelingAbility.sourceTile.ownerName === abilitySourceTile.ownerName)
				)
		) {
			if (cancelingAbility.abilityInfo.targetAbilityTypes) {
				// Does canceling ability affecting tile cancel this kind of ability?
				if (cancelingAbility.abilityInfo.targetAbilityTypes.includes(TrifleAbilityType.all)) {
					isCanceled = true;
				}

				cancelingAbility.abilityInfo.targetAbilityTypes.forEach(function(canceledAbilityType) {
					var abilitiesForType = TrifleAbilitiesForType[canceledAbilityType];
					if (abilitiesForType && abilitiesForType.length && abilitiesForType.includes(abilityType)) {
						isCanceled = true;
					} else if (abilityType === canceledAbilityType) {
						isCanceled = true;
					}
				});
			}

			if (cancelingAbility.abilityInfo.cancelAbilitiesFromTileCodes
					&& cancelingAbility.abilityInfo.cancelAbilitiesFromTileCodes.includes(abilitySourceTile.code)) {
				isCanceled = true;
			}
		}
	});

	return isCanceled;
};

TrifleAbilityManager.prototype.tickDurationAbilities = function() {
	// TODO: Something like this old tick code did:
	/* for (var i = this.activeDurationAbilities.length - 1; i >= 0; i--) {
		var durationAbilityDetails = this.activeDurationAbilities[i];
		var durationAbilityInfo = durationAbilityDetails.ability;
		durationAbilityInfo.remainingDuration -= 0.5;
		if (durationAbilityInfo.remainingDuration <= 0) {
			durationAbilityInfo.active = false;
			this.activeDurationAbilities.splice(i, 1);
			debug("Ability deactivated!");
			debug(durationAbilityInfo);
		}
	} */
};

TrifleAbilityManager.prototype.promptForNextNeededTargets = function() {
	if (!(this.abilitiesWithPromptTargetsNeeded && this.abilitiesWithPromptTargetsNeeded.length > 0)) {
		debug("Error: No abilities that need prompt targets found");
		return {};
	}

	if (this.abilitiesWithPromptTargetsNeeded.length > 1) {
		debug("Multiple abilities that need prompt targets. Will just choose first one to prompt...");
	}

	var abilityObject = this.abilitiesWithPromptTargetsNeeded[0];

	var neededPromptInfo = {};

	neededPromptInfo.abilitySourceTile = abilityObject.sourceTile;
	neededPromptInfo.sourceAbility = abilityObject;
	neededPromptInfo.sourceTileKey = TrifleAbilityManager.buildSourceTileKeyObject(abilityObject.sourceTile);
	var sourceTileKeyStr = JSON.stringify(neededPromptInfo.sourceTileKey);

	var nextNeededPromptTargetInfo;
	abilityObject.abilityInfo.neededPromptTargetsInfo.forEach((neededPromptTargetInfo) => {
		if (!nextNeededPromptTargetInfo && abilityObject.promptTargetInfo
				&& (!abilityObject.promptTargetInfo[sourceTileKeyStr] 
				|| !abilityObject.promptTargetInfo[sourceTileKeyStr][neededPromptTargetInfo.promptId])) {
			nextNeededPromptTargetInfo = neededPromptTargetInfo;
		}
	});

	if (nextNeededPromptTargetInfo) {
		var abilityBrain = TrifleBrainFactory.createAbilityBrain(abilityObject.abilityType, abilityObject);
		var promptTargetsExist = abilityBrain.promptForTarget(nextNeededPromptTargetInfo, sourceTileKeyStr);
		if (promptTargetsExist) {
			neededPromptInfo.currentPromptTargetId = nextNeededPromptTargetInfo.promptId;
		} else {
			debug("No targets available to prompt.. so no prompt needed! Removing ability from prompt list.");
			this.abilitiesWithPromptTargetsNeeded.shift();
		}
	} else {
		debug("No prompt needed, removing ability from prompt list.");
		this.abilitiesWithPromptTargetsNeeded.shift();
	}

	return { neededPromptInfo: neededPromptInfo };
};

TrifleAbilityManager.buildSourceTileKeyObject = function(abilitySourceTile) {
	return {
		tileOwner: abilitySourceTile.ownerCode,
		tileCode: abilitySourceTile.code,
		boardPoint: abilitySourceTile.seatedPoint.getNotationPointString(),
		tileId: abilitySourceTile.id
	};
};


