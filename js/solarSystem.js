// SolarSystem — ported from SolarSystem.pde
class SolarSystem {
  constructor() {
    messenger.addObserver(this);

    console.log('Solar System loading...');

    this._sectorList = [];

    this._sectorList.push(this.comet = new Comet());
    this._sectorList.push(this.rockyTwin = new RockyTwin());
    this._sectorList.push(this.sandyTwin = new SandyTwin());
    this._sectorList.push(this.timberHearth = new TimberHearth());
    this._sectorList.push(this.brittleHollow = new BrittleHollow());
    this._sectorList.push(this.giantsDeep = new GiantsDeep());
    this._sectorList.push(this.darkBramble = new DarkBramble());
    this._sectorList.push(this.quantumMoon = new QuantumMoon());
    this._sectorList.push(this.eyeOfTheUniverse = new EyeOfTheUniverse());

    this.comet.load();
    this.rockyTwin.load();
    this.sandyTwin.load();
    this.timberHearth.load();
    this.brittleHollow.load();
    this.giantsDeep.load();
    this.darkBramble.load();
    this.quantumMoon.load();
    this.eyeOfTheUniverse.load();

    this.player = new Player();
    this.ship = new Ship(this.player);
  }

  onReceiveGlobalMessage(message) {
    if (message.id === 'spawn ship') {
      this.timberHearth.addActor(this.ship, 'Village');

      // keeps player on top of ship
      const tNode = this.player.currentNode;
      this.timberHearth.removeActor(this.player);
      this.timberHearth.addActor(this.player, tNode);
    } else if (message.id === 'move to') {
      const node = this.getNodeByName(message.text);

      this.player.moveToNode(node);

      if (node.shipAccess) {
        this.ship.moveToNode(node);
      }

      feed.clear();
      feed.publish('you reach ' + node.getDescription());
    } else if (message.id === 'teleport to') {
      for (let i = 0; i < this._sectorList.length; i++) {
        const teleportNode = this._sectorList[i].getNode(message.text);

        if (teleportNode != null) {
          this.player.currentSector.removeActor(this.player);
          this._sectorList[i].addActor(this.player, teleportNode);
          gameManager.loadSector(this._sectorList[i]);

          feed.clear();
          feed.publish('you are teleported to ' + teleportNode.getDescription());
        }
      }
    } else if (message.id === 'quantum moon vanished') {
      this.player.currentSector.removeActor(this.player);
      this.ship.currentSector.removeActor(this.ship);
      gameManager.loadSolarSystemMap();
    }
  }

  isPlayerInShip() {
    return (this.player.currentNode === this.ship.currentNode);
  }

  getNodeByName(nodeName) {
    for (let i = 0; i < this._sectorList.length; i++) {
      const node = this._sectorList[i].getNode(nodeName);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  getSectorByName(sectorName) {
    switch (sectorName) {
      case SectorName.COMET: return this.comet;
      case SectorName.ROCKY_TWIN: return this.rockyTwin;
      case SectorName.SANDY_TWIN: return this.sandyTwin;
      case SectorName.TIMBER_HEARTH: return this.timberHearth;
      case SectorName.BRITTLE_HOLLOW: return this.brittleHollow;
      case SectorName.GIANTS_DEEP: return this.giantsDeep;
      case SectorName.DARK_BRAMBLE: return this.darkBramble;
      case SectorName.QUANTUM_MOON: return this.quantumMoon;
      case SectorName.EYE_OF_THE_UNIVERSE: return this.eyeOfTheUniverse;
      default: return null;
    }
  }
}
