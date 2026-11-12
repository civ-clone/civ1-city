import {
  Air,
  Diplomatic,
  Fortifiable,
  Naval,
  Worker,
} from '@civ-clone/civ1-unit/Types';
import {
  Anarchy,
  Communism,
  Democracy,
  Despotism,
  Monarchy,
  Republic,
} from '@civ-clone/civ1-government/Governments';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Government from '@civ-clone/core-government/Government';
import PopulationSupportFood from '@civ-clone/base-city-yield-population-support-food/PopulationSupportFood';
import { Settlers } from '@civ-clone/civ1-unit/Units';
import Unit from '@civ-clone/core-unit/Unit';
import Yield from '@civ-clone/core-yield/Yield';
import {
  exceedsFreeSupport,
  foodSupport,
  isSupportedBy,
  productionSupport,
} from '@civ-clone/base-government-unit-support/lib/unitSupport';
import { isUnderGovernment } from '@civ-clone/base-government-unit-support/lib/government';

// Diplomats and Caravans cost no shield under any government, and don't use up a free unit under Anarchy or Despotism
//  (v474.05: OpenCivOne `CityWorker.cs` L422-L430).
const supported = isSupportedBy(
  [Air, Fortifiable, Naval, Worker],
  [Diplomatic]
);

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  unitRegistry?: UnitRegistry
) => Cost[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Cost[] => [
  new Cost(
    'civ1-city:city/cost/population-support-food',
    new Effect(
      (city: City): Yield =>
        new PopulationSupportFood(cityGrowthRegistry.getByCity(city).size() * 2)
    )
  ),

  ...(
    [
      [Settlers, 1, Anarchy, Despotism],
      [Settlers, 2, Communism, Democracy, Monarchy, Republic],
    ] as [typeof Unit, number, ...(typeof Government)[]][]
  ).map(
    ([UnitType, cost, ...governments]) =>
      new Cost(
        `civ1-city:city/cost/unit-support-food/${UnitType.name}/${cost}`,
        new Criterion((city: City): boolean =>
          unitRegistry
            .getByCity(city)
            .some((unit: Unit): boolean => unit instanceof UnitType)
        ),
        new Criterion((city: City): boolean =>
          isUnderGovernment(city, governments, playerGovernmentRegistry)
        ),
        new Effect((city: City): Yield[] =>
          foodSupport(
            unitRegistry.getByCity(city),
            (unit: Unit): boolean => unit instanceof UnitType,
            cost
          )
        )
      )
  ),

  new Cost(
    'civ1-city:city/cost/unit-support-production/anarchy-despotism',
    new Criterion((city: City): boolean =>
      isUnderGovernment(city, [Anarchy, Despotism], playerGovernmentRegistry)
    ),
    // As many units as the city has citizens are free.
    new Criterion((city: City): boolean =>
      exceedsFreeSupport(
        unitRegistry.getByCity(city),
        supported,
        cityGrowthRegistry.getByCity(city).size()
      )
    ),
    new Effect((city: City): Yield[] =>
      productionSupport(
        unitRegistry.getByCity(city),
        supported,
        cityGrowthRegistry.getByCity(city).size(),
        1
      )
    )
  ),

  new Cost(
    'civ1-city:city/cost/unit-support-production/communism-democracy-monarchy-republic',
    new Criterion((city: City): boolean =>
      isUnderGovernment(
        city,
        [Communism, Democracy, Monarchy, Republic],
        playerGovernmentRegistry
      )
    ),
    new Effect((city: City): Yield[] =>
      productionSupport(unitRegistry.getByCity(city), supported, 0, 1)
    )
  ),
];

export default getRules;
