import {
  AvailableSpecialistRegistry,
  instance as availableSpecialistRegistryInstance,
} from '@civ-clone/core-city/AvailableSpecialistRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import {
  addSpecialist,
  assignWorker,
  citizenCount,
  releaseCitizens,
} from '../../lib/assignWorkers';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';

// From a city's 21st citizen, new citizens are born as Entertainers: p240, Wilson, J.L & Emrich A. (1992). Sid Meier's
// Civilization, or Rome on 640K a Day. Rocklin, CA: Prima Publishing
const largestWorkingSize = 20;

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Grow[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
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
        cityGrowth.size() <= largestWorkingSize
    ),
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        citizenCount(
          cityGrowth.city(),
          workedTileRegistry,
          specialistRegistry
        ) <
        cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void =>
      assignWorker(
        cityGrowth.city(),
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
        specialistRegistry,
        availableSpecialistRegistry
      )
    )
  ),

  new Grow(
    'civ1-city:city/grow/born-entertainer',
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        cityGrowth.size() > largestWorkingSize
    ),
    new Criterion(
      (cityGrowth: CityGrowth): boolean =>
        citizenCount(
          cityGrowth.city(),
          workedTileRegistry,
          specialistRegistry
        ) <
        cityGrowth.size() + 1
    ),
    new Effect((cityGrowth: CityGrowth): void => {
      addSpecialist(
        cityGrowth.city(),
        specialistRegistry,
        availableSpecialistRegistry
      );
    })
  ),

  new Grow(
    'civ1-city:city/grow/reduce-workers',
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
];

export default getRules;
