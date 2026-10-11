import { autoBuild as autoBuildCity } from '@civ-clone/core-city-build/lib/autoBuild';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';

// What a city on Auto may choose by itself: improvements and Wonders (which are improvements too), never units or
//  anything else a city can build, such as spaceship parts (civ-clone/web-renderer#194).
export const autoBuildable = (buildItem: BuildItem): boolean =>
  Object.prototype.isPrototypeOf.call(CityImprovement, buildItem.item());

// Starts what a city on Auto that is building nothing needs most, of what it may choose by itself. Returns whether it
//  started anything.
export const autoBuild = (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry
): boolean => autoBuildCity(cityBuild, ruleRegistry, autoBuildable);

export default autoBuild;
