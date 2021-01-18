import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Action from '@civ-clone/core-player/Rules/Action';
export declare const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityRegistry?: CityRegistry
) => Action[];
export default getRules;
