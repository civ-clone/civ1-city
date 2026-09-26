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
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import { citizenCount, releaseCitizens } from '../../lib/assignWorkers';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry
) => Shrink[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance
): Shrink[] => [
  new Shrink(
    'civ1-city:city/shrink/set-growth-cost',
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() > 0),
    new Effect((cityGrowth: CityGrowth): void =>
      cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'city-shrink')
    )
  ),

  new Shrink(
    'civ1-city:city/shrink/reduce-workers',
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() > 0),
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        citizenCount(
          cityGrowth.city(),
          workedTileRegistry,
          specialistRegistry
        ) >
        cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      releaseCitizens(
        cityGrowth.city(),
        cityGrowth,
        workedTileRegistry,
        specialistRegistry
      )
    )
  ),

  // TODO: this needs to potentially be associated to an attacking user...
  new Shrink(
    'civ1-city:city/shrink/destroy-empty-city',
    new Criterion((cityGrowth: CityGrowth): boolean => cityGrowth.size() <= 0),
    new Effect((cityGrowth: CityGrowth): void => cityGrowth.city().destroy())
  ),
];

export default getRules;
