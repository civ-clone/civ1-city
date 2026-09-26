import {
  Entertainer,
  Scientist,
  TaxCollector,
} from '@civ-clone/library-city/Specialists';
import { Gold, Luxuries, Research } from '../Yields';
import {
  changeSpecialist,
  changeWorkedTile,
  citizenCount,
  reassignWorkers,
} from '../lib/assignWorkers';
import setUpCity, { setUpCityOptions } from './lib/setUpCity';
import AvailableSpecialistRegistry from '@civ-clone/core-city/AvailableSpecialistRegistry';
import CanBeWorked from '@civ-clone/core-city/Rules/CanBeWorked';
import ChangeSpecialist from '@civ-clone/core-city/PlayerActions/ChangeSpecialist';
import City from '@civ-clone/core-city/City';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SpecialistRegistry from '@civ-clone/core-city/SpecialistRegistry';
import Tile from '@civ-clone/core-world/Tile';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import action from '../Rules/Player/action';
import created from '../Rules/City/created';
import destroyed from '../Rules/City/destroyed';
import { expect } from 'chai';
import grow from '../Rules/City/grow';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import shrink from '../Rules/City/shrink';
import tiles from '../Rules/City/tiles';
import yieldRules from '../Rules/City/yield';

describe('specialists', () => {
  const setUp = (
    size: number,
    { tilesAvailable = true }: { tilesAvailable?: boolean } = {},
    options: setUpCityOptions = {}
  ) => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      playerWorldRegistry = new PlayerWorldRegistry(),
      workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
      specialistRegistry = new SpecialistRegistry(),
      availableSpecialistRegistry = new AvailableSpecialistRegistry();

    availableSpecialistRegistry.register(Entertainer, TaxCollector, Scientist);

    ruleRegistry.register(
      ...action(undefined, cityRegistry, specialistRegistry),
      ...created(
        undefined,
        undefined,
        cityGrowthRegistry,
        cityRegistry,
        playerWorldRegistry,
        ruleRegistry,
        undefined,
        undefined,
        workedTileRegistry,
        specialistRegistry,
        availableSpecialistRegistry
      ),
      ...destroyed(
        undefined,
        cityRegistry,
        undefined,
        undefined,
        workedTileRegistry,
        specialistRegistry
      ),
      ...grow(
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
        specialistRegistry,
        availableSpecialistRegistry
      ),
      ...shrink(
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
        specialistRegistry
      ),
      ...tiles(),
      // Only the specialists' own yields: the others need a government.
      ...yieldRules(undefined, undefined, specialistRegistry).filter((rule) =>
        rule.id()?.startsWith('civ1-city:city/yield/specialist/')
      )
    );

    if (!tilesAvailable) {
      // Only the city centre can be worked, as if every other tile were taken.
      ruleRegistry.register(
        new CanBeWorked(new Effect((tile: Tile, city: City) => false))
      );
    }

    return setUpCity({
      ...options,
      size,
      ruleRegistry,
      cityGrowthRegistry,
      playerWorldRegistry,
      workedTileRegistry,
    }).then((city) => ({
      city,
      cityGrowth: cityGrowthRegistry.getByCity(city),
      specialists: () =>
        specialistRegistry
          .getByCity(city)
          .map((specialist) => specialist.constructor.name),
      count: () => citizenCount(city, workedTileRegistry, specialistRegistry),
      change: (tile: Tile) =>
        changeWorkedTile(
          city,
          tile,
          playerWorldRegistry,
          cityGrowthRegistry,
          workedTileRegistry,
          specialistRegistry,
          availableSpecialistRegistry
        ),
      cycle: (index: number) =>
        changeSpecialist(
          specialistRegistry.getByCity(city)[index],
          specialistRegistry,
          availableSpecialistRegistry
        ),
      reassign: () =>
        reassignWorkers(
          city,
          playerWorldRegistry,
          cityGrowthRegistry,
          workedTileRegistry,
          specialistRegistry,
          availableSpecialistRegistry
        ),
      unworked: () =>
        city
          .tiles()
          .entries()
          .filter((tile: Tile) => !workedTileRegistry.tileIsWorked(tile)),
      worked: () =>
        city
          .tilesWorked()
          .entries()
          .filter((tile: Tile) => tile !== city.tile()),
    }));
  };

  it('makes a citizen taken off a tile an Entertainer, and offers to change them', async () => {
    const { city, change, specialists, count, worked } = await setUp(3),
      [tile] = worked();

    expect(change(tile)).equal('removed');
    expect(specialists()).eql(['Entertainer']);
    expect(count()).equal(4);
    expect(
      city
        .player()
        .actions()
        .filter((action) => action instanceof ChangeSpecialist).length
    ).equal(1);
  });

  it('puts an Entertainer back to work on an unworked tile', async () => {
    const { change, specialists, count, worked, unworked } = await setUp(3),
      [tile] = worked();

    change(tile);

    const [target] = unworked().filter((unworked) => unworked !== tile);

    expect(change(target)).equal('added');
    expect(specialists()).eql([]);
    expect(count()).equal(4);
  });

  it('puts Entertainers back to work before other specialists', async () => {
    const { change, cycle, specialists, worked, unworked } = await setUp(3),
      [first, second] = worked();

    change(first);
    change(second);
    cycle(0);

    expect(specialists()).members(['Entertainer', 'TaxCollector']);

    change(unworked()[0]);

    expect(specialists()).eql(['TaxCollector']);
  });

  it('cycles a specialist through Tax collector and Scientist, back to Entertainer', async () => {
    const { change, cycle, specialists, worked } = await setUp(2),
      [tile] = worked();

    change(tile);

    cycle(0);
    expect(specialists()).eql(['TaxCollector']);

    cycle(0);
    expect(specialists()).eql(['Scientist']);

    cycle(0);
    expect(specialists()).eql(['Entertainer']);
  });

  it('keeps specialists when the city rearranges its workers', async () => {
    const { city, change, cycle, specialists, count, reassign, worked } =
        await setUp(4),
      [first, second] = worked();

    change(first);
    change(second);
    cycle(1);
    reassign();

    expect(specialists()).eql(['Entertainer', 'TaxCollector']);
    expect(city.tilesWorked().length).equal(3);
    expect(count()).equal(5);
  });

  it('gives each specialist 2 of its yield', async () => {
    const { city, change, cycle, specialists, worked } = await setUp(4),
      [first, second, third] = worked(),
      specialistYield = (YieldType: typeof Gold) =>
        reduceYield(city.yields(), YieldType);

    [first, second, third].forEach((tile) => change(tile));
    // A replaced specialist joins the end of the list: E, E, T, then E, T, T, then E, T, S.
    cycle(0);
    cycle(0);
    cycle(1);

    expect(specialists()).eql(['Entertainer', 'TaxCollector', 'Scientist']);
    expect(specialistYield(Luxuries)).equal(2);
    expect(specialistYield(Gold)).equal(2);
    expect(specialistYield(Research)).equal(2);
  });

  it('makes a new citizen an Entertainer when there is no tile left to work', async () => {
    const { cityGrowth, specialists, count } = await setUp(1, {
      tilesAvailable: false,
    });

    expect(specialists()).eql(['Entertainer']);

    cityGrowth.grow();

    expect(specialists()).eql(['Entertainer', 'Entertainer']);
    expect(count()).equal(3);
  });

  it('makes citizens from the 21st on Entertainers', async () => {
    const { cityGrowth, specialists, count } = await setUp(20);

    expect(specialists()).eql([]);

    cityGrowth.grow();

    expect(specialists()).eql(['Entertainer']);
    expect(count()).equal(22);
  });

  it('loses specialists before workers when the city shrinks', async () => {
    const { city, cityGrowth, change, specialists, count, worked } =
        await setUp(4),
      [tile] = worked();

    change(tile);
    cityGrowth.shrink();

    expect(specialists()).eql([]);
    expect(city.tilesWorked().length).equal(4);
    expect(count()).equal(4);
  });

  it('releases its specialists when the city is destroyed', async () => {
    const { city, change, specialists, worked } = await setUp(2),
      [tile] = worked();

    change(tile);
    city.destroy();

    expect(specialists()).eql([]);
  });
});
