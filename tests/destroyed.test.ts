import {
  Irrigation,
  Road,
} from '@civ-clone/base-terrain-civ1/TileImprovements';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import created from '../Rules/City/created';
import destroyed from '../Rules/City/destroyed';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';

describe('city:destroyed', (): void => {
  const ruleRegistry = new RuleRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityRegistry = new CityRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry();

  ruleRegistry.register(
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry
    ),
    ...destroyed(tileImprovementRegistry, cityRegistry)
  );

  it('should remove irrigation from the city tile', (): void => {
    const city = setUpCity({
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

    expect(
      tileImprovementRegistry
        .getByTile(city.tile())
        .some((improvement) => improvement instanceof Road)
    ).to.true;
  });

  it('should be removed from the CityRegistry', (): void => {
    const city = setUpCity({
      ruleRegistry,
      tileImprovementRegistry,
      cityGrowthRegistry,
    });

    expect(cityRegistry.entries()).to.include(city);

    city.destroy();

    expect(cityRegistry.entries()).to.not.include(city);
  });
});
