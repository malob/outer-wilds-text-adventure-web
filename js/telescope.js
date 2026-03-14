// FrequencyButton, Telescope, SignalSource — ported from Telescope.pde
// (Signal class extracted to signal.js)
//
// Frequency values as an ordered array for cycling — replaces Java's Frequency.values()/ordinal()
const FREQUENCY_VALUES = [Frequency.BEACON, Frequency.QUANTUM, Frequency.TRAVELER];

class FrequencyButton extends Button {
  constructor(rightFacing) {
    if (rightFacing) {
      super('Switch Frequency', width / 2 + 140, 40, 50, 50);
    } else {
      super('Switch Frequency', width / 2 - 140, 40, 50, 50);
    }
    this._rightFacing = rightFacing;
  }

  drawShape() {
    push();
    translate(this.screenPosition.x, this.screenPosition.y);

    if (this._rightFacing) {
      triangle(25, 0, 0, 15, 0, -15);
    } else {
      triangle(-25, 0, 0, 15, 0, -15);
    }

    pop();
  }

  drawText(alpha) {
    // no text drawn
  }
}

class Telescope {
  constructor() {
    this._frequency = Frequency.TRAVELER;
    this._signalStrength = 0;
  }

  update(signalSources) {
    this._signalStrength = 0;

    for (let i = 0; i < signalSources.length; i++) {
      this._signalStrength += signalSources[i].getSignalStrength(new Vector2(mouseX, mouseY), this._frequency);
    }
  }

  render() {
    let frequencyText = frequencyToString(this._frequency);

    if (!playerData.knowsFrequency(this._frequency)) {
      if (this._frequency === Frequency.BEACON) {
        frequencyText = 'Unknown Frequency 001';
      } else if (this._frequency === Frequency.QUANTUM) {
        frequencyText = 'Unknown Frequency 002';
      }
    }

    const xPos = width / 2;

    fill(0, 0, 100);
    textSize(18);
    mediumFont();
    text(frequencyText, xPos, 40);
    smallFont();

    // draw signal feedback
    stroke(0, 0, 100);
    fill(200, 100, 100);
    rectMode(CENTER);
    rect(xPos, 70, max(0, this._signalStrength * 300 - random(50)), 7);

    // draw crosshairs
    noFill();
    stroke(0, 0, 100);
    line(mouseX, 0, mouseX, height);
    line(0, mouseY, width, mouseY);
  }

  nextFrequency() {
    const index = (FREQUENCY_VALUES.indexOf(this._frequency) + 1) % FREQUENCY_VALUES.length;
    this._frequency = FREQUENCY_VALUES[index];
  }

  previousFrequency() {
    let index = FREQUENCY_VALUES.indexOf(this._frequency) - 1;
    if (index < 0) {
      index = FREQUENCY_VALUES.length - 1;
    }
    this._frequency = FREQUENCY_VALUES[index];
  }
}

class SignalSource extends Entity {
  constructor(nodeOrPosition, sectorOrUndefined) {
    super();
    this._signals = [];

    if (nodeOrPosition instanceof Node) {
      // SignalSource(node) constructor
      // Defensive copy — prevents shared reference mutation (see PORTING.md)
      this.setScreenPosition(new Vector2(nodeOrPosition.screenPosition));
      this._signals.push(nodeOrPosition.getSignal());
    } else {
      // SignalSource(screenPosition, sector) constructor
      this.setScreenPosition(new Vector2(nodeOrPosition));
      this._signals = sectorOrUndefined.getSectorSignals();
    }
  }

  addSignal(signal) {
    this._signals.push(signal);
  }

  getSignalStrength(telescopePos, frequency) {
    if (this.hasSignalWithFrequency(frequency)) {
      const d = telescopePos.sub(this.screenPosition);
      const dist = d.magnitude();

      const u = max(0, 1 - (dist / 150));
      return u * u * u;
    }
    return 0;
  }

  hasSignalWithFrequency(frequency) {
    for (let i = 0; i < this._signals.length; i++) {
      if (this._signals[i].frequency === frequency) {
        return true;
      }
    }
    return false;
  }
}
