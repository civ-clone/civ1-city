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
import CanBeWorked from '@civ-clone/core-city/Rules/CanBeWorked';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): CanBeWorked[] => [
  new CanBeWorked(
    new Effect((tile: Tile): boolean => !workedTileRegistry.tileIsWorked(tile))
  ),
  new CanBeWorked(
    new Effect(
      (tile: Tile, city: City): boolean =>
        !unitRegistry
          .getByTile(tile)
          .some((unit: Unit) => unit.player() !== city.player())
    )
  ),
  new CanBeWorked(
    new Effect((tile: Tile, city: City): boolean => {
      const otherTileCity = cityRegistry.getByTile(tile);

      if (otherTileCity === null) {
        return true;
      }

      return otherTileCity === city;
    })
  ),
];

export default getRules;
