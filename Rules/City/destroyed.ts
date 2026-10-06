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
import City from '@civ-clone/core-city/City';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import { Irrigation } from '@civ-clone/civ1-world/TileImprovements';
import Player from '@civ-clone/core-player/Player';
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
  tradeRouteRegistry?: TradeRouteRegistry
) => Destroyed[] = (
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  engine: Engine = engineInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  tradeRouteRegistry: TradeRouteRegistry = tradeRouteRegistryInstance
): Destroyed[] => [
  new Destroyed(
    'civ1-city:city/destroyed/remove-irrigation',
    new Effect((city: City): void =>
      tileImprovementRegistry
        .getByTile(city.tile())
        .filter(
          (improvement: TileImprovement): boolean =>
            improvement instanceof Irrigation
        )
        .forEach((irrigation: TileImprovement): void =>
          tileImprovementRegistry.unregister(irrigation)
        )
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
      unitRegistry.getByCity(city).forEach((unit: Unit) => unit.destroy())
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
