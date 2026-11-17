import {
  Arctic,
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Mountains,
  Plains,
  River,
  Swamp,
  Tundra,
} from '@civ-clone/civ1-world/Terrains';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import { Irrigation } from '@civ-clone/civ1-world/TileImprovements';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import available from '@civ-clone/civ1-world/Rules/TileImprovement/available';
import created from '../Rules/City/created';
import { expect } from 'chai';
import setUpCity from './lib/setUpCity';

// What a new city's square is given (v474.05 `CITY.C`, civ-clone/web-renderer#1029): a Road, and Irrigation only
//  where the terrain can be irrigated, whether or not there's water nearby.
describe('city:created', (): void => {
  const setUp = () => {
    const ruleRegistry = new RuleRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      playerWorldRegistry = new PlayerWorldRegistry(),
      workedTileRegistry = new WorkedTileRegistry(ruleRegistry),
      player = new Player(ruleRegistry);

    playerResearchRegistry.register(
      new PlayerResearch(player, new AdvanceRegistry(), ruleRegistry)
    );

    ruleRegistry.register(
      // Which tile improvements can be built where, as civ1-world registers them in a game.
      ...available(playerResearchRegistry, tileImprovementRegistry),
      ...created(
        tileImprovementRegistry,
        undefined,
        cityGrowthRegistry,
        new CityRegistry(),
        playerWorldRegistry,
        ruleRegistry,
        undefined,
        undefined,
        workedTileRegistry
      )
    );

    return {
      cityGrowthRegistry,
      player,
      playerWorldRegistry,
      ruleRegistry,
      tileImprovementRegistry,
      workedTileRegistry,
    };
  };

  (
    [
      [Desert, ['Irrigation', 'Road']],
      [Grassland, ['Irrigation', 'Road']],
      [Hills, ['Irrigation', 'Road']],
      [Plains, ['Irrigation', 'Road']],
      [River, ['Irrigation', 'Road']],
      [Arctic, ['Road']],
      [Forest, ['Road']],
      [Jungle, ['Road']],
      [Mountains, ['Road']],
      [Swamp, ['Road']],
      [Tundra, ['Road']],
    ] as [typeof Terrain, string[]][]
  ).forEach(([TerrainType, expected]) =>
    it(`should give a city founded on ${TerrainType.name} ${expected.join(
      ' and '
    )}`, async (): Promise<void> => {
      const {
          cityGrowthRegistry,
          player,
          playerWorldRegistry,
          ruleRegistry,
          tileImprovementRegistry,
          workedTileRegistry,
        } = setUp(),
        // The whole map is this terrain, so there's no water nearby.
        world = await generateWorld(
          generateGenerator(5, 5, TerrainType),
          ruleRegistry
        ),
        city = await setUpCity({
          ruleRegistry,
          tileImprovementRegistry,
          player,
          world,
          improveTerrain: false,
          playerWorldRegistry,
          cityGrowthRegistry,
          workedTileRegistry,
        });

      expect(city.tile().terrain()).instanceOf(TerrainType);
      expect(
        tileImprovementRegistry
          .getByTile(city.tile())
          .map(
            (improvement: TileImprovement): string =>
              improvement.constructor.name
          )
          .sort()
      ).to.deep.equal(expected);
    })
  );

  it('should leave a city square that is irrigated already as it is', async (): Promise<void> => {
    const {
        cityGrowthRegistry,
        player,
        playerWorldRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        workedTileRegistry,
      } = setUp(),
      world = await generateWorld(
        generateGenerator(5, 5, Grassland),
        ruleRegistry
      ),
      irrigation = new Irrigation(world.get(2, 2));

    tileImprovementRegistry.register(irrigation);

    const city = await setUpCity({
      ruleRegistry,
      tileImprovementRegistry,
      player,
      world,
      improveTerrain: false,
      playerWorldRegistry,
      cityGrowthRegistry,
      workedTileRegistry,
    });

    expect(
      tileImprovementRegistry
        .getByTile(city.tile())
        .filter((improvement) => improvement instanceof Irrigation)
    ).to.deep.equal([irrigation]);
  });
});
