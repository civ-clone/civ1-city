import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  TradeRouteRegistry,
  instance as tradeRouteRegistryInstance,
} from '@civ-clone/core-city/TradeRouteRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import { Low } from '@civ-clone/core-rule/Priorities';
import { Irrigation } from '@civ-clone/civ1-world/TileImprovements';
import { Land } from '@civ-clone/civ1-unit/Types';
import defendersLosing from '../../lib/defendersLosing';
import Player from '@civ-clone/core-player/Player';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import {
  instance as workedTileRegistryInstance,
  WorkedTileRegistry,
} from '@civ-clone/core-city/WorkedTileRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityRegistry?: CityRegistry,
  engine?: Engine,
  unitRegistry?: UnitRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  tradeRouteRegistry?: TradeRouteRegistry,
  ruleRegistry?: RuleRegistry
) => Destroyed[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  engine: Engine = engineInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  tradeRouteRegistry: TradeRouteRegistry = tradeRouteRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): Destroyed[] => [
  // Through the `Removed` rules, as clearing pollution does, so the square's yields are worked out again and
  //  `tile-improvement:removed` is raised for whoever shows the square (civ-clone/web-renderer#401).
  new Destroyed(
    'civ1-city:city/destroyed/remove-irrigation',
    new Effect((city: City): void =>
      tileImprovementRegistry
        .getByTile(city.tile())
        .filter(
          (improvement: TileImprovement): boolean =>
            improvement instanceof Irrigation
        )
        .forEach((irrigation: TileImprovement): void => {
          ruleRegistry.process(Removed, city.tile(), irrigation);
        })
    )
  ),

  new Destroyed(
    'civ1-city:city/destroyed/emit',
    new Effect((city: City, player: Player | null): void => {
      engine.emit('city:destroyed', city, player);
    })
  ),

  new Destroyed(
    'civ1-city:city/destroyed/destroy-supported-units',
    new Effect((city: City): void =>
      unitRegistry.getByCity(city).forEach((unit: Unit): void => {
        // Not one the disbanding of another took with it already: when the city was its player's last, the first unit
        //  to go defeats the player, which destroys the rest (civ-clone/web-renderer#600).
        if (unit.destroyed()) {
          return;
        }

        unit.destroy();
      })
    )
  ),

  // The ships and aircraft in the city go with it, wherever their home; units on land stay on its square
  //  (civ-clone/web-renderer#969). v474.05 `vanish` (`ECONOMY.C`), once it has disbanded the units the city supported:
  //
  //  ```c
  //  u = map_stack(x, y);
  //  if (u != -1)
  //      each_stack(townbuf[idx].owner, u, kill_stack_cb);
  //  ```
  //
  //  where `kill_stack_cb` (`UNITS.C`) disbands any unit that isn't a land unit:
  //  `if (utypes[armydata[group][index].type].domain != 0) drop_u_stack(group, index);`. `drop_u_stack` takes a
  //  ship's cargo with it only at sea (`terrain_at(...) == 10`), which a city's square never is, so the land units
  //  aboard stay in the city, as `civ1-unit`'s `unit/destroyed/lose-cargo` leaves them; an aircraft aboard a Carrier
  //  goes, as an aircraft. Lost to no one, as the city's own units are: v474.05 counts a loss in `drop_u_stack` only
  //  while `see_fight_all` is set, and `CONTROL.C` clears it after a battle, before the city that lost it vanishes.
  //  Only the city's player can have units on its square as it goes: a city is conquered only once nothing defends it,
  //  and one incited to revolt is never destroyed (`city/captured/shrink`).
  //
  //  Low, so after every other player's `Destroyed` rule whichever package loads first: when the city was its player's
  //  last, `civ1-player`'s `city/destroyed/defeat-when-last-city` defeats the player first, which destroys all its
  //  units, these among them, once each; destroying one here first would defeat the player from inside its own
  //  destruction (`civ1-player`'s `unit/destroyed/defeat-when-no-cities`), and it would be destroyed, and announced,
  //  twice.
  new Destroyed(
    'civ1-city:city/destroyed/destroy-ships-and-aircraft',
    new Low(),
    new Effect((city: City): void =>
      unitRegistry
        .getByTile(city.tile())
        .filter((unit: Unit): boolean => !(unit instanceof Land))
        .forEach((unit: Unit): void => {
          // Not a defender whose defeat destroyed the city, which is lost to the attacker (`lib/defendersLosing`).
          //  Those that went with the city already, as it supported them, or with its player, are no longer on the
          //  square.
          if (defendersLosing.has(unit)) {
            return;
          }

          unit.destroy();
        })
    )
  ),

  new Destroyed(
    'civ1-city:city/destroyed/release-worked-tiles',
    new Effect((city: City): void =>
      workedTileRegistry
        .getByCity(city)
        .forEach((workedTile) => workedTileRegistry.unregister(workedTile))
    )
  ),

  new Destroyed(
    'civ1-city:city/destroyed/release-specialists',
    new Effect((city: City): void =>
      specialistRegistry
        .getByCity(city)
        .forEach((specialist) => specialistRegistry.unregister(specialist))
    )
  ),

  // A destroyed city is cleared from every route, both the ones it held and the ones held to it (v474.05
  //  `Segment_1ade.cs` `F0_1ade_018e`, civ-clone/web-renderer#57).
  new Destroyed(
    'civ1-city:city/destroyed/remove-trade-routes',
    new Effect((city: City): void =>
      tradeRouteRegistry.unregister(
        ...tradeRouteRegistry.getByCity(city),
        ...tradeRouteRegistry.getByPartner(city)
      )
    )
  ),
];

export default getRules;
