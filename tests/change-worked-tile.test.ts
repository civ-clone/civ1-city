import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import ChangeWorkedTile from '@civ-clone/core-city/PlayerActions/ChangeWorkedTile';
import Player from '@civ-clone/core-player/Player';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import action from '../Rules/Player/action';
import canBeWorked from '../Rules/City/can-be-worked';
import { changeWorkedTile } from '../lib/assignWorkers';
import created from '../Rules/City/created';
import { expect } from 'chai';
import grow from '../Rules/City/grow';
import setUpCity from './lib/setUpCity';
import tiles from '../Rules/City/tiles';

describe('changeWorkedTile', () => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    cityGrowthRegistry = new CityGrowthRegistry(),
    playerWorldRegistry = new PlayerWorldRegistry(),
    unitRegistry = new UnitRegistry(),
    workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
    change = (city: Parameters<typeof changeWorkedTile>[0], tile: Tile) =>
      changeWorkedTile(
        city,
        tile,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry
      ),
    setUp = async (size: number) => {
      const city = await setUpCity({
        size,
        ruleRegistry,
        cityGrowthRegistry,
        playerWorldRegistry,
        workedTileRegistry,
      });

      return city;
    },
    unworked = (city: Awaited<ReturnType<typeof setUp>>) =>
      city
        .tiles()
        .entries()
        .filter((tile: Tile) => !workedTileRegistry.tileIsWorked(tile));

  ruleRegistry.register(
    ...action(undefined, cityRegistry),
    ...canBeWorked(cityRegistry, unitRegistry, workedTileRegistry),
    ...created(
      undefined,
      undefined,
      cityGrowthRegistry,
      cityRegistry,
      playerWorldRegistry,
      ruleRegistry,
      undefined,
      undefined,
      workedTileRegistry
    ),
    ...grow(cityGrowthRegistry, playerWorldRegistry, workedTileRegistry),
    ...tiles()
  );

  it("is offered for each of a player's cities", async () => {
    const city = await setUp(1),
      actions = city
        .player()
        .actions()
        .filter((action) => action instanceof ChangeWorkedTile);

    expect(actions.map((action) => action.value())).eql([city]);
    expect(
      new Player(ruleRegistry)
        .actions()
        .filter((action) => action instanceof ChangeWorkedTile)
    ).empty;
  });

  it('takes the worker off a worked tile', async () => {
    const city = await setUp(2),
      [, worked] = city.tilesWorked().entries();

    expect(change(city, worked)).equal('removed');
    expect(city.tilesWorked().entries()).not.include(worked);
    expect(city.tilesWorked().length).equal(2);
  });

  it('puts a free worker on an unworked tile', async () => {
    const city = await setUp(2),
      [, worked] = city.tilesWorked().entries();

    change(city, worked);

    const [target] = unworked(city).filter((tile) => tile !== worked);

    expect(change(city, target)).equal('added');
    expect(city.tilesWorked().entries()).include(target);
    expect(city.tilesWorked().length).equal(3);
  });

  it('reassigns the workers once every worker is placed', async () => {
    const city = await setUp(2),
      [target] = unworked(city);

    expect(change(city, target)).equal('reassigned');
    expect(city.tilesWorked().length).equal(3);
    expect(city.tilesWorked().entries()).include(city.tile());
  });

  it('leaves the city centre, and tiles it cannot work, alone', async () => {
    const city = await setUp(2),
      [, worked] = city.tilesWorked().entries();

    change(city, worked);

    const before = city.tilesWorked().entries(),
      outside = city
        .tile()
        .getSurroundingArea(3)
        .entries()
        .find((tile: Tile) => !city.tiles().includes(tile)) as Tile,
      otherCity = await setUp(1),
      [, otherCitysTile] = otherCity.tilesWorked().entries();

    expect(change(city, city.tile())).equal('none');
    expect(change(city, outside)).equal('none');
    expect(change(city, otherCitysTile)).equal('none');
    expect(city.tilesWorked().entries()).eql(before);
  });
});
