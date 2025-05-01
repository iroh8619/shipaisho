import {
  DEPLOY,
  GUEST,
  MOVE,
  NotationPoint,
  RowAndColumn,
} from '../../CommonNotationObjects';
import { NON_PLAYABLE, POSSIBLE_MOVE } from '../../skud-pai-sho/SkudPaiShoBoardPoint';
import { ShiNotationBuilder } from '../ShiNotation';
import { WAITING_FOR_ENDPOINT } from '../../PaiShoMain';

export class ShiBotHelp {
  constructor() {
    this.moveNum = 0;
  }

  getAllPossibleMoves(game, player) {
    const deploymentMoves = this.getPossibleDeploymentMoves(game, player);
    const movementMoves = this.getPossibleMovementMoves(game, player);

    const shouldOnlyFormEclipse = player === GUEST &&
    this.getMovementStartPoints(game, player).filter(p =>
      ['W', 'F', 'E', 'A'].includes(p.tile.code)
    ).length >= 6;
  
  if (shouldOnlyFormEclipse) {
    const celestialMoves = this.getPossibleMovementMoves(game, player).filter(move => {
      const code = this.getTileCodeAtNotation(game, move.startPoint?.notationPointString);
      return ['S', 'M', 'L'].includes(code);
    });
  
    const celestialDeployments = this.getPossibleDeploymentMoves(game, player).filter(move =>
      ['S', 'M', 'L', 'L'].includes(move.tileType)
    );
  
    const eclipseMoves = celestialMoves.concat(celestialDeployments);
  
    if (eclipseMoves.length > 0) {
      return eclipseMoves.map(move => ({
        move,
        score: this.scoreMove(game, move, player)
      }));
    }
  
    // If still no moves found, fall back to standard logic (optional)
  }
  
  

    const allMoves = deploymentMoves.concat(movementMoves);
  
    // Optional: hard bias for capture first
    const captureMoves = allMoves.filter(m => m.priorityCapture);
    if (captureMoves.length > 0) return captureMoves.map(move => ({
      move,
      score: 999 // top score
    }));
  
    return allMoves.map(move => ({
      move,
      score: this.scoreMove(game, move, player)
    }));
  }
  

  scoreMove(game, move, player) {
    let score = 0;
    const captured = player === GUEST
      ? game.tileManager.capturedGuestTiles.length
      : game.tileManager.capturedHostTiles.length;

    const shouldFormEclipse = player === GUEST && captured >= 6;
    const isDeploy = move.moveType === DEPLOY;
    const isMove = move.moveType === MOVE;

    const isCelestial = ['S', 'M', 'L'].includes(move.tileType) ||
      (isMove && ['S', 'M', 'L'].includes(this.getTileCodeAtNotation(game, move.startPoint.notationPointString)));

    const isElemental = ['F', 'A', 'E', 'W'].includes(move.tileType) ||
      (isMove && ['F', 'A', 'E', 'W'].includes(this.getTileCodeAtNotation(game, move.startPoint.notationPointString)));

    const end = move.endPoint?.notationPointString;
    if (end) {
      const coord = new NotationPoint(end).rowAndColumn;
      const isCenter = coord.row === 8 && coord.col === 8;
      if (isCenter) {
        score -= 100; // hard avoid Celestial Gate
      }
    }

    if (isDeploy) {
      if (move.tileType === 'L') {
        const hasSun = this.getCelestialTiles(game, player).some(t => t.code === 'S');
        const hasMoon = this.getCelestialTiles(game, player).some(t => t.code === 'M');
        const canAdvanceEclipse = hasSun && hasMoon;

        if (captured >= 6) {
          score += 25;
        } else if (canAdvanceEclipse) {
          score += 20;
        } else {
          score += 5;
        }
      } else if (isCelestial) {
        if (shouldFormEclipse) {
          score += 50; // deploy celestials aggressively for eclipse
        } else {
          const elementalsOnBoard = this.getMovementStartPoints(game, player).filter(cell =>
            ['W', 'F', 'E', 'A'].includes(cell.tile.code)
          ).length;
      
          if (elementalsOnBoard >= 2) {
            score += 15;
          } else {
            score -= 5;
          }
        }
      }

      if (isElemental) {
        const active = this.getMovementStartPoints(game, player)
          .filter(p => ['W', 'F', 'E', 'A'].includes(p.tile.code)).length;
        score += (active === 0 ? 20 : 5);
      }
    }

    if (isDeploy && isElemental && move.endPoint?.notationPointString) {
      const end = new NotationPoint(move.endPoint.notationPointString).rowAndColumn;
      const enemyTiles = this.getAllEnemyTiles(game, player);
      const attackerCode = move.tileType;
      const captureCycle = { W: 'F', F: 'E', E: 'A', A: 'W' };
    
      const canTarget = enemyTiles.some(enemy => {
        const validTarget = captureCycle[attackerCode] === enemy.code;
        const alignedRow = enemy.row === end.row;
        const alignedCol = enemy.col === end.col;
        return validTarget && (alignedRow || alignedCol);
      });
    
    }
    
    

    if (isMove && move.endPoint?.notationPointString) {

      const startCoord = new NotationPoint(move.startPoint.notationPointString).rowAndColumn;
      const endCoord = new NotationPoint(move.endPoint.notationPointString).rowAndColumn;
      
      const deltaRow = Math.abs(endCoord.row - startCoord.row);
      const deltaCol = Math.abs(endCoord.col - startCoord.col);
      const strideLength = Math.max(deltaRow, deltaCol);
      
      const tileCode = this.getTileCodeAtNotation(game, move.startPoint.notationPointString);
      const isElemental = ['W', 'F', 'E', 'A'].includes(tileCode);
      const isCelestial = ['S', 'M', 'L'].includes(tileCode);
      
      if (isElemental && strideLength === 6) {
        score += 10; // full range = good
      }
      if (isCelestial && strideLength >= 3) {
        score += 5 + strideLength; // the farther, the better
      }
      

      // Detecting captures based on destination tile
      const targetCell = this.getCellAtNotation(game, move.endPoint.notationPointString);
      const targetCode = this.getTileCodeAtNotation(game, move.endPoint.notationPointString);
    
      if (targetCell?.tile && targetCell.tile.ownerName !== player) {
        score += 30;
    
        // Bonus for capturing valid target
        const attackerCode = this.getTileCodeAtNotation(game, move.startPoint.notationPointString);
        const captureCycle = { W: 'F', F: 'E', E: 'A', A: 'W', L: ['S', 'M'], S: ['L'], M: ['L'] };
    
        if (
          (attackerCode in captureCycle) &&
          (
            (Array.isArray(captureCycle[attackerCode]) && captureCycle[attackerCode].includes(targetCode)) ||
            captureCycle[attackerCode] === targetCode
          )
        ) {
          score += 25; // high aggression bonus
        }
      }

      if (isCelestial) {
        if (this.advancesEclipseFormation(game, move, player)) {
          score += shouldFormEclipse ? 120 : 35; // boost hard if focused on eclipse
        }
        
        if (this.blocksOpponentEclipse(game, move, player)) score += 25;
        if (this.isCelestialBaitMove(game, move, player)) score += 8;

        const tileCode = this.getTileCodeAtNotation(game, move.startPoint.notationPointString);
        if (tileCode === 'L') {
          const start = new NotationPoint(move.startPoint.notationPointString).rowAndColumn;
          if (this.isEnemyWithinTwoSteps(game, player, start.row, start.col)) {
            score += 20; // encourage aggressive positioning
          }
          const isAtGate = start.row === 8 && start.col === 8;
          if (isAtGate) {
            const alignedIfMoved = this.advancesEclipseFormation(game, move, player);
            score += alignedIfMoved ? 35 : 10;
          }
        }
      }
    }
    if (move.longStrideTowardEnemy) {
      score += 30; // big bonus for max-range aggression
    }
    
    return score + Math.random();
  }

  isCelestialBaitMove(game, move, player) {
    if (move.moveType !== MOVE || !move.endPoint) return false;
    const code = this.getTileCodeAtNotation(game, move.startPoint.notationPointString);
    if (!['S', 'M', 'L'].includes(code)) return false;

    const coord = new NotationPoint(move.endPoint.notationPointString).rowAndColumn;
    const otherCelestials = this.getCelestialTiles(game, player)
      .filter(t => t.code !== code)
      .map(t => new NotationPoint(t.notation).rowAndColumn);

    if (otherCelestials.length !== 2) return false;
    const aligned = this.areAligned([...otherCelestials, coord]);
    if (aligned) return false;

    return this.isNearlyAligned([...otherCelestials, coord]);
  }

  isNearlyAligned(coords) {
    if (coords.length !== 3) return false;
    const [a, b, c] = coords;
    const rowRange = Math.max(a.row, b.row, c.row) - Math.min(a.row, b.row, c.row);
    const colRange = Math.max(a.col, b.col, c.col) - Math.min(a.col, b.col, c.col);
    return rowRange <= 2 && colRange <= 2;
  }

  blocksOpponentEclipse(game, move, player) {
    const opponent = player === GUEST ? 'HOST' : 'GUEST';
    const oppCelestials = this.getCelestialTiles(game, opponent);
    if (oppCelestials.length !== 2 || !move.endPoint) return false;
    const coord1 = new NotationPoint(oppCelestials[0].notation).rowAndColumn;
    const coord2 = new NotationPoint(oppCelestials[1].notation).rowAndColumn;
    const coord3 = new NotationPoint(move.endPoint.notationPointString).rowAndColumn;
    return this.areAligned([coord1, coord2, coord3]);
  }

  getPossibleDeploymentMoves(game, player) {
    const moves = [];
    const tilePile = this.getTilePile(game, player);

    for (const tile of tilePile) {
      game.revealDeployPoints(player, tile.code, true);
      const endPoints = this.getPossibleMovePoints(game);

      for (const endPoint of endPoints) {
        const builder = new ShiNotationBuilder();
        builder.moveType = DEPLOY;
        builder.tileType = tile.code;
        builder.endPoint = new NotationPoint(this.getNotation(endPoint));
        builder.status = WAITING_FOR_ENDPOINT;

        const move = builder.getNotationMove(this.moveNum, player);
        game.hidePossibleMovePoints(true);

        if (move && move.fullMoveText && !moves.some(m => m.equals(move))) {
          moves.push(move);
        }
      }
    }

    return moves;
  }

  getPossibleMovementMoves(game, player) {
    const moves = [];
    const startPoints = this.getMovementStartPoints(game, player);
  
    for (const startPoint of startPoints) {
      const attackerCode = startPoint.tile.code;
      const attackerRow = startPoint.row;
      const attackerCol = startPoint.col;
    
      const cycle = { W: 'F', F: 'E', E: 'A', A: 'W', L: ['S', 'M'], S: ['L'], M: ['L'] };
    
      game.revealPossibleMovePoints(startPoint, true);
      const endPoints = this.getPossibleMovePoints(game);
    
      for (const endPoint of endPoints) {
        const defender = endPoint.tile;
        const builder = new ShiNotationBuilder();
        builder.moveType = MOVE;
        builder.startPoint = new NotationPoint(this.getNotation(startPoint));
        builder.endPoint = new NotationPoint(this.getNotation(endPoint));
        builder.status = WAITING_FOR_ENDPOINT;
    
        const move = builder.getNotationMove(this.moveNum, player);
        game.hidePossibleMovePoints(true);
    
        if (move && move.fullMoveText && !moves.some(m => m.equals(move))) {
          if (defender && defender.ownerName !== player && this.bothLotusesOnBoard(game)) {
            const defenderCode = defender.code;
            const validTarget =
              (Array.isArray(cycle[attackerCode]) && cycle[attackerCode].includes(defenderCode)) ||
              cycle[attackerCode] === defenderCode;
    
            if (validTarget) {
              move.priorityCapture = true;
              console.log(`[BOT DEBUG] ${attackerCode} at (${attackerRow},${attackerCol}) can capture ${defenderCode} at (${endPoint.row},${endPoint.col})`);
            }
          }
          if (!move.priorityCapture && this.bothLotusesOnBoard(game)) {
            const enemies = this.getAllEnemyTiles(game, player);
            const validTargets = enemies.filter(enemy => {
              const targetCode = enemy.code;
              const validTarget =
                (Array.isArray(cycle[attackerCode]) && cycle[attackerCode].includes(targetCode)) ||
                cycle[attackerCode] === targetCode;
          
              const alignedRow = enemy.row === startPoint.row;
              const alignedCol = enemy.col === startPoint.col;
          
              return validTarget && (alignedRow || alignedCol);
            });
          
            for (const target of validTargets) {
              const deltaRow = target.row - attackerRow;
              const deltaCol = target.col - attackerCol;
          
              const maxRange = ['W', 'F', 'E', 'A'].includes(attackerCode) ? 6 : 16;
              const dist = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
              if (dist > maxRange) continue;
          
              const dirRow = Math.sign(deltaRow);
              const dirCol = Math.sign(deltaCol);
              const moveRow = endPoint.row - attackerRow;
              const moveCol = endPoint.col - attackerCol;
          
              const sameDirection = dirRow === Math.sign(moveRow) && dirCol === Math.sign(moveCol);
              const distance = Math.max(Math.abs(moveRow), Math.abs(moveCol));
              
              if (sameDirection) {
                // Strong bonus for max stride directly toward enemy
                const maxStride = ['W','F','E','A'].includes(attackerCode) ? 6 : 16;
                if (distance === dist && dist <= maxStride) {
                  move.priorityCapture = true;
                  move.aggressiveAdvance = true;
                  move.longStrideTowardEnemy = true;
                }
              }
              
            }
          }
          
    
          moves.push(move);
        }
      }
          
    }
  
    return moves;
  }
  

  getTilePile(game, player) {
    return player === GUEST ? game.tileManager.guestTiles : game.tileManager.hostTiles;
  }

  getPossibleMovePoints(game) {
    const points = [];
    game.board.cells.forEach(row => {
      row.forEach(cell => {
        if (!cell.isType(NON_PLAYABLE) && cell.isType(POSSIBLE_MOVE)) {
          points.push(cell);
        }
      });
    });
    return points;
  }

  getMovementStartPoints(game, player) {
    const points = [];
    game.board.cells.forEach(row => {
      row.forEach(cell => {
        if (cell.hasTile() && cell.tile.ownerName === player) {
          points.push(cell);
        }
      });
    });
    return points;
  }

  getNotation(boardPoint) {
    return new RowAndColumn(boardPoint.row, boardPoint.col).notationPointString;
  }

  getCellAtNotation(game, notationString) {
    if (!notationString) return null; // <== Add this check
    const np = new NotationPoint(notationString).rowAndColumn;
    return game.board.cells?.[np.row]?.[np.col];
  }
  
  getTileCodeAtNotation(game, notationString) {
    if (!notationString) return null; // <== Add this check
    const np = new NotationPoint(notationString).rowAndColumn;
    const cell = game.board.cells?.[np.row]?.[np.col];
    return cell?.tile?.code || null;
  }
  

  followsElementalCycle(game, move, player) {
    if (move.moveType !== MOVE || !move.startPoint || !move.endPoint) return false;
    const attackerCode = this.getTileCodeAtNotation(game, move.startPoint.notationPointString);
    const targetCode = this.getTileCodeAtNotation(game, move.endPoint.notationPointString);
    const targetCell = this.getCellAtNotation(game, move.endPoint.notationPointString);

    if (!['W', 'F', 'E', 'A'].includes(attackerCode)) return false;
    if (!targetCode || !['W', 'F', 'E', 'A'].includes(targetCode)) return false;
    if (!targetCell?.tile || targetCell.tile.ownerName === player) return false;

    const cycle = { W: 'F', F: 'E', E: 'A', A: 'W' };
    return cycle[attackerCode] === targetCode;
  }

  advancesEclipseFormation(game, move, player) {
    const celestialCodes = ['S', 'M', 'L'];
    const moveCode = move.tileType || (move.startPoint && this.getTileCodeAtNotation(game, move.startPoint.notationPointString));
    if (!celestialCodes.includes(moveCode)) return false;

    const celestials = this.getCelestialTiles(game, player);
    const movedTilePoint = move.endPoint?.notationPointString;
    const simCelestials = celestials.map(p => p.notation);
    if (movedTilePoint && !simCelestials.includes(movedTilePoint)) {
      simCelestials.push(movedTilePoint);
    }

    if (simCelestials.length < 3) return false;
    const coords = simCelestials.map(not => new NotationPoint(not).rowAndColumn);
    return this.areAligned(coords);
  }

  getCelestialTiles(game, player) {
    const celestialTiles = [];
    game.board.cells.forEach(row => {
      row.forEach(cell => {
        if (
          cell.hasTile() &&
          cell.tile.ownerName === player &&
          ['S', 'M', 'L'].includes(cell.tile.code)
        ) {
          celestialTiles.push({
            code: cell.tile.code,
            notation: new RowAndColumn(cell.row, cell.col).notationPointString
          });
        }
      });
    });
    return celestialTiles;
  }

  getCelestialGateCoordinate() {
    return { row: 8, col: 8 };
  }

  bothLotusesOnBoard(game) {
    let count = 0;
    game.board.cells.forEach(row => {
      row.forEach(cell => {
        if (cell.hasTile() && cell.tile.code === 'L') {
          // Check not at Celestial Gate
          if (!(cell.row === 8 && cell.col === 8)) {
            count++;
          }
        }
      });
    });
    return count === 2;
  }
  

  areAligned(coords) {
    if (coords.length < 3) return false;
    const [a, b, c] = coords;
    const sameRow = a.row === b.row && b.row === c.row;
    const sameCol = a.col === b.col && b.col === c.col;
    const sameDiag1 = (a.row - a.col) === (b.row - b.col) && (b.row - b.col) === (c.row - c.col);
    const sameDiag2 = (a.row + a.col) === (b.row + b.col) && (b.row + b.col) === (c.row + c.col);
    return sameRow || sameCol || sameDiag1 || sameDiag2;
  }

  isEnemyWithinTwoSteps(game, player, sourceRow, sourceCol) {
    const enemies = this.getAllEnemyTiles(game, player);
  
    return enemies.some(enemy => {
      const sameRow = enemy.row === sourceRow && Math.abs(enemy.col - sourceCol) <= 2;
      const sameCol = enemy.col === sourceCol && Math.abs(enemy.row - sourceRow) <= 2;
      return sameRow || sameCol;
    });
  }
  

  getAllTiles(game) {
    const tiles = [];
    game.board.cells.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.hasTile()) {
          tiles.push({
            owner: cell.tile.ownerName,
            code: cell.tile.code,
            row: r,
            col: c
          });
        }
      });
    });
    return tiles;
  }
  

  getAllEnemyTiles(game, player) {
    const enemies = [];
    game.board.cells.forEach(row => {
      row.forEach(cell => {
        if (
          cell.hasTile() &&
          cell.tile.ownerName !== player &&
          ['W', 'F', 'E', 'A', 'S', 'M', 'L'].includes(cell.tile.code)
        ) {
          enemies.push({
            code: cell.tile.code,
            row: cell.row,
            col: cell.col
          });
        }
      });
    });
    return enemies;
  }
  

}