import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Priority from '@civ-clone/core-rule/Priority';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import Unit from '@civ-clone/core-unit/Unit';
import WorkedTile from '@civ-clone/core-city/WorkedTile';

export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): TurnStart[] => [
  new TurnStart(
    'civ1-city:player/turn-start/release-occupied-worked-tiles',
    // Before the `City` yields are processed (`civ1-player:player/turn-start/process-city-yields` is `High`).
    new Priority(0), // X High
    new Effect((player: Player): void =>
      cityRegistry.getByPlayer(player).forEach((city: City): void =>
        workedTileRegistry
          .getByCity(city)
          .filter(
            (workedTile: WorkedTile): boolean =>
              workedTile.tile() !== city.tile() &&
              unitRegistry
                .getByTile(workedTile.tile())
                .some((unit: Unit): boolean => unit.player() !== player)
          )
          .forEach((workedTile: WorkedTile): void => {
            workedTileRegistry.unregister(workedTile);

            ruleRegistry.process(TileReassigned, city, workedTile.tile());
          })
      )
    )
  ),
];

export default getRules;
