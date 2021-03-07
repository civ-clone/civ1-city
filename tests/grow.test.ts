import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import { Food } from '@civ-clone/civ1-world/Yields';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import created from '../Rules/City/created';
import { expect } from 'chai';
import foodStorage from '../Rules/City/food-storage';
import grow from '../Rules/City/grow';
import setUpCity from './lib/setUpCity';
import growthCost from '../Rules/City/growth-cost';

describe('city:grow', (): void => {
  const ruleRegistry = new RuleRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityRegistry = new CityRegistry(),
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
    ...growthCost()
  );

  it('should cause a city to grow when the food cost is met', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    expect(cityGrowth.progress().value()).to.equal(0);
    expect(cityGrowth.cost().value()).to.equal(20);

    ([
      [2, 2, 20],
      [2, 4, 20],
      [12, 16, 20],
      [2, 18, 20],
      [2, 0, 30],
      [2, 2, 30],
      [26, 28, 30],
      [2, 0, 40],
    ] as [number, number, number][]).forEach(
      ([yieldValue, expectedProgress, expectedCost]): void => {
        cityGrowth.add(new Food(yieldValue));

        cityGrowth.check();

        expect(
          cityGrowth.progress().value(),
          `Progress should be ${expectedProgress}`
        ).to.equal(expectedProgress);
        expect(
          cityGrowth.cost().value(),
          `Cost should be ${expectedCost}`
        ).to.equal(expectedCost);
        expect(
          city.tilesWorked().length,
          `Number of tilesWorked should be ${cityGrowth.size() + 1}`
        ).to.equal(cityGrowth.size() + 1);
      }
    );
  });
});
