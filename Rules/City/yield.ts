import {
  Anarchy,
  Communism,
  Democracy,
  Despotism,
  Monarchy,
  Republic,
} from '@civ-clone/civ1-government/Governments';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { Corruption, Trade } from '../../Yields';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Government from '@civ-clone/core-government/Government';
import { High } from '@civ-clone/core-rule/Priorities';
import { Palace } from '@civ-clone/library-city/CityImprovements';
import Priority from '@civ-clone/core-rule/Priority';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export const getRules: (
  cityImprovementRegistry?: CityImprovementRegistry,
  playerGovernmentRegistry?: PlayerGovernmentRegistry
) => YieldRule[] = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance
): YieldRule[] => [
  new YieldRule(
    new High(),
    new Effect((city: City, yields: Yield[]) => {
      // Corruption Formula: p223-224, Wilson, J.L & Emrich A. (1992). Sid Meier's Civilization, or Rome on 640K a Day. Rocklin, CA: Prima Publishing
      const playerGovernment = playerGovernmentRegistry.getByPlayer(
          city.player()
        ),
        [capital] = cityImprovementRegistry
          .filter(
            (cityImprovement) =>
              cityImprovement instanceof Palace &&
              city.player() === cityImprovement.city().player()
          )
          .map((cityImprovement) => cityImprovement.city()),
        currentTrade = reduceYield(yields, Trade),
        distanceFromCapital = playerGovernment.is(Communism)
          ? 10
          : playerGovernment.is(Democracy)
          ? 0
          : capital
          ? capital.tile().distanceFrom(city.tile())
          : 32,
        // These values could be provided by `Rule`s to allow other government types to be created
        [governmentModifier] = (
          [
            [Anarchy, 8],
            [Communism, 20],
            [Democracy, 0],
            [Despotism, 12],
            [Monarchy, 16],
            [Republic, 24],
          ] as [typeof Government, number][]
        )
          .filter(([GovernmentType]) => playerGovernment.is(GovernmentType))
          .map(([, modifier]) => modifier);

      return new Corruption(
        governmentModifier
          ? // Assuming `floor` here, although it might be `round`ed... Need to check in Civ.
            Math.min(
              Math.floor(
                (currentTrade * distanceFromCapital * 3) /
                  (10 * governmentModifier)
              ),
              currentTrade
            )
          : 0,
        distanceFromCapital.toFixed(2)
      );
    })
  ),

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
];

export default getRules;
