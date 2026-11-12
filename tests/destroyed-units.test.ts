import {
  Carrier,
  Fighter,
  Settlers,
  Trireme,
  Warrior,
} from '@civ-clone/civ1-unit/Units';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import FillGenerator from '@civ-clone/core-world/tests/lib/FillGenerator';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';
import { Game } from '@civ-clone/core-game/Game';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import canStow from '@civ-clone/civ1-unit/Rules/Unit/canStow';
import captured from '../Rules/City/captured';
import destroyed from '../Rules/City/destroyed';
import { expect } from 'chai';
import foodExhausted from '../Rules/City/food-exhausted';
import shrink from '../Rules/City/shrink';
import { Attack } from '@civ-clone/civ1-unit/Actions';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import { Tank } from '@civ-clone/civ1-unit/Units';
import defeated from '../Rules/Unit/defeated';
import unitDefeated from '@civ-clone/civ1-unit/Rules/Unit/defeated';
import unitDestroyed from '@civ-clone/civ1-unit/Rules/Unit/destroyed';
import unitStowed from '@civ-clone/civ1-unit/Rules/Unit/stowed';
import unitYield from '@civ-clone/civ1-unit/Rules/Unit/yield';

// Ids, not the objects: chai prints what it compares when an assertion fails, and a unit leads to the whole game.
const ids = (units: Unit[]): string[] => units.map((unit) => unit.id());

// What goes with a destroyed city (civ-clone/web-renderer#969), as v474.05 `vanish` (`ECONOMY.C`): the units it
//  supported, wherever they are, and the ships and aircraft on its square, wherever their home; not the land units on
//  its square from elsewhere, nor those aboard a ship there.
describe('The units in a destroyed city (civ-clone/web-renderer#969)', (): void => {
  const setUp = async () => {
    const game = new Game();

    game.rules.register(
      // What a transport can carry, and how much.
      ...canStow(),
      ...unitStowed(),
      ...captured(
        game.cities,
        game.units,
        game.cityGrowth,
        game.cityBuilds,
        game.engine,
        game.playerWorlds,
        game.workedTiles,
        game.specialists,
        game.availableSpecialists,
        game.clients
      ),
      ...destroyed(
        game.tileImprovements,
        game.cities,
        game.engine,
        game.units,
        game.workedTiles,
        game.specialists,
        game.tradeRoutes,
        game.rules
      ),
      // A defender's defeat: this package's shrinks its city, then civ1-unit's destroys it, as they load.
      ...defeated(game.cities, game.cityGrowth, game.engine),
      ...unitDefeated(
        game.cities,
        game.rules,
        game.tileImprovements,
        game.units,
        game.engine
      ),
      ...foodExhausted(game.engine),
      ...shrink(
        game.cityGrowth,
        game.playerWorlds,
        game.workedTiles,
        game.specialists,
        game.engine
      ),
      ...unitDestroyed(
        game.units,
        game.unitImprovements,
        game.engine,
        game.transports,
        game.unitLosses
      ),
      // A transport's capacity.
      ...unitYield(game.unitImprovements, game.rules, game.transports)
    );

    const world = new World(new FillGenerator(10, 10, Grassland), game.rules),
      player = new Player(game.rules),
      enemy = new Player(game.rules);

    await world.build();

    [player, enemy].forEach((each: Player): void => {
      game.players.register(each);
      game.playerWorlds.register(new PlayerWorld(each, world, game.rules));
    });

    const found = (owner: Player, x: number, y: number): City => {
        const city = new City(owner, world.get(x, y), `${x},${y}`, game.rules);

        game.cities.register(city);
        game.cityBuilds.register(
          new CityBuild(city, game.availableCityBuildItems, game.rules)
        );
        game.cityGrowth.register(new CityGrowth(city, game.rules));

        return city;
      },
      city = found(player, 4, 4),
      elsewhere = found(player, 8, 8),
      make = <T extends Unit>(
        UnitType: new (...args: any[]) => T,
        home: City | null,
        owner: Player = player
      ): T => {
        const unit = new UnitType(
          home,
          owner,
          city.tile(),
          game.rules,
          game.transports
        );

        game.units.register(unit);

        return unit;
      },
      // A ship and an aircraft from elsewhere and from nowhere, the city's own ship, land units from elsewhere and from
      //  nowhere, and a loaded transport: a Trireme with a Warrior and Settlers aboard, and a Carrier with a Fighter.
      ship = make(Trireme, elsewhere),
      homelessShip = make(Trireme, null),
      ownShip = make(Trireme, city),
      aircraft = make(Fighter, elsewhere),
      homelessAircraft = make(Fighter, null),
      land = make(Warrior, elsewhere),
      homelessLand = make(Warrior, null),
      transport = make(Trireme, elsewhere),
      cargo = [make(Warrior, elsewhere), make(Settlers, null)],
      carrier = make(Carrier, elsewhere),
      carried = make(Fighter, elsewhere),
      ownLand = make(Warrior, city),
      lost: [Unit, Player | null][] = [];

    cargo.forEach((unit: Unit): void => {
      expect(transport.stow(unit)).true;
      expect(unit.busy()?.constructor.name).equal('Sleeping');
    });
    expect(carrier.stow(carried)).true;

    game.engine.on('unit:destroyed', (unit: Unit, by: Player | null) =>
      lost.push([unit, by])
    );

    return {
      game,
      city,
      enemy,
      player,
      lost,
      gone: [
        ship,
        homelessShip,
        ownShip,
        aircraft,
        homelessAircraft,
        transport,
        carrier,
        carried,
        ownLand,
      ],
      stay: [land, homelessLand, ...cargo],
      cargo,
    };
  };

  const expectVanished = (
    { city, game, lost, gone, stay, cargo }: Awaited<ReturnType<typeof setUp>>,
    by: Player | null = null,
    losses: number = 0
  ): void => {
    expect(city.destroyed()).true;
    expect(ids(gone.filter((unit) => !unit.destroyed()))).eql([]);
    expect(ids(stay.filter((unit) => unit.destroyed()))).eql([]);
    // Each once, lost to no one, so none is counted as a loss.
    expect(ids(lost.map(([unit]) => unit)).sort()).eql(ids(gone).sort());
    expect(lost.filter(([, player]) => player !== by)).length(0);
    expect(
      game.unitLosses.entries().reduce((total, loss) => total + loss.count(), 0)
    ).equal(losses);
    // The cargo is ashore, on the city's square, aboard nothing, still asleep as it was aboard (as v474.05's `drop_u_stack`
    //  leaves the units in the stack as they were).
    cargo.forEach((unit: Unit): void => {
      expect(unit.tile() === city.tile()).true;
      expect(unit.busy()?.constructor.name).equal('Sleeping');
      expect(game.transports.hasUnit(unit)).false;
    });
  };

  it('should take the ships and aircraft on its square with it, and leave the units on land', async (): Promise<void> => {
    const setting = await setUp();

    setting.city.destroy();

    expectVanished(setting);
  });

  it('should do so for a city that starves', async (): Promise<void> => {
    const setting = await setUp();

    setting.game.rules.process(
      FoodExhausted,
      setting.game.cityGrowth.getByCity(setting.city)
    );

    expectVanished(setting);
  });

  it('should do so for a city of size 1 that is taken, sparing the land unit that took it', async (): Promise<void> => {
    const setting = await setUp(),
      { city, enemy, game } = setting,
      captor = new Warrior(null, enemy, city.tile(), game.rules);

    game.units.register(captor);

    city.capture(enemy);

    expectVanished(setting);
    expect(captor.destroyed()).false;
  });

  it('should do so for a city of size 1 whose defender is defeated, leaving the defender to the attacker', async (): Promise<void> => {
    const setting = await setUp(),
      { city, enemy, game, gone, lost, player } = setting,
      [defender] = gone.filter(
        (unit: Unit): boolean => unit instanceof Fighter
      ),
      from = game.cities.getByTile(city.tile())!.tile().getNeighbour('e'),
      tank = new Tank(null, enemy, from, game.rules);

    game.units.register(tank);

    game.rules.process(
      Defeated,
      defender,
      tank,
      new Attack(from, city.tile(), tank, game.rules)
    );

    expect(city.destroyed()).true;
    // The defender once, lost to the attacker, and counted as a loss, as v474.05's `battle` drops it before `vanish`.
    expect(
      lost.filter(([unit]) => unit === defender).map(([, by]) => by === enemy)
    ).eql([true]);
    expect(
      game.unitLosses
        .getByPlayer(player)
        .map((loss) => [loss.unit().name, loss.count()])
    ).eql([['Fighter', 1]]);

    // The rest as for any other way the city goes.
    setting.lost.splice(
      setting.lost.findIndex(([unit]) => unit === defender),
      1
    );
    expectVanished(
      { ...setting, gone: gone.filter((unit) => unit !== defender) },
      null,
      1
    );
  });

  it('should leave a city that only shrinks as it was', async (): Promise<void> => {
    const setting = await setUp(),
      { city, game, lost } = setting;

    game.cityGrowth.getByCity(city).grow();

    game.rules.process(FoodExhausted, game.cityGrowth.getByCity(city));

    expect(city.destroyed()).false;
    expect(lost).length(0);
  });
});
