import AvailableSpecialistRegistry from '@civ-clone/core-city/AvailableSpecialistRegistry';
/**
 * Offers the Civ1 specialists in `availableSpecialistRegistry`, in the order a player cycles through them, starting with
 * the kind a citizen becomes when taken off a tile. Kinds already there are left alone, so registering a game twice
 * doesn't add them twice.
 */
export declare const registerAvailableSpecialists: (
  availableSpecialistRegistry: AvailableSpecialistRegistry
) => void;
export default registerAvailableSpecialists;
