import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import captured from '../Rules/City/captured';
import created from '../Rules/City/created';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import unitDestroyed from '@civ-clone/civ1-unit/Rules/Unit/destroyed';

describe('city:captured', (): void => {
  const ruleRegistry = new RuleRegistry(),
    unitRegistry = new UnitRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry();

  ruleRegistry.register(
    ...captured(
      cityRegistry,
      unitRegistry,
      cityGrowthRegistry,
      cityBuildRegistry
    ),
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry
    ),
    ...shrink(cityGrowthRegistry),
    ...unitCreated(unitRegistry),
    ...unitDestroyed(unitRegistry)
  );

  it('should cause a city to lose a population point', (): void => {
    const city = setUpCity({
        size: 2,
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
      }),
      enemy = new Player(),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    expect(cityGrowth.size()).to.equal(2);

    city.capture(enemy);

    expect(cityGrowth.size()).to.equal(1);
    expect(city.player()).to.equal(enemy);
  });

  it('should destroy all of the cities units', (): void => {
    const city = setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
      }),
      enemy = new Player(),
      unit = new Warrior(city, city.player(), city.tile(), ruleRegistry);

    unitRegistry.register(unit);

    city.capture(enemy);

    expect(unit.destroyed()).to.true;
    expect(unitRegistry.entries().includes(unit)).to.false;

    unitRegistry.unregister(unit);
  });

  it('should clear build progress', (): void => {
    const city = setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
      }),
      enemy = new Player(),
      cityBuild = cityBuildRegistry.getByCity(city);

    expect(cityBuild.progress().value()).to.equal(0);

    cityBuild.progress().add(10);

    expect(cityBuild.progress().value()).to.equal(10);

    city.capture(enemy);

    expect(cityBuild.progress().value()).to.equal(0);
  });
});
