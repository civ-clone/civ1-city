import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import Action from '@civ-clone/core-player/Rules/Action';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { CityBuild as CityBuildAction } from '@civ-clone/core-city-build/PlayerActions';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';

export const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityRegistry?: CityRegistry
) => Action[] = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance
): Action[] => {
  return [
    new Action(
      new Criterion((player: Player): boolean =>
        cityRegistry
          .getByPlayer(player)
          .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
          .some((cityBuild: CityBuild): boolean => !cityBuild.building())
      ),
      new Effect((player: Player) =>
        cityRegistry
          .getByPlayer(player)
          .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
          .filter((cityBuild: CityBuild): boolean => !cityBuild.building())
          .map(
            (cityBuild: CityBuild): CityBuildAction =>
              new CityBuildAction(cityBuild)
          )
      )
    ),
  ];
};

export default getRules;
