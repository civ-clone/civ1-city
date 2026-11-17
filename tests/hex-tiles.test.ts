import City from '@civ-clone/core-city/City';
import FillGenerator from '@civ-clone/core-world/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Tileset from '@civ-clone/core-world/Tileset';
import { TopologyId } from '@civ-clone/core-world/Topology';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { fatCross } from '@civ-clone/base-city-tiles-fat-cross/lib/fatCross';
import { rings } from '@civ-clone/base-city-tiles-rings/lib/rings';
import tiles from '../Rules/City/tiles';

describe('civ1-city:city/tiles/fat-cross on each grid', () => {
  const [rule] = tiles(),
    // The rule only asks the city for its tile.
    cityTiles = (tile: Tile): Tile[] =>
      (
        rule.process({ tile: () => tile } as unknown as City) as Tileset
      ).entries(),
    buildWorld = (
      width: number,
      height: number,
      topologyId: TopologyId
    ): Promise<World> =>
      new World(
        new FillGenerator(height, width, Grassland, { topologyId }),
        new RuleRegistry()
      ).build(),
    same = (actual: Tile[], expected: Tile[]): boolean =>
      actual.length === expected.length &&
      actual.every((tile: Tile, i: number): boolean => tile === expected[i]);

  it('is the 19-tile hex of 2 rings on the hexagonal grid, as it always was there', async () => {
    const world = await buildWorld(10, 8, 'hex-odd-r');

    world.forEach((tile: Tile): void => {
      const actual = cityTiles(tile);

      expect(actual.length).equal(19);
      expect(
        same(actual, rings(tile, 2).entries()),
        `at ${tile.x()}, ${tile.y()}`
      ).true;
      expect(
        same(actual, fatCross(tile).entries()),
        `at ${tile.x()}, ${tile.y()}`
      ).true;
    });
  });

  (['square', 'staggered-iso'] as TopologyId[]).forEach((topologyId) =>
    it(`is the 21-tile fat cross on the ${topologyId} grid`, async () => {
      const world = await buildWorld(10, 8, topologyId);

      world.forEach((tile: Tile): void => {
        const actual = cityTiles(tile);

        expect(actual.length).equal(21);
        expect(same(actual, fatCross(tile).entries())).true;
      });
    })
  );
});
