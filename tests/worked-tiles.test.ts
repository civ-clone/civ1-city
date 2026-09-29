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
import turnStart from '../Rules/Player/turn-start';
import setUpCity from './lib/setUpCity';
import { expect } from 'chai';
import Tile from '@civ-clone/core-world/Tile';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import Player from '@civ-clone/core-player/Player';
import Action from '@civ-clone/core-unit/Action';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import { citizenCount } from '../lib/assignWorkers';
import { instance as cityGrowthRegistryInstance } from '@civ-clone/core-city-growth/CityGrowthRegistry';

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
    ...moved(ruleRegistry, workedTileRegistry),
    ...turnStart(cityRegistry, unitRegistry, workedTileRegistry, ruleRegistry)
  );

  const moveTo = (unit: Warrior, to: Tile): void => {
    const from = unit.tile();

    unit.setTile(to);
    ruleRegistry.process(Moved, unit, new Action(from, to, unit, ruleRegistry));
  };

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
  it('should release a worked `Tile` when an enemy `Unit` stops on it with moves left', async () => {
    const city = await setUpCity({
        size: 3,
        ruleRegistry,
        workedTileRegistry,
      }),
      [targetTile] = city
        .tilesWorked()
        .entries()
        .filter((tile) => tile !== city.tile()),
      unit = new Warrior(
        null,
        new Player(ruleRegistry),
        city.tile(),
        ruleRegistry
      );

    unitRegistry.register(unit);
    unit.moves().set(1);

    moveTo(unit, targetTile);

    expect(unit.moves().value()).to.equal(1);
    expect(city.tilesWorked().entries()).not.include(targetTile);
    expect(citizenCount(city, workedTileRegistry)).to.equal(
      cityGrowthRegistryInstance.getByCity(city).size() + 1
    );
  });

  it('should not release a worked `Tile` when a `Unit` of the same `Player` moves onto it', async () => {
    const city = await setUpCity({
        size: 3,
        ruleRegistry,
        workedTileRegistry,
      }),
      [targetTile] = city
        .tilesWorked()
        .entries()
        .filter((tile) => tile !== city.tile()),
      unit = new Warrior(city, city.player(), city.tile(), ruleRegistry);

    unitRegistry.register(unit);

    moveTo(unit, targetTile);

    expect(city.tilesWorked().entries()).include(targetTile);
  });

  it('should not release the `City` centre when an enemy `Unit` moves onto it', async () => {
    const city = await setUpCity({
        size: 3,
        ruleRegistry,
        workedTileRegistry,
      }),
      [neighbour] = city.tiles().entries(),
      unit = new Warrior(
        null,
        new Player(ruleRegistry),
        neighbour,
        ruleRegistry
      );

    unitRegistry.register(unit);

    moveTo(unit, city.tile());

    expect(city.tilesWorked().entries()).include(city.tile());
  });

  it('should release worked `Tile`s occupied by an enemy `Unit` at the start of the turn, before the yields are processed, and offer them again once it has left', async () => {
    const city = await setUpCity({
        size: 3,
        ruleRegistry,
        workedTileRegistry,
      }),
      [freeTile] = city
        .tiles()
        .entries()
        .filter((tile) => !workedTileRegistry.tileIsWorked(tile)),
      enemy = new Player(ruleRegistry),
      unit = new Warrior(null, enemy, freeTile, ruleRegistry),
      // Neither of these is released: a `City` always works its centre, and its own `Unit`s don't block it.
      enemyOnCentre = new Warrior(null, enemy, city.tile(), ruleRegistry),
      [friendlyTile] = city
        .tilesWorked()
        .entries()
        .filter((tile) => tile !== city.tile()),
      friendlyUnit = new Warrior(
        city,
        city.player(),
        friendlyTile,
        ruleRegistry
      );

    let workedWhenYieldsProcessed: boolean | null = null;

    // Stands in for `civ1-player:player/turn-start/process-city-yields`, which is `High`.
    ruleRegistry.register(
      new TurnStart(
        new High(),
        new Effect((player: Player): void => {
          if (player === city.player()) {
            workedWhenYieldsProcessed =
              workedTileRegistry.getByTile(freeTile)?.city() === city;
          }
        })
      )
    );

    // A worked `Tile` with an enemy `Unit` already on it, as a loaded game can have: no `Moved` rule has run.
    unitRegistry.register(unit, enemyOnCentre, friendlyUnit);
    workedTileRegistry.unregister(
      workedTileRegistry
        .getByCity(city)
        .find(
          (workedTile) =>
            workedTile.tile() !== city.tile() &&
            workedTile.tile() !== friendlyTile
        )!
    );
    workedTileRegistry.register(new WorkedTile(freeTile, city));

    expect(city.tilesWorked().entries()).include(freeTile);

    // Released and taken straight back would look the same by `Tile`, so compare the `WorkedTile`s themselves.
    const centreWorkedTile = workedTileRegistry.getByTile(city.tile()),
      friendlyWorkedTile = workedTileRegistry.getByTile(friendlyTile);

    ruleRegistry.process(TurnStart, city.player());

    expect(workedWhenYieldsProcessed).to.equal(false);
    expect(city.tilesWorked().entries()).not.include(freeTile);
    expect(
      workedTileRegistry.getByTile(city.tile()) === centreWorkedTile,
      'the centre was released'
    ).to.be.true;
    expect(
      workedTileRegistry.getByTile(friendlyTile) === friendlyWorkedTile,
      'the tile under a friendly unit was released'
    ).to.be.true;
    expect(citizenCount(city, workedTileRegistry)).to.equal(
      cityGrowthRegistryInstance.getByCity(city).size() + 1
    );
    expect(workedTileRegistry.tileCanBeWorkedBy(freeTile, city)).to.be.false;

    moveTo(
      unit,
      city
        .tiles()
        .entries()
        .find(
          (tile) => tile !== freeTile && !workedTileRegistry.tileIsWorked(tile)
        )!
    );

    expect(workedTileRegistry.tileCanBeWorkedBy(freeTile, city)).to.be.true;
  });
});
