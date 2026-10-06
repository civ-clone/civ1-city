import { Communism, Democracy } from '@civ-clone/civ1-government/Governments';
import { Corruption, Trade } from '../Yields';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import AvailableGovernmentRegistry from '@civ-clone/core-government/AvailableGovernmentRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Government from '@civ-clone/core-government/Government';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import Priority from '@civ-clone/core-rule/Priority';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SpecialistRegistry from '@civ-clone/core-city/SpecialistRegistry';
import TradeRoute from '@civ-clone/core-city/TradeRoute';
import TradeRouteRegistry from '@civ-clone/core-city/TradeRouteRegistry';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import World from '@civ-clone/core-world/World';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import cityDestroyed from '../Rules/City/destroyed';
import cityYield from '../Rules/City/yield';
import { expect } from 'chai';
import playerAdded from '@civ-clone/civ1-government/Rules/Player/added';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import setUpCity from './lib/setUpCity';

describe('city:yield trade routes', (): void => {
  let ruleRegistry: RuleRegistry,
    playerGovernmentRegistry: PlayerGovernmentRegistry,
    playerWorldRegistry: PlayerWorldRegistry,
    tradeRouteRegistry: TradeRouteRegistry,
    workedTileRegistry: WorkedTileRegistry,
    trade: Map<City, number>,
    world: World;

  const addCity = async (
      name: string,
      x: number,
      tradeValue: number,
      GovernmentType: typeof Government,
      player: Player = new Player(ruleRegistry)
    ): Promise<City> => {
      const city = await setUpCity({
        name,
        player,
        playerWorldRegistry,
        ruleRegistry,
        tile: world.get(x, 5),
        workedTileRegistry,
        world,
      });

      playerGovernmentRegistry
        .getByPlayer(city.player())
        .set(new GovernmentType());
      trade.set(city, tradeValue);

      return city;
    },
    // Each route's trade, by partner name (the yield's provider is the partner's id).
    routeTrade = (city: City): [string, number][] =>
      city
        .yields()
        .filter((cityYield: Yield) => cityYield.constructor === Trade)
        .flatMap((cityYield: Yield) => cityYield.values())
        .filter(([, provider]) => provider !== 'test')
        .map(([value, provider]) => [
          tradeRouteRegistry
            .getByCity(city)
            .find((route) => route.to().id() === provider)!
            .to()
            .name(),
          value,
        ]);

  beforeEach(async (): Promise<void> => {
    const availableGovernmentRegistry = new AvailableGovernmentRegistry();

    ruleRegistry = new RuleRegistry();
    playerGovernmentRegistry = new PlayerGovernmentRegistry();
    playerWorldRegistry = new PlayerWorldRegistry();
    tradeRouteRegistry = new TradeRouteRegistry();
    workedTileRegistry = new WorkedTileRegistry(ruleRegistry);
    trade = new Map();

    ruleRegistry.register(
      ...playerAdded(
        availableGovernmentRegistry,
        playerGovernmentRegistry,
        ruleRegistry
      ),
      // Each city's tile trade comes from the test.
      new YieldRule(
        new Priority(0),
        new Effect((city: City) => new Trade(trade.get(city) ?? 0, 'test'))
      ),
      ...cityYield(
        new CityImprovementRegistry(),
        playerGovernmentRegistry,
        new SpecialistRegistry(),
        tradeRouteRegistry
      ),
      ...cityDestroyed(
        undefined,
        undefined,
        undefined,
        undefined,
        workedTileRegistry,
        new SpecialistRegistry(),
        tradeRouteRegistry
      )
    );

    world = await generateWorld(
      generateGenerator(40, 10, Grassland),
      ruleRegistry
    );
  });

  it('should add (partner + total + 4) / 8 for a foreign partner and / 16 for your own, building on each other', async (): Promise<void> => {
    const home = await addCity('home', 2, 10, Democracy),
      foreign = await addCity('foreign', 10, 14, Democracy),
      own = await addCity('own', 20, 6, Democracy, home.player());

    tradeRouteRegistry.register(
      new TradeRoute(home, foreign),
      new TradeRoute(home, own)
    );

    // (14 + 10 + 4) / 8 = 3, then (6 + 13 + 4) / 16 = 1.
    expect(routeTrade(home)).to.deep.equal([
      ['foreign', 3],
      ['own', 1],
    ]);
    expect(reduceYield(home.yields(), Trade)).to.equal(14);
    // A route is one-way.
    expect(routeTrade(foreign)).to.deep.equal([]);
  });

  it('should work corruption out on the total, routes included', async (): Promise<void> => {
    // Communism's corruption is 10 × 3 / 20 of trade.
    const home = await addCity('home', 2, 20, Communism),
      foreign = await addCity('foreign', 10, 40, Communism);

    expect(reduceYield(home.yields(), Corruption)).to.equal(-3);

    tradeRouteRegistry.register(new TradeRoute(home, foreign));

    // The partner's base trade is 40 - 6 = 34: (34 + 20 + 4) / 8 = 7, so 27 trade and 4 corruption.
    expect(routeTrade(home)).to.deep.equal([['foreign', 7]]);
    expect(reduceYield(home.yields(), Corruption)).to.equal(-4);
  });

  it('should follow who owns the partner now', async (): Promise<void> => {
    const home = await addCity('home', 2, 10, Democracy),
      own = await addCity('own', 10, 14, Democracy, home.player());

    tradeRouteRegistry.register(new TradeRoute(home, own));

    expect(routeTrade(home)).to.deep.equal([['own', 1]]);

    const newOwner = new Player(ruleRegistry);

    playerGovernmentRegistry.getByPlayer(newOwner).set(new Democracy());

    own.capture(newOwner);

    expect(routeTrade(home)).to.deep.equal([['own', 3]]);
  });

  it('should remove the routes a destroyed city held and the routes to it', async (): Promise<void> => {
    const home = await addCity('home', 2, 10, Democracy),
      partner = await addCity('partner', 10, 14, Democracy),
      third = await addCity('third', 20, 14, Democracy);

    tradeRouteRegistry.register(
      new TradeRoute(home, partner),
      new TradeRoute(partner, third),
      new TradeRoute(third, home)
    );

    partner.destroy();

    expect(
      tradeRouteRegistry.entries().map((route) => route.to())
    ).to.deep.equal([home]);
  });

  it('should not recurse when two cities are routed to each other', async (): Promise<void> => {
    const first = await addCity('first', 2, 10, Democracy),
      second = await addCity('second', 10, 10, Democracy);

    tradeRouteRegistry.register(
      new TradeRoute(first, second),
      new TradeRoute(second, first)
    );

    // (10 + 10 + 4) / 8 = 3 each way: each partner's base trade leaves out its own routes.
    expect(routeTrade(first)).to.deep.equal([['second', 3]]);
    expect(routeTrade(second)).to.deep.equal([['first', 3]]);
  });
});
