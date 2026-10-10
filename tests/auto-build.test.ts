import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Buildable from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import buildingCancelled from '../Rules/City/building-cancelled';
import buildingComplete from '../Rules/City/building-complete';
import { buildCosts } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';

describe('city:auto-build', (): void => {
  class Granary extends Buildable {
    static build(): Granary {
      return new Granary();
    }
  }
  class Temple extends Buildable {
    static build(): Temple {
      return new Temple();
    }
  }

  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      cityBuild = new CityBuild(
        await setUpCity({ ruleRegistry }),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      unavailable = new Set<typeof Buildable>(),
      priority = (Item: typeof Buildable, score: number): BuildPriority =>
        new BuildPriority(
          new Criterion(
            (cityBuild: CityBuild, BuildItem: typeof Buildable): boolean =>
              BuildItem === Item
          ),
          new Effect((): number => score)
        );

    availableBuildItemsRegistry.register(
      Granary,
      Temple,
      Warrior as unknown as typeof Buildable
    );

    ruleRegistry.register(
      new Build(
        new Effect(
          (city, BuildItem: typeof Buildable): IBuildCriterion =>
            new Criterion((): boolean => !unavailable.has(BuildItem))
        )
      ),
      ...buildCosts([
        [Granary, 40],
        [Temple, 30],
        [Warrior as unknown as typeof Buildable, 10],
      ]),
      priority(Warrior as unknown as typeof Buildable, 5),
      priority(Temple, 2),
      priority(Granary, 1),
      ...buildingComplete(new Engine(), ruleRegistry),
      ...buildingCancelled(ruleRegistry)
    );

    return { cityBuild, unavailable };
  };

  it('should start what a city on Auto needs most once its build is complete, but never a unit', async (): Promise<void> => {
    const { cityBuild } = await setUp();

    cityBuild.setAuto(true);
    cityBuild.build(Granary);
    cityBuild.add(cityBuild.cost());
    cityBuild.check();

    expect(cityBuild.building()!.item()).equal(Temple);
  });

  it('should leave a city that is not on Auto for its player to choose', async (): Promise<void> => {
    const { cityBuild } = await setUp();

    cityBuild.build(Granary);
    cityBuild.add(cityBuild.cost());
    cityBuild.check();

    expect(cityBuild.building()).null;
  });

  it('should choose again when a city on Auto can no longer build what it was building', async (): Promise<void> => {
    const { cityBuild, unavailable } = await setUp();

    cityBuild.setAuto(true);
    cityBuild.build(Temple);
    unavailable.add(Temple);
    cityBuild.revalidate();

    expect(cityBuild.building()!.item()).equal(Granary);
  });
});
