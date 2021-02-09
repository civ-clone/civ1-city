import {
  Anarchy,
  Communism,
  Democracy,
  Despotism,
  Monarchy,
  Republic,
} from '@civ-clone/civ1-government/Governments';
import { Food, Production } from '@civ-clone/civ1-world/Yields';
import { Settlers, Warrior } from '@civ-clone/civ1-unit/Units';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Government from '@civ-clone/core-government/Government';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import added from '@civ-clone/civ1-government/Rules/Player/added';
import cost from '../Rules/City/cost';
import created from '../Rules/City/created';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import Yield from '@civ-clone/core-yield/Yield';

describe('city:cost', (): void => {
  const ruleRegistry = new RuleRegistry(),
    playerGovernmentRegistry = new PlayerGovernmentRegistry(),
    unitRegistry = new UnitRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry();

  ruleRegistry.register(
    ...added(playerGovernmentRegistry, ruleRegistry),
    ...cost(playerGovernmentRegistry, unitRegistry, cityGrowthRegistry),
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry
    ),
    ...unitCreated(unitRegistry)
  );

  it('should cost 2 Food to feed each population point', (): void => {
    const city = setUpCity({
        ruleRegistry,
        cityGrowthRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      cityYields = city.yields([Food]),
      [cityFood] = cityYields.filter(
        (cityYield: Yield): boolean => cityYield instanceof Food
      );

    expect(cityFood.value()).to.equal(-2);

    [-4, -6, -8, -10, -12, -14, -16, -18, -20].forEach(
      (value: number): void => {
        cityGrowth.grow();

        const [updatedCityFood] = city
          .yields([Food])
          .filter((cityYield: Yield): boolean => cityYield instanceof Food);

        expect(updatedCityFood.value()).to.equal(value);
      }
    );
  });

  it('should cost Food to support each Settlers', (): void => {
    const city = setUpCity({
        ruleRegistry,
        cityGrowthRegistry,
      }),
      playerGovernment = playerGovernmentRegistry.getByPlayer(city.player());

    new Settlers(city, city.player(), city.tile(), ruleRegistry);

    // -2 for food cost and -1/-2 for each unit cost
    ([
      [Anarchy, -3],
      [Communism, -4],
      [Democracy, -4],
      [Despotism, -3],
      [Monarchy, -4],
      [Republic, -4],
    ] as [typeof Government, number][]).forEach(
      ([TargetGovernment, expectedCost]): void => {
        playerGovernment.set(new TargetGovernment());

        const yields = city.yields([Food]);

        expect(yields[0].value()).to.equal(expectedCost);
      }
    );
  });

  it('should cost Production to support military units', (): void => {
    const city = setUpCity({
        ruleRegistry,
        cityGrowthRegistry,
      }),
      playerGovernment = playerGovernmentRegistry.getByPlayer(city.player());

    new Warrior(city, city.player(), city.tile(), ruleRegistry);
    new Warrior(city, city.player(), city.tile(), ruleRegistry);

    ([
      [Anarchy, -1],
      [Communism, -2],
      [Democracy, -2],
      [Despotism, -1],
      [Monarchy, -2],
      [Republic, -2],
    ] as [typeof Government, number][]).forEach(
      ([TargetGovernment, expectedCost]): void => {
        playerGovernment.set(new TargetGovernment());

        const yields = city.yields([Production]);

        expect(
          yields[0].value(),
          `expected to cost ${expectedCost} for 2 Warriors under ${TargetGovernment.name}`
        ).to.equal(expectedCost);
      }
    );
  });
});
