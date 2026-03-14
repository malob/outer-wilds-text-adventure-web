// Actor, Player, Ship, and Probe — extracted from Entity.pde (lines 99-267 in the original).
class Actor extends Entity {
  constructor() {
    super(new Vector2(0, 0));
    this.currentSector = null;
    this.lastSector = null;
    this.currentNode = null;
    this.SPEED = 10;
    this._moveTowardsTarget = false;
    this._targetScreenPos = new Vector2();
    this._distToTarget = 0;
    this._offset = new Vector2(0, 0);
  }

  isDead() {
    return false;
  }

  update() {
    this._offset.y = 0;

    if (this.currentNode == null || !this.currentNode.gravity) {
      this._offset.y = sin(millis() * 0.005) * 5.0;
    }

    if (this._moveTowardsTarget) {
      const d = this._targetScreenPos.sub(this.screenPosition);
      this._distToTarget = d.magnitude();
      const v = min(this._distToTarget, this.SPEED);
      this.setScreenPosition(this.screenPosition.add(d.normalize().mult(v)));
    }
  }

  draw() {
    fill(0, 0, 100);
    ellipse(this.screenPosition.x, this.screenPosition.y, 10, 10);
  }

  setNode(node) {
    this.currentNode = node;
    this._targetScreenPos.assign(node.screenPosition);
    this.setScreenPosition(node.screenPosition);
  }

  moveToScreenPosition(screenPos) {
    this._targetScreenPos.assign(screenPos);
    this._moveTowardsTarget = true;
  }

  moveToNode(node) {
    this.currentNode = node;
    this._targetScreenPos.assign(node.screenPosition);
    this._moveTowardsTarget = true;
  }
}

class Player extends Actor {
  setNode(node) {
    super.setNode(node);
    node.visit();
  }

  moveToNode(node) {
    super.moveToNode(node);
    node.visit();
  }

  update() {
    super.update();
  }

  draw() {
    this.drawAt(this.screenPosition.x, this.screenPosition.y + this._offset.y, 1);
  }

  drawAt(xPos, yPos, s) {
    stroke(30, 100, 100);
    fill(0, 0, 0);

    push();
      translate(xPos, yPos);
      scale(s);
      ellipse(0, 0, 10, 20);
    pop();
  }
}

class Ship extends Actor {
  constructor(player) {
    super();
    this._player = player;
  }

  update() {
    super.update();
  }

  draw() {
    this.drawAt(this.screenPosition.x, this.screenPosition.y + this._offset.y, 1, false);
  }

  drawAt(xPos, yPos, s, skipFill) {
    stroke(30, 100, 100);
    fill(0, 0, 0);

    if (this._player.currentNode === this.currentNode && !skipFill) {
      fill(30, 100, 100);
    }

    push();
      translate(xPos, yPos);
      scale(s);
      triangle(-20, 15, 20, 15, 0, -20);
    pop();
  }
}

class Probe extends Actor {
  isDead() {
    return this._distToTarget < 0.1;
  }

  update() {
    super.update();
  }

  draw() {
    noStroke();
    fill(30, 100, 100);

    push();
      translate(this.screenPosition.x, this.screenPosition.y);
      ellipse(0, 0, 10, 10);
    pop();
  }
}
