// ExploreScreen - exploration overlay
// Ported from ExploreScreen.pde

class ExploreScreen extends Screen {
  constructor(location) {
    super();
    this._exploreData = location.getExploreData();
    this.overlay = true;

    this.BOX_WIDTH = 700;
    this.BOX_HEIGHT = 400;

    this.addButtonToToolbar(this._databaseButton = new Button('Use Database', 0, 0, 150, 50));
    this.addButtonToToolbar(this._waitButton = new Button('Wait [1 min]', 0, 0, 150, 50));
    this.addButtonToToolbar(this._backButton = new Button('Continue', 0, 0, 150, 50));

    this._exploreData.parseJSON();
  }

  update() {}

  renderBackground() {}

  render() {
    push();
    translate(width / 2 - this.BOX_WIDTH / 2, height / 2 - this.BOX_HEIGHT / 2);

    stroke(0, 0, 100);
    fill(0, 0, 0);
    rectMode(CORNER);
    rect(0, 0, this.BOX_WIDTH, this.BOX_HEIGHT);

    fill(0, 0, 100);
    mediumFont();
    textSize(18);
    textAlign(LEFT, TOP);
    text(this._exploreData.getExploreText(), 10, 10, this.BOX_WIDTH - 20, this.BOX_HEIGHT - 10);

    pop();

    feed.render();
    timeLoop.renderTimer();
  }

  onEnter() {}
  onExit() {}

  // DatabaseObserver
  onInvokeClue(clue) {
    if (this._exploreData.canClueBeInvoked(clue.id)) {
      gameManager.popScreen();
      this._exploreData.invokeClue(clue.id);
      this._exploreData.explore();
    } else if (locator.player.currentSector != null && locator.player.currentSector.canClueBeInvoked(clue)) {
      gameManager.popScreen();
      locator.player.currentSector.invokeClue(clue);
    } else {
      feed.publish("that doesn't help you right now", true);
    }
  }

  onButtonUp(button) {
    if (button === this._databaseButton) {
      gameManager.pushScreen(gameManager.databaseScreen);
      gameManager.databaseScreen.setObserver(this);
    } else if (button === this._backButton) {
      gameManager.popScreen();
    } else if (button === this._waitButton) {
      timeLoop.waitFor(1);
      this._exploreData.explore();
    }
  }
}
