/* Adevar Pai Sho Harmony */

import { AdevarTileType } from './AdevarTile';
import {
  GUEST,
  HOST,
  NotationPoint,
  RowAndColumn,
} from '../CommonNotationObjects';
import { debug } from '../GameData';

export function AdevarHarmony(tile1, tile1RowAndColumn, tile2, tile2RowAndColumn) {
	this.tile1 = tile1;
	this.tile1Pos = new RowAndColumn(tile1RowAndColumn.row, tile1RowAndColumn.col);
	this.tile2 = tile2;
	this.tile2Pos = new RowAndColumn(tile2RowAndColumn.row, tile2RowAndColumn.col);
	this.owners = [];

    if (this.tile1.type === AdevarTileType.basic) {
        this.addOwner(this.tile1.ownerCode, this.tile1.ownerName);
    } else if (this.tile2.type === AdevarTileType.basic) {
        this.addOwner(this.tile2.ownerCode, this.tile2.ownerName);
    } else {
        debug("ERROR: HARMONY REQUIRES A BASIC FLOWER TILE");
    }
}

AdevarHarmony.prototype.addOwner = function(ownerCode, ownerName) {
	if (!this.hasOwner(ownerName)) {
		this.owners.push({
			ownerCode: ownerCode,
			ownerName: ownerName
		});
	}
};

AdevarHarmony.prototype.hasOwner = function(ownerName) {
	for (var i = 0; i < this.owners.length; i++) {
		if (this.owners[i].ownerName === ownerName) {
			return true;
		}
	}
};

AdevarHarmony.prototype.equals = function(otherHarmony) {
	if (this.tile1 === otherHarmony.tile1 || this.tile1 === otherHarmony.tile2) {
		if (this.tile2 === otherHarmony.tile1 || this.tile2 === otherHarmony.tile2) {
			return true;
		}
	}
	return false;
};

AdevarHarmony.prototype.notAnyOfThese = function(harmonies) {
	for (var i = 0; i < harmonies.length; i++) {
		if (this.equals(harmonies[i])) {
			return false;
		}
	}
	return true;
};

AdevarHarmony.prototype.containsTile = function(tile) {
	return (this.tile1 === tile || this.tile2 === tile);
};

AdevarHarmony.prototype.getTileThatIsNotThisOne = function(tile) {
	if (this.tile1 === tile) {
		return this.tile2;
	} else if (this.tile2 === tile) {
		return this.tile1;
	} else {
		debug("BOTH TILES ARE NOT THAT ONE!");
	}
};

AdevarHarmony.prototype.containsTilePos = function(pos) {
	return this.tile1Pos.samesies(pos) || this.tile2Pos.samesies(pos);
};

AdevarHarmony.prototype.getPosThatIsNotThisOne = function(pos) {
	if (this.tile1Pos.samesies(pos)) {
		return this.tile2Pos;
	} else if(this.tile2Pos.samesies(pos)) {
		return this.tile1Pos;
	} else {
		debug("	BOTH TILE POS ARE NOT THAT ONE!");
	}
};

AdevarHarmony.prototype.getString = function() {
	return this.owners + " (" + this.tile1Pos.notationPointString + ")-(" + this.tile2Pos.notationPointString + ")";
};

AdevarHarmony.prototype.getDirectionForTile = function(tile) {
	if (!this.containsTile(tile)) {
		return;
	}

	var thisPos = this.tile1Pos;	// Assume it's tile1
	var otherPos = this.tile2Pos;
	if (this.tile2.id === tile.id) {
		thisPos = this.tile2Pos;	// It's tile2!
		otherPos = this.tile1Pos;
	}

	if (thisPos.row === otherPos.row) {
		// Same row means East or West
		if (thisPos.col < otherPos.col) {
			return "Eastish";
		} else {
			return "Westish";
		}
	} else if (thisPos.col === otherPos.col) {
		// Same col means North or South
		if (thisPos.row > otherPos.row) {
			return "Northish";
		} else {
			return "Southish";
		}
	}
};

AdevarHarmony.prototype.crossesCenter = function() {
	var rowHigh = this.tile1Pos.row;
	var rowLow = this.tile2Pos.row;
	if (this.tile1Pos.row < this.tile2Pos.row) {
		rowHigh = this.tile2Pos.row;
		rowLow = this.tile1Pos.row;
	}

	if (rowHigh !== rowLow) {
		return rowHigh > 8 && rowLow < 8;
	}

	var colHigh = this.tile1Pos.col;
	var colLow = this.tile2Pos.col;
	if (this.tile1Pos.col < this.tile2Pos.col) {
		colHigh = this.tile2Pos.col;
		colLow = this.tile1Pos.col;
	}

	if (colHigh !== colLow) {
		return colHigh > 8 && colLow < 8;
	}
};


// --------------------------------------------- // 


// HarmonyManager manages list of harmonies
export function AdevarHarmonyManager() {
	this.harmonies = [];
}

AdevarHarmonyManager.prototype.printHarmonies = function() {
	debug("All Harmonies:");
	for (var i = 0; i < this.harmonies.length; i++) {
		debug(this.harmonies[i].getString());
	}
};

AdevarHarmonyManager.prototype.getHarmoniesWithThisTile = function(tile) {
	var results = [];
	this.harmonies.forEach(function(harmony) {
		if (harmony.containsTile(tile)) {
			results.push(harmony);
		}
	});
	return results;
};

AdevarHarmonyManager.prototype.addHarmony = function(harmony) {
	// Add harmony if it doesn't already exist

	// Does it exist in old set of harmonies?
	var harmonyIndexesToRemove = [];
	var exists = false;
	for (var j = 0; j < this.harmonies.length; j++) {
		if (harmony.equals(this.harmonies[j])) {
			exists = true;
		}
	}

	for (var i = 0; i < harmonyIndexesToRemove.length; i++) {
		this.harmonies.splice(harmonyIndexesToRemove[i], 1);
	}

	if (!exists) {
		this.harmonies.push(harmony);
	} else {
		// debug("Harmony exists, ignoring");
	}
};

AdevarHarmonyManager.prototype.addHarmonies = function(harmoniesToAdd) {
	if (!harmoniesToAdd) {
		return;
	}

	for (var i = 0; i < harmoniesToAdd.length; i++) {
		this.addHarmony(harmoniesToAdd[i]);
	}
};

AdevarHarmonyManager.prototype.clearList = function() {
	this.harmonies = [];
};

AdevarHarmonyManager.prototype.numHarmoniesForPlayer = function(player) {
	var count = 0;
	for (var i = 0; i < this.harmonies.length; i++) {
		if (this.harmonies[i].hasOwner(player)) {
			count++;
		}
	}
	return count;
};

AdevarHarmonyManager.prototype.getNumCrossingCenterForPlayer = function(player) {
	var count = 0;
	for (var i = 0; i < this.harmonies.length; i++) {
		if (this.harmonies[i].hasOwner(player)) {
			if (this.harmonies[i].crossesCenter()) {
				count++;
			}
		}
	}
	return count;
};

AdevarHarmonyManager.prototype.ringLengthForPlayer = function(player) {
	var rings = this.getHarmonyChains();
	var longest = 0;

	for (var i = 0; i < rings.length; i++) {
		var ring = rings[i];
		var h = ring.pop();
		if (h.hasOwner(player)) {
			var veryNice = true;
			if (veryNice && ring.length > longest) {
				longest = ring.length;
			}
		}
	}

	return longest;
};

AdevarHarmonyManager.prototype.getPlayerWithLongestChain = function() {
	var hostLength = this.ringLengthForPlayer(HOST);
	var guestLength = this.ringLengthForPlayer(GUEST);

	if (guestLength > hostLength) {
		return GUEST;
	} else if (hostLength > guestLength) {
		return HOST;
	}
};

AdevarHarmonyManager.prototype.hasNewHarmony = function(player, oldHarmonies) {
	// There's a new harmony if a player's tile has a harmony with a tile it didn't before
	
	// If current harmony list has one that oldHarmonies does not
	var newHarmonies = [];

	for (var i = 0; i < this.harmonies.length; i++) {

		// Does it belong to player?
		if (this.harmonies[i].hasOwner(player)) {

			// Does it exist in old set of harmonies?
			var exists = false;
			for (var j = 0; j < oldHarmonies.length; j++) {
				if (this.harmonies[i].equals(oldHarmonies[j])
					&& oldHarmonies[j].hasOwner(player)) {
					// Existing Harmony
					exists = true;
				}
			}

			if (!exists) {
				newHarmonies.push(this.harmonies[i]);
			}
		}
	}

	return newHarmonies.length > 0;
};

AdevarHarmonyManager.prototype.getHarmonyChains = function() {
	var self = this;

	var rings = [];

	for (var i = 0; i < this.harmonies.length; i++) {
		var hx = this.harmonies[i];

		var chain = [];
		chain.push(hx);

		var startTile = hx.tile2;
		var startTilePos = hx.tile2Pos;
		var targetTile = hx.tile1;
		var targetTilePos = hx.tile1Pos;

		var foundRings = this.lookForRings(startTile, targetTile, chain);
		
		if (foundRings && foundRings.length > 0) {
			foundRings.forEach(function(ringThatWasFound) {
				var ringExists = false;
				rings.forEach(function(ring) {	
					if (self.ringsMatch(ring, ringThatWasFound)) {
						ringExists = true;
					}
				});
				if (!ringExists) {
					rings.push(ringThatWasFound);
				}
			});
		}
	}

	if (rings.length > 0) {
		debug("Rings Found:");
		debug(rings);
	}

	return rings;
};

AdevarHarmonyManager.prototype.harmonyRingExists = function() {
	// Chain of harmonies around the center of the board

	var self = this;

	// var rings = [];
	var rings = this.getHarmonyChains();

	var verifiedHarmonyRingOwners = [];
	rings.forEach(function(ring) {
		debug(ring);
		var playerName = self.verifyHarmonyRing(ring);
		if (playerName) {
			verifiedHarmonyRingOwners.push(playerName);
		}
	});

	// return verifiedHarmonyRings.length > 0;
	return verifiedHarmonyRingOwners;
};

AdevarHarmonyManager.prototype.ringContains345 = function(ring) {
	// 
	var has3 = false;
	var has4 = false;
	var has5 = false;
	for (var i = 0; i < ring.length; i++) {
		var h = ring[i];
		if (h.tile1.basicValue === '3') {
			has3 = true;
		}
		if (h.tile1.basicValue === '4') {
			has4 = true;
		}
		if (h.tile1.basicValue === '5') {
			has5 = true;
		}
		if (h.tile2.basicValue === '3') {
			has3 = true;
		}
		if (h.tile2.basicValue === '4') {
			has4 = true;
		}
		if (h.tile2.basicValue === '5') {
			has5 = true;
		}
	}

	return has3 && has4 && has5;
};

// I think this works.
AdevarHarmonyManager.prototype.verifyHarmonyRing = function(ring) {
	// Verify harmonies in ring go around center of board
	// debug("In verifyHarmonyRing()");

	// We have to go through the harmonies and create an array of the points of the 'shape' that the harmony ring makes
	var shapePoints = [];

	// playerName is the player that's an owner on all rings
	var allHaveHost = true;
	var allHaveGuest = true;
	for (var i = 0; i < ring.length; i++) {
		if (!ring[i].hasOwner(HOST)) {
			allHaveHost = false;
		}
		if (!ring[i].hasOwner(GUEST)) {
			allHaveGuest = false;
		}
	}

	var playerNames = "";
	if (allHaveHost && allHaveGuest) {
		playerNames = "Host and Guest";
	} else if (allHaveHost) {
		playerNames = HOST;
	} else if (allHaveGuest) {
		playerNames = GUEST;
	}

	var h = ring.pop();

	shapePoints.push(new NotationPoint(h.tile1Pos.notationPointString).toArr());
	shapePoints.push(new NotationPoint(h.tile2Pos.notationPointString).toArr());

	var lastTilePos = h.tile2Pos;

	var count = 0;
	while (ring.length > 0 && count < 400) {
		// Go through ring and find next point in the harmony 'shape'
		for (var i = 0; i < ring.length; i++) {
			h = ring[i];
			if (h.containsTilePos(lastTilePos)) {
				lastTilePos = h.getPosThatIsNotThisOne(lastTilePos);
				var np = new NotationPoint(lastTilePos.notationPointString);
				if (!np.samesies(new NotationPoint(shapePoints[0][0] + "," + shapePoints[0][1]))) {
					shapePoints.push(np.toArr());
				}
				ring.splice(i, 1);
			}
		}
		count++;
		// debug("last tile Pos: " + lastTilePos.notationPointString);
		// ring.forEach(function(h){ debug(h.tile1Pos.notationPointString + " - " + h.tile2Pos.notationPointString); });
		// debug("-----")
	}

	if (count > 390) {
		debug("THERE WAS A PROBLEM CONNECTING THE DOTS");
		return false;
	}


	if (this.isCenterInsideShape(shapePoints)) {
		// debug("WINNER");
		return playerNames;
	} else {
		return false;
	}
};


/** Don't touch this magic... 
Polygon shape checking based off of https://github.com/substack/point-in-polygon under MIT License:

The MIT License (MIT)

Copyright (c) 2016 James Halliday

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**/
AdevarHarmonyManager.prototype.isPointInsideShape = function(notationPoint, shapePoints) {
	var x = notationPoint.x;
	var y = notationPoint.y;

	var inside = false;
	for (var i = 0, j = shapePoints.length - 1; i < shapePoints.length; j = i++) {
		var xi = shapePoints[i][0], yi = shapePoints[i][1];
		var xj = shapePoints[j][0], yj = shapePoints[j][1];

		// If on the line, doesn't count...
		if ((xi === x && xj === x && xi * xj )) {
			return false;
		}

		var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) {
			inside = !inside;
		}
	}

	return inside;
};

AdevarHarmonyManager.prototype.isPointInsideShape_alternate = function(notationPoint, poly) {
	var pt = [notationPoint.x, notationPoint.y];
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
        && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);
    return c;
};

/* Working function */
AdevarHarmonyManager.prototype.isCenterInsideShapeOld = function(shapePoints) {
	var x = 0;
	var y = 0;
	var inside = false;
	for (var i = 0, j = shapePoints.length - 1; i < shapePoints.length; j = i++) {
		var xi = shapePoints[i][0], yi = shapePoints[i][1];
		var xj = shapePoints[j][0], yj = shapePoints[j][1];

		// If on the line, doesn't count...
		if ((xi === 0 && xj === 0 && yi * yj < 0)
			|| (yi === 0 && yj === 0 && xi * xj < 0)) {
			debug("Crosses center, cannot count");
			return false;
		}

		// If one of the points is 0,0 that won't count...
		if ((xi === 0 && yi === 0) || (xj === 0 && yj === 0)) {
			debug("On center point, cannot count");
			return false;
		}

		var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) {
			inside = !inside;
		}
	}

	return inside;
};

/* Based on Winding Number algorithm https://gist.github.com/thejambi/6ae53b6ab2636c8aff367195efeb4f44 */
AdevarHarmonyManager.prototype.isCenterInsideShape = function(vs) {
	var x = .5;
	var y = -.5;

	var wn = 0;

	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = parseFloat(vs[i][0]), yi = parseFloat(vs[i][1]);
		var xj = parseFloat(vs[j][0]), yj = parseFloat(vs[j][1]);

		if (yj <= y) {
			if (yi > y) {
				if (this.isLeft([xj, yj], [xi, yi], [x, y]) > 0) {
					wn++;
				}
			}
		} else {
			if (yi <= y) {
				if (this.isLeft([xj, yj], [xi, yi], [x, y]) < 0) {
					wn--;
				}
			}
		}
	}

	return wn != 0;
};
AdevarHarmonyManager.prototype.isLeft = function(P0, P1, P2) {
    var res = ( (P1[0] - P0[0]) * (P2[1] - P0[1])
            - (P2[0] -  P0[0]) * (P1[1] - P0[1]) );
    return res;
};


AdevarHarmonyManager.prototype.ringsMatch = function(ring1, ring2) {
	// Must be same size to qualify as matching
	if (ring1.length !== ring2.length) {
		return false;
	}

	// They're the same length if we're here
	// Now, all harmonies must match 
	var h1Matches = false;
	ring1.forEach(function(h1) {
		h1Matches = false;
		ring2.forEach(function(h2) {
			if (h1.equals(h2)) {
				h1Matches = true;
			}
		});
		if (!h1Matches) {
			return false;
		}
	});

	return h1Matches;
};

AdevarHarmonyManager.prototype.lookForRings = function(t1, tx, originalChain) {
	var rings = [];
	var keepLookingAtTheseHarmonies = [];
	for (var i = 0; i < this.harmonies.length; i++) {	// Any complete rings?
		var currentChain = originalChain.slice();
		var hx = this.harmonies[i];
		if (hx.containsTile(t1) && hx.notAnyOfThese(currentChain)) {
			currentChain.push(hx);
			if (hx.containsTile(tx)) {	// Complete ring found
				rings.push(currentChain);
			} else {
				keepLookingAtTheseHarmonies.push(hx);
			}
		}
	}
	for (var i = 0; i < this.harmonies.length; i++) {
		currentChain = originalChain.slice();
		var hx = this.harmonies[i];
		if (keepLookingAtTheseHarmonies.includes(hx)) {
			currentChain.push(hx);
			var newStartTile = hx.getTileThatIsNotThisOne(t1);
			rings = rings.concat(this.lookForRings(newStartTile, tx, currentChain));
		}
	}
	return rings;
};

AdevarHarmonyManager.prototype.lookForRing = function(t1, tx, chain) {
	// Look for different harmony that includes t1
	for (var i = 0; i < this.harmonies.length; i++) {
		var hx = this.harmonies[i];
		if (hx.containsTile(t1) && hx.notAnyOfThese(chain)) {
			chain.push(hx);
			if (hx.containsTile(tx)) {
				return [true, chain];
			} else {
				var newStartTile = hx.getTileThatIsNotThisOne(t1);
				return this.lookForRing(newStartTile, tx, chain);
			}
		}
	}
	return [false];
};






