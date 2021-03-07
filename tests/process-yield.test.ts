import { Food, Production } from '@civ-clone/civ1-world/Yields';
import {
  ProcessYield,
  IProcessYieldRegistry,
} from '@civ-clone/core-city/Rules/ProcessYield';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import buildCost from '@civ-clone/civ1-unit/Rules/City/buildCost';
import created from '../Rules/City/created';
import { expect } from 'chai';
import foodStorage from '../Rules/City/food-storage';
import grow from '../Rules/City/grow';
import processYield from '../Rules/City/process-yield';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import unitDestroyed from '@civ-clone/civ1-unit/Rules/Unit/destroyed';
import growthCost from '../Rules/City/growth-cost';

describe('city:process-yield', (): void => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    unitRegistry = new UnitRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry();

  ruleRegistry.register(
    ...buildCost(),
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry,
      playerWorldRegistry,
      ruleRegistry
    ),
    ...foodStorage(),
    ...grow(cityGrowthRegistry, playerWorldRegistry),
    ...growthCost(),
    ...processYield(cityBuildRegistry, cityGrowthRegistry, unitRegistry),
    ...shrink(cityGrowthRegistry, playerWorldRegistry),
    ...unitCreated(unitRegistry),
    ...unitDestroyed(unitRegistry)
  );

  it('should cause a city to grow when the food cost is met', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      cityYield = new Food(20),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    expect(cityGrowth.size()).to.equal(1);

    (ruleRegistry as IProcessYieldRegistry).process(
      ProcessYield,
      cityYield,
      city
    );

    expect(cityGrowth.size()).to.equal(2);
  });

  it('should cause a city to shrink when the food store is depleted', async (): Promise<void> => {
    const city = await setUpCity({
        size: 2,
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      cityYield = new Food(-1),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    expect(cityGrowth.size()).to.equal(2);

    (ruleRegistry as IProcessYieldRegistry).process(
      ProcessYield,
      cityYield,
      city
    );

    expect(cityGrowth.size()).to.equal(1);
  });

  it('should cause a city to accrue Production when surplus is available', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      cityBuild = cityBuildRegistry.getByCity(city);

    (ruleRegistry as IProcessYieldRegistry).process(
      ProcessYield,
      new Production(2),
      city
    );

    expect(cityBuild.progress().value()).to.equal(2);
  });

  it('should cause units to be destroyed in a city where there is not enough Production to support them', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      cityYield = new Production(-1),
      supportedUnit = new Warrior(
        city,
        city.player(),
        city.tile(),
        ruleRegistry
      ),
      unsupportedUnit = new Warrior(
        city,
        city.player(),
        city.tile(),
        ruleRegistry
      );

    expect(supportedUnit.destroyed()).to.false;
    expect(unsupportedUnit.destroyed()).to.false;

    (ruleRegistry as IProcessYieldRegistry).process(
      ProcessYield,
      cityYield,
      city
    );

    expect(supportedUnit.destroyed()).to.false;
    expect(unsupportedUnit.destroyed()).to.true;
  });
});
