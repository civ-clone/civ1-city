// The ids of this package's rules that another package is expected to name (civ-clone/web-renderer#954), as a rule
//  set that supersedes one does: imported, a rename breaks the other package's build rather than leaving both rules
//  running.

/** A city the human captures keeps what it was building, at the human's price, as v474.05. */
export const KEEP_BUILD_RULE = 'civ1-city:city/captured/keep-build';
