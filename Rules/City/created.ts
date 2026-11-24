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
import {
  Fortress,
  Irrigation,
  Road,
} from '@civ-clone/civ1-world/TileImprovements';
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
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import Available from '@civ-clone/core-tile-improvement/Rules/Available';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Created from '@civ-clone/core-city/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { High } from '@civ-clone/core-rule/Priorities';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import assignWorkers from '../../lib/assignWorkers';
import {
  AvailableSpecialistRegistry,
  instance as availableSpecialistRegistryInstance,
} from '@civ-clone/core-city/AvailableSpecialistRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';

export const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  cityRegistry?: CityRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  ruleRegistry?: RuleRegistry,
  availableBuildItemsRegistry?: AvailableCityBuildItemsRegistry,
  engine?: Engine,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Created[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  availableBuildItemsRegistry: AvailableCityBuildItemsRegistry = availableCityBuildItemsRegistryInstance,
  engine: Engine = engineInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): Created[] => [
  // A Fortress on the square goes when a city is founded there (v474.05 `CITY.C`, `unflag(36)`;
  //  civ-clone/web-renderer#388), taken away through the `Removed` rules so the square is redrawn.
  new Created(
    'civ1-city:city/created/remove-fortress',
    new Effect((city: City): void =>
      tileImprovementRegistry
        .getByTile(city.tile())
        .filter(
          (tileImprovement: TileImprovement): boolean =>
            tileImprovement instanceof Fortress
        )
        .forEach((fortress: TileImprovement): void => {
          ruleRegistry.process(Removed, city.tile(), fortress);
        })
    )
  ),
  ...(
    [
      // A new city's square is irrigated only where its terrain can be irrigated, as the rule set's `Available` rules
      //  have it (civ1-world's: Desert, Grassland, Hills, Plains and River), without the water nearby a worker would
      //  need (v474.05 `CITY.C`, `work_rules[terrain][0] < -1`, civ-clone/web-renderer#1029)...
      [
        Irrigation,
        new Criterion((city: City): boolean =>
          ruleRegistry
            .get(Available)
            .some((rule: Available): boolean =>
              rule.validate(city.tile(), Irrigation, city.player())
            )
        ),
      ],
      // ...and it has a Road whatever its terrain.
      [Road],
    ] as [typeof TileImprovement, ...Criterion[]][]
  ).map(
    ([TileImprovementType, ...criteria]: [
      typeof TileImprovement,
      ...Criterion[]
    ]) =>
      new Created(
        `civ1-city:city/created/add-improvement/${TileImprovementType.name}`,
        new Criterion((city: City) =>
          tileImprovementRegistry
            .getByTile(city.tile())
            .every(
              (tileImprovement) =>
                !(tileImprovement instanceof TileImprovementType)
            )
        ),
        ...criteria,
        new Effect((city: City): void =>
          tileImprovementRegistry.register(new TileImprovementType(city.tile()))
        )
      )
  ),
  new Created(
    'civ1-city:city/created/register-city-build',
    new Effect((city: City): void => {
      const cityBuild = new CityBuild(
        city,
        availableBuildItemsRegistry,
        ruleRegistry
      );

      // Its first build is asked for as a new city's (civ-clone/web-renderer#716).
      cityBuild.setCleared('created');

      cityBuildRegistry.register(cityBuild);
    })
  ),
  new Created(
    'civ1-city:city/created/register-city-growth',
    new Effect((city: City): void =>
      cityGrowthRegistry.register(new CityGrowth(city, ruleRegistry))
    )
  ),
  new Created(
    'civ1-city:city/created/register',
    new Effect((city: City): void => cityRegistry.register(city))
  ),
  new Created(
    'civ1-city:city/created/emit',
    new Effect((city: City): void => {
      engine.emit('city:created', city);
    })
  ),
  new Created(
    'civ1-city:city/created/work-city-tile',
    new Effect((city: City): void => {
      const existingWorkedTile = workedTileRegistry.getByTile(city.tile());

      if (existingWorkedTile !== null) {
        workedTileRegistry.unregister(existingWorkedTile);
      }

      workedTileRegistry.register(new WorkedTile(city.tile(), city));

      // Give the existing City the chance to reassign its worker before...
      if (existingWorkedTile !== null) {
        ruleRegistry.process(
          TileReassigned,
          existingWorkedTile.city(),
          existingWorkedTile.tile()
        );
      }

      // ...assigning the remaining workers.
      assignWorkers(
        city,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
        specialistRegistry,
        availableSpecialistRegistry
      );
    })
  ),
];

export default getRules;
