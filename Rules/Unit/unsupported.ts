import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';
import { disbandUnsupported } from '@civ-clone/base-city-lifecycle/lib/unsupported';

export const getRules = (): Unsupported[] => [
  new Unsupported(
    'civ1-city:unit/unsupported/destroy',
    new Effect((city: City, unit: Unit) => disbandUnsupported(city, unit))
  ),
];

export default getRules;
