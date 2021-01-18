import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
export declare const getRules: (
  tileImprovementRegistry?: TileImprovementRegistry,
  cityRegistry?: CityRegistry,
  engine?: Engine
) => Destroyed[];
export default getRules;
