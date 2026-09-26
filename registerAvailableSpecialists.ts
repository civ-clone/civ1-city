import {
  Entertainer,
  Scientist,
  TaxCollector,
} from '@civ-clone/library-city/Specialists';
import { instance as availableSpecialistRegistryInstance } from '@civ-clone/core-city/AvailableSpecialistRegistry';

// In the order a player cycles through them, starting with the kind a citizen becomes when taken off a tile.
availableSpecialistRegistryInstance.register(
  Entertainer,
  TaxCollector,
  Scientist
);
