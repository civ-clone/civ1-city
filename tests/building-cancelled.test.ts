import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import { IBuildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import { Game } from '@civ-clone/core-game/Game';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import buildingCancelled from '../Rules/City/building-cancelled';
import { buildCost } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';
import register from '../registerRules';
import setUpCity from './lib/setUpCity';

// The event a client shows a dropped build by, whenever it is dropped (civ-clone/web-renderer#978).
describe('city:building-cancelled', (): void => {
  it('should emit, with the build, the item and the reason the rules are given', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      cityBuild = new CityBuild(
        await setUpCity({ ruleRegistry }),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      // Whether it was this build, rather than the build itself, which a failing comparison would print in full.
      events: [boolean, IBuildable, string][] = [];

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Warrior as unknown as IBuildable, 10),
      ...buildingCancelled(ruleRegistry, engine)
    );

    availableBuildItemsRegistry.register(Warrior);

    engine.on(
      'city:building-cancelled',
      (cancelled: CityBuild, item: IBuildable, reason: string): void => {
        events.push([cancelled === cityBuild, item, reason]);
      }
    );

    // As `CityBuild#cancel` processes them.
    ruleRegistry.process(
      BuildingCancelled,
      cityBuild,
      Warrior as unknown as IBuildable,
      'unavailable'
    );

    expect(events).eql([[true, Warrior, 'unavailable']]);
  });

  it('should be `civ1-city:city/building-cancelled/emit`, before Auto chooses again', (): void => {
    expect(
      buildingCancelled(new RuleRegistry(), new Engine()).map((rule) =>
        rule.id()
      )
    ).eql([
      'civ1-city:city/building-cancelled/emit',
      'civ1-city:city/building-cancelled/auto',
    ]);
  });

  it('should be registered with the rest of the package', (): void => {
    const game = new Game();

    register(game);

    expect(
      game.rules
        .get(BuildingCancelled)
        .map((rule: BuildingCancelled) => rule.id())
    ).eql([
      'civ1-city:city/building-cancelled/emit',
      'civ1-city:city/building-cancelled/auto',
    ]);
  });
});
