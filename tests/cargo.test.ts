import { Trireme, Warrior } from '@civ-clone/civ1-unit/Units';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import { Move } from '@civ-clone/civ1-unit/Actions';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import ValidateMove from '@civ-clone/core-unit/Rules/ValidateMove';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import canBeWorked from '../Rules/City/can-be-worked';
import { citizenCount } from '../lib/assignWorkers';
import { instance as cityGrowthRegistryInstance } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import created from '../Rules/City/created';
import { expect } from 'chai';
import grow from '../Rules/City/grow';
import moved from '../Rules/Unit/moved';
import setUpCity from './lib/setUpCity';
import tileReassigned from '../Rules/City/tile-reassigned';
import tiles from '../Rules/City/tiles';
import unitMoved from '@civ-clone/civ1-unit/Rules/Unit/moved';
import unitYield from '@civ-clone/civ1-unit/Rules/Unit/yield';

describe('A transport and its cargo moving onto a worked tile', (): void => {
  it('should release the tile once, for the transport and its cargo, without throwing (civ-clone/web-renderer#225)', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      cityRegistry = new CityRegistry(),
      unitRegistry = new UnitRegistry(),
      transportRegistry = new TransportRegistry(),
      workedTileRegistry = new WorkedTileRegistry(ruleRegistry);

    ruleRegistry.register(
      // `civ1-unit`'s `Moved` rules come before this package's in a game, so a transport's cargo is moved (and the
      // cargo's own `Moved` rules run) before this package's rule acts for the transport, but after every `Moved`
      // rule's criteria have been checked for it.
      ...unitMoved(transportRegistry, ruleRegistry),
      ...unitYield(
        new UnitImprovementRegistry(),
        ruleRegistry,
        transportRegistry
      ),
      new MovementCost(new Effect((): number => 1)),
      new ValidateMove(new Effect((): boolean => true)),
      ...canBeWorked(cityRegistry, unitRegistry, workedTileRegistry),
      ...created(
        undefined,
        undefined,
        undefined,
        cityRegistry,
        undefined,
        ruleRegistry,
        undefined,
        undefined,
        workedTileRegistry
      ),
      ...grow(undefined, undefined, workedTileRegistry),
      ...tileReassigned(undefined, undefined, workedTileRegistry),
      ...tiles(),
      ...moved(ruleRegistry, workedTileRegistry)
    );

    const city = await setUpCity({
        size: 3,
        ruleRegistry,
        workedTileRegistry,
      }),
      [targetTile] = city
        .tilesWorked()
        .entries()
        .filter((tile: Tile): boolean => tile !== city.tile()),
      [from] = city
        .tiles()
        .entries()
        .filter(
          (tile: Tile): boolean =>
            tile.isNeighbourOf(targetTile) &&
            !workedTileRegistry.tileIsWorked(tile)
        ),
      enemy = new Player(ruleRegistry),
      trireme = new Trireme(null, enemy, from, ruleRegistry, transportRegistry),
      warrior = new Warrior(null, enemy, from, ruleRegistry);

    unitRegistry.register(trireme, warrior);
    expect(trireme.stow(warrior)).to.be.true;
    expect(trireme.hasCargo()).to.be.true;

    trireme.action(new Move(from, targetTile, trireme, ruleRegistry));

    expect(trireme.tile() === targetTile, 'the transport moved').to.be.true;
    expect(warrior.tile() === targetTile, 'the cargo moved').to.be.true;
    expect(workedTileRegistry.tileIsWorked(targetTile)).to.be.false;
    expect(citizenCount(city, workedTileRegistry)).to.equal(
      cityGrowthRegistryInstance.getByCity(city).size() + 1
    );
  });
});
