import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Buildable, { IBuildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import buildingCancelled from '../Rules/City/building-cancelled';
import buildingComplete from '../Rules/City/building-complete';
import playerTurnStart from '../Rules/Player/turn-start';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import { buildCosts } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';

describe('city:auto-build', (): void => {
  class Granary extends CityImprovement {}
  class Temple extends CityImprovement {}
  // Neither a unit nor an improvement, like a spaceship part.
  class Part extends Buildable {
    static build(): Part {
      return new Part();
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
      unavailable = new Set<IBuildable>(),
      priority = (Item: IBuildable, score: number): BuildPriority =>
        new BuildPriority(
          new Criterion(
            (cityBuild: CityBuild, BuildItem: IBuildable): boolean =>
              BuildItem === Item
          ),
          new Effect((): number => score)
        );

    availableBuildItemsRegistry.register(
      Granary,
      Part,
      Temple,
      Warrior as unknown as typeof Buildable
    );

    ruleRegistry.register(
      new Build(
        new Effect(
          (city, BuildItem: IBuildable): IBuildCriterion =>
            new Criterion((): boolean => !unavailable.has(BuildItem))
        )
      ),
      ...buildCosts([
        [Granary, 40],
        [Part, 20],
        [Temple, 30],
        [Warrior as unknown as typeof Buildable, 10],
      ]),
      priority(Warrior as unknown as typeof Buildable, 5),
      priority(Part, 4),
      priority(Temple, 2),
      priority(Granary, 1),
      ...buildingComplete(new Engine(), ruleRegistry),
      ...buildingCancelled(ruleRegistry)
    );

    return { cityBuild, ruleRegistry, unavailable };
  };

  it('should start what a city on Auto needs most once its build is complete, but only an improvement', async (): Promise<void> => {
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

  it('should choose at the start of a turn in a city on Auto that had nothing it would choose', async (): Promise<void> => {
    const { cityBuild, ruleRegistry, unavailable } = await setUp(),
      city = cityBuild.city();

    ruleRegistry.register(
      ...playerTurnStart(
        { getByPlayer: () => [city] } as unknown as CityRegistry,
        new UnitRegistry(),
        new WorkedTileRegistry(ruleRegistry),
        ruleRegistry,
        { getByCity: () => cityBuild } as unknown as CityBuildRegistry
      )
    );

    unavailable.add(Granary);
    unavailable.add(Temple);
    cityBuild.setAuto(true);

    ruleRegistry.process(TurnStart, city.player());

    expect(cityBuild.building()).null;

    unavailable.delete(Temple);

    ruleRegistry.process(TurnStart, city.player());

    expect(cityBuild.building()!.item()).equal(Temple);
  });
});
