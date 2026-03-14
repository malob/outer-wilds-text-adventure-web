// Sector — ported from Sector.pde
class Sector {
  constructor() {
    this._sectorRoot = new Entity(width / 2, height / 2);
    this._actors = [];
    this._nodes = [];
    this._nodeConnections = [];

    this._name = 'unnamed';
    this._JSONFilename = '';
    this._sectorJSON = null;

    this._skipArrivalScreen = false;

    this.orbitNode = new Node(80, 170); // screen space
    this.orbitNode.gravity = false;

    this.defaultActorPosition = new Vector2(width - 100, height - 100);

    messenger.addObserver(this);
  }

  setAnchorOffset(offsetX, offsetY) {
    this._sectorRoot.setPosition(width / 2 + offsetX, height / 2 + offsetY);
  }

  loadFromJSON(filename, jsonData) {
    this._JSONFilename = filename;
    this._sectorJSON = jsonData;

    // LOAD NODES
    const nodes = jsonData['Nodes'];
    for (const nodeName in nodes) {
      if (nodes.hasOwnProperty(nodeName)) {
        this.addNode(this.createNode(nodeName, nodes[nodeName]));
      }
    }

    // LOAD CONNECTIONS
    const connectionArray = jsonData['Connections'];
    for (let i = 0; i < connectionArray.length; i++) {
      const connection = connectionArray[i];
      const node1 = this.getNode(connection['Node 1']);
      const node2 = this.getNode(connection['Node 2']);
      this._nodeConnections.push(new NodeConnection(node1, node2, connection));
    }
  }

  createNode(name, nodeObj) {
    return new Node(name, nodeObj);
  }

  // Original writes to disk via saveJSONObject(); browser has no filesystem access.
  saveSectorJSON() {
    console.log('Sector JSON saved (browser: data logged to console)');
    console.log(JSON.stringify(this._sectorJSON, null, 2));
  }

  load() {
    // stub to override
  }

  drawSectorBackdrop() {
    // stub to override
  }

  onReceiveGlobalMessage(message) {
    if (message.id === 'quantum entanglement') {
      this.onQuantumEntanglement();
    }
  }

  onNodeVisited(node) {
    this.updateNodeRanges(gameManager._solarSystem.isPlayerInShip(), node);
  }

  onArrival() {
    if (!this._skipArrivalScreen && this._sectorJSON['Sector Arrival'] !== undefined) {
      this._skipArrivalScreen = true;
      gameManager.pushScreen(new SectorArrivalScreen(this._sectorJSON['Sector Arrival']['text'], this.getName()));
    }
  }

  onQuantumEntanglement() {
    if (locator.player.currentSector === this) {
      gameManager.pushScreen(new QuantumEntanglementScreen());

      // teleport player
      for (let i = 0; i < this._nodes.length; i++) {
        if (this._nodes[i].allowQuantumEntanglement() && this._nodes[i] !== locator.player.currentNode) {
          locator.player.setNode(this._nodes[i]);
          break;
        }
      }
    }
  }

  canClueBeInvoked(clue) {
    return false;
  }

  invokeClue(clue) {
    // override in derived class
  }

  updateNodeRanges(isPlayerInShip, playerNode) {
    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].updateInRange(isPlayerInShip, playerNode);
    }

    for (let i = 0; i < this._nodeConnections.length; i++) {
      this._nodeConnections[i].updateAdjacentToPlayer(playerNode);
    }
  }

  allowTelescope() { return true; }

  getName() {
    return this._name;
  }

  getNodeByIndex(index) {
    if (this._nodes[index] != null) {
      return this._nodes[index];
    }
    console.log('No nodes at index ' + index);
    return null;
  }

  getNode(nodeID) {
    if (typeof nodeID === 'number') {
      return this.getNodeByIndex(nodeID);
    }
    for (let i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i].getID() === nodeID) {
        return this._nodes[i];
      }
    }
    return null;
  }

  getSectorSignalSources() {
    const signalSources = [];
    for (let i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i].getSignal() != null) {
        signalSources.push(new SignalSource(this._nodes[i]));
      }
    }
    return signalSources;
  }

  getSectorSignals() {
    const nodeSignals = [];
    for (let i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i].getSignal() != null) {
        nodeSignals.push(this._nodes[i].getSignal());
      }
    }
    return nodeSignals;
  }

  addNodeButtonObserver(observer) {
    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].addObserver(observer);
    }
  }

  removeAllNodeButtonObservers() {
    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].removeAllObservers();
    }
  }

  update() {
    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].update();
    }

    // Reverse iteration: the original iterates forward, which can skip an actor
    // adjacent to a removed one. Reverse iteration is the standard safe pattern.
    for (let i = this._actors.length - 1; i >= 0; i--) {
      this._actors[i].update();

      if (this._actors[i].isDead()) {
        this.removeActor(this._actors[i]);
      }
    }
  }

  renderBackground() {
    push();
    translate(this._sectorRoot.position.x, this._sectorRoot.position.y);
    this.drawSectorBackdrop();
    pop();

    // draw letterbox
    fill(0, 0, 0);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, 90);
    rect(0, height - 90, width, 90);
    rectMode(CENTER);
  }

  render() {
    for (let i = 0; i < this._nodeConnections.length; i++) {
      this._nodeConnections[i].render();
    }

    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].render();
    }

    for (let i = 0; i < this._actors.length; i++) {
      this._actors[i].render();
    }

    for (let i = 0; i < this._nodes.length; i++) {
      this._nodes[i].drawName();
    }
  }

  addNode(node) {
    if (this._nodes.indexOf(node) === -1) {
      this._nodes.push(node);
      node.setNodeObserver(this);
      this._sectorRoot.addChild(node);
    } else {
      console.log('Node is already in this Sector!!!');
    }
  }

  removeNode(node) {
    const idx = this._nodes.indexOf(node);
    if (idx !== -1) {
      this._nodes.splice(idx, 1);
      node.setNodeObserver(null);
      this._sectorRoot.removeChild(node);
    } else {
      console.log('Node is not in this Sector!!!');
    }
  }

  addActor(actor, nodeOrName) {
    if (this._actors.indexOf(actor) !== -1) {
      console.log('Actor is already in this Sector!!!');
      return;
    }

    actor.currentSector = this;
    this._actors.push(actor);
    this._sectorRoot.addChild(actor);

    let atNode = null;
    if (typeof nodeOrName === 'string') {
      atNode = this.getNode(nodeOrName);
    } else if (nodeOrName instanceof Node) {
      atNode = nodeOrName;
    }

    if (atNode != null) {
      actor.setNode(atNode);
    } else {
      // spawn actor off-screen
      actor.setScreenPosition(this.orbitNode.screenPosition.sub(new Vector2(200, 0)));
      actor.moveToNode(this.orbitNode);
    }
  }

  removeActor(actor) {
    const idx = this._actors.indexOf(actor);
    if (idx !== -1) {
      actor.currentNode = null;
      actor.currentSector = null;
      actor.lastSector = this;
      this._actors.splice(idx, 1);
      this._sectorRoot.removeChild(actor);
    } else {
      console.log('Actor is not in this Sector!!!');
    }
  }
}
