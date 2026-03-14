// GameManager - main game controller
// Ported from GameManager.pde

class GameManager extends ScreenManager {
  constructor() {
    super();
    this.titleScreen = null;
    this.databaseScreen = null;
    this.solarSystemMapScreen = null;
    this._solarSystem = null;
    this._telescope = null;
    this._flashbackTriggered = false;
  }

  newGame() {
    this.setupSolarSystem();

    this.titleScreen = new TitleScreen();
    this.databaseScreen = new DatabaseScreen();

    this.pushScreen(this.titleScreen);
  }

  resetTimeLoop() {
    this._flashbackTriggered = false;
    this._screenStack = [];
    this.setupSolarSystem();
    this.loadSector(SectorName.TIMBER_HEARTH);
  }

  setupSolarSystem() {
    messenger.removeAllObservers();
    messenger.addObserver(this);

    feed.init();
    timeLoop.init();
    playerData.init();

    this._telescope = new Telescope();

    this._solarSystem = new SolarSystem();
    this._solarSystem.timberHearth.addActor(this._solarSystem.player, 'Village');

    this.solarSystemMapScreen = new SolarSystemMapScreen(this._solarSystem);

    if (playerData.knowsLaunchCodes()) {
      messenger.sendMessage('spawn ship');
    }

    locator = new Locator();
  }

  // runs after everything else updates
  lateUpdate() {
    // check if the sun explodes (this check has to be last to override all other screens)
    timeLoop.lateUpdate();

    // check if the player died
    if (playerData.isPlayerDead() && !this._flashbackTriggered) {
      this._flashbackTriggered = true;

      if (timeLoop.getEnabled()) {
        this.swapScreen(new FlashbackScreen());
      } else {
        this.swapScreen(new GameOverScreen());
      }
    }
  }

  onReceiveGlobalMessage(message) {
    // TRIGGERED FROM SECTORSCREEN (NOT EXPLORE SCREEN)
    if (message.id === 'death by anglerfish') {
      this.pushScreen(new DeathByAnglerfishScreen());
    } else if (message.id === 'dive attempt') {
      this.pushScreen(new DiveAttemptScreen());
    }
    // TRIGGERED FROM EVENT SCREEN
    else if (message.id === 'follow the vine') {
      this.swapScreen(new FollowTheVineScreen());
    }
    // TRIGGERED FROM EXPLORE DATA
    else if (message.id === 'explore ancient vessel') {
      this.swapScreen(new AncientVesselScreen());
    } else if (message.id === 'time loop central') {
      this.swapScreen(new TimeLoopCentralScreen());
    } else if (message.id === 'older than the universe') {
      this.swapScreen(new EyeOfTheUniverseScreen());
    } else if (message.id === 'explore bramble outskirts') {
      this.swapScreen(new BrambleOutskirtsScreen());
    }
  }

  loadTelescopeView() {
    this.pushScreen(new SolarSystemTelescopeScreen(this._solarSystem, this._telescope));
  }

  loadSectorTelescopeView(sector) {
    this.pushScreen(new SectorTelescopeScreen(sector, this._telescope));
  }

  loadSolarSystemMap() {
    this.swapScreen(this.solarSystemMapScreen);
  }

  loadSector(sectorNameOrSector) {
    let sector = sectorNameOrSector;
    if (typeof sectorNameOrSector === 'string') {
      sector = this._solarSystem.getSectorByName(sectorNameOrSector);
    }
    this.swapScreen(new SectorScreen(sector, this._solarSystem.player, this._solarSystem.ship));
  }
}
