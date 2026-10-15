import City from '@civ-clone/core-city/City';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Engine from '@civ-clone/core-engine/Engine';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import { expect } from 'chai';
import foodExhausted from '../Rules/City/food-exhausted';
import grow from '../Rules/City/grow';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';

// The events a renderer redraws a city from, and announces famine by (civ-clone/web-renderer#400).
describe('city:grow, city:shrink and city:food-storage-exhausted', (): void => {
  const setUp = async (size: number) => {
    const ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      playerWorldRegistry = new PlayerWorldRegistry(),
      workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
      events: [string, City, unknown][] = [];

    ruleRegistry.register(
      ...foodExhausted(engine),
      ...grow(
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
        undefined,
        undefined,
        engine
      ),
      ...shrink(
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
        undefined,
        engine
      )
    );

    const city = await setUpCity({
        size,
        ruleRegistry,
        tileImprovementRegistry: new TileImprovementRegistry(),
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    ['city:grow', 'city:shrink', 'city:food-storage-exhausted'].forEach(
      (event) =>
        engine.on(event, (city: City, cause: unknown = undefined) =>
          events.push([event, city, cause])
        )
    );

    return { city, cityGrowth, events, ruleRegistry };
  };

  it('should emit city:grow once, with the city, when it grows', async (): Promise<void> => {
    const { city, cityGrowth, events } = await setUp(1);

    cityGrowth.grow();

    expect(events).to.deep.equal([['city:grow', city, null]]);
  });

  it('should emit city:shrink once, with the city and what caused it, when it shrinks', async (): Promise<void> => {
    const { city, cityGrowth, events } = await setUp(3);

    const cause = {};

    cityGrowth.shrink(cause);

    expect(cityGrowth.size()).to.equal(2);
    expect(events).to.deep.equal([['city:shrink', city, cause]]);
  });

  it('should not emit city:shrink for a city shrunk to nothing', async (): Promise<void> => {
    const { cityGrowth, events } = await setUp(1);

    cityGrowth.shrink();

    expect(cityGrowth.size()).to.equal(0);
    expect(events).to.deep.equal([]);
  });

  it('should announce the famine before the city shrinks, and shrink it for famine', async (): Promise<void> => {
    const { city, cityGrowth, events, ruleRegistry } = await setUp(2);

    ruleRegistry.process(FoodExhausted, cityGrowth);

    expect(cityGrowth.size()).to.equal(1);
    expect(events).to.deep.equal([
      ['city:food-storage-exhausted', city, undefined],
      ['city:shrink', city, FoodExhausted],
    ]);
  });
});
