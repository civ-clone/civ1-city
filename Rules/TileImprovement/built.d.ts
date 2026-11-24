import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Built from '@civ-clone/core-tile-improvement/Rules/Built';
/**
 * A Fortress is never on a city's square (civ-clone/web-renderer#388). Settlers can't start one there, and founding a
 *  city takes one away (`Rules/City/created`), but one started before a city was founded on its square would still be
 *  finished: v474.05 checks for a city on each turn of the job (`CONTROL.C`, 'f', `map_flags & 0x21`) and stops it.
 *  Low, so it runs once civ1-world's `Built` rules have registered the Fortress, and takes it away through the
 *  `Removed` rules, so the renderer hears of it.
 */
export declare const getRules: (
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry,
  tileImprovementRegistry?: TileImprovementRegistry
) => Built[];
export default getRules;
