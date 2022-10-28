import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';

export const getRules = (): Unsupported[] => [
  new Unsupported(new Effect((city: City, unit: Unit) => unit.destroy())),
];

export default getRules;
