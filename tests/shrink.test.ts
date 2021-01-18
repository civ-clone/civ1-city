import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import { Food } from '@civ-clone/base-terrain-civ1/Yields';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import created from '../Rules/City/created';
import { expect } from 'chai';
import foodStorage from '../Rules/City/food-storage';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';
import grow from '../Rules/City/grow';

describe('city:shrink', (): void => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry();

  ruleRegistry.register(
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
    ...shrink(cityGrowthRegistry, playerWorldRegistry)
  );

  it('should empty the food storage', (): void => {
    const city = setUpCity({
        size: 10,
        ruleRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    [0, 0, 0, 0, 0, 0, 0, 0, 0].forEach((value): void => {
      cityGrowth.add(new Food(cityGrowth.cost()));

      cityGrowth.shrink();

      expect(cityGrowth.progress().value()).to.equal(value);
    });

    expect(cityGrowth.size()).to.equal(1);

    cityGrowth.shrink();

    expect(cityRegistry).to.not.include(city);
  });
});
