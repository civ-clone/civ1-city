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
import assignWorkers from '../../lib/assignWorkers';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry
) => Grow[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance
): Grow[] => [
  new Grow(new Effect((cityGrowth: CityGrowth): void => cityGrowth.empty())),
  new Grow(
    new Effect((cityGrowth: CityGrowth): void =>
      cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-grow')
    )
  ),
  new Grow(
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.city().tilesWorked().length < cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      assignWorkers(cityGrowth.city(), playerWorldRegistry, cityGrowthRegistry)
    )
  ),
  new Grow(
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.city().tilesWorked().length > cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      cityGrowth
        .city()
        .tilesWorked()
        .entries()
        .slice(cityGrowth.size() + 1)
        .forEach((tile: Tile): void =>
          cityGrowth.city().tilesWorked().unregister(tile)
        )
    )
  ),
];

export default getRules;
