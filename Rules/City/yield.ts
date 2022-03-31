import { Air, Fortifiable, Naval, Worker } from '@civ-clone/civ1-unit/Types';
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
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Government from '@civ-clone/core-government/Government';
import PopulationSupportFood from '@civ-clone/base-city-yield-population-support-food/PopulationSupportFood';
import Priority from '@civ-clone/core-rule/Priority';
import { Settlers } from '@civ-clone/civ1-unit/Units';
import Unit from '@civ-clone/core-unit/Unit';
import UnitSupportFood from '@civ-clone/base-city-yield-unit-support-food/UnitSupportFood';
import UnitSupportProduction from '@civ-clone/base-city-yield-unit-support-production/UnitSupportProduction';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';

export const getRules: (
  cityGrowthRegistry?: CityGrowthRegistry,
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  unitRegistry?: UnitRegistry
) => YieldRule[] = (
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): YieldRule[] => [
  new YieldRule(
    new Priority(0), // X High
    new Effect((city: City) =>
      city
        .tilesWorked()
        .entries()
        .flatMap((tile) =>
          tile.yields(city.player()).flatMap(
            (tileYield: Yield) =>
              new (tileYield.constructor as typeof Yield)(
                tileYield.value(),
                tile.id() +
                  ': ' +
                  tileYield
                    .values()
                    .map(([, provider]) => provider)
                    .join('-')
              )
          )
        )
    )
  ),

  new YieldRule(
    new Effect(
      (city: City): Yield =>
        new PopulationSupportFood(cityGrowthRegistry.getByCity(city).size() * 2)
    )
  ),

  ...(
    [
      [Settlers, 1, Anarchy, Despotism],
      [Settlers, 2, Communism, Democracy, Monarchy, Republic],
    ] as [typeof Unit, number, ...typeof Government[]][]
  ).map(
    ([UnitType, cost, ...governments]) =>
      new YieldRule(
        new Criterion((city: City): boolean =>
          unitRegistry
            .getByCity(city)
            .some((unit: Unit): boolean => unit instanceof UnitType)
        ),
        new Criterion((city: City): boolean =>
          playerGovernmentRegistry.getByPlayer(city.player()).is(...governments)
        ),
        new Effect((city: City): Yield[] =>
          unitRegistry
            .getByCity(city)
            .filter((unit: Unit): boolean => unit instanceof UnitType)
            .map((unit: Unit) => new UnitSupportFood(cost, unit) as Yield)
        )
      )
  ),

  new YieldRule(
    new Criterion((city: City): boolean =>
      playerGovernmentRegistry.getByPlayer(city.player()).is(Anarchy, Despotism)
    ),
    new Criterion((city: City): boolean => {
      const cityGrowth = cityGrowthRegistry.getByCity(city);

      return (
        unitRegistry
          .getByCity(city)
          .filter((unit: Unit): boolean =>
            [Air, Fortifiable, Naval, Worker].some(
              (UnitType) => unit instanceof UnitType
            )
          ).length > cityGrowth.size()
      );
    }),
    new Effect((city: City): Yield[] => {
      const cityGrowth = cityGrowthRegistry.getByCity(city);

      return unitRegistry
        .getByCity(city)
        .filter((unit: Unit): boolean =>
          [Air, Fortifiable, Naval, Worker].some(
            (UnitType) => unit instanceof UnitType
          )
        )
        .slice(cityGrowth.size())
        .map((unit) => new UnitSupportProduction(1, unit) as Yield);
    })
  ),

  new YieldRule(
    new Criterion((city: City): boolean =>
      playerGovernmentRegistry
        .getByPlayer(city.player())
        .is(Communism, Democracy, Monarchy, Republic)
    ),
    new Effect((city: City): Yield[] =>
      unitRegistry
        .getByCity(city)
        .filter((unit: Unit): boolean =>
          [Air, Fortifiable, Naval, Worker].some(
            (UnitType) => unit instanceof UnitType
          )
        )
        .map((unit) => new UnitSupportProduction(1, unit) as Yield)
    )
  ),
];

export default getRules;
