// StatusFeed + StatusLine — ported from StatusFeed.pde
class StatusFeed {
  constructor() {
    this.MAX_LINES = 3;
    this._feed = [];
  }

  init() {
    this._feed = [];
    messenger.addObserver(this);
  }

  clear() {
    this._feed = [];
  }

  onReceiveGlobalMessage(message) {
    // stub
  }

  publish(newLine, important) {
    this._feed.push(new StatusLine(newLine, important || false));

    if (this._feed.length > this.MAX_LINES) {
      this._feed.shift();
    }
  }

  render() {
    for (let i = 0; i < this._feed.length; i++) {
      if (!this._feed[i].draw(20, 30 + i * 25)) {
        break; // break if the current line hasn't finished displaying
      }
    }
  }
}

class StatusLine {
  constructor(newLine, important) {
    this._line = newLine;
    this._initTime = 0;
    this._displayTriggered = false;
    this._lineColor = null;
    this._important = important;
    this.SPEED = 0.08;
  }

  _getLineColor() {
    if (this._lineColor === null) {
      this._lineColor = this._important ? color(100, 100, 100) : color(0, 0, 100);
    }
    return this._lineColor;
  }

  draw(x, y) {
    if (!this._displayTriggered) {
      this._initTime = millis();
      this._displayTriggered = true;
    }

    textAlign(LEFT);
    mediumFont();
    fill(this._getLineColor());
    text(this._line.substring(0, min(this._line.length, this.getDisplayLength())), x, y);
    smallFont();

    // is this line fully displayed?
    return this._line.length <= this.getDisplayLength();
  }

  getDisplayLength() {
    return Math.floor((millis() - this._initTime) * this.SPEED);
  }
}
