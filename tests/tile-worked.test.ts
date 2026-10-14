import City from '@civ-clone/core-city/City';
import Engine from '@civ-clone/core-engine/Engine';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import { expect } from 'chai';
import { instance as cityGrowthRegistryInstance } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import grow from '../Rules/City/grow';
import setUpCity from './lib/setUpCity';
import tileReleased from '../Rules/City/tile-released';
import tileWorked from '../Rules/City/tile-worked';

describe('city:tile-worked and city:tile-released', (): void => {
  const setUp = () => {
    const engine = new Engine(),
      ruleRegistry = new RuleRegistry(),
      workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
      events: [string, City, Tile][] = [];

    ruleRegistry.register(...tileWorked(engine), ...tileReleased(engine));

    ['city:tile-worked', 'city:tile-released'].forEach((event: string) =>
      engine.on(event, (city: City, tile: Tile): number =>
        events.push([event, city, tile])
      )
    );

    return { events, ruleRegistry, workedTileRegistry };
  };

  it('should be emitted as a tile starts and stops being worked', async (): Promise<void> => {
    const { events, ruleRegistry, workedTileRegistry } = setUp(),
      city = await setUpCity({ ruleRegistry, workedTileRegistry }),
      [tile] = city.tiles().entries();

    workedTileRegistry.register(new WorkedTile(tile, city));
    workedTileRegistry.unregisterByTile(tile);

    expect(events).to.deep.equal([
      ['city:tile-worked', city, tile],
      ['city:tile-released', city, tile],
    ]);
  });

  it('should be emitted for the tile a growing city starts working', async (): Promise<void> => {
    const { events, ruleRegistry, workedTileRegistry } = setUp(),
      city = await setUpCity({ ruleRegistry, workedTileRegistry });

    ruleRegistry.register(...grow(undefined, undefined, workedTileRegistry));
    workedTileRegistry.register(new WorkedTile(city.tile(), city));
    events.splice(0);

    cityGrowthRegistryInstance.getByCity(city).grow();

    const worked = workedTileRegistry
      .getByCity(city)
      .map((workedTile: WorkedTile): Tile => workedTile.tile())
      .filter((tile: Tile): boolean => tile !== city.tile());

    expect(worked).not.to.be.empty;
    expect(events).to.deep.equal(
      worked.map((tile: Tile) => ['city:tile-worked', city, tile])
    );
  });
});
