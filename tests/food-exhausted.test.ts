import {
  Anarchy,
  Despotism,
  Monarchy,
} from '@civ-clone/civ1-government/Governments';
import { Food, UnitSupportFood } from '../Yields';
import { Settlers, Warrior } from '@civ-clone/civ1-unit/Units';
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import City from '@civ-clone/core-city/City';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Government from '@civ-clone/core-government/Government';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import Player from '@civ-clone/core-player/Player';
import PlayerAdded from '@civ-clone/core-player/Rules/Added';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import Priority from '@civ-clone/core-rule/Priority';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';
import Yield from '@civ-clone/core-yield/Yield';
import cost from '../Rules/City/cost';
import created from '../Rules/City/created';
import destroyed from '../Rules/City/destroyed';
import { expect } from 'chai';
import foodExhausted from '../Rules/City/food-exhausted';
import foodStorage from '../Rules/City/food-storage';
import grow from '../Rules/City/grow';
import processYield from '../Rules/City/process-yield';
import setUpCity from './lib/setUpCity';
import shrink from '../Rules/City/shrink';
import unitCreated from '@civ-clone/civ1-unit/Rules/Unit/created';
import unitDestroyed from '@civ-clone/civ1-unit/Rules/Unit/destroyed';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import traits from '@civ-clone/civ1-unit/Rules/Unit/traits';

// What each event was said with, by id: chai prints what it compares when an assertion fails, and a unit or a city leads
//  to the whole game.
const said = (events: [string, ...unknown[]][]): unknown[][] =>
  events.map(([event, ...args]) => [
    event,
    ...args.map((arg: any): unknown =>
      typeof arg === 'function' ? arg.name : arg?.id?.() ?? arg
    ),
  ]);

// A city short of food eats into its store, and loses one Settlers it supports (or, with none, a citizen) only once the
//  store runs out, which empties it, as v474.05 (civd `CITYMGT.C` `city_process()`; civ-clone/web-renderer#969).
describe('A city whose food store runs out (civ-clone/web-renderer#969)', (): void => {
  const setUp = async ({
    size = 1,
    store = 0,
    settlers = 0,
    government = Despotism,
  }: {
    size?: number;
    store?: number;
    settlers?: number;
    government?: typeof Government;
  } = {}) => {
    const ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      cityRegistry = new CityRegistry(),
      cityBuildRegistry = new CityBuildRegistry(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      unitRegistry = new UnitRegistry(),
      playerWorldRegistry = new PlayerWorldRegistry(),
      playerGovernmentRegistry = new PlayerGovernmentRegistry(),
      availableGovernmentRegistry = new AvailableGovernmentRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
      events: [string, ...unknown[]][] = [],
      unsupported: Unit[] = [];

    availableGovernmentRegistry.register(Anarchy, Despotism, Monarchy);

    ruleRegistry.register(
      // civ1-unit's unit traits, registered first as in a game: `cost` asks which units are `NonCombatant`.
      ...traits(),
      new PlayerAdded(
        new Effect((player: Player): void => {
          const playerGovernment = new PlayerGovernment(
            player,
            availableGovernmentRegistry,
            ruleRegistry
          );

          playerGovernmentRegistry.register(playerGovernment);

          playerGovernment.set(new government());
        })
      ),
      // Nothing that runs out of food is unsupported (that is the shields' word: `CITYMGT.C` "can't support … Unit
      //  Disbanded").
      new Unsupported(
        new Effect((city: City, unit: Unit): void => {
          unsupported.push(unit);
        })
      ),
      ...cost(cityGrowthRegistry, playerGovernmentRegistry, unitRegistry),
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
        engine,
        unitRegistry,
        workedTileRegistry,
        undefined,
        undefined,
        ruleRegistry
      ),
      ...foodExhausted(engine),
      ...foodStorage(ruleRegistry),
      ...grow(
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
        undefined,
        undefined,
        engine
      ),
      ...processYield(
        cityBuildRegistry,
        cityGrowthRegistry,
        unitRegistry,
        ruleRegistry
      ),
      ...shrink(
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
        undefined,
        engine
      ),
      ...unitCreated(unitRegistry),
      ...unitDestroyed(unitRegistry)
    );

    const city = await setUpCity({
        size,
        ruleRegistry,
        tileImprovementRegistry,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
      }),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      homed = new Array(settlers)
        .fill(null)
        .map(
          (): Unit =>
            new Settlers(city, city.player(), city.tile(), ruleRegistry)
        );

    cityGrowth.progress().add(store);

    ['city:food-storage-exhausted', 'city:shrink', 'city:destroyed'].forEach(
      (event: string): void =>
        engine.on(event, (...args: unknown[]): number =>
          events.push([event, ...args])
        )
    );

    // A turn's food, net of what the city's citizens and units eat (as `civ1-player` passes it), into the store.
    const eat = (food: number): void => {
      ruleRegistry.process(ProcessYield, new Food(food), city, city.yields());
    };

    return {
      city,
      cityGrowth,
      eat,
      events,
      homed,
      ruleRegistry,
      unitRegistry,
      unsupported,
    };
  };

  it('should eat into the store, losing nothing, while there is food in it', async (): Promise<void> => {
    const { city, cityGrowth, eat, events, homed } = await setUp({
      size: 2,
      store: 3,
      settlers: 2,
    });

    eat(-2);

    expect(cityGrowth.progress().value()).equal(1);
    expect(cityGrowth.size()).equal(2);
    expect(homed.map((unit) => unit.destroyed())).eql([false, false]);
    expect(city.destroyed()).false;
    expect(events).length(0);

    // Down to nothing is not below it.
    eat(-1);

    expect(cityGrowth.progress().value()).equal(0);
    expect(cityGrowth.size()).equal(2);
    expect(homed.map((unit) => unit.destroyed())).eql([false, false]);
    expect(events).length(0);
  });

  it('should lose the first Settlers the city supports, and only that, emptying the store, when it runs out', async (): Promise<void> => {
    const { city, cityGrowth, eat, events, homed, unitRegistry, unsupported } =
      await setUp({
        size: 2,
        store: 1,
        settlers: 2,
      });

    eat(-3);

    expect(homed.map((unit) => unit.destroyed())).eql([true, false]);
    expect(unitRegistry.getByCity(city).map((unit) => unit.id())).eql([
      homed[1].id(),
    ]);
    expect(cityGrowth.size()).equal(2);
    expect(cityGrowth.progress().value()).equal(0);
    expect(unsupported).length(0);
    // One famine, said with the Settlers it cost.
    expect(said(events)).eql([
      ['city:food-storage-exhausted', city.id(), homed[0].id()],
    ]);

    // And one more each turn the store runs out.
    eat(-1);

    expect(homed.map((unit) => unit.destroyed())).eql([true, true]);
    expect(cityGrowth.size()).equal(2);
    expect(cityGrowth.progress().value()).equal(0);

    // Then the city starves.
    eat(-1);

    expect(cityGrowth.size()).equal(1);
    expect(cityGrowth.progress().value()).equal(0);
    expect(city.destroyed()).false;
  });

  it('should lose the Settlers of a size-1 city, not the city', async (): Promise<void> => {
    const { city, cityGrowth, eat, events, homed } = await setUp({
      settlers: 1,
    });

    eat(-1);

    expect(homed[0].destroyed()).true;
    expect(city.destroyed()).false;
    expect(cityGrowth.size()).equal(1);
    expect(cityGrowth.progress().value()).equal(0);
    expect(said(events)).eql([
      ['city:food-storage-exhausted', city.id(), homed[0].id()],
    ]);
  });

  it('should starve a city that supports no Settlers, emptying its store, as before', async (): Promise<void> => {
    const { city, cityGrowth, eat, events, homed, ruleRegistry } = await setUp({
        size: 3,
        store: 1,
      }),
      // Its Warriors cost shields, not food.
      warrior = new Warrior(city, city.player(), city.tile(), ruleRegistry);

    eat(-4);

    expect(homed).length(0);
    expect(warrior.destroyed()).false;
    expect(cityGrowth.size()).equal(2);
    expect(cityGrowth.progress().value()).equal(0);
    // Said without a unit, as before.
    expect(said(events)).eql([
      ['city:food-storage-exhausted', city.id()],
      ['city:shrink', city.id(), 'FoodExhausted'],
    ]);

    // Once a turn, not again for the shortfall that was cleared.
    eat(-1);

    expect(cityGrowth.size()).equal(1);
    expect(cityGrowth.progress().value()).equal(0);
  });

  it('should destroy a city of size 1 that supports no Settlers, as before', async (): Promise<void> => {
    const { city, eat, events } = await setUp();

    eat(-1);

    expect(city.destroyed()).true;
    expect(events.map(([event]) => event)).eql([
      'city:food-storage-exhausted',
      'city:destroyed',
    ]);
  });

  it('should leave a Settlers homed elsewhere', async (): Promise<void> => {
    const { city, cityGrowth, eat, ruleRegistry } = await setUp({ size: 2 }),
      elsewhere = new Settlers(null, city.player(), city.tile(), ruleRegistry);

    eat(-1);

    expect(elsewhere.destroyed()).false;
    expect(cityGrowth.size()).equal(1);
  });

  it('should starve a city that supports units only with shields', async (): Promise<void> => {
    const { city, cityGrowth, eat, ruleRegistry } = await setUp({
        size: 2,
        // Where every unit costs a shield.
        government: Monarchy,
      }),
      warrior = new Warrior(city, city.player(), city.tile(), ruleRegistry);

    eat(-1);

    expect(warrior.destroyed()).false;
    expect(cityGrowth.size()).equal(1);
  });

  it('should pass over food owed by no unit for the unit after it', async (): Promise<void> => {
    const { cityGrowth, eat, homed, ruleRegistry } = await setUp({
      size: 2,
      settlers: 1,
    });

    ruleRegistry.register(
      new Cost(
        new Priority(0),
        new Effect((): Yield[] => [new UnitSupportFood(1, null)])
      )
    );

    eat(-1);

    expect(homed[0].destroyed()).true;
    expect(cityGrowth.size()).equal(2);
  });
});
