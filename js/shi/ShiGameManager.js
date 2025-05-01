// NOTE: File partially completed

import { DEPLOY, MOVE, GUEST, HOST } from "../CommonNotationObjects.js";
import { debug } from "../GameData.js";
import { PaiShoMarkingManager } from "../pai-sho-common/PaiShoMarkingManager.js";
import { setGameLogText } from "../PaiShoMain.js";

import { ShiActuator } from "./ShiActuator.js";
import { ShiBoard } from "./ShiBoard.js";
import { ShiTileManager } from "./ShiTileManager.js";
import { ShiNotationMove } from "./ShiNotation.js";
import { ShiBoardPoint } from "./ShiBoardPoint.js";
import { NotationPoint } from "../CommonNotationObjects.js";
import { DEPLOY, MOVE, GUEST, HOST } from "../CommonNotationObjects.js";

export const SKIP = "SKIP";

export class ShiGameManager {

    /** @type {string} */
    gameLogText;

    /** @type {string|null} */

    /** @type {boolean} */
    isCopy;

    /** @type {ShiActuator} */
    actuator;

    /** @type {ShiTileManager} */
    tileManager;

    /** @type {ShiBoard} */
    board;

    /** @type {PaiShoMarkingManager} */
    markingManager;

    /** @type {string} */
    lastPlayerName;

    /** @type {Object} */
    firstTurnPlayed = { G: false, H: false };

    constructor(actuator, ignoreActuate, isCopy) {
        this.gameLogText = '';
        this.isCopy = isCopy;
        this.actuator = actuator;
    
        this.tileManager = new ShiTileManager();
        this.markingManager = new PaiShoMarkingManager();
        this.firstTurnPlayed = { GUEST: false, HOST: false }; // Ensure these match constants
        this.turnDeployCount = {
            [GUEST]: 0,
            [HOST]: 0
        };
    
        this.setup(ignoreActuate);
    }
    

    setup(ignoreActuate) {
        this.board = new ShiBoard();

        if (!ignoreActuate) {
            this.actuate();
        }
    }

    actuate(moveToAnimate) {
        this.actuator.actuate(this.board, this.tileManager, this.markingManager, moveToAnimate);
    }
    

    /**
     * 
     * @param {ShiBoardPoint} boardPoint 
     * @param {boolean} ignoreActuate 
     */

    revealPossibleMovePoints(boardPoint, ignoreActuate) {
        if (!boardPoint.hasTile()) return;

        this.board.setPossibleMovePoints(boardPoint);

        if (!ignoreActuate) {
            this.actuate();
        }
    }

    revealDeployPoints(player, tileCode, ignoreActuate) {
        this.board.setDeployPointsPossibleMoves(player, tileCode, false); // No bonus deploy logic
    
        if (!ignoreActuate) {
            this.actuate();
        }
    }
    
    hidePossibleMovePoints(ignoreActuate) {
        this.board.removePossibleMovePoints();
        this.tileManager.removeSelectedTileFlags();
    
        if (!ignoreActuate) {
            this.actuate();
        }
    }
    
    cleanup() {
        // No cleanup needed for now
    }
    
    /**
     * @param {ShiNotationMove} move
     * @param {boolean} withActuate
     * @param {string} playerCode GUEST or HOST
     */
    runNotationMove(move, withActuate) {
        debug("From ShiGameManager.js");
        debug("Running Move: " + move.fullMoveText + " Move type: " + move.moveType);
    
        let moveWasSuccessful = false;
    
        if (move.moveType === MOVE) {
            const moveResults = this.board.moveTile(move.playerCode, move.startPoint, move.endPoint);
    
            if (moveResults) {
                if (moveResults.capturedTile) {
                    this.tileManager.addToCapturedTiles(moveResults.capturedTile, move.playerCode);
                    this.board.checkForEndGame(this.tileManager, move.playerCode);
                }
    
                moveResults.movedTile.gotMoved = true;
                moveWasSuccessful = true;
            }
        }
    
        else if (move.moveType === DEPLOY) {
            const tile = this.tileManager.grabTile(move.playerCode, move.tileType);
    
            if (tile) {
                this.board.placeTile(tile, move.endPoint);
                moveWasSuccessful = true;
    
                debug("DEPLOY successful: " + tile.code + " at " + move.endPoint.pointText);
                this.lastPlayerName = move.playerCode;
            } else {
                debug("DEPLOY failed — no tile.");
            }
        }
    
        // Clear flags on board
        this.board.getTilesOnBoard().forEach(tile => tile.gotMoved = false);
    
        // Check win conditions
        this.board.checkForEndGame(this.tileManager, move.playerCode);
    
        if (withActuate) {
            this.actuate();
    
            if (this.hasEnded()) {
                debug(this.getWinReason());
                setGameLogText(this.getWinReason());
            }
        }
    
        return { moveWasSuccessful };
    }
    
    
    
    
    
    
    
    canDeployBonusElemental(playerCode) {
        const gatePoints = this.board._getGatePoints();
        const gateTileCount = gatePoints.filter(p =>
            p.hasTile() && p.tile.ownerName === playerCode
        ).length;
        return gateTileCount < 2;
    }
    
    


    

    hasEnded() {
        return this.board.winners.length > 0;
    }

    formatPlayerDisplay(code) {
        return code === "GUEST" ? "Guest" : "Host";
    }
    

    getWinner() {
        if (this.board.winners.length === 1) {
            const code = this.board.winners[0];
            return this.formatPlayerDisplay(code);
        } else if (this.board.winners.length > 1) {
            return "BOTH players";
        }
    }
    
    
    
    
    
    

    getWinReason() {
        const code = this.board.winners[0];
        const eclipseType = this.board.winnerReason?.includes("Solar") ? "Solar" : "Lunar";
        const playerDisplay = this.formatPlayerDisplay(code);
        return `${eclipseType} eclipse formed!`;
    }
    
}
