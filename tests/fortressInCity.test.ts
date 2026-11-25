import { Fortress } from '@civ-clone/civ1-world/TileImprovements';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Engine from '@civ-clone/core-engine/Engine';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import { Hills } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import built from '../Rules/TileImprovement/built';
import { expect } from 'chai';
import worldBuilt from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import worldRemoved from '@civ-clone/civ1-world/Rules/TileImprovement/removed';

// Settlers part-way through a Fortress when a city is founded on their square finish it into nothing, as v474.05
//  stops the job once a city is there (civ-clone/web-renderer#388).
describe('tile-improvement:built: no Fortress in a city', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      engine = new Engine(),
      events: string[] = [];

    ruleRegistry.register(
      // As a game has them: civ1-world's registered first, civ1-city's after.
      ...worldBuilt(tileImprovementRegistry, engine),
      ...worldRemoved(tileImprovementRegistry, engine),
      ...built(cityRegistry, ruleRegistry, tileImprovementRegistry)
    );

    const world = await generateWorld(
      generateGenerator(5, 5, Hills),
      ruleRegistry
    );

    engine.on('tile-improvement:built', () => events.push('built'));
    engine.on('tile-improvement:removed', () => events.push('removed'));

    return {
      cityRegistry,
      events,
      ruleRegistry,
      tileImprovementRegistry,
      world,
    };
  };

  it('takes away a Fortress finished on a city square, telling the renderer', async (): Promise<void> => {
    const {
        cityRegistry,
        events,
        ruleRegistry,
        tileImprovementRegistry,
        world,
      } = await setUp(),
      tile = world.get(2, 2);

    cityRegistry.register(
      new City(new Player(ruleRegistry), tile, '', ruleRegistry)
    );

    new Fortress(tile, ruleRegistry);

    expect(
      tileImprovementRegistry
        .getByTile(tile)
        .filter(
          (improvement: TileImprovement) => improvement instanceof Fortress
        ).length
    ).to.equal(0);
    expect(events).to.eql(['built', 'removed']);
  });

  it('leaves a Fortress anywhere else', async (): Promise<void> => {
    const { events, ruleRegistry, tileImprovementRegistry, world } =
        await setUp(),
      tile = world.get(2, 2),
      fortress = new Fortress(tile, ruleRegistry);

    const [only, ...others] = tileImprovementRegistry.getByTile(tile);

    expect(only).to.equal(fortress);
    expect(others).to.have.lengthOf(0);
    expect(events).to.eql(['built']);
  });
});
