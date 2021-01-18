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
import Shrink from '@civ-clone/core-city-growth/Rules/Shrink';
import Tile from '@civ-clone/core-world/Tile';
import assignWorkers from '../../lib/assignWorkers';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry
) => Shrink[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance
): Shrink[] => [
  new Shrink(
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() > 0),
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.empty())
  ),
  new Shrink(
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() > 0),
    new Effect((cityGrowth: CityGrowth): void =>
      cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-shrink')
    )
  ),
  new Shrink(
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() > 0),
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
  new Shrink(
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() > 0),
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.city().tilesWorked().length < cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      assignWorkers(cityGrowth.city(), playerWorldRegistry, cityGrowthRegistry)
    )
  ),
  new Shrink(
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() === 0),
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.city().destroy())
  ),
];

export default getRules;
