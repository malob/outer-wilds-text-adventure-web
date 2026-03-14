// DatabaseScreen + ClueButton
// Ported from DatabaseScreen.pde

class DatabaseScreen extends Screen {
  constructor() {
    super();
    this._activeClue = null;
    this._observer = null;

    this.addButtonToToolbar(new Button('Close Database', 0, 0, 150, 50));
    this._clueRoot = new Entity(100, 140);

    for (let i = 0; i < playerData.getClueCount(); i++) {
      const clueButton = new ClueButton(playerData.getClueAt(i), i * 40, this);
      this.addButton(clueButton);
      this._clueRoot.addChild(clueButton);
    }
  }

  setObserver(observer) {
    this._observer = observer;
  }

  onEnter() {}

  onExit() {
    this._observer = null;
  }

  // ClueButtonObserver
  onClueMouseOver(clue) {
    this._activeClue = clue;
  }

  onClueSelected(clue) {
    if (this._observer != null) {
      this._observer.onInvokeClue(clue);
    } else {
      feed.publish("that doesn't help you right now", true);
    }
  }

  onButtonUp(button) {
    if (button.id === 'Close Database') {
      gameManager.popScreen();
    }
  }

  update() {}

  render() {
    fill(0, 0, 0);
    stroke(0, 0, 100);
    rectMode(CORNER);

    const x = width / 2 - 100;
    const y = 200;
    const w = 500;
    const h = 300;

    rect(x, y, w, h);

    let displayText = 'Select An Entry';

    if (this._activeClue != null) {
      displayText = this._activeClue.description;
    } else if (playerData.getKnownClueCount() === 0) {
      displayText = 'No Entries Yet';
    }

    mediumFont();
    textSize(18);
    textAlign(LEFT, TOP);
    fill(0, 0, 100);
    text(displayText, x + 10, y + 10, w - 20, h - 20);

    feed.render();
  }
}

class ClueButton extends Button {
  constructor(clue, y, observer) {
    // Use textWidth for accurate measurement (BitmapText overrides textWidth)
    const w = textWidth(clue.name) + 10;
    super(clue.name, w * 0.5, y, w, 20);
    this._clue = clue;
    this._clueObserver = observer;
    this._symbolColor = null;
  }

  getClue() {
    return this._clue;
  }

  _getSymbolColor() {
    if (this._symbolColor === null) {
      if (this._clue.curiosity === Curiosity.VESSEL) {
        this._symbolColor = color(100, 100, 100);
      } else if (this._clue.curiosity === Curiosity.ANCIENT_PROBE_LAUNCHER) {
        this._symbolColor = color(200, 100, 100);
      } else if (this._clue.curiosity === Curiosity.TIME_LOOP_DEVICE) {
        this._symbolColor = color(20, 100, 100);
      } else {
        this._symbolColor = color(300, 100, 100);
      }
    }
    return this._symbolColor;
  }

  update() {
    this.enabled = this._clue.discovered;
    this.visible = this._clue.discovered;
    super.update();
  }

  draw() {
    if (!this.visible) return;

    super.draw();

    const sc = this._getSymbolColor();
    fill(sc);
    noStroke();
    ellipse(this.screenPosition.x - this._bounds.x * 0.5 - 20, this.screenPosition.y, 10, 10);

    noFill();
    stroke(sc);
    ellipse(this.screenPosition.x - this._bounds.x * 0.5 - 20, this.screenPosition.y, 15, 15);
  }

  onButtonEnterHover() {
    this._clueObserver.onClueMouseOver(this._clue);
  }

  onButtonUp() {
    this._clueObserver.onClueSelected(this._clue);
  }
}
