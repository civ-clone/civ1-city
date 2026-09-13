import cityBuildingComplete from './Rules/City/building-complete';
import cityCanBeWorked from './Rules/City/can-be-worked';
import cityCaptured from './Rules/City/captured';
import cityCost from './Rules/City/cost';
import cityCreated from './Rules/City/created';
import cityDestroyed from './Rules/City/destroyed';
import cityFoodExhausted from './Rules/City/food-exhausted';
import cityFoodStorage from './Rules/City/food-storage';
import cityGrow from './Rules/City/grow';
import cityGrowthCost from './Rules/City/growth-cost';
import cityProcessYield from './Rules/City/process-yield';
import cityShrink from './Rules/City/shrink';
import cityTileReassigned from './Rules/City/tile-reassigned';
import cityTiles from './Rules/City/tiles';
import cityYield from './Rules/City/yield';
import playerAction from './Rules/Player/action';
import unitDefeated from './Rules/Unit/defeated';
import unitMoved from './Rules/Unit/moved';
import unitUnsupported from './Rules/Unit/unsupported';
import { Game, defaultGame } from '@civ-clone/core-game';

export const register = (game: Game): void =>
  game.rules.register(
    ...cityBuildingComplete(game.engine),
    ...cityCanBeWorked(game.cities, game.units, game.workedTiles),
    ...cityCaptured(
      game.cities,
      game.units,
      game.cityGrowth,
      game.cityBuilds,
      game.engine,
      game.playerWorlds,
      game.workedTiles
    ),
    ...cityCost(game.cityGrowth, game.playerGovernments, game.units),
    ...cityCreated(
      game.tileImprovements,
      game.cityBuilds,
      game.cityGrowth,
      game.cities,
      game.playerWorlds,
      game.rules,
      game.availableCityBuildItems,
      game.engine,
      game.workedTiles
    ),
    ...cityDestroyed(
      game.tileImprovements,
      game.cities,
      game.engine,
      game.units,
      game.workedTiles
    ),
    ...cityFoodExhausted(),
    ...cityFoodStorage(game.rules),
    ...cityGrow(game.cityGrowth, game.playerWorlds, game.workedTiles),
    ...cityGrowthCost(),
    ...cityProcessYield(
      game.cityBuilds,
      game.cityGrowth,
      game.units,
      game.rules
    ),
    ...cityShrink(game.cityGrowth, game.playerWorlds, game.workedTiles),
    ...cityTiles(),
    ...cityTileReassigned(game.playerWorlds, game.cityGrowth, game.workedTiles),
    ...cityYield(game.cityImprovements, game.playerGovernments),
    ...playerAction(game.cityBuilds, game.cities),
    ...unitDefeated(game.cities, game.cityGrowth, game.engine),
    ...unitMoved(game.rules, game.workedTiles),
    ...unitUnsupported()
  );

// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
register(defaultGame);

export default register;
