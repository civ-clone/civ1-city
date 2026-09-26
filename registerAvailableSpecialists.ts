import {
  Entertainer,
  Scientist,
  TaxCollector,
} from '@civ-clone/library-city/Specialists';
import AvailableSpecialistRegistry from '@civ-clone/core-city/AvailableSpecialistRegistry';

/**
 * Offers the Civ1 specialists in `availableSpecialistRegistry`, in the order a player cycles through them, starting with
 * the kind a citizen becomes when taken off a tile. Kinds already there are left alone, so registering a game twice
 * doesn't add them twice.
 */
export const registerAvailableSpecialists = (
  availableSpecialistRegistry: AvailableSpecialistRegistry
): void =>
  availableSpecialistRegistry.register(
    ...[Entertainer, TaxCollector, Scientist].filter(
      (SpecialistType) => !availableSpecialistRegistry.includes(SpecialistType)
    )
  );

export default registerAvailableSpecialists;
