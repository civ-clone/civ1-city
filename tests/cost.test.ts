import {
  Anarchy,
  Communism,
  Democracy,
  Despotism,
  Monarchy,
  Republic,
} from '@civ-clone/civ1-government/Governments';
import {
  Corruption,
  PopulationSupportFood,
  Trade,
  UnitSupportFood,
  UnitSupportProduction,
} from '../Yields';
import { Settlers, Warrior } from '@civ-clone/civ1-unit/Units';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Courthouse from '@civ-clone/base-city-improvement-courthouse/Courthouse';
import Effect from '@civ-clone/core-rule/Effect';
import Government from '@civ-clone/core-government/Government';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import cityCost from '../Rules/City/cost';
import cityCreated from '../Rules/City/created';
import cityYield from '../Rules/City/yield';
import { expect } from 'chai';
import playerAdded from '@civ-clone/civ1-government/Rules/Player/added';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import setUpCity from './lib/setUpCity';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import Priority from '@civ-clone/core-rule/Priority';

describe('city:cost', (): void => {
  const ruleRegistry = new RuleRegistry(),
    availableGovernmentRegistry = new AvailableGovernmentRegistry(),
    playerGovernmentRegistry = new PlayerGovernmentRegistry(),
    unitRegistry = new UnitRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry(),
    cityImprovementRegistry = new CityImprovementRegistry();

  ruleRegistry.register(
    ...playerAdded(
      availableGovernmentRegistry,
      playerGovernmentRegistry,
      ruleRegistry
    ),
    new YieldRule(new Priority(0), new Effect(() => new Trade(8))),
    ...cityYield(cityImprovementRegistry, playerGovernmentRegistry),
    ...cityCost(cityGrowthRegistry, playerGovernmentRegistry, unitRegistry),
    ...cityCreated(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry,
      playerWorldRegistry,
      ruleRegistry
    ),
    ...unitCreated(unitRegistry)
  );

  it('should cost 2 Food to feed each population point', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      cityYields = city.yields(),
      [cityFood] = cityYields.filter(
        (cityYield: Yield): boolean =>
          cityYield instanceof PopulationSupportFood
      );

    expect(cityFood.value()).to.equal(-2);

    [4, 6, 8, 10, 12, 14, 16, 18, 20].forEach((value: number): void => {
      cityGrowth.grow();

      const [updatedCityFood] = city
        .yields()
        .filter(
          (cityYield: Yield): boolean =>
            cityYield instanceof PopulationSupportFood
        );

      expect(updatedCityFood.value()).to.equal(-value);
    });
  });

  it('should cost Food to support each Settlers', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
      }),
      playerGovernment = playerGovernmentRegistry.getByPlayer(city.player());

    new Settlers(city, city.player(), city.tile(), ruleRegistry);

    // -2 for food cost and -1/-2 for each unit cost
    (
      [
        [Anarchy, 1],
        [Communism, 2],
        [Democracy, 2],
        [Despotism, 1],
        [Monarchy, 2],
        [Republic, 2],
      ] as [typeof Government, number][]
    ).forEach(([TargetGovernment, expectedCost]): void => {
      playerGovernment.set(new TargetGovernment());

      const [unitFoodSupport] = city
        .yields()
        .filter((cityYield) => cityYield instanceof UnitSupportFood);

      expect(unitFoodSupport.value()).to.equal(-expectedCost);
    });
  });

  it('should cost Production to support military units', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
      }),
      playerGovernment = playerGovernmentRegistry.getByPlayer(city.player());

    new Warrior(city, city.player(), city.tile(), ruleRegistry);
    new Warrior(city, city.player(), city.tile(), ruleRegistry);

    (
      [
        [Anarchy, 1],
        [Communism, 2],
        [Democracy, 2],
        [Despotism, 1],
        [Monarchy, 2],
        [Republic, 2],
      ] as [typeof Government, number][]
    ).forEach(([TargetGovernment, expectedCost]): void => {
      playerGovernment.set(new TargetGovernment());

      const unitSupportProduction = city
        .yields()
        .filter((cityYield) => cityYield instanceof UnitSupportProduction)
        .reduce((baseYield, cityYield) => {
          baseYield.add(cityYield.value());

          return baseYield;
        }, new Yield());

      expect(
        unitSupportProduction.value(),
        `expected to cost ${expectedCost} for 2 Warriors under ${TargetGovernment.name}`
      ).to.equal(-expectedCost);
    });
  });

  (
    [
      [Anarchy, 0, 6, 6, 8, true],
      [Communism, 1, 1, 1, 1, true],
      [Democracy, 0, 0, 0, 0, true],
      [Despotism, 0, 4, 4, 5, true],
      [Monarchy, 0, 3, 3, 4, true],
      [Republic, 0, 2, 2, 2, true],

      [Anarchy, 8, 8, 8, 8, false],
      [Communism, 1, 1, 1, 1, false],
      [Democracy, 0, 0, 0, 0, false],
      [Despotism, 6, 6, 6, 6, false],
      [Monarchy, 4, 4, 4, 4, false],
      [Republic, 3, 3, 3, 3, false],
    ] as [typeof Government, number, number, number, number, boolean][]
  ).forEach(
    ([
      GovernmentType,
      capitalCorruption,
      city1Corruption,
      city2Corruption,
      city3Corruption,
      hasCapital,
    ]) =>
      it(`should yield expected Corruption under ${GovernmentType.name}${
        hasCapital ? '' : ' without a capital city'
      }`, async (): Promise<void> => {
        const world = await generateWorld(
            generateGenerator(50, 50, Grassland),
            ruleRegistry
          ),
          capital = await setUpCity({
            playerWorldRegistry,
            ruleRegistry,
            tile: world.get(2, 2),
            world,
          }),
          otherCity1 = await setUpCity({
            player: capital.player(),
            playerWorldRegistry,
            ruleRegistry,
            tile: world.get(22, 4),
            world,
          }),
          otherCity2 = await setUpCity({
            player: capital.player(),
            playerWorldRegistry,
            ruleRegistry,
            tile: world.get(4, 22),
            world,
          }),
          otherCity3 = await setUpCity({
            player: capital.player(),
            playerWorldRegistry,
            ruleRegistry,
            tile: world.get(22, 22),
            world,
          }),
          playerGovernment = playerGovernmentRegistry.getByPlayer(
            capital.player()
          );

        if (hasCapital) {
          cityImprovementRegistry.register(new Palace(capital, ruleRegistry));
        }

        playerGovernment.set(new GovernmentType());

        const actualCapitalCorruption = reduceYield(
            capital.yields(),
            Corruption
          ),
          actualCity1Corruption = reduceYield(otherCity1.yields(), Corruption),
          actualCity2Corruption = reduceYield(otherCity2.yields(), Corruption),
          actualCity3Corruption = reduceYield(otherCity3.yields(), Corruption);

        expect(actualCapitalCorruption).equal(-capitalCorruption);
        expect(actualCity1Corruption).equal(-city1Corruption);
        expect(actualCity2Corruption).equal(-city2Corruption);
        expect(actualCity3Corruption).equal(-city3Corruption);
      })
  );
});
