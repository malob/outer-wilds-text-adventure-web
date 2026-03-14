// SectorButton classes for solar system map
// Ported from SectorButtons.pde

class SectorButton extends Button {
  constructor(id, x, y, w, h, sector) {
    super(id, x, y, w, h);
    this.node = new Node(x, y);
    this._sector = sector;
  }

  getRadius() {
    return this._bounds.y * 0.5;
  }

  getSector() {
    return this._sector;
  }

  render() {
    this.drawNonHighlighted();

    if (this.hoverState) {
      strokeWeight(2);
    }

    this.drawPlanet();
    this.drawYouAreHere();

    strokeWeight(1);
  }

  drawPlanet() {}

  drawNonHighlighted() {}

  drawName(nameStr, xPos) {
    if (nameStr === undefined) {
      nameStr = this.id;
      xPos = this.screenPosition.x;
    }
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(nameStr, xPos, this.screenPosition.y - this.getRadius() - 40);
  }

  drawYouAreHere() {
    if (locator.ship.currentSector === this._sector) {
      locator.ship.drawAt(this.screenPosition.x, this.screenPosition.y, 0.5, true);
    }

    if (locator.player.currentSector === this._sector) {
      locator.player.drawAt(this.screenPosition.x, this.screenPosition.y, 0.5);
    }
  }

  drawZoomPrompt() {
    textSize(14);
    smallFont();

    fill(0, 0, 0);
    stroke(0, 0, 100);
    rectMode(CENTER);
    rect(this.screenPosition.x, this.screenPosition.y + this.getRadius() + 40, textWidth('L - Zoom In') + 10, 20);

    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    text('L - Zoom In', this.screenPosition.x, this.screenPosition.y + this.getRadius() + 40);
  }
}

class CometButton extends SectorButton {
  constructor(x, y, sector) {
    super('The Comet', x, y, 40, 40, sector);
  }

  drawPlanet() {
    noStroke();
    fill(0, 0, 0);

    push();
    translate(this.screenPosition.x, this.screenPosition.y);
    triangle(0, this.getRadius(), 0, -this.getRadius(), 130, 0);
    stroke(200, 30, 100);
    arc(0, 0, this._bounds.y, this._bounds.y, PI * 0.5, PI * 1.5);
    line(0, this._bounds.y * 0.5, 130, 0);
    line(0, -this._bounds.y * 0.5, 130, 0);
    pop();
  }
}

class HourglassTwinsButton extends SectorButton {
  constructor(centerX, y, isRightTwin, sector) {
    super('Hourglass Twin', centerX, y, 50, 50, sector);
    this._isRightTwin = isRightTwin;
    this._centerX = centerX;

    if (isRightTwin) {
      this._twinName = 'Sandy ';
      this.setPosition(centerX + 35, this.position.y);
    } else {
      this._twinName = 'Rocky ';
      this.setPosition(centerX - 35, this.position.y);
    }
  }

  drawName() {
    super.drawName(this._twinName + this.id, this._centerX);
  }

  drawNonHighlighted() {
    if (!this._isRightTwin) {
      stroke(60, 100, 100);
      fill(0, 0, 0);
      rectMode(CENTER);
      rect(this._centerX, this.position.y, this._bounds.y * 1.5, this._bounds.y * 0.2);
    }
  }

  drawPlanet() {
    stroke(60, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.y, this._bounds.y);
  }
}

class TimberHearthButton extends SectorButton {
  constructor(x, y, sector) {
    super('Timber Hearth', x, y, 80, 80, sector);
  }

  drawPlanet() {
    stroke(200, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

class BrittleHollowButton extends SectorButton {
  constructor(x, y, sector) {
    super('Brittle Hollow', x, y, 80, 80, sector);
  }

  drawPlanet() {
    stroke(0, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

class GiantsDeepButton extends SectorButton {
  constructor(x, y, sector) {
    super("Giant's Deep", x, y, 150, 150, sector);
  }

  drawPlanet() {
    stroke(180, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

class DarkBrambleButton extends SectorButton {
  constructor(x, y, sector) {
    super('Dark Bramble', x, y, 230, 230, sector);
  }

  drawPlanet() {
    stroke(120, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

class QuantumMoonButton extends SectorButton {
  constructor(targets, sector) {
    super('Quantum Moon', 0, 0, 30, 30, sector);
    this._targets = targets;
    this._currentTarget = null;
  }

  collapse() {
    this._sector.collapse();
    this.updatePosition();
  }

  updatePosition() {
    const i = this._sector.getQuantumLocation();

    console.log(i);

    if (i === 4) {
      this._currentTarget = null;
    } else {
      this._currentTarget = this._targets[i];
    }

    if (this._currentTarget != null) {
      this.setPosition(this._currentTarget.position.x - 25,
                       this._currentTarget.position.y - this._currentTarget.getRadius() - 30);
    } else {
      this.setPosition(-1000, -1000);
    }
  }

  drawPlanet() {
    stroke(300, 50, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}
