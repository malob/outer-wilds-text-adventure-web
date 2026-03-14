// Locator — ported from Locator.pde
class Locator {
  constructor() {
    this.player = gameManager._solarSystem.player;
    this.ship = gameManager._solarSystem.ship;
    this._quantumSector = gameManager._solarSystem.quantumMoon;
  }

  getQuantumMoonLocation() {
    return this._quantumSector.getQuantumLocation();
  }
}
