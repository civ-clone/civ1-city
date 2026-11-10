import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import { expect } from 'chai';
import { generateTile } from '@civ-clone/core-world/tests/lib/buildWorld';
import renamed from '../Rules/City/renamed';

describe('city:renamed', (): void => {
  it("should claim a renamed city's new name, however it was renamed", async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      claimed: string[] = [],
      cityNames = { claim: (name: string): void => void claimed.push(name) };

    ruleRegistry.register(...renamed(cityNames));

    const city = new City(
      new Player(ruleRegistry),
      await generateTile(ruleRegistry),
      'Thebes',
      ruleRegistry,
      new WorkedTileRegistry()
    );

    // Founding it is no rename: the name it was founded with is taken by whatever founded it.
    expect(claimed).eql([]);

    city.setName('Athens');
    city.setName('Athens');
    city.setName('Sparta');

    expect(claimed).eql(['Athens', 'Sparta']);
  });
});
