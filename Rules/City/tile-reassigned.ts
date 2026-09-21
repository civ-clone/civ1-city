import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import assignWorkers from '../../lib/assignWorkers';

export const getRules = (
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): TileReassigned[] => [
  new TileReassigned(
    'civ1-city:city/tile-reassigned/assign-workers',
    // A destroyed `City` can still be holding a tile it should not be (a new `City` founded on its site takes its
    // centre back and processes this), but must not be given another.
    new Criterion((city: City): boolean => !city.destroyed()),
    new Effect((city: City): void =>
      assignWorkers(
        city,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry
      )
    )
  ),
];

export default getRules;
