// Extracted from Telescope.pde (lines 167-185 in the original).
class Signal {
  constructor(frequencyStr) {
    this.frequency = Signal.parseFrequency(frequencyStr);
  }

  static parseFrequency(str) {
    const upper = str.toUpperCase();
    if (Frequency[upper] !== undefined) {
      return Frequency[upper];
    }
    console.log('Unknown frequency: ' + str);
    return null;
  }
}
