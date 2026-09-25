import {
  CityBuild as CityBuildAction,
  ChangeProduction,
} from '@civ-clone/core-city-build/PlayerActions';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import Action from '@civ-clone/core-player/Rules/Action';
import ChangeWorkedTile from '@civ-clone/core-city/PlayerActions/ChangeWorkedTile';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
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
      'civ1-city:player/action/choose-production',
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
              new CityBuildAction(player, cityBuild)
          )
      )
    ),
    new Action(
      'civ1-city:player/action/change-production',
      new Criterion((player: Player): boolean =>
        cityRegistry
          .getByPlayer(player)
          .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
          .some((cityBuild: CityBuild): boolean => !!cityBuild.building())
      ),
      new Effect((player: Player) =>
        cityRegistry
          .getByPlayer(player)
          .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
          .filter((cityBuild: CityBuild): boolean => !!cityBuild.building())
          .map(
            (cityBuild: CityBuild): ChangeProduction =>
              new ChangeProduction(player, cityBuild)
          )
      )
    ),
    new Action(
      'civ1-city:player/action/change-worked-tile',
      new Criterion(
        (player: Player): boolean => cityRegistry.getByPlayer(player).length > 0
      ),
      new Effect((player: Player) =>
        cityRegistry
          .getByPlayer(player)
          .map(
            (city: City): ChangeWorkedTile => new ChangeWorkedTile(player, city)
          )
      )
    ),
  ];
};

export default getRules;
