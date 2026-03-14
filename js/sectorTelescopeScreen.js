// SectorTelescopeScreen - telescope view within a sector
// Ported from SectorTelescopeScreen.pde

class SectorTelescopeScreen extends Screen {
  constructor(sector, telescope) {
    super();
    this._sector = sector;
    this._telescope = telescope;
    this._signalSources = sector.getSectorSignalSources();

    this.addButton(this._nextFrequency = new FrequencyButton(true));
    this.addButton(this._previousFrequency = new FrequencyButton(false));

    this.addButtonToToolbar(this._zoomOutButton = new Button('Zoom Out', 0, 0, 150, 50));
    this.addButtonToToolbar(this._exitButton = new Button('Exit', 0, 0, 150, 50));
  }

  onEnter() {
    noCursor();
  }

  onExit() {
    cursor();
  }

  update() {
    this._telescope.update(this._signalSources);
  }

  renderBackground() {
    super.renderBackground();
    this._sector.renderBackground();
  }

  render() {
    this._sector.render();
    this._telescope.render();
  }

  onButtonUp(button) {
    if (button === this._exitButton) {
      gameManager.popScreen();
      gameManager.popScreen();
    } else if (button === this._zoomOutButton) {
      gameManager.popScreen();
    } else if (button === this._nextFrequency) {
      this._telescope.nextFrequency();
    } else if (button === this._previousFrequency) {
      this._telescope.previousFrequency();
    }
  }
}
