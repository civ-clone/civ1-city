import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import {
  changeProductionActions,
  changeSpecialistActions,
  changeWorkedTileActions,
  chooseProductionActions,
  hasCity,
  hasCityToChangeProduction,
  hasCityToChooseProduction,
  hasSpecialist,
} from '@civ-clone/base-city-lifecycle/lib/playerActions';
import Action from '@civ-clone/core-player/Rules/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';

export const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  cityRegistry?: CityRegistry,
  specialistRegistry?: SpecialistRegistry
) => Action[] = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance
): Action[] => {
  return [
    new Action(
      'civ1-city:player/action/choose-production',
      new Criterion((player: Player): boolean =>
        hasCityToChooseProduction(player, cityRegistry, cityBuildRegistry)
      ),
      new Effect((player: Player) =>
        chooseProductionActions(player, cityRegistry, cityBuildRegistry)
      )
    ),
    new Action(
      'civ1-city:player/action/change-production',
      new Criterion((player: Player): boolean =>
        hasCityToChangeProduction(player, cityRegistry, cityBuildRegistry)
      ),
      new Effect((player: Player) =>
        changeProductionActions(player, cityRegistry, cityBuildRegistry)
      )
    ),
    new Action(
      'civ1-city:player/action/change-worked-tile',
      new Criterion((player: Player): boolean => hasCity(player, cityRegistry)),
      new Effect((player: Player) =>
        changeWorkedTileActions(player, cityRegistry)
      )
    ),
    new Action(
      'civ1-city:player/action/change-specialist',
      new Criterion((player: Player): boolean =>
        hasSpecialist(player, cityRegistry, specialistRegistry)
      ),
      new Effect((player: Player) =>
        changeSpecialistActions(player, cityRegistry, specialistRegistry)
      )
    ),
  ];
};

export default getRules;
