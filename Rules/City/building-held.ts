import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import BuildingHeld from '@civ-clone/core-city-build/Rules/BuildingHeld';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (engine?: Engine) => BuildingHeld[] = (
  engine: Engine = engineInstance
): BuildingHeld[] => [
  // A city's build is paid for and `Hold` rules keep it waiting: said each turn it waits, with the item and the ids of
  //  the rules holding it, for a client to word, and to tell its player of once (civ-clone/web-renderer#970).
  new BuildingHeld(
    'civ1-city:city/building-held/emit',
    new Effect(
      (
        cityBuild: CityBuild,
        item: Buildable,
        held: (string | null)[]
      ): void => {
        engine.emit('city:building-held', cityBuild, item, held);
      }
    )
  ),
];

export default getRules;
