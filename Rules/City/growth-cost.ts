import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { levelOf, productionRatio } from '@civ-clone/civ1-difficulty/level';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Cost from '@civ-clone/core-city-growth/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';

// A city grows at (size + 1) × the player's production ratio: 10 for the human, and 16 down to 8 for the computer
//  players, Chieftain to Emperor (v474.05 `CityWorker.cs` L217-L224).
export const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  clientRegistry?: ClientRegistry
) => Cost[] = (
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
): Cost[] => [
  new Cost(
    'civ1-city:city/growth-cost/by-size',
    new Effect(
      (cityGrowth: CityGrowth): number =>
        productionRatio(
          levelOf(gameDifficultyRegistry),
          isHuman(cityGrowth.city().player(), clientRegistry)
        ) *
        (cityGrowth.size() + 1)
    )
  ),
];

export default getRules;
