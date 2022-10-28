import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';

export const getRules: () => YieldRule[] = (): YieldRule[] => [
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
