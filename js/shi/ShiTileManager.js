// NOTE: File completed

import { GUEST, HOST } from "../CommonNotationObjects";
import { debug } from "../GameData";
import { ShiTile } from "./ShiTile";

export class ShiTileManager {
    /** @type {Array<ShiTile>} */
    hostTiles;

    /** @type {Array<ShiTile>} */
    guestTiles;

    /** @type {Array<ShiTile>} */
    capturedHostTiles;

    /** @type {Array<ShiTile>} */
    capturedGuestTiles;

    constructor() {
        this.hostTiles = this.loadTileSet("H");
        this.guestTiles = this.loadTileSet("G");

        this.capturedHostTiles = [];
        this.capturedGuestTiles = [];
    }

    /**
     * Loads the tile set for a given player (host or guest).
     * @param {'G' | 'H'} ownerCode - Indicates the owner of the tiles.
     * @returns {Array<ShiTile>} Array of tiles for the specified owner.
     */
    loadTileSet(ownerCode) {
        let tiles = [];

        tiles.push(
            new ShiTile('W', ownerCode),
            new ShiTile('W', ownerCode),
            new ShiTile('W', ownerCode),
            new ShiTile('W', ownerCode),
            new ShiTile("E", ownerCode),
            new ShiTile("E", ownerCode),
            new ShiTile("E", ownerCode),
            new ShiTile("E", ownerCode),
            new ShiTile("F", ownerCode),
            new ShiTile("F", ownerCode),
            new ShiTile("F", ownerCode),
            new ShiTile("F", ownerCode),
            new ShiTile("A", ownerCode),
            new ShiTile("A", ownerCode),
            new ShiTile("A", ownerCode),
            new ShiTile("A", ownerCode),
            new ShiTile("S", ownerCode),
            new ShiTile("M", ownerCode),
            new ShiTile("L", ownerCode)
        )

        return tiles
    }

    /**
     * Grabs a tile from the corresponding tile pile and returns it.
     * @param {string} player - HOST or GUEST.
     * @param {string} tileCode - The code for the tile type.
     * @returns {ShiTile | null} The grabbed tile or null if not found.
     */
    grabTile(player, tileCode) {
        let tilePile = player === HOST ? this.hostTiles : this.guestTiles;

        /** @type {ShiTile} */
        let tile;
        for (let i = 0; i < tilePile.length; i++) {
            if (tilePile[i].code === tileCode) {
                let newTileArr = tilePile.splice(i, 1);
                tile = newTileArr[0];
                break;
            }
        }

        if (!tile) {
            debug("No tiles found for parameters: " + player + " " + tileCode);
        }

        return tile;
    }


    peekTile(player, tileCode, tileId) {
        let tilePile = player === HOST ? this.hostTiles : this.guestTiles;

        if (tileId) {
            for (let i = 0; i < tilePile.length; i++) {
                if (tilePile[i].id === tileId) {
                    return tilePile[i];
                }
            }
        }

        for (let i = 0; i < tilePile.length; i++) {
            if (tilePile[i].code === tileCode) {
                return tilePile[i];
            }
        }
    }

    /**
    * Adds a captured tile to the appropriate player's captured tiles.
    * Special logic for Celestial tiles: they return to owner's reserve!
    * @param {ShiTile} tile - The captured tile.
    * @param {string} capturingPlayerCode - GUEST or HOST.
    */
    addToCapturedTiles(tile, capturingPlayerCode) {
        // Celestial tiles: S, M, L
        if (tile.code === 'S' || tile.code === 'M' || tile.code === 'L') {
            // Celestial tiles return to their owner's reserve
            this.returnCelestialTileToReserve(tile);
        }
        else {
            // Normal tiles are permanently captured
            if (capturingPlayerCode === GUEST) {
                this.capturedGuestTiles.push(tile);
            } else if (capturingPlayerCode === HOST) {
                this.capturedHostTiles.push(tile);
            }
        }
    }

    /**
     * Clears the selected flags for all tiles.
     */
    removeSelectedTileFlags() {
        this.hostTiles.forEach((tile) => (tile.selectedFromPile = false));
        this.guestTiles.forEach((tile) => (tile.selectedFromPile = false));
    }

    /**
    * Puts a captured celestial tile back to the owner's reserve.
    * @param {ShiTile} tile - The captured celestial tile.
    */
    returnCelestialTileToReserve(tile) {
        if (tile.ownerName === GUEST) {
            this.guestTiles.push(tile);
        } else if (tile.ownerName === HOST) {
            this.hostTiles.push(tile);
        }
    }

    /**
    * Returns the number of Elemental tiles captured by the player.
    * @param {string} playerCode - GUEST or HOST
    * @returns {number}
    */
    getCapturedElementalCount(playerCode) {
        let capturedTiles = playerCode === GUEST ? this.capturedGuestTiles : this.capturedHostTiles;
        return capturedTiles.filter(tile => tile.isElementalTile()).length;
    }


}
