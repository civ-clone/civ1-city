import {
  Anarchy,
  Communism,
  Democracy,
  Despotism,
  Monarchy,
  Republic,
} from '@civ-clone/base-government-civ1/Governments';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Food, Production } from '../../Yields';
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
import { Fortifiable } from '@civ-clone/base-unit-civ1/Types';
import { Settlers } from '@civ-clone/base-unit-civ1/Units';
import Unit from '@civ-clone/core-unit/Unit';
import Yield from '@civ-clone/core-yield/Yield';

export const getRules: (
  playerGovernmentRegistry?: PlayerGovernmentRegistry,
  unitRegistry?: UnitRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => Cost[] = (
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): Cost[] => [
  new Cost(
    new Criterion((tileYield: Yield): boolean => tileYield instanceof Food),
    new Effect((tileYield: Yield, city: City): void => {
      const cityGrowth = cityGrowthRegistry.getByCity(city);

      tileYield.subtract(cityGrowth.size() * 2, 'population-cost');
    })
  ),

  new Cost(
    new Criterion((tileYield: Yield): boolean => tileYield instanceof Food),
    new Criterion((tileYield: Yield, city: City): boolean =>
      unitRegistry
        .getByCity(city)
        .some((unit: Unit): boolean => unit instanceof Settlers)
    ),
    new Criterion((tileYield: Yield, city: City): boolean =>
      playerGovernmentRegistry.getByPlayer(city.player()).is(Anarchy, Despotism)
    ),
    new Effect((tileYield: Yield, city: City): void =>
      tileYield.subtract(
        unitRegistry
          .getByCity(city)
          .filter((unit: Unit): boolean => unit instanceof Settlers).length,
        'settlers-support'
      )
    )
  ),

  new Cost(
    new Criterion((tileYield: Yield): boolean => tileYield instanceof Food),
    new Criterion((tileYield: Yield, city: City): boolean =>
      unitRegistry
        .getByCity(city)
        .some((unit: Unit): boolean => unit instanceof Settlers)
    ),
    new Criterion((tileYield: Yield, city: City): boolean =>
      playerGovernmentRegistry
        .getByPlayer(city.player())
        .is(Communism, Democracy, Monarchy, Republic)
    ),
    new Effect((tileYield: Yield, city: City): void =>
      tileYield.subtract(
        2 *
          unitRegistry
            .getByCity(city)
            .filter((unit: Unit): boolean => unit instanceof Settlers).length,
        'settlers-support'
      )
    )
  ),

  new Cost(
    new Criterion(
      (tileYield: Yield): boolean => tileYield instanceof Production
    ),
    new Criterion((tileYield: Yield, city: City): boolean =>
      playerGovernmentRegistry.getByPlayer(city.player()).is(Anarchy, Despotism)
    ),
    new Criterion((tileYield: Yield, city: City): boolean => {
      const cityGrowth = cityGrowthRegistry.getByCity(city);

      return (
        unitRegistry
          .getByCity(city)
          .filter((unit: Unit): boolean => unit instanceof Fortifiable).length >
        cityGrowth.size()
      );
    }),
    new Effect((tileYield: Yield, city: City): void => {
      const cityGrowth = cityGrowthRegistry.getByCity(city);

      tileYield.subtract(
        Math.abs(
          cityGrowth.size() -
            unitRegistry
              .getByCity(city)
              .filter((unit: Unit): boolean => unit instanceof Fortifiable)
              .length
        ),
        'unit-support'
      );
    })
  ),

  new Cost(
    new Criterion(
      (tileYield: Yield): boolean => tileYield instanceof Production
    ),
    new Criterion((tileYield: Yield, city: City): boolean =>
      playerGovernmentRegistry
        .getByPlayer(city.player())
        .is(Communism, Democracy, Monarchy, Republic)
    ),
    new Criterion((tileYield: Yield, city: City): boolean =>
      unitRegistry
        .getByCity(city)
        .some((unit: Unit): boolean => unit instanceof Fortifiable)
    ),
    new Effect((tileYield: Yield, city: City): void =>
      tileYield.subtract(
        unitRegistry
          .getByCity(city)
          .filter((unit: Unit): boolean => unit instanceof Fortifiable).length,
        'unit-support'
      )
    )
  ),
];

export default getRules;
