// NOTE: File completed
import { GATE, NEUTRAL } from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { ShiTile } from "./ShiTile"

export const ALIGNED_HIGHLIGHT = "ALIGNED_HIGHLIGHT";

export let LOTUSPATH = "Lotus Path"
export let ELEMENTALGATE = "Elemental Gate"
export let CELESTIALGATE = "Celestial Gate"
export class ShiBoardPoint {

    /** @type {Array<string>} */
    types

    /** @type {number} */
    row

    /** @type {number} */
    col

    /** @type {ShiTile} */
    tile

	constructor() {
		this.types = [];
		this.row = -1;
		this.col = -1;
	}

    /**
     * Taken from SpiritBoardPoint.js
     * @param {string} type Type of point. Use constants only.
     */
    addType(type) {
        if (!this.types.includes(type)) {
            this.types.push(type);
        }
    }

    /**
     * Taken from SpiritBoardPoint.js
     * @param {string} type Type of point. Use constants only.
     */
    removeType(type) {
        for (let i = 0; i < this.types.length; i++) {
            if (this.types[i] === type) {
                this.types.splice(i, 1);
            }
        }
    }

    /**
     * Taken from SpiritBoardPoint.js
     * @param {ShiTile} tile
     */
    putTile(tile) {
        this.tile = tile;
    }

    removeTile() {
        let tile = this.tile;
        this.tile = null;
        return tile;
    }

    /**
     * Taken from SpiritBoardPoint.js
     */
    hasTile() {
        if (this.tile) return true;
        return false;
    }

    isType(type) {
        return this.types.includes(type);
    }

	isOpenGate() {
		return !this.hasTile() && this.types.includes(GATE);
	}

	drainTile() {
		if (this.tile) {
			this.tile.drain();
		}
	}
	restoreTile() {
		if (this.tile) {
			this.tile.restore();
		}
	}

	// Point makers
	static neutral() {
		let point = new ShiBoardPoint();
		point.addType(NEUTRAL);

		return point;
	}
	static gate() {
		let point = new ShiBoardPoint();
		point.addType(GATE);

		return point;
	}
	static red() {
		let point = new ShiBoardPoint();
		point.addType(RED);

		return point;
	}
	static white() {
		let point = new ShiBoardPoint();
		point.addType(WHITE);

		return point;
	}

	static lotuspath() {
		let p = new ShiBoardPoint();
		p.addType(LOTUSPATH);

		return p;
	}

	static elementalgate() {
		let p = new ShiBoardPoint();
		p.addType(ELEMENTALGATE);

		return p;
	}

	static celestialgate() {
		let p = new ShiBoardPoint();
		p.addType(CELESTIALGATE);

		return p;
	}
}