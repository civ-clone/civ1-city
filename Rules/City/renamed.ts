import {
  CityNames,
  claimName,
} from '@civ-clone/base-city-lifecycle/lib/claimName';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Renamed from '@civ-clone/core-city/Rules/Renamed';

// What keeps the names cities have been given: a game's `cityNames` (core-civilization's `CityNameRegistry`), of
//  which only this much is asked, so that this package needn't depend on that one.
export type { CityNames };

/**
 * A city's new name is claimed, so that no city founded later is given it too (civ-clone/web-renderer#712, #876),
 * however the city came to be renamed: by its player, by another client or by a computer player. Its old name stays
 * taken, as a name in use once always has.
 */
export const getRules: (cityNames: CityNames) => Renamed[] = (
  cityNames: CityNames
): Renamed[] => [
  new Renamed(new Effect((city: City): void => claimName(city, cityNames))),
];

export default getRules;
