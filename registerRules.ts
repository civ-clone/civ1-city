import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import buildingComplete from './Rules/City/building-complete';
import captured from './Rules/City/captured';
import cost from './Rules/City/cost';
import created from './Rules/City/created';
import destroyed from './Rules/City/destroyed';
import foodStorage from './Rules/City/food-storage';
import grow from './Rules/City/grow';
import growthCost from './Rules/City/growth-cost';
import playerAction from './Rules/Player/action';
import processYield from './Rules/City/process-yield';
import shrink from './Rules/City/shrink';

ruleRegistryInstance.register(
  ...buildingComplete(),
  ...captured(),
  ...cost(),
  ...created(),
  ...destroyed(),
  ...foodStorage(),
  ...grow(),
  ...growthCost(),
  ...playerAction(),
  ...processYield(),
  ...shrink()
);
