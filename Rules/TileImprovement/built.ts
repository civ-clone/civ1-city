import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Built from '@civ-clone/core-tile-improvement/Rules/Built';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Fortress } from '@civ-clone/civ1-world/TileImprovements';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';

/**
 * A Fortress is never on a city's square (civ-clone/web-renderer#388). Settlers can't start one there, and founding a
 *  city takes one away (`Rules/City/created`), but one started before a city was founded on its square would still be
 *  finished: v474.05 checks for a city on each turn of the job (`CONTROL.C`, 'f', `map_flags & 0x21`) and stops it.
 *  Low, so it runs once civ1-world's `Built` rules have registered the Fortress, and takes it away through the
 *  `Removed` rules, so the renderer hears of it.
 */
export const getRules: (
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry
) => Built[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance
): Built[] => [
  new Built(
    'civ1-city:tile-improvement/built/no-fortress-in-city',
    new Low(),
    new Criterion(
      (tile: Tile, tileImprovement: TileImprovement): boolean =>
        tileImprovement instanceof Fortress
    ),
    new Criterion(
      (tile: Tile): boolean => cityRegistry.getByTile(tile) !== null
    ),
    // Asked when it runs, not when the rules are picked: civ1-world's rule registers the Fortress first.
    new Effect((tile: Tile, tileImprovement: TileImprovement): void => {
      if (tileImprovementRegistry.getByTile(tile).includes(tileImprovement)) {
        ruleRegistry.process(Removed, tile, tileImprovement);
      }
    })
  ),
];

export default getRules;
