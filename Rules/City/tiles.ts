import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Tiles from '@civ-clone/core-city/Rules/Tiles';
import Tileset from '@civ-clone/core-world/Tileset';

export const getRules = (): Tiles[] => [
  new Tiles(
    new Effect(
      (city: City): Tileset =>
        Tileset.from(
          ...city
            .tile()
            .getSurroundingArea(2)
            .filter((tile, i) => ![0, 4, 20, 24].includes(i))
        )
    )
  ),
];

export default getRules;
