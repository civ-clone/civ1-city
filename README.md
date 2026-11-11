# civ1-city

Contains the `Rule`s for dealing with cities, `Cost`s, growth, building (except for build costs which are defined
against `Unit`s and `CityImprovement`s). Aims to be compatible with Civ 1.

## A captured city's build

As v474.05, a computer player that captures a city chooses its build again (`civ1-city:city/captured/clear-build`), and
the human keeps what it was building, from no shields, at their own price and with no queue
(`civ1-city:city/captured/keep-build`). v474.05's one human is, here, every player whose seat is not played by the
computer (`civ1-difficulty`'s `isHuman`: a player with a client, none of them an `AIClient`). A player with no client
counts as a computer player. `civ1-enhanced` clears the build for the human too, superseding `keep-build` while its set
is on (civ-clone/web-renderer#954).