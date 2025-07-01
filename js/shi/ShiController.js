/* Shi Pai Sho by Uncle Iroh Advice */

// NOTE: File completed

import { ShiActuator } from "./ShiActuator.js";
import { ShiGameManager } from "./ShiGameManager.js";
import { CELESTIALGATE, ELEMENTALGATE, LOTUSPATH, ShiBoardPoint } from "./ShiBoardPoint.js";
import { ShiNotationBuilder, ShiGameNotation } from "./ShiNotation.js";
import { DEPLOY, GUEST, HOST, MOVE, NotationPoint } from "../CommonNotationObjects.js";
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';
import { GATE, NEUTRAL, POSSIBLE_MOVE } from "../skud-pai-sho/SkudPaiShoBoardPoint.js";
import { BRAND_NEW, callSubmitMove, createGameIfThatIsOk, currentMoveIndex, finalizeMove, gameId, GameType, isAnimationsOn, isInReplay, myTurn, onlinePlayEnabled, playingOnlineGame, READY_FOR_BONUS, rerunAll, toBullets, userIsLoggedIn, WAITING_FOR_ENDPOINT, activeAi, activeAi2 } from "../PaiShoMain.js";
import { ShiTile } from "./ShiTile.js";
import { ShiBotv1 } from './bot/ShiBotv1';
import { buildPreferenceDropdownDiv, setUserGamePreference, getUserGamePreference } from "../PaiShoMain.js"; // ✅ You should already be importing this
import { debug } from "../GameData.js";
import { ShiNotationMove } from "./ShiNotation.js";


var botGameStarted = false;

export var ShiPreferences = {
    tileDesignKey: "TileDesigns",
    tileDesignTypeValues: {
        shi: "Classic Design",
    }
};


export function ensureDefaultTileDesign() {
    const pref = getUserGamePreference(ShiPreferences.tileDesignKey);
    if (!pref || pref === "shi") {
        setUserGamePreference(ShiPreferences.tileDesignKey, ShiPreferences.tileDesignTypeValues.shi);
    }
}

export class ShiController {
    /** @type {ShiActuator}          */ actuator;
    /** @type {ShiGameManager}       */ theGame;
    /** @type {ShiNotationBuilder}   */ notationBuilder;
    /** @type {ShiGameNotation}      */ gameNotation;
    /** @type {ShiBoardPoint | null} */ mouseStartPoint;
    isPaiShoGame = true;

    /**
     * Used for remembering the BoardPoint which the player clicked on
     * @type {ShiBoardPoint | null}
     */
    mouseStartPoint

    /**
     * @param {HTMLDivElement} gameContainer This is the div element that your game needs to be put in
     * @param {boolean} isMobile Boolean flag for if running on mobile device
     */
    constructor(gameContainer, isMobile) {
        ensureDefaultTileDesign();
        this.actuator = new ShiActuator(
            gameContainer,
            isMobile,
            isAnimationsOn()
        );
        this.actuator.controller = this;

        this.resetGameManager();
        this.resetNotationBuilder();
        this.resetGameNotation();
    }

     /**
     * Sets the animation state for the game.
     */
     setAnimationsOn(isAnimationsOn) {
        this.actuator.setAnimationOn(isAnimationsOn);
    }   

    /**
     * Returns the GameType id for your game.
     */
    getGameTypeID() {
        return GameType.ShiPaiSho.id;
    }

    hideHarmonyAidsKey = "HideHarmonyAids";

    completeSetup() {

        if (!playingOnlineGame()) {
            // Assign default side when playing locally
            window.isHostSide = true;
        }
        

        this.setAnimationsOn(true); // ✅ Enable animations
        rerunAll();
        this.callActuate();
    
        // 🔁 Attach Start Bot Game button handler (works for getAdditionalMessage)
        setTimeout(() => {
            const btn = document.getElementById("startBotGameBtn");
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = "true";
                btn.onclick = () => {
                    this.botGameStarted = true;
                    window.activeAi = new ShiBotv1();
                    window.activeAi.setPlayer(this.getCurrentPlayer());
                    this.playAiTurn(finalizeMove);
                };
                
            }
        }, 100);
        
    }
    

    resetGameManager() {
        this.theGame = new ShiGameManager(this.actuator);
    }

    resetNotationBuilder() {
        this.notationBuilder = new ShiNotationBuilder();
    }

    resetGameNotation() {
        this.gameNotation = this.getNewGameNotation();
    }

    getNewGameNotation() {
        return new ShiGameNotation();
    }

    callActuate() {
        this.theGame.actuate();
    }
    resetMove() {
        if (this.notationBuilder.status === BRAND_NEW) {
            this.gameNotation.removeLastMove();
        }
        rerunAll();
    }
    cleanup() {}
    isSolitaire() {
        return false;
    }
	playAiTurn(finalizeMove) {
		if (this.theGame.getWinner()) {
			return;
		}
        const theAi = window.activeAi; // ✅ use global

        if (!theAi || !theAi.getMove) {
            console.warn("Bot not initialized properly.");
            return;
        }
        
        const playerMoveNum = this.gameNotation.getPlayerMoveNum();
        
        setTimeout(() => {
            const move = theAi.getMove(this.theGame, playerMoveNum);

            if (!move || !move.fullMoveText) {
              console.warn("[BOT WARNING] No valid move returned. Skipping AI turn.");
              // Optionally mark turn passed or just do nothing
              return;
            }
            
            try {
              this.gameNotation.addMove(move);
              finalizeMove();
            } catch (err) {
              console.error("[BOT ERROR] Failed to apply bot move:", move, err);
              alert("⚠️ The bot attempted an invalid move. The game may be corrupted. Try starting a new one.");
            }
            
        }, 10);
        
	}
	startAiGame(finalizeMove) {
		this.playAiTurn(finalizeMove);
	}
	getAiList() {
		return [new ShiBotv1()];
	}

    

    getCurrentPlayer() {
        let guestMoves = 0;
        let hostMoves = 0;
    
        for (const move of this.gameNotation.moves) {
            if (move.playerCode === GUEST) guestMoves++;
            else if (move.playerCode === HOST) hostMoves++;
        }
    
        return guestMoves <= hostMoves ? GUEST : HOST;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    /* EVENT METHODS */

    /**
     * Called when the player clicks on an unplayed tile
     * @param {HTMLDivElement} tileDiv 
     */
    unplayedTileClicked(tileDiv) {
        console.log("[DEBUG] tileClick – active player is:", this.getCurrentPlayer());
        this.theGame.markingManager.clearMarkings();
    
        const divName = tileDiv.getAttribute("name");
        const tileId = parseInt(tileDiv.getAttribute("id"));
        const tileCode = divName.substring(1);
        const tileOwnerCode = divName.charAt(0); // 'H' or 'G'
    
        const activePlayer = this.getCurrentPlayer();
        const currentPlayerCode = activePlayer === HOST ? 'H' : 'G';
    
        if (isInReplay || !myTurn()) {
            return;
        }
    
        // ✅ Use correct tile pool
        const tile = this.theGame.tileManager.peekTile(tileOwnerCode === 'H' ? HOST : GUEST, tileCode, tileId);
    
        // ✅ Prevent selecting a tile not owned by currentPlayerCode ('H' or 'G')
        if (tileOwnerCode !== currentPlayerCode) {
            debug("You cannot deploy opponent's tiles!");
            return;
        }
    
        // ✅ Continue with selection
        if (this.notationBuilder.status === BRAND_NEW) {
            tile.selectedFromPile = true;
            this.notationBuilder.moveType = DEPLOY;
            this.notationBuilder.tileType = tileCode;
            this.notationBuilder.status = WAITING_FOR_ENDPOINT;
    
            this.theGame.revealDeployPoints(currentPlayerCode, tileCode, false);
        } else {
            this.theGame.hidePossibleMovePoints();
            this.resetNotationBuilder();
        }
    }

    /** @param {HTMLDivElement} htmlPoint */
    RmbDown(htmlPoint) {
        let npText = htmlPoint.getAttribute("name");
        let notationPoint = new NotationPoint(npText);
        let rowCol = notationPoint.rowAndColumn;
        this.mouseStartPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
    }

    /** @param {HTMLDivElement} htmlPoint */
    RmbUp(htmlPoint) {
        let npText = htmlPoint.getAttribute("name");
        let notationPoint = new NotationPoint(npText);
        let rowCol = notationPoint.rowAndColumn;
        let mouseEndPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

        if (mouseEndPoint == this.mouseStartPoint) {
            this.theGame.markingManager.toggleMarkedPoint(mouseEndPoint);
        } else if (this.mouseStartPoint) {
            this.theGame.markingManager.toggleMarkedArrow(this.mouseStartPoint, mouseEndPoint);
        }

        this.mouseStartPoint = null;
        this.callActuate();
    }

    /** @param {HTMLDivElement} htmlPoint */
    pointClicked(htmlPoint) {
        this.theGame.markingManager.clearMarkings();
        this.callActuate();

        if (this.theGame.hasEnded()) return;

        const activePlayer = this.getCurrentPlayer();

        if (!myTurn()) {
            debug("It's not your turn.");
            return;
        }

        const npText = htmlPoint.getAttribute("name");
        const notationPoint = new NotationPoint(npText);
        const rowCol = notationPoint.rowAndColumn;
        const boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

        if (this.notationBuilder.status === BRAND_NEW) {
            if (boardPoint.hasTile()) {
                if (boardPoint.tile.ownerName !== activePlayer) {
                    debug("You cannot move your opponent’s tile.");
                    return;
                }

                this.notationBuilder.status = WAITING_FOR_ENDPOINT;
                this.notationBuilder.moveType = MOVE;
                this.notationBuilder.startPoint = new NotationPoint(npText);

                this.theGame.revealPossibleMovePoints(boardPoint);
            }
        }

        else if (this.notationBuilder.status === WAITING_FOR_ENDPOINT) {
            if (boardPoint.isType(POSSIBLE_MOVE)) {
                this.theGame.hidePossibleMovePoints();

                if (!isInReplay) {
                    this.notationBuilder.endPoint = new NotationPoint(npText);
                    const move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
                    console.log("[DEBUG] Move about to run:", move.fullMoveText);

                    const moveWasSuccessful = this.theGame.runNotationMove(move);

                    if (moveWasSuccessful) {
                        this.lastPlayerName = move.playerCode;
                        this.gameNotation.addMove(move);
                        finalizeMove();

                        if (
                            this.botGameStarted &&
                            window.activeAi &&
                            window.activeAi.player === this.getCurrentPlayer()
                        ) {
                            this.playAiTurn(finalizeMove);
                        }
                    } else {
                        debug("Move failed, not adding to notation!");
                    }
                }
            } else {
                this.theGame.hidePossibleMovePoints();
                this.resetNotationBuilder();
            }
        }
    }

    
    
    
    
    

    /**
     * @param {HTMLDivElement} htmlPoint
     * @returns {{heading: string, message: Array<string>} | null}
     */
    getPointMessage(htmlPoint) {
        const messageInfo = {
            heading: "",
            message: [],
        }

        let npText = htmlPoint.getAttribute("name")
        let notationPoint = new NotationPoint(npText)
        let rowCol = notationPoint.rowAndColumn
        let boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col]

        if (boardPoint.hasTile()) {
            const tileInfo = this.getTheMessage(boardPoint.tile, boardPoint.tile.ownerName)
            messageInfo.heading = tileInfo.heading
            messageInfo.message.push(...tileInfo.message)
        }

        // Add point data
        if (boardPoint.isType(NEUTRAL)) {
            messageInfo.heading = "Neutral Garden";
            messageInfo.message.push(this._getNeutralPointMessage());
        }
        if (boardPoint.isType(WHITE)) {
            messageInfo.heading = "White Garden";
            messageInfo.message.push(this._getWhitePointMessage());
        }
        if (boardPoint.isType(RED)) {
            messageInfo.heading = "Red Garden";
            messageInfo.message.push(this._getRedPointMessage());
        }
        if (boardPoint.isType(LOTUSPATH)) {
            messageInfo.heading = "Lotus Path";
            messageInfo.message.push(this._getLotusPathMessage());
        }
        if (boardPoint.isType(ELEMENTALGATE)) {
            messageInfo.heading = "Elemental Gate";
            messageInfo.message.push(this._getElementalGateMessage());
        }
        if (boardPoint.isType(CELESTIALGATE)) {
            messageInfo.heading = "Celestial Gate";
            messageInfo.message.push(this._getCelestialGateMessage());
        }
        return messageInfo
    }

    _getNeutralPointMessage() {
        return `
            <p>Any Elemental Tile may land here.</p>
        `    
    }

    _getWhitePointMessage() {
        return `
            <p>Any Sun or Elemental Tile may land here.</p>
        `    
    }

    _getRedPointMessage() {
        return `
            <p>Any Moon or Elemental tile may land here.</p>
        `    
    }

    _getLotusPathMessage() {
        return `
            <p>Either a Celestial or Elemental tile may land here.</p>
        `    
    }

    _getElementalGateMessage() {
        return `
            <p>Elemental Tiles are deployed on the point inside an Elemental Gate.</p>
        `
    }

    _getCelestialGateMessage() {
        return `
            <p>Celestial Tiles are deployed on the point inside the Celestial Gate.</p>
        `
    }

    /** @returns {string} */
    getDefaultHelpMessageText() {
        return `<h4>Shi Pai Sho</h4>
        <p></p>
        <p>Shi Pai Sho is a game of placement, movement and capture inspired by the eclipse in the Avatar world. The objective is to be the first to form an Eclipse.</p>
        <p></p>
       <p><strong>Guest:</strong>
        <ul>
        <li>Creates a Lunar Eclipse</li>
        <li>Lotus between the Sun and Moon</li>
        </ul>
        <p><strong>Host:</strong>
        <ul>
        <li>Creates a Solar Eclipse</li>
        <li>Moon between the Sun and Lotus</li>
        </ul>
        <p><strong>Win Conditions:</strong>
        <p></p>
        <ul>
        <li>Capture at least 6 Elemental Tiles</li>
        <li>Position the Sun in a White Garden</li>
        <li>Position the Moon in a Red Garden</li>
        <li>Line up the Celestial Tiles with no tile between them</li>
        </ul>
        <p><strong>Elemental Capture Cycle:</strong><br /> Water → Fire → Earth → Air → Water
        <p></p>
        <p><strong>Celestial Capture Cycle:</strong><br /> Lotus → Sun & Moon → Lotus
        <p></p>
        <p>Capture is only possible after both Lotus tiles are on the board, placed outisde the Celestial Gate.</p>
        <p></p>
        <p>Select tiles or points on the board to learn more, and see the <a href='https://drive.google.com/file/d/1kpIt_rjm1g4HYEewWSDCySz9tc_0qBo7/view?usp=sharing' target='_blank'>rules</a> for details.</p>
        <p>`;
    }

    /** @returns {string} */
    getAdditionalMessage() {
        let msg = "";
        
        if (this.gameNotation.moves.length === 0) {
            msg += `
                Click <em>Join Game</em> above to join another player's game. Or, you can play against a bot by clicking <strong>Start Bot Game<strong> below.<br />
                <button id="startBotGameBtn" style="margin-top:6px;">Start Bot Game</button>`;
            }
        
        const hostCaptured = this.theGame.tileManager.capturedHostTiles.length;
        const guestCaptured = this.theGame.tileManager.capturedGuestTiles.length;
        
        if (hostCaptured >= 6 && guestCaptured >= 6) {
            msg += `<br><strong>BOTH players have captured 6 Elemental tiles and can now form their Eclipse!</strong>`;
        } else if (hostCaptured >= 6) {
            msg += `<br><strong>HOST has captured 6 Elemental tiles and can now form a Solar Eclipse!</strong>`;
        } else if (guestCaptured >= 6) {
            msg += `<br><strong>GUEST has captured 6 Elemental tiles and can now form a Lunar Eclipse!</strong>`;
        }
        
        return msg;
        
        
    }


    getCorrectMoveNumForBonusPlayer(playerCode) {
        // Find the last move made by this player
        const lastByPlayer = [...this.gameNotation.moves]
            .reverse()
            .find(m => m.playerCode === playerCode);
    
        if (lastByPlayer) {
            return lastByPlayer.moveNum; // Use same move number
        }
    
        return 1; // fallback if first move ever
    }
    
    
    getNextMoveNumForPlayer(playerCode) {
        return this.gameNotation.moves.filter(m => m.playerCode === playerCode).length + 1;
    }
    
    
    
    updateCurrentPlayerMessage() {
        const msgDiv = document.querySelector(".gameMessage");
        if (!msgDiv) return;
        const player = this.getCurrentPlayer();
        msgDiv.innerHTML = `<strong>Current Player: ${player === HOST ? "Host" : "Guest"}</strong>`;
      }
      
    
    
    
    













getAdditionalHelpTabDiv() {
	const settingsDiv = document.createElement("div");

    const heading = document.createElement("h4");
    heading.innerText = "Shi Pai Sho Preferences:";
    settingsDiv.appendChild(heading);
    
    // ✅ Start Bot Game button
    //const startBotButton = document.createElement("button");
    //startBotButton.innerText = "Start Bot Game";
    //startBotButton.onclick = () => {
        //window.activeAi = new ShiBotv1(); // declare globally
        //window.activeAi.setPlayer(this.getCurrentPlayer());
        //this.startAiGame(finalizeMove);
    //};
    //settingsDiv.appendChild(startBotButton);

    settingsDiv.appendChild(
        buildPreferenceDropdownDiv(
            "Tile Designs",
            "shiPaiShoDesignsDropdown",
            ShiPreferences.tileDesignTypeValues,
            ShiPreferences.tileDesignKey,
            () => {
                this.actuator.updateTileDesignAndRefresh(); // ✅ Refresh on change
            }
        )
    );
    

	settingsDiv.appendChild(document.createElement("br"));

    return settingsDiv;
}    



    /**
     * @param {HTMLDivElement} tileDiv
     * @returns {{heading: string, message: Array<string>}} Message of the tile, given by `getTheMessage(tile, ownerName)`
     */
    getTileMessage(tileDiv) {
        let divName = tileDiv.getAttribute("name");
        let tile = new ShiTile(divName.substring(1), divName.charAt(0));
        let ownerName = divName.startsWith("G") ? GUEST : HOST;
        return this.getTheMessage(tile, ownerName);
    }

    /**
     * Get the information of a especific tile.
     * @param {ShiTile} tile
     * @param {string} ownerName
     * @returns {{heading: string, message: Array<string>}} Information to display
     */
    getTheMessage(tile, ownerName) {
        let tileCode = tile.code
        let message = []
        let heading = ownerName + ' Tile'
        if (tileCode === 'W') {
            message.push("Elemental Tile")
            message.push("Can move up to 6 spaces")
            message.push("Can Capture Fire")
            message.push("Can be captured by Air")
        } else if (tileCode === 'E') {
            message.push("Elemental Tile")
            message.push("Can move up to 6 spaces")
            message.push("Can Capture Air")
            message.push("Can be captured by Fire")
        } else if (tileCode === 'F') {
            message.push("Elemental Tile")
            message.push("Can move up to 6 spaces")
            message.push("Can Capture Earth")
            message.push("Can be captured by Water")
        } else if (tileCode === 'A') {
            message.push("Elemental Tile")
            message.push("Can move up to 6 spaces")
            message.push("Can Capture Water")
            message.push("Can be captured by Earth")
        } else if (tileCode === 'S') {
            message.push("Celestial Tile")
            message.push("Can move any number of spaces along the Lotus Path and inside a White Garden")
            message.push("Can Capture Lotus")
            message.push("Can be captured by Lotus")
        } else if (tileCode === 'M') {
            message.push("Celestial Tile")
            message.push("Can move any number of spaces along the Lotus Path and inside a Red Garden")
            message.push("Can Capture Lotus")
            message.push("Can be captured by Lotus")
        } else if (tileCode === 'L') {
            message.push("Celestial Tile")
            message.push("Can move any number of spaces along the Lotus Path")
            message.push("Can Capture Sun and Moon")
            message.push("Can be captured by Sun and Moon")
        }

        return {
            heading: heading,
            message: ["<strong>" + ShiTile.getTileName(tileCode) + "</strong>: " + toBullets(message)]
        }
    }

    /* STATIC METHODS */

    /**
     * Returns the html representation of the tile containers for host. Each container may contain the tiles
     * that the host currently has available to deploy or plant. Each cointainer must have a class name with
     * the code of whatever tile it cointains
     * @returns {string}
     * */
    static getHostTilesContainerDivs() {
        return '' +
        //'<span>Host\'s Tile Reserve</span>' +
        //'<br>' +
        '<div class="HW"></div>' +
        '<div class="HE"></div>' +
        '<div class="HF"></div>' +
        '<div class="HA"></div>' +
        '<br class="clear">' +
        '<div class="HS"></div>' +
        '<div class="HM"></div>' +
        '<div class="HL"></div>' +
        '<br class="clear">' +
        '<br>' +
        //'<span>Host\'s Captured Tiles</span>' +
        '<span class="tileLibrary"></span>';
    }

    /**
     * Returns the html representation of the tile containers for guest. Each container may contain the tiles
     * that the host currently has available to deploy or plant. Each cointainer must have a class name with
     * the code of whatever tile it cointains
     * @returns {string}
     * */
    /** @returns {string} */
    static getGuestTilesContainerDivs() {
        return '' +
        //'<span>Guest\'s Tile Reserve</span>' +
        //'<br>' +
        '<div class="GW"></div>' +
        '<div class="GE"></div>' +
        '<div class="GF"></div>' +
        '<div class="GA"></div>' +
        '<br class="clear">' +
        '<div class="GS"></div>' +
        '<div class="GM"></div>' +
        '<div class="GL"></div>' +
        '<br class="clear">' +
        '<br>' +
        //'<span>Guest\'s Captured Tiles</span>' +
        '<span class="tileLibrary"></span>';
    }

    
    
}
