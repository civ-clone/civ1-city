import {
  Chieftain,
  Emperor,
  Prince,
} from '@civ-clone/civ1-difficulty/Difficulties';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';
import growthCost from '../Rules/City/growth-cost';
import setUpCity from './lib/setUpCity';

describe('city:growth-cost', (): void => {
  const foodBox = async (
    Level: typeof Prince,
    human: boolean
  ): Promise<number> => {
    const ruleRegistry = new RuleRegistry(),
      clientRegistry = new ClientRegistry(),
      gameDifficultyRegistry = new GameDifficultyRegistry(),
      city = await setUpCity({ ruleRegistry });

    gameDifficultyRegistry.set(Level);
    clientRegistry.register(
      human ? new Client(city.player()) : new AIClient(city.player())
    );
    ruleRegistry.register(
      ...growthCost(gameDifficultyRegistry, clientRegistry)
    );

    return new CityGrowth(city, ruleRegistry).cost().value();
  };

  it('should fill at 20 for a size 1 human city at every level', async (): Promise<void> => {
    expect(await foodBox(Chieftain, true)).equal(20);
    expect(await foodBox(Emperor, true)).equal(20);
  });

  it('should fill at 32 for a size 1 Chieftain computer city, and 16 on Emperor', async (): Promise<void> => {
    expect(await foodBox(Chieftain, false)).equal(32);
    expect(await foodBox(Emperor, false)).equal(16);
  });
});
