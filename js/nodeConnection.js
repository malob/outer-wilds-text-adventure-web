// NodeConnection — ported from NodeConnection.pde
class NodeConnection {
  constructor(n1, n2, connectionObj) {
    this.node1 = n1;
    this.node2 = n2;
    this._connectionObj = connectionObj;

    this._description = null;
    this._hasDescription = false;
    this._adjacentToPlayer = false;
    this._traversed = false;
    this._visible = false;
    this._gated = false;
    this._oneWay = false;
    this._hidden = false;

    this.node1.addConnection(this);
    this.node2.addConnection(this);

    this._oneWay = connectionObj['one-way'] || this._oneWay;
    this._hidden = connectionObj['hidden'] || this._hidden;
    this._gated = connectionObj['gated'] || this._gated;

    if (EDIT_MODE) {
      this._visible = true;
    }

    if (connectionObj['description'] !== undefined) {
      this._hasDescription = true;
      this._description = connectionObj['description'];
    }
  }

  updateAdjacentToPlayer(playerNode) {
    this._adjacentToPlayer = false;
    if (this.node1 === playerNode || this.node2 === playerNode) {
      this._adjacentToPlayer = true;
    }
  }

  hasDescription() {
    return this._hasDescription;
  }

  getDescription() {
    return this._description;
  }

  getWrongWayText() {
    return 'looks like this path is only traversible from the other direction';
  }

  getOtherNode(node) {
    if (node === this.node1) {
      return this.node2;
    }
    return this.node1;
  }

  traversibleFrom(startingNode) {
    return (!this._gated && (!this._oneWay || startingNode === this.node1));
  }

  fireTraverseEvent() {
    if (this._connectionObj['traverse event'] !== undefined) {
      messenger.sendMessage(this._connectionObj['traverse event']);
    }
  }

  fireFailEvent() {
    if (this._connectionObj['fail event'] !== undefined) {
      messenger.sendMessage(this._connectionObj['fail event']);
    }
  }

  traverse() {
    this._traversed = true;
  }

  revealHidden() {
    this._hidden = false;
    this.reveal();
  }

  setVisible(visible) {
    this._visible = visible;
  }

  reveal() {
    if (this._hidden) {
      return;
    }
    this.node1.setVisible(true);
    this.node2.setVisible(true);
    this._visible = true;
  }

  getAlpha() {
    if (!this._adjacentToPlayer) {
      return 35;
    }
    return 100;
  }

  render() {
    if (!this._visible) return;

    const dir = this.node2.screenPosition.sub(this.node1.screenPosition);
    const d = dir.magnitude();
    dir.normalize();

    // draw segmented line
    if (!this._traversed) {
      stroke(0, 0, 100, this.getAlpha());

      let l = 0;
      const segmentLength = 5;

      while (l < d) {
        const startPos = this.node1.screenPosition.add(dir.mult(l));
        const endPos = this.node1.screenPosition.add(dir.mult(l + segmentLength));
        line(startPos.x, startPos.y, endPos.x, endPos.y);
        l += segmentLength * 3;
      }
    }
    // draw solid line
    else {
      stroke(0, 0, 100, this.getAlpha());
      line(this.node1.screenPosition.x, this.node1.screenPosition.y,
           this.node2.screenPosition.x, this.node2.screenPosition.y);
    }

    if (!this._oneWay) return;

    // draw arrow
    const tip = this.node1.screenPosition.add(dir.mult(d * 0.6));
    const base = tip.sub(dir.mult(14));

    // Renamed from 'right'/'left' to avoid shadowing p5.js constants
    const right2 = base.add(dir.rightNormal().scale(7));
    const left2 = base.add(dir.leftNormal().scale(7));

    fill(0, 0, 0);
    triangle(right2.x, right2.y, left2.x, left2.y, tip.x, tip.y);
  }
}
