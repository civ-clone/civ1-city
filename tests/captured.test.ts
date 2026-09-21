import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import captured from '../Rules/City/captured';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import created from '../Rules/City/created';
import destroyed from '../Rules/City/destroyed';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';
import tileReassigned from '../Rules/City/tile-reassigned';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import unitDestroyed from '@civ-clone/civ1-unit/Rules/Unit/destroyed';

describe('city:captured', (): void => {
  const ruleRegistry = new RuleRegistry(),
    unitRegistry = new UnitRegistry(),
    cityRegistry = new CityRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry(),
    workedTileRegistry = new WorkedTileRegistry(ruleRegistry);

  ruleRegistry.register(
    ...captured(
      cityRegistry,
      unitRegistry,
      cityGrowthRegistry,
      cityBuildRegistry,
      undefined,
      playerWorldRegistry,
      workedTileRegistry
    ),
    ...created(
      tileImprovementRegistry,
      cityBuildRegistry,
      cityGrowthRegistry,
      cityRegistry,
      playerWorldRegistry,
      ruleRegistry,
      undefined,
      undefined,
      workedTileRegistry
    ),
    ...destroyed(
      tileImprovementRegistry,
      cityRegistry,
      undefined,
      unitRegistry,
      workedTileRegistry
    ),
    ...shrink(cityGrowthRegistry, playerWorldRegistry, workedTileRegistry),
    ...tileReassigned(
      playerWorldRegistry,
      cityGrowthRegistry,
      workedTileRegistry
    ),
    ...unitCreated(unitRegistry),
    ...unitDestroyed(unitRegistry)
  );

  it('should cause a city to lose a population point', async (): Promise<void> => {
    const city = await setUpCity({
        size: 2,
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      enemy = new Player(),
      world = city.tile().map(),
      enemyWorld = new PlayerWorld(enemy, world, ruleRegistry),
      cityGrowth = cityGrowthRegistry.getByCity(city);

    playerWorldRegistry.register(enemyWorld);

    expect(cityGrowth.size()).to.equal(2);

    city.capture(enemy);

    expect(cityGrowth.size()).to.equal(1);
    expect(city.player()).to.equal(enemy);
  });

  it('should destroy all of the `City`s units', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      enemy = new Player(),
      unit = new Warrior(city, city.player(), city.tile(), ruleRegistry);

    // `captured` looks up a `PlayerWorld` for the capturing player. It used to
    // find one only because another test file had left it in the singleton.
    playerWorldRegistry.register(
      new PlayerWorld(enemy, city.tile().map(), ruleRegistry)
    );

    unitRegistry.register(unit);

    city.capture(enemy);

    expect(unit.destroyed()).to.true;

    unitRegistry.unregister(unit);
  });

  it('should clear build progress', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      enemy = new Player(),
      cityBuild = cityBuildRegistry.getByCity(city);

    playerWorldRegistry.register(
      new PlayerWorld(enemy, city.tile().map(), ruleRegistry)
    );

    expect(cityBuild.progress().value()).to.equal(0);

    cityBuild.progress().add(10);

    expect(cityBuild.progress().value()).to.equal(10);

    city.capture(enemy);

    expect(cityBuild.progress().value()).to.equal(0);
  });

  it('should not leave a destroyed `City` working any tiles', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      enemy = new Player();

    playerWorldRegistry.register(
      new PlayerWorld(enemy, city.tile().map(), ruleRegistry)
    );

    expect(workedTileRegistry.getByCity(city)).to.not.be.empty;

    // Capturing a size 1 `City` shrinks it to nothing, which destroys it and
    // releases its tiles: `reassign-workers` used to hand it its centre back.
    city.capture(enemy);

    expect(city.destroyed()).to.true;
    expect(workedTileRegistry.getByCity(city)).to.be.empty;
  });

  it('should not give a destroyed `City` a tile when a new `City` is founded on its site', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      world = city.tile().map();

    city.destroy();

    // The centre tile a destroyed `City` was left holding before the fix
    // above, as it would still be in an existing save.
    workedTileRegistry.register(new WorkedTile(city.tile(), city));

    const newCity = await setUpCity({
      ruleRegistry,
      tileImprovementRegistry,
      cityGrowthRegistry,
      playerWorldRegistry,
      workedTileRegistry,
      world,
      tile: city.tile(),
    });

    // Founding takes the centre back and processes `TileReassigned` for the
    // destroyed `City`, which used to give it the best tile that was left.
    expect(workedTileRegistry.getByCity(city)).to.be.empty;
    expect(workedTileRegistry.getByTile(city.tile())?.city()).to.equal(newCity);
  });
});
