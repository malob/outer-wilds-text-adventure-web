// Entity — ported from Entity.pde (lines 1-97; Actor/Player/Ship/Probe are in actor.js)
class Entity {
  constructor(xOrVec, y) {
    this.position = new Vector2();
    this.screenPosition = new Vector2();
    this.parent = null;
    this._children = [];

    if (xOrVec instanceof Vector2) {
      this.setPosition(xOrVec.x, xOrVec.y);
    } else if (xOrVec !== undefined) {
      this.setPosition(xOrVec, y ?? 0);
    }
  }

  setPosition(xOrVec, y) {
    if (xOrVec instanceof Vector2) {
      this.position.x = xOrVec.x;
      this.position.y = xOrVec.y;
    } else {
      this.position.x = xOrVec;
      this.position.y = y;
    }

    if (this.parent != null) {
      this.updateScreenPosition(this.parent.screenPosition);
    } else {
      this.updateScreenPosition(new Vector2(0, 0));
    }
  }

  updateScreenPosition(parentScreenPos) {
    this.screenPosition.assign(parentScreenPos.add(this.position));

    for (let i = 0; i < this._children.length; i++) {
      this._children[i].updateScreenPosition(this.screenPosition);
    }
  }

  setScreenPosition(newScreenPos) {
    if (this.parent == null) {
      this.setPosition(newScreenPos);
    } else {
      this.setPosition(newScreenPos.sub(this.parent.screenPosition));
    }
  }

  draw() {
    // stub to override
  }

  render() {
    this.draw();
  }

  addChild(child) {
    if (!this._children.includes(child)) {
      this._children.push(child);
      child.parent = this;
      child.updateScreenPosition(this.screenPosition);
    }
  }

  removeChild(child) {
    const idx = this._children.indexOf(child);
    if (idx !== -1) {
      this._children.splice(idx, 1);
    }
    child.parent = null;
  }
}
