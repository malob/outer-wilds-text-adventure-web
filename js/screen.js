// Screen base class + ScreenManager
// Ported from Screen.pde and ScreenManager.pde

class Screen {
  constructor() {
    this.active = false;
    this.overlay = false;
    this._buttons = [];
    this._toolbarButtons = [];
    this._starPositions = [];

    for (let i = 0; i < 1000; i++) {
      this._starPositions.push(new Vector2(random(0, width), random(90, height - 90)));
    }

    this._toolbarRoot = new Entity(width / 2, height - 50);
  }

  addButton(button) {
    this._buttons.push(button);
    button.setObserver(this);
  }

  removeButton(button) {
    const idx = this._buttons.indexOf(button);
    if (idx !== -1) {
      this._buttons.splice(idx, 1);
    }
  }

  addButtonToToolbar(button) {
    this.addButton(button);
    this._toolbarButtons.push(button);
    this._toolbarRoot.addChild(button);
    this.updateToolbarPositions();
  }

  removeButtonFromToolbar(button) {
    this.removeButton(button);
    const idx = this._toolbarButtons.indexOf(button);
    if (idx !== -1) {
      this._toolbarButtons.splice(idx, 1);
    }
    this._toolbarRoot.removeChild(button);
    this.updateToolbarPositions();
  }

  updateToolbarPositions() {
    const margins = 10;
    let toolbarWidth = -margins;

    for (let i = 0; i < this._toolbarButtons.length; i++) {
      toolbarWidth += margins;
      toolbarWidth += this._toolbarButtons[i].getWidth();
    }

    let xPos = -(toolbarWidth * 0.5);

    for (let i = 0; i < this._toolbarButtons.length; i++) {
      const buttonHalfWidth = this._toolbarButtons[i].getWidth() * 0.5;
      xPos += buttonHalfWidth;
      this._toolbarButtons[i].setPosition(xPos, 0);
      xPos += buttonHalfWidth + margins;
    }
  }

  update() {}
  render() {}
  onEnter() {}
  onExit() {}
  onButtonUp(button) {}
  onButtonEnterHover(button) {}
  onButtonExitHover(button) {}

  updateInput() {
    for (let i = 0; i < this._buttons.length; i++) {
      this._buttons[i].update();
    }
  }

  renderBackground() {
    let bgColor = color(0, 0, 0);
    let starColor = color(0, 0, 100);

    // superhack to invert colors when player is at EYE_OF_THE_UNIVERSE
    if (playerData.isPlayerAtEOTU()) {
      bgColor = color(0, 0, 100);
      starColor = color(0, 0, 0);
    }

    background(bgColor);
    noStroke();

    for (let j = 0; j < this._starPositions.length; j++) {
      fill(starColor);
      rectMode(CENTER);
      rect(this._starPositions[j].x, this._starPositions[j].y, 2, 2);
    }
  }

  renderButtons() {
    if (this.active) {
      for (let i = 0; i < this._buttons.length; i++) {
        this._buttons[i].render();
      }
    }
  }
}

class ScreenManager {
  constructor() {
    this._screenStack = [];
    this._skipRender = false;
  }

  lateUpdate() {}

  runGameLoop() {
    if (this._screenStack.length > 0) {
      this._skipRender = false;

      const activeScreen = this._screenStack[this._screenStack.length - 1];
      activeScreen.updateInput();
      activeScreen.update();
      this.lateUpdate();

      if (this._skipRender) return;

      let lowestRenderIndex = 0;
      for (let i = this._screenStack.length - 1; i >= 0; i--) {
        if (!this._screenStack[i].overlay) {
          lowestRenderIndex = i;
          break;
        }
      }

      for (let i = lowestRenderIndex; i < this._screenStack.length; i++) {
        this._screenStack[i].renderBackground();
        this._screenStack[i].renderButtons();
        this._screenStack[i].render();
      }
    } else {
      console.log('No screens on the stack!!!');
    }
  }

  swapScreen(newScreen) {
    if (this._screenStack.length > 0) {
      this._screenStack[this._screenStack.length - 1].onExit();
      this._screenStack[this._screenStack.length - 1].active = false;
      this._screenStack.splice(this._screenStack.length - 1, 1);
    }

    this._screenStack.push(newScreen);
    this._screenStack[this._screenStack.length - 1].active = true;
    this._screenStack[this._screenStack.length - 1].onEnter();

    this._skipRender = true;
    console.log('SWAP: ' + newScreen.constructor.name);
  }

  pushScreen(nextScreen) {
    if (this._screenStack.length > 0) {
      this._screenStack[this._screenStack.length - 1].onExit();
      this._screenStack[this._screenStack.length - 1].active = false;
    }

    this._screenStack.push(nextScreen);
    nextScreen.active = true;
    nextScreen.onEnter();

    this._skipRender = true;
    console.log('PUSH: ' + nextScreen.constructor.name);
  }

  popScreen() {
    this._screenStack[this._screenStack.length - 1].onExit();
    this._screenStack[this._screenStack.length - 1].active = false;
    this._screenStack.splice(this._screenStack.length - 1, 1);

    if (this._screenStack.length > 0) {
      this._screenStack[this._screenStack.length - 1].active = true;
      this._screenStack[this._screenStack.length - 1].onEnter();
    }

    this._skipRender = true;
    console.log('POP');
  }
}
