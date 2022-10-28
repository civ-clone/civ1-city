import cityBuildingComplete from './Rules/City/building-complete';
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
import cityYield from './Rules/City/yield';
import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import playerAction from './Rules/Player/action';
import unitDefeated from './Rules/Unit/defeated';
import unitUnsupported from './Rules/Unit/unsupported';

ruleRegistryInstance.register(
  ...cityBuildingComplete(),
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
  ...cityYield(),
  ...playerAction(),
  ...unitDefeated(),
  ...unitUnsupported()
);
