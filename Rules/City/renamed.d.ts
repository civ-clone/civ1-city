import Renamed from '@civ-clone/core-city/Rules/Renamed';
export type CityNames = {
  claim(name: string): void;
};
/**
 * A city's new name is claimed, so that no city founded later is given it too (civ-clone/web-renderer#712, #876),
 * however the city came to be renamed: by its player, by another client or by a computer player. Its old name stays
 * taken, as a name in use once always has.
 */
export declare const getRules: (cityNames: CityNames) => Renamed[];
export default getRules;
