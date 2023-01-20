import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import canBeWorked from '../Rules/City/can-be-worked';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import created from '../Rules/City/created';
import grow from '../Rules/City/grow';
import tileReassigned from '../Rules/City/tile-reassigned';
import tiles from '../Rules/City/tiles';
import moved from '../Rules/Unit/moved';
import setUpCity from './lib/setUpCity';
import { expect } from 'chai';
import Tile from '@civ-clone/core-world/Tile';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import Player from '@civ-clone/core-player/Player';
import Action from '@civ-clone/core-unit/Action';
import Moved from '@civ-clone/core-unit/Rules/Moved';

describe('City.workedTiles', () => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    unitRegistry = new UnitRegistry(),
    workedTileRegistry = new WorkedTileRegistry(ruleRegistry);

  ruleRegistry.register(
    ...canBeWorked(cityRegistry, unitRegistry, workedTileRegistry),
    ...created(
      undefined,
      undefined,
      undefined,
      cityRegistry,
      undefined,
      ruleRegistry,
      undefined,
      undefined,
      workedTileRegistry
    ),
    ...grow(undefined, undefined, workedTileRegistry),
    ...tileReassigned(undefined, undefined, workedTileRegistry),
    ...tiles(),
    ...moved(ruleRegistry, workedTileRegistry)
  );

  it('should generate the "fat cross" pattern for `City.tiles()`', async () => {
    const city = await setUpCity({
      ruleRegistry,
      workedTileRegistry,
    });

    expect(
      city
        .tiles()
        .entries()
        .map((tile: Tile) => [tile.x(), tile.y()])
    ).eql([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [3, 4],
      [4, 1],
      [4, 2],
      [4, 3],
    ]);
  });

  it('should have `Tile`s reassigned when blocked, or use by another `City`', async () => {
    const city = await setUpCity({
      size: 3,
      ruleRegistry,
      workedTileRegistry,
    });

    const [firstTargetTile, secondTargetTile] = city.tiles().entries();

    expect(
      city
        .tilesWorked()
        .entries()
        .map((tile: Tile) => [tile.x(), tile.y()])
    ).eql([
      [2, 2],
      [0, 1],
      [0, 2],
      [0, 3],
    ]);

    const unit = new Warrior(
      null,
      new Player(ruleRegistry),
      firstTargetTile,
      ruleRegistry
    );

    unitRegistry.register(unit);
    unit.setTile(firstTargetTile);
    ruleRegistry.process(
      Moved,
      unit,
      new Action(unit.tile(), firstTargetTile, unit, ruleRegistry)
    );

    expect(city.tilesWorked().entries()).not.include(unit.tile());

    unit.setTile(secondTargetTile);
    ruleRegistry.process(
      Moved,
      unit,
      new Action(firstTargetTile, secondTargetTile, unit, ruleRegistry)
    );

    expect(city.tilesWorked().entries()).not.include(unit.tile());

    const enemyCity = await setUpCity({
      player: unit.player(),
      ruleRegistry,
      workedTileRegistry,
    });
  });
});
