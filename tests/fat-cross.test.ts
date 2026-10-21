import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import City from '@civ-clone/core-city/City';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Tileset from '@civ-clone/core-world/Tileset';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import tiles from '../Rules/City/tiles';

describe('civ1-city:city/tiles/fat-cross', () => {
  const [rule] = tiles(),
    // The rule only asks the city for its tile.
    fatCross = (tile: Tile): Tile[] =>
      (
        rule.process({ tile: () => tile } as unknown as City) as Tileset
      ).entries(),
    // The rule as it was before it went through the world's topology: the 5x5
    // box from `getSurroundingArea(2)`, which is x-major, without positions 0,
    // 4, 20 and 24, its four corners.
    indexedFatCross = (tile: Tile): Tile[] =>
      tile
        .getSurroundingArea(2)
        .filter(
          (tile: Tile, i: number): boolean => ![0, 4, 20, 24].includes(i)
        ),
    // `generateGenerator` takes the height first.
    buildWorld = (width: number, height: number): Promise<World> =>
      generateWorld(
        generateGenerator(height, width, Grassland),
        new RuleRegistry()
      ),
    coordinates = (tiles: Tile[]): [number, number][] =>
      tiles.map((tile: Tile): [number, number] => [tile.x(), tile.y()]),
    sortedKeys = (tiles: Tile[]): string[] =>
      tiles.map((tile: Tile): string => `${tile.x()},${tile.y()}`).sort();

  it('is the 5x5 box without its corners, in x-major order', async () => {
    const world = await buildWorld(40, 25),
      cross: [number, number][] = [];

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
          continue;
        }

        cross.push([10 + dx, 10 + dy]);
      }
    }

    expect(coordinates(fatCross(world.get(10, 10)))).eql(cross);
  });

  (
    [
      [5, 5],
      [5, 7],
      [7, 5],
      [6, 6],
      [9, 11],
      [40, 25],
      [80, 50],
    ] as [number, number][]
  ).forEach(([width, height]: [number, number]): void =>
    it(`is the same tiles, in the same order, as the indexed rule for every tile of a ${width}x${height} world`, async () => {
      const world = await buildWorld(width, height);
      let checked = 0,
        onASeam = 0;

      world.forEach((tile: Tile): void => {
        const expected = indexedFatCross(tile),
          actual = fatCross(tile);

        expect(actual.length).equal(21);
        expect(new Set(actual).size).equal(21);
        expect(coordinates(actual), `at ${tile.x()}, ${tile.y()}`).eql(
          coordinates(expected)
        );
        expect(
          actual.every(
            (actualTile: Tile, i: number): boolean => actualTile === expected[i]
          )
        ).true;

        checked++;

        if (
          tile.x() < 2 ||
          tile.x() >= width - 2 ||
          tile.y() < 2 ||
          tile.y() >= height - 2
        ) {
          onASeam++;
        }
      });

      expect(checked).equal(width * height);
      // Including every tile within two of an edge, whose cross wraps across
      // a seam.
      expect(onASeam).equal(
        width * height - Math.max(0, width - 4) * Math.max(0, height - 4)
      );
    })
  );

  it('is every tile within reach, once each, on a world smaller than 5x5', async () => {
    for (let width = 1; width <= 6; width++) {
      for (let height = 1; height <= 6; height++) {
        if (width >= 5 && height >= 5) {
          continue;
        }

        const world = await buildWorld(width, height);

        world.forEach((tile: Tile): void => {
          const actual = fatCross(tile),
            inReach = world.filter(
              (other: Tile): boolean => tile.distanceFrom(other) < 2.5
            );

          expect(new Set(actual).size, `${width}x${height}`).equal(
            actual.length
          );
          expect(sortedKeys(actual), `${width}x${height}`).eql(
            sortedKeys(inReach)
          );
        });
      }
    }
  });
});
