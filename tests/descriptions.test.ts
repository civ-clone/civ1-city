import { Corruption } from '../Yields';
import { Palace } from '@civ-clone/library-city/CityImprovements';
import yieldRules from '../Rules/City/yield';
import { expect } from 'chai';

// What the Palace says it does, for the Civilopedia (civ-clone/web-renderer#1196), on the rule that measures
//  corruption from it.
describe('descriptions', (): void => {
  it('the Palace is the capital corruption is measured from', (): void => {
    const described = yieldRules().filter(
      (rule) => rule.descriptions().length > 0
    );

    expect(described.map((rule) => rule.id())).to.eql([
      'civ1-city:city/yield/corruption',
    ]);
    expect(described[0].descriptions()).to.eql([
      { type: 'capital', subject: Palace, yield: Corruption },
    ]);
  });
});
