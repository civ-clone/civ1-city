import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import {
  isNotAnotherCity,
  isNotOccupiedByEnemy,
  isNotWorked,
} from '@civ-clone/base-city-lifecycle/lib/canBeWorked';
import CanBeWorked from '@civ-clone/core-city/Rules/CanBeWorked';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Tile from '@civ-clone/core-world/Tile';

export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): CanBeWorked[] => [
  new CanBeWorked(
    'civ1-city:city/can-be-worked/not-already-worked',
    new Effect((tile: Tile): boolean => isNotWorked(tile, workedTileRegistry))
  ),
  new CanBeWorked(
    'civ1-city:city/can-be-worked/not-occupied-by-enemy',
    new Effect((tile: Tile, city: City): boolean =>
      isNotOccupiedByEnemy(tile, city, unitRegistry)
    )
  ),
  new CanBeWorked(
    'civ1-city:city/can-be-worked/not-another-city',
    new Effect((tile: Tile, city: City): boolean =>
      isNotAnotherCity(tile, city, cityRegistry)
    )
  ),
];

export default getRules;
