// ShiTile.js — FINAL VERSION

import { GUEST, HOST } from "../CommonNotationObjects";
import { debug } from "../GameData";
import { tileIdIncrement } from "../skud-pai-sho/SkudPaiShoTile";

export const ELEMENTAL_TILES = ["W", "F", "E", "A"];
export const CELESTIAL_TILES = ["S", "M", "L"];

export const ELEMENTAL_CAPTURE_ORDER = {
    "W": "F", // Water -> Fire
    "F": "E", // Fire -> Earth
    "E": "A", // Earth -> Air
    "A": "W"  // Air -> Water
};

export const CELESTIAL_CAPTURE_ORDER = {
    "L": ["S", "M"], // Lotus captures Sun or Moon
    "S": ["L"],      // Sun captures Lotus
    "M": ["L"]       // Moon captures Lotus
};

export class ShiTile {

    static ELEMENTAL_MOVE_RANGE = 6;
    static CELESTIAL_MOVE_RANGE = 17; // Unlimited (handled in Board movement checks)

    /** @type {string} */ code;
    /** @type {string} */ ownerCode;
    /** @type {string} */ ownerName;
    /** @type {number} */ id;
    /** @type {boolean} */ selectedFromPile = false;
    /** @type {boolean} */ gotMoved = false;
    /** @type {number} */ rotation = 0;

    /**
     * @param {string} code Tile code (e.g., 'W', 'E', 'F', 'A', 'S', 'M', 'L')
     * @param {'G'|'H'} ownerCode Player who owns this tile
     */
    constructor(code, ownerCode) {
        this.code = code;
        this.ownerCode = ownerCode;

        if (ownerCode === "G") {
            this.ownerName = GUEST;
        } else if (ownerCode === "H") {
            this.ownerName = HOST;
        } else {
            debug("INCORRECT OWNER CODE");
        }

        this.id = tileIdIncrement();
        this.rotation = 0; // Default no rotation
    }

    /**
     * Returns true if this tile is an Elemental tile
     * @returns {boolean}
     */
    isElementalTile() {
        return ELEMENTAL_TILES.includes(this.code);
    }

    /**
     * Returns true if this tile is a Celestial tile
     * @returns {boolean}
     */
    isCelestialTile() {
        return CELESTIAL_TILES.includes(this.code);
    }

    /**
     * Calculates movement distance
     * @returns {number}
     */
    getMoveDistance() {
        if (this.isCelestialTile()) {
            return ShiTile.CELESTIAL_MOVE_RANGE;
        }
        if (this.isElementalTile()) {
            return ShiTile.ELEMENTAL_MOVE_RANGE;
        }
        return 0;
    }

    /**
     * Determines if this tile can capture the other tile
     * @param {ShiTile} otherTile 
     * @returns {boolean}
     */
    canCapture(otherTile) {
        if (this.ownerCode === otherTile.ownerCode) {
            return false; // Cannot capture own tiles
        }

        if (this.isElementalTile() && otherTile.isElementalTile()) {
            return ELEMENTAL_CAPTURE_ORDER[this.code] === otherTile.code;
        }

        if (this.isCelestialTile() && otherTile.isCelestialTile()) {
            const captures = CELESTIAL_CAPTURE_ORDER[this.code];
            return captures?.includes(otherTile.code);
        }

        return false; // Elementals can't capture Celestials and vice-versa
    }

    /**
     * Determines if this tile can BE captured by the other tile
     * @param {ShiTile} attacker
     * @returns {boolean}
     */
    canBeCapturedBy(attacker) {
        return attacker.canCapture(this);
    }

    /**
     * Get the image name for sprite loading
     * @returns {string}
     */
    getImageName() {
        const prefix = this.ownerName === "HOST" ? "H" : "G";
        return prefix + this.code;
    }
    

    /**
     * Get a copy of this tile
     * @returns {ShiTile}
     */
    getCopy() {
        return new ShiTile(this.code, this.ownerCode);
    }

    /**
     * Return tile friendly name
     * @param {string} tileCode
     * @returns {string}
     */
    static getTileName(tileCode) {
        const names = {
            "W": "Water",
            "F": "Fire",
            "E": "Earth",
            "A": "Air",
            "S": "Sun",
            "M": "Moon",
            "L": "Lotus"
        };
        return names[tileCode] || "Unknown";
    }

    /**
     * Returns a full explanation for capture cycle
     * @returns {string}
     */
    getCaptureInfo() {
        if (this.isElementalTile()) {
            const captures = ELEMENTAL_CAPTURE_ORDER[this.code];
            const capturedBy = Object.keys(ELEMENTAL_CAPTURE_ORDER).find(key => ELEMENTAL_CAPTURE_ORDER[key] === this.code);
            return `${ShiTile.getTileName(this.code)} captures ${ShiTile.getTileName(captures)} and is captured by ${ShiTile.getTileName(capturedBy)}`;
        } else if (this.isCelestialTile()) {
            if (this.code === "L") {
                return "Lotus captures Sun and Moon, and is captured by Sun and Moon.";
            } else if (this.code === "S") {
                return "Sun captures Lotus, and is captured by Lotus.";
            } else if (this.code === "M") {
                return "Moon captures Lotus, and is captured by Lotus.";
            }
        }
        return "Unknown capture behavior.";
    }

    /**
     * Sets rotation of tile when placed
     * @param {number} degrees
     */
    setRotation(degrees) {
        this.rotation = degrees;
    }

    /**
     * Checks if this tile is a Lotus
     * @returns {boolean}
     */
    isLotus() {
        return this.code === "L";
    }
}