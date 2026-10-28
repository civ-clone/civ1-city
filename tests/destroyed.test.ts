import { Irrigation, Road } from '@civ-clone/civ1-world/TileImprovements';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import created from '../Rules/City/created';
import destroyed from '../Rules/City/destroyed';
import Engine from '@civ-clone/core-engine/Engine';
import removed from '@civ-clone/civ1-world/Rules/TileImprovement/removed';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';

describe('city:destroyed', (): void => {
  const ruleRegistry = new RuleRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityRegistry = new CityRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    engine = new Engine(),
    removedImprovements: string[] = [];

  engine.on('tile-improvement:removed', (tile, improvement) =>
    removedImprovements.push(improvement.constructor.name)
  );

  ruleRegistry.register(
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry
    ),
    ...destroyed(
      tileImprovementRegistry,
      cityRegistry,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      ruleRegistry
    ),
    ...removed(tileImprovementRegistry, engine)
  );

  it('should remove irrigation from the city tile', async (): Promise<void> => {
    const city = await setUpCity({
      ruleRegistry,
      tileImprovementRegistry,
      cityGrowthRegistry,
    });

    expect(
      tileImprovementRegistry
        .getByTile(city.tile())
        .some((improvement) => improvement instanceof Irrigation)
    ).to.true;

    expect(
      tileImprovementRegistry
        .getByTile(city.tile())
        .some((improvement) => improvement instanceof Road)
    ).to.true;

    city.destroy();

    expect(
      tileImprovementRegistry
        .getByTile(city.tile())
        .some((improvement) => improvement instanceof Irrigation)
    ).to.false;

    // Through the `Removed` rules, so whoever shows the square hears of it.
    expect(removedImprovements).to.deep.equal(['Irrigation']);

    expect(
      tileImprovementRegistry
        .getByTile(city.tile())
        .some((improvement) => improvement instanceof Road)
    ).to.true;
  });

  it('should be removed from the CityRegistry', async (): Promise<void> => {
    const city = await setUpCity({
      ruleRegistry,
      tileImprovementRegistry,
      cityGrowthRegistry,
    });

    expect(cityRegistry.entries()).to.include(city);

    city.destroy();

    expect(city.destroyed()).true;
  });
});
