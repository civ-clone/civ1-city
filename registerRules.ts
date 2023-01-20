import cityBuildingComplete from './Rules/City/building-complete';
import cityCanBeWorked from './Rules/City/can-be-worked';
import cityCaptured from './Rules/City/captured';
import cityCost from './Rules/City/cost';
import cityCreated from './Rules/City/created';
import cityDestroyed from './Rules/City/destroyed';
import cityFoodExhausted from './Rules/City/food-exhausted';
import cityFoodStorage from './Rules/City/food-storage';
import cityGrow from './Rules/City/grow';
import cityGrowthCost from './Rules/City/growth-cost';
import cityProcessYield from './Rules/City/process-yield';
import cityShrink from './Rules/City/shrink';
import cityTileReassigned from './Rules/City/tile-reassigned';
import cityTiles from './Rules/City/tiles';
import cityYield from './Rules/City/yield';
import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import playerAction from './Rules/Player/action';
import unitDefeated from './Rules/Unit/defeated';
import unitMoved from './Rules/Unit/moved';
import unitUnsupported from './Rules/Unit/unsupported';

ruleRegistryInstance.register(
  ...cityBuildingComplete(),
  ...cityCanBeWorked(),
  ...cityCaptured(),
  ...cityCost(),
  ...cityCreated(),
  ...cityDestroyed(),
  ...cityFoodExhausted(),
  ...cityFoodStorage(),
  ...cityGrow(),
  ...cityGrowthCost(),
  ...cityProcessYield(),
  ...cityShrink(),
  ...cityTiles(),
  ...cityTileReassigned(),
  ...cityYield(),
  ...playerAction(),
  ...unitDefeated(),
  ...unitMoved(),
  ...unitUnsupported()
);
