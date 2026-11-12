import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { BuildProgress } from '@civ-clone/core-city-build/Yields';
import { IBuildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import Hold from '@civ-clone/core-city-build/Rules/Hold';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import buildingHeld from '../Rules/City/building-held';
import { buildCost } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';

// The event a client says a build is waiting by, once (civ-clone/web-renderer#970).
describe('city:building-held', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      cityBuild = new CityBuild(
        await setUpCity({ ruleRegistry }),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      holding = { on: true },
      // Whether it was this build, rather than the build itself, which a failing comparison would print in full.
      events: [boolean, IBuildable, (string | null)[]][] = [];

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Warrior as unknown as IBuildable, 10),
      new Hold(
        'test:city/hold/warrior',
        new Criterion((): boolean => holding.on)
      ),
      ...buildingHeld(engine)
    );

    availableBuildItemsRegistry.register(Warrior);

    engine.on(
      'city:building-held',
      (
        heldBuild: CityBuild,
        item: IBuildable,
        held: (string | null)[]
      ): void => {
        events.push([heldBuild === cityBuild, item, held]);
      }
    );

    cityBuild.build(Warrior as unknown as IBuildable);

    return { cityBuild, events, holding };
  };

  it('should emit once, with the build, the item and the holding rules, when shields pay for a held build', async (): Promise<void> => {
    const { cityBuild, events } = await setUp();

    cityBuild.add(new BuildProgress(5));

    expect(events).eql([]);

    cityBuild.add(new BuildProgress(5));
    cityBuild.check();
    cityBuild.add(new BuildProgress(5));
    cityBuild.check();

    expect(events).eql([[true, Warrior, ['test:city/hold/warrior']]]);
  });

  it('should not emit for a build that completes', async (): Promise<void> => {
    const { cityBuild, events, holding } = await setUp();

    holding.on = false;
    cityBuild.add(new BuildProgress(10));

    expect(cityBuild.check()).instanceof(Warrior);
    expect(events).eql([]);
  });
});
