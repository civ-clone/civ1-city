import { AvailableCityBuildItemsRegistry } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Created from '@civ-clone/core-city/Rules/Created';
export declare const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityRegistry?: CityRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  ruleRegistry?: RuleRegistry,
  availableBuildItemsRegistry?: AvailableCityBuildItemsRegistry,
  engine?: Engine
) => Created[];
export default getRules;
