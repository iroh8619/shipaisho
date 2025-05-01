// NOTE: File completed

import { createBoardArrow, createBoardPointDiv, setupPaiShoBoard } from "../ActuatorHelp.js";
import { PaiShoMarkingManager } from "../pai-sho-common/PaiShoMarkingManager";
import { clearMessage, pointClicked, RmbDown, RmbUp, showPointMessage, showTileMessage, unplayedTileClicked, pieceAnimationLength, piecePlaceAnimation } from "../PaiShoMain.js";
import { MARKED, NON_PLAYABLE, POSSIBLE_MOVE } from "../skud-pai-sho/SkudPaiShoBoardPoint.js";
import { ShiBoard } from "./ShiBoard";
import { ShiController } from "./ShiController.js";
import { ShiBoardPoint } from "./ShiBoardPoint";
import { ShiTile } from "./ShiTile";
import { ShiTileManager } from "./ShiTileManager.js";
import { ADEVAR_ROTATE } from '../GameOptions'
import { getUserGamePreference } from "../PaiShoMain.js";
import { ShiPreferences } from "./ShiController.js";




export class ShiActuator {
    /** @type {HTMLDivElement} */ gameContainer;
    /** @type {boolean}        */ isMobile;
    /** @type {boolean}        */ animationOn;
    /** @type {HTMLDivElement} */ boardContainer;
    /** @type {Element}        */ arrowContainer;
    /** @type {HTMLDivElement} */ hostTilesContainer;
    /** @type {HTMLDivElement} */ guestTilesContainer;

    /**
     * @param {HTMLDivElement} gameContainer
     * @param {boolean} isMovile
     * @param {boolean} enableAnimation
     */
    constructor(gameContainer, isMovile, enableAnimation) {
        this.gameContainer = gameContainer;
        this.isMobile = isMovile;
        this.animationOn = enableAnimation;
        this.controller = null;

        let containers = setupPaiShoBoard(
            this.gameContainer,
            ShiController.getHostTilesContainerDivs(),
            ShiController.getGuestTilesContainerDivs(),
            true,
            ADEVAR_ROTATE
        );


        this.boardContainer = containers.boardContainer;
        this.arrowContainer = containers.arrowContainer;
        this.hostTilesContainer = containers.hostTilesContainer;
        this.guestTilesContainer = containers.guestTilesContainer;
    }


    setAnimationOn(isOn) {
        this.animationOn = isOn;
    }

    /**
     * Calls forth `this.htmlify()`
     *
     * NOTE: This is function is the key for updating your board state, so you should never call `this.htmlify()` directly
     * @param {ShiBoard} board
     * @param {ShiTileManager} tileManager
     * @param {PaiShoMarkingManager} markingManager
     * @param {*} moveToAnimate
     * @param {number} moveAnimationBeginStep
     */
    actuate(
        board,
        tileManager,
        markingManager,
        moveToAnimate,
        moveAnimationBeginStep,
    ) {
        let self = this;
        if (!moveAnimationBeginStep) {
            moveAnimationBeginStep = 0;
        }

        window.requestAnimationFrame(function () {
            self.htmlify(board, tileManager, markingManager, moveToAnimate);
        });
    }

    /**
     * Creates the html grid found on the board
     *
     * @param {ShiBoard} board
     * @param {ShiTileManager} tileManager
     * @param {PaiShoMarkingManager} markingManager
     * @param {number} moveToAnimate
     * @param {number} moveAnimationBeginStep
     */
    htmlify(
        board,
        tileManager,
        markingManager,
        moveToAnimate,
        moveAnimationBeginStep,
    ) {
        this.clearContainer(this.boardContainer);
        this.clearContainer(this.arrowContainer);

        for (const column of board.cells) {
            for (const cell of column) {
                if (
                    markingManager.pointIsMarked(cell) &&
                    !cell.isType(MARKED)
                ) {
                    cell.addType(MARKED);
                } else if (
                    !markingManager.pointIsMarked(cell) &&
                    cell.isType(MARKED)
                ) {
                    cell.removeType(MARKED);
                }

                if (cell) {
                    this.addBoardPoint(cell, moveToAnimate);
                }
            }
        }

        // Draw arrows
        for (let [_, arrow] of Object.entries(markingManager.arrows)) {
            this.arrowContainer.appendChild(
                createBoardArrow(arrow[0], arrow[1])
            );
        }

        let fullTileSet = new ShiTileManager();

        // Go through tile piles and clear containers
        for (const tile of fullTileSet.hostTiles) {
            this.clearTileContainer(tile);
        }
        for (const tile of fullTileSet.guestTiles) {
            this.clearTileContainer(tile);
        }
        // Don't forget the deleted tiles!
        this.clearContainer(
            this.hostTilesContainer.querySelector("span.tileLibrary")
        );
        this.clearContainer(
            this.guestTilesContainer.querySelector("span.tileLibrary")
        );

        // Go through tile piles and display
        for (const tile of tileManager.hostTiles) {
            this.addTile(tile, this.hostTilesContainer);
        }
        for (const tile of tileManager.guestTiles) {
            this.addTile(tile, this.guestTilesContainer);
        }

        // Add deleted tiles
        for (const capturedTile of tileManager.capturedHostTiles) {
            this._addCapturedTile(capturedTile, this.hostTilesContainer);
        }
        for (const capturedTile of tileManager.capturedGuestTiles) {
            this._addCapturedTile(capturedTile, this.guestTilesContainer);
        }
    }

    /** @param {Element} container */
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * Taken from CaptureActuator.js
     *
     * Remember to add the correct div with its proper tile code in
     * `Controller.getHostTilesContainerDivs()` / `Controller.getGuestTilesContainerDivs()` or else this breaks
     * @param {ShiTile} tile
     */
    clearTileContainer(tile) {
        let containerClass = "." + tile.getImageName();
        let container = document.querySelector(containerClass);
        while (container.firstChild != null) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * Taken from CaptureActuator.js
     * @param {ShiTile} tile
     * @param {HTMLDivElement} mainContainer Seems to be unused, but I'll keep it just in case :)
     */
    addTile(tile, mainContainer) {
        let container = mainContainer.querySelector("." + tile.getImageName());
        let div = document.createElement("div");

        let srcValue = this.getTileImageSourceDir(); // ✅ Declare before using
        //console.log("Image path used:", srcValue + tile.getImageName() + ".png");

        div.classList.add("point");
        div.classList.add("hasTile");

        if (tile.selectedFromPile) {
            div.classList.add("selectedFromPile");
            div.classList.add("drained");
        }

        let img = document.createElement("img");

        img.src = srcValue + tile.getImageName() + ".png";
        div.appendChild(img);

        div.setAttribute("name", tile.getImageName());
        div.setAttribute("id", tile.id);

        if (this.isMobile) {
            div.addEventListener("click", () => {
                unplayedTileClicked(div);
                showTileMessage(div);
            });
        } else {
            div.addEventListener("click", () => unplayedTileClicked(div));
            div.addEventListener("mouseover", () => showTileMessage(div));
            div.addEventListener("mouseout", clearMessage);
        }

        container.appendChild(div);
    }

    /**
     * Function of mine so to seperate concerns
     * @param {ShiTile} tile
     * @param {HTMLDivElement} mainContainer Container of tiles.
     */
    _addCapturedTile(tile, mainContainer) {
        const capturedContainer =
            mainContainer.querySelector("span.tileLibrary");
        const div = document.createElement("div");

        div.classList.add("point");
        div.classList.add("hasTile");

        const img = document.createElement("img");
        const srcValue = this.getTileImageSourceDir();

        img.src = srcValue + tile.getImageName() + ".png";


        div.appendChild(img);

        div.setAttribute("name", tile.getImageName());
        div.setAttribute("id", tile.id);

        if (this.isMobile) {
            div.addEventListener("click", () => {
                showTileMessage(div);
            });
        } else {
            div.addEventListener("mouseover", () => showTileMessage(div));
            div.addEventListener("mouseout", clearMessage);
        }

        capturedContainer.appendChild(div);
    }


    // Tile Placement and Move Animation to be reworked
    doAnimateBoardPoint(bp, moveToAnimate, img, div) {
        if (!this.animationOn || !moveToAnimate) return;
    
        const isMobile = window.innerWidth <= 612;
        const tileSize = isMobile ? 5.5555 : 34;
        const unit = isMobile ? 'vw' : 'px';
    
        const moveType = moveToAnimate.moveType;
        const start = moveToAnimate.startPoint?.rowAndColumn;
        const end = moveToAnimate.endPoint?.rowAndColumn;
    
        if (moveType === "MOVE" && start && end) {
            if (bp.row === end.row && bp.col === end.col) {
                // create a clone for animation
                const animDiv = div.cloneNode(true);
                animDiv.style.position = "absolute";
                animDiv.style.left = ((start.col - end.col) * tileSize) + unit;
                animDiv.style.top = ((start.row - end.row) * tileSize) + unit;
                animDiv.style.transition = `${pieceAnimationLength}ms`;
                animDiv.style.zIndex = 10;
    
                this.boardContainer.appendChild(animDiv);
    
                requestAnimationFrame(() => {
                    animDiv.style.left = "0" + unit;
                    animDiv.style.top = "0" + unit;
                });
    
                // After animation, remove only the ghost
                setTimeout(() => {
                    this.boardContainer.removeChild(animDiv);
                }, pieceAnimationLength);
            }
        } 
        else if (moveType === "DEPLOY" && end) {
            if (bp.row === end.row && bp.col === end.col) {
                img.style.transform = "scale(2)";
                img.style.transition = `${piecePlaceAnimation}ms`;
    
                requestAnimationFrame(() => {
                    img.style.transform = "scale(1)";
                });
            }
        }
    }


    /**
     * Taken from CaptureActuator.js
     * @param {ShiBoardPoint} bp
     */
    addBoardPoint(bp, moveToAnimate) {
        let div = createBoardPointDiv(bp);

        if (!bp.isType(NON_PLAYABLE)) {
            div.classList.add("activePoint");

            if (bp.isType(MARKED)) {
                div.classList.add("markedPoint");
            }

            if (bp.isType(POSSIBLE_MOVE)) {
                div.classList.add("possibleMove");
            }

            if (this.isMobile) {
                div.setAttribute(
                    "ontouchstart",
                    "pointClicked(this); showPointMessage(this);"
                );
            } else {
                div.addEventListener("click", () => pointClicked(div));
                div.addEventListener("mouseover", () => showPointMessage(div));
                div.addEventListener("mouseout", clearMessage);
                div.addEventListener("mousedown", (e) => {
                    // Right Mouse Button
                    if (e.button == 2) {
                        RmbDown(div);
                    }
                });
                div.addEventListener("mouseup", (e) => {
                    // Right Mouse Button
                    if (e.button == 2) {
                        RmbUp(div);
                    }
                });
                div.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                });
            }
        }

        if (bp.hasTile()) {
            div.classList.add("hasTile");

            let img = document.createElement("img");
            

            
            let srcValue = this.getTileImageSourceDir();

            img.src = srcValue + bp.tile.getImageName() + ".png";

            // ROTATE THE TILE IMAGE TO MATCH THE BOARD
            img.style.rotate = "225deg";          

            div.appendChild(img);

        }

        this.boardContainer.appendChild(div);
    }
    


    getTileImageSourceDir() {
        return "./images/Shi/" + "classicdesign" + "/";
    }
    
    
    
    
    
    
    
    
    
    
    
    
}