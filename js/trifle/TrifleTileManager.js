// Tile Manager

var STANDARD = "Standard";
var RESTRICTED_BY_OPPONENT_TILE_ZONE = "Restricted by opponent tile zone";

TrifleTileManager = function() {
	this.hostTeam = [];
	this.guestTeam = [];
	this.hostTiles = [];
	this.guestTiles = [];
}

TrifleTileManager.prototype.grabTile = function(player, tileCode) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	var tile;
	for (var i = 0; i < tilePile.length; i++) {
		if (tilePile[i].code === tileCode) {
			newTileArr = tilePile.splice(i, 1);
			tile = newTileArr[0];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
	}

	return tile;
};

TrifleTileManager.prototype.peekTile = function(player, tileCode, tileId) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	var tile;
	if (tileId) {
		for (var i = 0; i < tilePile.length; i++) {
			if (tilePile[i].id === tileId) {
				return tilePile[i];
			}
		}
	}

	for (var i = 0; i < tilePile.length; i++) {
		if (tilePile[i].code === tileCode) {
			tile = tilePile[i];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
	}

	return tile;
};

TrifleTileManager.prototype.removeSelectedTileFlags = function() {
	this.hostTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
	this.guestTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
};

TrifleTileManager.prototype.unselectTiles = function(player) {
	var tilePile = this.getPlayerTilePile(player);

	tilePile.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
}

TrifleTileManager.prototype.putTileBack = function(tile) {
	var player = tile.ownerName;
	var tilePile = this.getPlayerTilePile(player);

	tilePile.push(tile);
};

TrifleTileManager.prototype.getTeamSize = function() {
	return 11;
};

TrifleTileManager.prototype.hostTeamIsFull = function() {
	return this.playerTeamIsFull(HOST);
};

TrifleTileManager.prototype.guestTeamIsFull = function() {
	return this.playerTeamIsFull(GUEST);
};

TrifleTileManager.prototype.playerTeamIsFull = function(player) {
	return this.getPlayerTeam(player).length >= this.getTeamSize();
};

TrifleTileManager.prototype.playersAreSelectingTeams = function() {
	return !this.hostTeamIsFull() || !this.guestTeamIsFull();
};

TrifleTileManager.prototype.playerTeamHasBanner = function(player) {
	var team = this.getPlayerTeam(player);
	for (var i = 0; i < team.length; i++) {
		var tileInfo = TrifleTrifleTiles[team[i].code];
		if (tileInfo && this.tileInfoIsBanner(tileInfo)) {
			return true;
		}
	}
	return false;
};

TrifleTileManager.prototype.tileInfoIsBanner = function(tileInfo) {
	return tileInfo && tileInfo.types.includes(TrifleTileType.banner);
};

TrifleTileManager.prototype.addToTeamIfOk = function(tile) {
	var addOk = false;
	var player = tile.ownerName;
	if (!this.playerTeamIsFull(player)) {
		/* Team isn't full, that's the first check! */
		addOk = true;	// So far!

		var tileInfo = TrifleTrifleTiles[tile.code];
		/* If tile is Banner, it's ok if we don't have one */
		if (this.tileInfoIsBanner(tileInfo)) {
			addOk = addOk && !this.playerTeamHasBanner(player);
		} else {
			/* If tile is not banner, we just need to make sure we have room on the team for one or have one already */
			addOk = addOk && (this.playerTeamHasBanner(player)
					|| this.getPlayerTeam(player).length < this.getTeamSize() - 1);
		}

		var howManyAlreadyInTeam = this.countOfThisTileInTeam(tile.code, tile.ownerName);
		addOk = addOk && howManyAlreadyInTeam < TrifleTile.getTeamLimitForTile(tile.code);

		if (addOk) {
			this.getPlayerTeam(tile.ownerName).push(tile);
			this.getPlayerTilePile(tile.ownerName).push(tile);
		}
	}

	return addOk;
};

TrifleTileManager.prototype.removeTileFromTeam = function(tile) {
	if (this.countOfThisTileInTeam(tile.code, tile.ownerName) > 0) {
		var playerTeam = this.getPlayerTeam(tile.ownerName);

		for (var i = 0; i < playerTeam.length; i++) {
			if (playerTeam[i].code === tile.code) {
				playerTeam.splice(i, 1);
				break;
			}
		}

		this.grabTile(tile.ownerName, tile.code);
	}
};

TrifleTileManager.prototype.countOfThisTileInTeam = function(tileCode, ownerName) {
	var count = 0;
	var ownerTeam = this.getPlayerTeam(ownerName);

	for (var i = 0; i < ownerTeam.length; i++) {
		if (ownerTeam[i].code === tileCode) {
			count++;
		}
	}
	return count;
};

TrifleTileManager.prototype.getPlayerTeam = function(player) {
	var playerTeam = this.hostTeam;
	if (player === GUEST) {
		playerTeam = this.guestTeam;
	}
	return playerTeam;
};

TrifleTileManager.prototype.getPlayerTilePile = function(player) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}
	return tilePile;
};

TrifleTileManager.prototype.getAllTiles = function() {
	return this.hostTeam.concat(this.guestTeam);
};

TrifleTileManager.prototype.getCopy = function() {
	var copy = new TrifleTileManager();

	// copy this.hostTiles and this.guestTiles
	
	return copy;
};
