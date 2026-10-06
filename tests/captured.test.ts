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
import InciteRevolt from '@civ-clone/base-unit-action-incite-revolt/InciteRevolt';
import defectingUnits from '@civ-clone/civ1-unit/Rules/City/captured';
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
    ...unitDestroyed(unitRegistry),
    // civ1-unit's, which brings an incited city's units over.
    ...defectingUnits(cityRegistry, unitRegistry, cityGrowthRegistry)
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

  it("should disband the city's supported units, but not those that have gone over to the capturer", async (): Promise<void> => {
    const city = await setUpCity({
        size: 3,
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      enemy = new Player(),
      defector = new Warrior(city, city.player(), city.tile(), ruleRegistry),
      loyal = new Warrior(city, city.player(), city.tile(), ruleRegistry);

    playerWorldRegistry.register(
      new PlayerWorld(enemy, city.tile().map(), ruleRegistry)
    );
    unitRegistry.register(defector, loyal);

    // As an incited city's nearby units do, before the city changes hands (civ1-unit's `defecting-units`).
    defector.transfer(enemy, city);

    city.capture(enemy);

    expect(defector.destroyed()).to.false;
    expect(loyal.destroyed()).to.true;

    unitRegistry.unregister(defector, loyal);
  });

  it('should keep the units an incited city of size 1 brings over, though the city is destroyed', async (): Promise<void> => {
    const city = await setUpCity({
        ruleRegistry,
        tileImprovementRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      }),
      enemy = new Player(),
      garrison = new Warrior(city, city.player(), city.tile(), ruleRegistry),
      // Only the cause's class matters to the rules.
      incite = Object.create(InciteRevolt.prototype);

    playerWorldRegistry.register(
      new PlayerWorld(enemy, city.tile().map(), ruleRegistry)
    );
    unitRegistry.register(garrison);

    city.capture(enemy, incite);

    expect(city.destroyed()).to.true;
    expect(garrison.destroyed()).to.false;
    expect(garrison.player()).to.equal(enemy);
    expect(garrison.city()).to.null;

    unitRegistry.unregister(garrison);
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
