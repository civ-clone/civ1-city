import {
  AvailableCityBuildItemsRegistry,
  instance as availableCityBuildItemsRegistryInstance,
} from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import { Irrigation, Road } from '@civ-clone/civ1-world/TileImprovements';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Created from '@civ-clone/core-city/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import assignWorkers from '../../lib/assignWorkers';

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityRegistry?: CityRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  ruleRegistry?: RuleRegistry,
  availableBuildItemsRegistry?: AvailableCityBuildItemsRegistry,
  engine?: Engine
) => Created[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  availableBuildItemsRegistry: AvailableCityBuildItemsRegistry = availableCityBuildItemsRegistryInstance,
  engine: Engine = engineInstance
): Created[] => [
  new Created(
    new Effect((city: City): void => {
      ([Irrigation, Road] as typeof TileImprovement[]).forEach(
        (Improvement: typeof TileImprovement): void =>
          tileImprovementRegistry.register(new Improvement(city.tile()))
      );
    })
  ),
  new Created(
    new Effect((city: City): void =>
      cityBuildRegistry.register(
        new CityBuild(city, availableBuildItemsRegistry, ruleRegistry)
      )
    )
  ),
  new Created(
    new Effect((city: City): void =>
      cityGrowthRegistry.register(new CityGrowth(city, ruleRegistry))
    )
  ),
  new Created(new Effect((city: City): void => cityRegistry.register(city))),
  new Created(
    new Effect((city: City): void => {
      engine.emit('city:created', city);
    })
  ),
  new Created(
    new Effect((city: City): void =>
      assignWorkers(city, playerWorldRegistry, cityGrowthRegistry)
    )
  ),
];

export default getRules;
