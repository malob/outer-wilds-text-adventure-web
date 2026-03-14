// SolarSystemScreen + TelescopeScreen + MapScreen
// Ported from SolarSystemScreen.pde

class SolarSystemScreen extends Screen {
  constructor(solarSystem) {
    super();

    this._solarSystem = solarSystem;
    this._player = solarSystem.player;
    this._ship = solarSystem.ship;

    this._focusSectorButton = null;

    this._sectorButtons = [];
    const buttonHeight = height / 2;

    this._sectorButtons.push(this._hourglassButton_left = new HourglassTwinsButton(170, buttonHeight, false, this._solarSystem.rockyTwin));
    this._sectorButtons.push(this._hourglassButton_right = new HourglassTwinsButton(170, buttonHeight, true, this._solarSystem.sandyTwin));
    this._sectorButtons.push(this._timberButton = new TimberHearthButton(300, buttonHeight, this._solarSystem.timberHearth));
    this._sectorButtons.push(this._brittleButton = new BrittleHollowButton(420, buttonHeight, this._solarSystem.brittleHollow));
    this._sectorButtons.push(this._giantsButton = new GiantsDeepButton(580, buttonHeight, this._solarSystem.giantsDeep));
    this._sectorButtons.push(this._darkButton = new DarkBrambleButton(810, buttonHeight, this._solarSystem.darkBramble));
    this._sectorButtons.push(this._cometButton = new CometButton(600, buttonHeight + 200, this._solarSystem.comet));

    const targets = [this._hourglassButton_right, this._timberButton, this._brittleButton, this._giantsButton];
    this._sectorButtons.push(this._quantumButton = new QuantumMoonButton(targets, this._solarSystem.quantumMoon));

    for (let i = 0; i < this._sectorButtons.length; i++) {
      this.addButton(this._sectorButtons[i]);
    }
  }

  onEnter() {
    this._quantumButton.collapse();
  }

  update() {}

  render() {
    // draw sun
    stroke(40, 100, 100);
    fill(0, 0, 0);
    ellipse(-430, height / 2, 1000, 1000);

    if (this._ship.currentSector == null) {
      this._ship.render();
    }
    if (this._player.currentSector == null) {
      this._player.render();
    }
  }

  onButtonEnterHover(button) {
    if (this._sectorButtons.includes(button)) {
      this._focusSectorButton = button;
    }
  }

  onButtonExitHover(button) {
    if (button === this._focusSectorButton) {
      this._focusSectorButton = null;
    }
  }

  onButtonUp(button) {
    if (this._sectorButtons.includes(button)) {
      this.selectSector(button.getSector());
    }
  }

  selectSector(selectedSector) {}

  getSectorScreenPosition(sector) {
    for (let i = 0; i < this._sectorButtons.length; i++) {
      if (this._sectorButtons[i].getSector() === sector) {
        return this._sectorButtons[i].screenPosition;
      }
    }
    return null;
  }
}

class SolarSystemTelescopeScreen extends SolarSystemScreen {
  constructor(solarSystem, telescope) {
    super(solarSystem);

    this.addButton(this._nextFrequency = new FrequencyButton(true));
    this.addButton(this._previousFrequency = new FrequencyButton(false));

    this.addButtonToToolbar(this._exitButton = new Button('Exit', 0, 0, 150, 50));

    this._telescope = telescope;
    this._signalSources = null;
  }

  onEnter() {
    super.onEnter();
    noCursor();

    // must do this after quantum moon collapses
    this._signalSources = [];
    this._signalSources.push(new SignalSource(new Vector2(this._cometButton.screenPosition), this._cometButton.getSector()));
    this._signalSources.push(new SignalSource(new Vector2(this._hourglassButton_left.screenPosition), this._hourglassButton_left.getSector()));
    this._signalSources.push(new SignalSource(new Vector2(this._timberButton.screenPosition), this._timberButton.getSector()));
    this._signalSources.push(new SignalSource(new Vector2(this._brittleButton.screenPosition), this._brittleButton.getSector()));
    this._signalSources.push(new SignalSource(new Vector2(this._giantsButton.screenPosition), this._giantsButton.getSector()));
    this._signalSources.push(new SignalSource(new Vector2(this._darkButton.screenPosition), this._darkButton.getSector()));
    this._signalSources.push(new SignalSource(new Vector2(this._quantumButton.screenPosition), this._quantumButton.getSector()));
  }

  onExit() {
    cursor();
  }

  update() {
    super.update();
    this._telescope.update(this._signalSources);
  }

  render() {
    super.render();
    this._telescope.render();

    if (this._focusSectorButton != null) {
      this._focusSectorButton.drawName();
    }

    if (this._focusSectorButton != null) {
      this._focusSectorButton.drawZoomPrompt();
    }
  }

  selectSector(selectedSector) {
    gameManager.loadSectorTelescopeView(selectedSector);
  }

  onButtonUp(button) {
    super.onButtonUp(button);

    if (button === this._exitButton) {
      gameManager.popScreen();
    } else if (button === this._nextFrequency) {
      this._telescope.nextFrequency();
    } else if (button === this._previousFrequency) {
      this._telescope.previousFrequency();
    }
  }
}

class SolarSystemMapScreen extends SolarSystemScreen {
  constructor(solarSystem) {
    super(solarSystem);
    this.addButtonToToolbar(this._databaseButton = new Button('View Database', 0, 0, 150, 50));
    this.addButtonToToolbar(this._telescopeButton = new Button('Scan For Signals', 0, 0, 150, 50));
  }

  render() {
    super.render();

    if (this._focusSectorButton != null) {
      this._focusSectorButton.drawName();
    }

    feed.render();
    timeLoop.renderTimer();
  }

  onEnter() {
    super.onEnter();
    this.setActorPosition(this._player);
    this.setActorPosition(this._ship);
  }

  setActorPosition(actor) {
    const idlePos = new Vector2(200, height - 200);

    if (actor.lastSector != null) {
      actor.setScreenPosition(new Vector2(this.getSectorScreenPosition(actor.lastSector)));
    } else {
      actor.setScreenPosition(new Vector2(idlePos));
    }

    actor.moveToScreenPosition(idlePos);
    actor.lastSector = null;
  }

  update() {
    this._player.update();
    this._ship.update();
  }

  onButtonUp(button) {
    if (button === this._databaseButton) {
      gameManager.pushScreen(gameManager.databaseScreen);
    } else if (button === this._telescopeButton) {
      gameManager.loadTelescopeView();
    }

    super.onButtonUp(button);
  }

  selectSector(selectedSector) {
    let nextSector = selectedSector;

    if (this._solarSystem.ship.currentSector == null) {
      nextSector.addActor(this._solarSystem.ship);
    }

    if (this._solarSystem.player.currentSector == null) {
      nextSector.addActor(this._solarSystem.player);
    }

    gameManager.loadSector(nextSector);
    nextSector.onArrival();
  }
}
