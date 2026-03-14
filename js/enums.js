// Replaces Java enum types (SectorName, Frequency, Curiosity) used throughout the
// original .pde files. JavaScript has no native enums, so we use frozen objects
// with string values instead.
const SectorName = Object.freeze({
  NONE: 'NONE',
  ROCKY_TWIN: 'ROCKY_TWIN',
  SANDY_TWIN: 'SANDY_TWIN',
  TIMBER_HEARTH: 'TIMBER_HEARTH',
  BRITTLE_HOLLOW: 'BRITTLE_HOLLOW',
  GIANTS_DEEP: 'GIANTS_DEEP',
  DARK_BRAMBLE: 'DARK_BRAMBLE',
  COMET: 'COMET',
  QUANTUM_MOON: 'QUANTUM_MOON',
  EYE_OF_THE_UNIVERSE: 'EYE_OF_THE_UNIVERSE'
});

const Frequency = Object.freeze({
  BEACON: 'BEACON',
  QUANTUM: 'QUANTUM',
  TRAVELER: 'TRAVELER'
});

const Curiosity = Object.freeze({
  VESSEL: 'VESSEL',
  TIME_LOOP_DEVICE: 'TIME_LOOP_DEVICE',
  QUANTUM_MOON: 'QUANTUM_MOON',
  ANCIENT_PROBE_LAUNCHER: 'ANCIENT_PROBE_LAUNCHER'
});

