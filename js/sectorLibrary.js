// Sector subclasses — ported from SectorLibrary.pde
class Comet extends Sector {
  load() {
    this._name = 'the Comet';
    this.loadFromJSON('sectors/comet.json', sectorJSONData['comet']);
  }

  drawSectorBackdrop() {
    stroke(200, 30, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 300, 300);
  }
}

class RockyTwin extends Sector {
  load() {
    this._name = 'the rocky Hourglass Twin';
    this.loadFromJSON('sectors/rocky_twin.json', sectorJSONData['rocky_twin']);
  }

  drawSectorBackdrop() {
    stroke(60, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
  }
}

class SandyTwin extends Sector {
  load() {
    this._name = 'the sandy Hourglass Twin';
    this.loadFromJSON('sectors/sandy_twin.json', sectorJSONData['sandy_twin']);
  }

  drawSectorBackdrop() {
    stroke(60, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
  }
}

class TimberHearth extends Sector {
  load() {
    this._name = 'Timber Hearth';
    this.loadFromJSON('sectors/timber_hearth.json', sectorJSONData['timber_hearth']);
  }

  drawSectorBackdrop() {
    stroke(200, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
  }
}

class BrittleHollow extends Sector {
  load() {
    this._name = 'Brittle Hollow';
    this.loadFromJSON('sectors/brittle_hollow.json', sectorJSONData['brittle_hollow']);
  }

  drawSectorBackdrop() {
    stroke(0, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
    this.drawBlackHole(35);
  }

  drawBlackHole(radius) {
    // black hole
    noStroke();
    fill(0, 100, 0);
    ellipse(0, 0, radius * 0.5, radius * 0.5);

    // spiral
    noFill();
    strokeWeight(1);
    stroke(260, 80, 70);

    const start = radius * 0.125;
    const end = radius;
    const spirals = 3;
    const step = 0.1 * PI;

    let x0 = start;
    let y0 = 0;

    for (let t = step; t < spirals * TWO_PI; t += step) {
      let theta = t;

      let r = (theta / (spirals * TWO_PI)) * (end - start) + start;
      const x3 = r * cos(theta);
      const y3 = r * sin(theta);

      theta -= step / 3;
      r = (theta / (spirals * TWO_PI)) * (end - start) + start;
      const x2 = r * cos(theta);
      const y2 = r * sin(theta);

      theta -= step / 3;
      r = (theta / (spirals * TWO_PI)) * (end - start) + start;
      const x1 = r * cos(theta);
      const y1 = r * sin(theta);

      bezier(x0, y0, x1, y1, x2, y2, x3, y3);
      x0 = x3;
      y0 = y3;
    }
  }
}

class GiantsDeep extends Sector {
  load() {
    this._name = "Giant's Deep";
    this.loadFromJSON('sectors/giants_deep.json', sectorJSONData['giants_deep']);
    this.setAnchorOffset(0, 60);
  }

  drawSectorBackdrop() {
    fill(0, 0, 0);

    stroke(180, 100, 100);
    ellipse(0, 0, 600, 600);

    stroke(200, 100, 60);
    ellipse(0, 0, 400, 400);
  }
}

class DarkBramble extends Sector {
  constructor() {
    super();
    this._fogLightNodes = [];
    this._fogLightPositions = [];
  }

  load() {
    this._name = 'Dark Bramble';
    this.loadFromJSON('sectors/dark_bramble.json', sectorJSONData['dark_bramble']);

    for (let i = 0; i < this._fogLightNodes.length; i++) {
      const index = floor(random(0, this._fogLightPositions.length));
      this._fogLightNodes[i].setPosition(this._fogLightPositions[index].x, this._fogLightPositions[index].y);
      this._fogLightPositions.splice(index, 1);
    }
  }

  createNode(name, nodeObj) {
    let newNode;

    if (nodeObj['anglerfish'] !== undefined) {
      newNode = new AnglerfishNode(name, nodeObj);
      this._fogLightNodes.push(newNode);
      this._fogLightPositions.push(new Vector2(newNode.position));
    } else {
      newNode = new Node(name, nodeObj);
    }

    if (nodeObj['fog light'] === true) {
      this._fogLightNodes.push(newNode);
      this._fogLightPositions.push(new Vector2(newNode.position));
    }

    return newNode;
  }

  drawSectorBackdrop() {
    stroke(120, 100, 100);
    fill(0, 0, 0);
    ellipse(100, 0, 700, 500);
  }
}

class QuantumMoon extends Sector {
  constructor() {
    super();
    this._quantumLocation = 0;
    this._turnsSinceEOTU = 0;
  }

  load() {
    this._name = 'Quantum Moon';
    this.loadFromJSON('sectors/quantum_moon.json', sectorJSONData['quantum_moon']);
  }

  onReceiveGlobalMessage(message) {
    if (message.id === 'quantum entanglement') {
      if (locator.player.currentSector === this) {
        this.collapse();
        this.onQuantumEntanglement();
      }
    }
  }

  onArrival() {
    // overrides normal arrival screen
    gameManager.pushScreen(new QuantumArrivalScreen());
  }

  createNode(name, nodeObj) {
    return new QuantumNode(name, nodeObj);
  }

  collapse() {
    // move to random location
    let tLocation = this._quantumLocation;
    while (tLocation === this._quantumLocation) {
      tLocation = floor(random(5));
    }
    this._quantumLocation = tLocation;

    // limit how many turns can pass without going to the EOTU
    if (this._quantumLocation !== 4) {
      this._turnsSinceEOTU++;

      if (this._turnsSinceEOTU > 4) {
        this._quantumLocation = 4;
        this._turnsSinceEOTU = 0;
      }
    }

    // update node visibility
    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].updateQuantumStatus(this._quantumLocation);
    }
  }

  onQuantumEntanglement() {
    super.onQuantumEntanglement();

    // remove ship
    if (locator.ship.currentSector === this) {
      locator.ship.currentSector.removeActor(locator.ship);
    }
  }

  getQuantumLocation() { return this._quantumLocation; }

  allowTelescope() { return false; }

  drawSectorBackdrop() {
    stroke(300, 50, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 300, 300);
  }

  removeActor(actor) {
    super.removeActor(actor);
    actor.lastSector = null; // prevents animation of leaving Sector
  }
}

class EyeOfTheUniverse extends Sector {
  load() {
    this._name = 'The Thing Older Than The Universe';
    this.loadFromJSON('sectors/eye_of_the_universe.json', sectorJSONData['eye_of_the_universe']);
  }

  allowTelescope() { return false; }

  drawSectorBackdrop() {
    // empty
  }
}
