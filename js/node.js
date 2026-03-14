// Node, QuantumNode, AnglerfishNode — ported from Node.pde, QuantumNode.pde, AnglerfishNode.pde
class Node extends Entity {
  constructor(idOrX, jsonObjOrY) {
    // Node(x, y) constructor
    if (typeof idOrX === 'number') {
      super(idOrX, jsonObjOrY ?? 0);
      this._id = '';
      this._name = '';
      this.entryPoint = false;
      this.shipAccess = false;
      this.allowTelescope = true;
      this.gravity = true;
      this._signal = null;
      this._visible = false;
      this._visited = false;
      this._explored = false;
      this._inRange = false;
      this._button = null;
      this._connections = new Map();
      this._observers = [];
      this._observer = null;
      this._nodeJSONObj = null;
      this._exploreData = null;
      messenger.addObserver(this);
      return;
    }

    // Node(id, jsonObj) constructor
    super(0, 0);
    this._id = idOrX;
    this._name = idOrX;
    this.entryPoint = false;
    this.shipAccess = false;
    this.allowTelescope = true;
    this.gravity = true;
    this._signal = null;
    this._visible = false;
    this._visited = false;
    this._explored = false;
    this._inRange = false;
    this._connections = new Map();
    this._observers = [];
    this._observer = null;
    this._nodeJSONObj = null;
    this._exploreData = null;
    messenger.addObserver(this);

    this.loadJSON(jsonObjOrY);

    if (this.entryPoint) {
      this._visible = true;
    }

    this._button = new Button(this._id, 0, 0, this.getSize() * 1.5, this.getSize() * 1.5);
    this._button.setObserver(this);
    this._button.visible = false;
    this.addChild(this._button);
  }

  loadJSON(nodeJSONObj) {
    this._nodeJSONObj = nodeJSONObj;

    this._name = nodeJSONObj['name'] ?? this._id;

    if (nodeJSONObj['explore'] !== undefined) {
      this._exploreData = new ExploreData(this, nodeJSONObj);
    }

    this.position.x = nodeJSONObj['position']['x'];
    this.position.y = nodeJSONObj['position']['y'];

    if (nodeJSONObj['start visible'] !== undefined) {
      this._visible = nodeJSONObj['start visible'];
    }

    if (EDIT_MODE) {
      this._visible = true;
    }

    if (nodeJSONObj['entry point'] !== undefined) {
      this.entryPoint = nodeJSONObj['entry point'];
    }
    this.shipAccess = this.entryPoint || (nodeJSONObj['ship access'] || false);
    if (nodeJSONObj['allow telescope'] !== undefined) {
      this.allowTelescope = nodeJSONObj['allow telescope'];
    }
    if (nodeJSONObj['gravity'] !== undefined) {
      this.gravity = nodeJSONObj['gravity'];
    }

    if (nodeJSONObj['signal'] !== undefined) {
      this._signal = new Signal(nodeJSONObj['signal']);
    }
  }

  savePosition() {
    this._nodeJSONObj['position']['x'] = this.position.x;
    this._nodeJSONObj['position']['y'] = this.position.y;
    console.log(this._id + ' position saved: ' + this.position.x + ', ' + this.position.y);
  }

  onReceiveGlobalMessage(message) {
    // stub for subclasses
  }

  isExplorable() {
    return (this._nodeJSONObj != null && this._nodeJSONObj['explore'] !== undefined);
  }

  getExploreData() {
    return this._exploreData;
  }

  getProbeDescription() {
    if (this._nodeJSONObj['probe description'] !== undefined) {
      return this._nodeJSONObj['probe description'];
    }
    return this.getDescription();
  }

  getDescription() {
    return this._nodeJSONObj['description'] || 'a vast expanse of nothing';
  }

  hasDescription() {
    return (this._nodeJSONObj != null && this._nodeJSONObj['description'] !== undefined);
  }

  isProbeable() {
    return (this._nodeJSONObj != null && this._nodeJSONObj['description'] !== undefined);
  }

  isConnectedTo(node) {
    return this._connections.has(node);
  }

  inRange() {
    return this._inRange;
  }

  updateInRange(isPlayerInShip, playerNode) {
    this._inRange = false;

    if (playerNode === this) {
      this._inRange = true;
    }

    if (this.entryPoint && isPlayerInShip) {
      this._inRange = true;
    }

    if (playerNode != null && this.isConnectedTo(playerNode)) {
      this._inRange = true;
    }
  }

  getConnection(nodeOrId) {
    if (typeof nodeOrId === 'string') {
      for (const [node, connection] of this._connections) {
        if (node.getID() === nodeOrId) {
          return connection;
        }
      }
      return null;
    }
    return this._connections.get(nodeOrId) || null;
  }

  allowQuantumEntanglement() {
    if (this._nodeJSONObj == null) return false;
    return this._nodeJSONObj['entanglement node'] || false;
  }

  getSignal() { return this._signal; }

  getID() { return this._id; }

  getActualName() { return this._name; }

  getKnownName() {
    if (this._visited) return this.getActualName();
    else return '???';
  }

  setVisible(visible) { this._visible = visible; }

  visit() {
    this._visited = true;
    this.setVisible(true);

    if (this._nodeJSONObj != null && this._nodeJSONObj['fire event'] !== undefined) {
      messenger.sendMessage(this._nodeJSONObj['fire event']);
    }

    for (const connection of this._connections.values()) {
      connection.reveal();
    }

    if (this._observer != null) {
      this._observer.onNodeVisited(this);
    }
  }

  explore() {
    this._explored = true;
    this._exploreData.explore();

    if (this._signal != null) {
      playerData.learnFrequency(this._signal.frequency);
    }
  }

  update() {
    if (!this._visible) return;
    this._button.enabled = this.inRange() || EDIT_MODE;
    this._button.update();
  }

  getAlpha() {
    if (!this.inRange()) {
      return 35;
    }
    return 100;
  }

  getSize() {
    if (this.entryPoint) {
      return 50;
    } else if (!this.isExplorable()) {
      return 25;
    }
    return 35;
  }

  draw() {
    if (!this._visible) return;

    if (this._button.hoverState) {
      stroke(200, 100, 100, this.getAlpha());
    } else {
      stroke(0, 0, 100, this.getAlpha());
    }

    push();
    translate(this.screenPosition.x, this.screenPosition.y);

    if (!this.isExplorable()) {
      fill(0, 0, 0);
      ellipse(0, 0, this.getSize(), this.getSize());
      pop();
      return;
    }

    if (this.entryPoint) {
      fill(0, 0, 0);
      ellipse(0, 0, this.getSize(), this.getSize());
    } else {
      fill(0, 0, 0);
      rect(0, 0, this.getSize(), this.getSize());
    }

    if (!this._explored) {
      fill(0, 0, 100, this.getAlpha());
      textAlign(CENTER, CENTER);
      textSize(30);
      text('?', 0, 0);
    }

    pop();
  }

  drawName() {
    if (!this._visible) return;
    if (!this.isExplorable()) return;

    const textPos = new Vector2(
      this.screenPosition.x,
      this.screenPosition.y - this.getSize() / 2 - 20
    );

    noStroke();
    fill(0, 0, 0);
    textSize(TEXT_SIZE);
    rect(textPos.x, textPos.y, textWidth(this.getKnownName()), TEXT_SIZE + 4);

    fill(0, 0, 100, this.getAlpha());
    textAlign(CENTER, CENTER);
    text(this.getKnownName(), textPos.x, textPos.y);
  }

  addConnection(connection) {
    // Check if already connected
    for (const conn of this._connections.values()) {
      if (conn === connection) {
        console.log('These nodes are already connected!!!');
        return;
      }
    }

    if (connection.node1 !== this) {
      this._connections.set(connection.node1, connection);
    } else {
      this._connections.set(connection.node2, connection);
    }
  }

  setNodeObserver(observer) {
    this._observer = observer;
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  removeAllObservers() {
    this._observers = [];
  }

  onButtonUp(button) {
    for (let i = 0; i < this._observers.length; i++) {
      this._observers[i].onNodeSelected(this);
    }
  }

  onButtonEnterHover(button) {
    for (let i = 0; i < this._observers.length; i++) {
      this._observers[i].onNodeGainFocus(this);
    }
  }

  onButtonExitHover(button) {
    for (let i = 0; i < this._observers.length; i++) {
      this._observers[i].onNodeLoseFocus(this);
    }
  }
}

class QuantumNode extends Node {
  constructor(name, nodeJSON) {
    super(name, nodeJSON);
  }

  updateQuantumStatus(quantumState) {
    const visible = this._nodeJSONObj['quantum location'] === quantumState;
    this.setVisible(visible);

    if (!visible) {
      for (const connection of this._connections.values()) {
        connection.setVisible(visible);
      }
    }
  }

  allowQuantumEntanglement() {
    return this._nodeJSONObj['quantum location'] === locator.getQuantumMoonLocation() &&
           (this._nodeJSONObj['entanglement node'] || false);
  }
}

class AnglerfishNode extends Node {
  constructor(nodeName, nodeJSONObj) {
    super(nodeName, nodeJSONObj);
    this.entryPoint = true;
    this.shipAccess = true;
    this.gravity = false;
    this._visible = true;
  }

  getKnownName() {
    if (this._visited) return 'Anglerfish';
    else return '???';
  }

  getDescription() {
    return 'an enormous hungry-looking anglerfish';
  }

  getProbeDescription() {
    return 'a light shining through the fog';
  }

  hasDescription() { return true; }

  isProbeable() { return true; }

  isExplorable() { return true; }

  visit() {
    this._visited = true;
    this.setVisible(true);

    messenger.sendMessage('death by anglerfish');

    if (this._observer != null) {
      this._observer.onNodeVisited(this);
    }
  }
}
