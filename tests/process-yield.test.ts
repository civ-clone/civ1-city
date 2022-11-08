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
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerAdded from '@civ-clone/core-player/Rules/Added';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TerrainFeatureRegistry from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import buildCost from '@civ-clone/civ1-unit/Rules/City/buildCost';
import cityYield from '../Rules/City/yield';
import cost from '../Rules/City/cost';
import created from '../Rules/City/created';
import { expect } from 'chai';
import foodExhausted from '../Rules/City/food-exhausted';
import foodStorage from '../Rules/City/food-storage';
import grow from '../Rules/City/grow';
import growthCost from '../Rules/City/growth-cost';
import processYield from '../Rules/City/process-yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';
import tileYield from '@civ-clone/civ1-world/Rules/Tile/yield';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import unitDestroyed from '@civ-clone/civ1-unit/Rules/Unit/destroyed';
import unitUnsupported from '../Rules/Unit/unsupported';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';

describe('city:process-yield', (): void => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    unitRegistry = new UnitRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry(),
    playerGovernmentRegistry = new PlayerGovernmentRegistry(),
    availableGovernmentRegistry = new AvailableGovernmentRegistry(),
    terrainFeatureRegistry = new TerrainFeatureRegistry(),
    cityImprovementRegistry = new CityImprovementRegistry();

  availableGovernmentRegistry.register(
    Anarchy,
    Communism,
    Democracy,
    Despotism,
    Monarchy,
    Republic
  );

  ruleRegistry.register(
    new PlayerAdded(
      new Effect((player: Player) => {
        const playerGovernment = new PlayerGovernment(
          player,
          availableGovernmentRegistry,
          ruleRegistry
        );

        playerGovernmentRegistry.register(playerGovernment);

        playerGovernment.set(new Despotism());
      })
    ),
    ...buildCost(),
    ...cityYield(cityImprovementRegistry, playerGovernmentRegistry),
    ...cost(cityGrowthRegistry, playerGovernmentRegistry, unitRegistry),
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry,
      playerWorldRegistry,
      ruleRegistry
    ),
    ...foodExhausted(),
    ...foodStorage(ruleRegistry),
    ...grow(cityGrowthRegistry, playerWorldRegistry),
    ...growthCost(),
    ...processYield(
      cityBuildRegistry,
      cityGrowthRegistry,
      unitRegistry,
      ruleRegistry
    ),
    ...shrink(cityGrowthRegistry, playerWorldRegistry),
    ...tileYield(
      tileImprovementRegistry,
      terrainFeatureRegistry,
      playerGovernmentRegistry
    ),
    ...unitCreated(unitRegistry),
    ...unitDestroyed(unitRegistry),
    ...unitUnsupported()
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

    ruleRegistry.process(ProcessYield, cityYield, city, city.yields());

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
    expect(cityGrowth.progress().value()).to.equal(0);

    ruleRegistry.process(ProcessYield, cityYield, city, city.yields());

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

    ruleRegistry.process(ProcessYield, new Production(2), city, city.yields());

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
      unsupportedUnit1 = new Warrior(
        city,
        city.player(),
        city.tile(),
        ruleRegistry
      ),
      unsupportedUnit2 = new Warrior(
        city,
        city.player(),
        city.tile(),
        ruleRegistry
      );

    expect(unitRegistry.getByCity(city).length).equal(3);
    expect(supportedUnit.destroyed()).to.false;
    expect(unsupportedUnit1.destroyed()).to.false;
    expect(unsupportedUnit2.destroyed()).to.false;

    ruleRegistry.process(ProcessYield, cityYield, city, city.yields());
    expect(unitRegistry.getByCity(city).length).equal(2);

    expect(supportedUnit.destroyed()).to.false;
    expect(unsupportedUnit1.destroyed()).to.true;
    expect(unsupportedUnit2.destroyed()).to.false;
  });

  it('should cost Food to support Settlers', async () => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      food1 = reduceYield(city.yields(), Food);

    expect(food1).equal(2);

    const unit1 = new Settlers(city, city.player(), city.tile(), ruleRegistry),
      food2 = reduceYield(city.yields(), Food);

    expect(food2).equal(1);

    const unit2 = new Settlers(city, city.player(), city.tile(), ruleRegistry),
      unit3 = new Settlers(city, city.player(), city.tile(), ruleRegistry);

    unit1.setTile(city.tiles().entries()[1]);

    unit3.setTile(city.tiles().entries()[2]);

    unit3.setTile(city.tiles().entries()[7]);

    const food3 = reduceYield(city.yields(), Food);

    expect(food3).equal(-1);

    ruleRegistry.process(ProcessYield, new Food(food3), city, city.yields());

    const food4 = reduceYield(city.yields(), Food);

    expect(food4).equal(0);
    expect(unitRegistry.getByCity(city).length).equal(2);
    expect(unit1.destroyed()).equal(true);
    expect(unit2.destroyed()).equal(false);
    expect(unit3.destroyed()).equal(false);
  });
});
