import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';
import Tile from '@civ-clone/core-world/Tile';
import assignWorkers, {
  assignWorker,
  reduceWorkers,
  sortTiles,
} from '../../lib/assignWorkers';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Grow[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): Grow[] => [
  new Grow(
    'civ1-city:city/grow/empty-food-store',
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.empty())
  ),
  new Grow(
    'civ1-city:city/grow/set-growth-cost',
    new Effect((cityGrowth: CityGrowth): void =>
      cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-grow')
    )
  ),
  new Grow(
    'civ1-city:city/grow/assign-worker',
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.city().tilesWorked().length < cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      assignWorker(
        cityGrowth.city(),
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry
      )
    )
  ),

  new Grow(
    'civ1-city:city/grow/reduce-workers',
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.city().tilesWorked().length > cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      reduceWorkers(cityGrowth.city(), cityGrowth).forEach((tile: Tile): void =>
        workedTileRegistry.unregisterByTile(tile)
      )
    )
  ),
];

export default getRules;
