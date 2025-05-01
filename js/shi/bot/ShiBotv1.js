/* Shi Pai Sho Bot */

import { ShiBotHelp } from './ShiBotHelp.js';

export class ShiBotv1 {
	constructor() {
		this.aiHelp = new ShiBotHelp();
		this.player = null;
	}

    getName() {
        return "Shi Random Bot";
    }
    
    getMessage() {
        return "This bot makes moves completely randomly, so you should be able to beat it easily.";
    }
    
    setPlayer(playerName) {
        this.player = playerName;
    }
    
    getMove(game, moveNum) {
        this.aiHelp.moveNum = moveNum;
        let scoredMoves;
        try {
          scoredMoves = this.aiHelp.getAllPossibleMoves(game, this.player);
        } catch (e) {
          console.error("[BOT ERROR] Failed to generate moves:", e);
          return null;
        }
      
        if (!scoredMoves || scoredMoves.length === 0) {
          console.warn("[BOT DEBUG] No scored moves returned");
          return null;
        }
      
        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves[0].move;
      }
      
    
    
    
}
