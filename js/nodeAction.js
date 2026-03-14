// NodeAction classes
// Ported from NodeAction.pde

class NodeAction {
  constructor() {
    this._prompt = '';
    this._mouseButton = LEFT;
    this._observer = null;
  }

  setObserver(observer) {
    this._observer = observer;
  }

  getMouseButton() {
    return this._mouseButton;
  }

  setMouseButton(button) {
    this._mouseButton = button;
  }

  execute() {}

  getCost() {
    return 0;
  }

  getPrompt() {
    return this._prompt;
  }

  setPrompt(description) {
    if (this._mouseButton === LEFT) {
      this._prompt += 'L-Clk - ' + description;
    } else {
      this._prompt += 'R-Clk - ' + description;
    }
    this._prompt += ' [' + this.getCost() + ' min]';
  }
}

class ProbeAction extends NodeAction {
  constructor(button, player, location, observer) {
    super();
    this._player = player;
    this._location = location;
    this.setMouseButton(button);
    this.setObserver(observer);
    this.setPrompt('probe');
  }

  execute() {
    feed.publish('you see ' + this._location.getProbeDescription());

    const probe = new Probe();
    this._player.currentSector.addActor(probe);
    // Defensive copy — JS objects are references; without this the probe and
    // player would share the same screenPosition object (see PORTING.md)
    probe.setScreenPosition(new Vector2(this._player.screenPosition));
    probe.moveToNode(this._location);

    this._observer.onProbeNode(this._location);
  }
}

class ExploreAction extends NodeAction {
  constructor(button, location, observer) {
    super();
    this._location = location;
    this.setMouseButton(button);
    this.setObserver(observer);
    this.setPrompt('explore');
  }

  getCost() {
    return 1;
  }

  execute() {
    timeLoop.spendActionPoints(this.getCost());

    if (timeLoop.getActionPoints() === 0) {
      return;
    }

    feed.clear();
    feed.publish('you explore the ' + this._location.getActualName());

    this._observer.onExploreNode(this._location);
    gameManager.pushScreen(new ExploreScreen(this._location));
    this._location.explore();
  }
}

class TravelAction extends NodeAction {
  constructor(button, player, shipOrDestination, destinationOrObserver, observer) {
    super();

    // TravelAction(button, player, destination, observer)
    if (observer === undefined) {
      this._ship = null;
      this._player = player;
      this._destination = shipOrDestination;
      this.setMouseButton(button);
      this.setObserver(destinationOrObserver);
    }
    // TravelAction(button, player, ship, destination, observer)
    else {
      this._ship = shipOrDestination;
      this._player = player;
      this._destination = destinationOrObserver;
      this.setMouseButton(button);
      this.setObserver(observer);
    }

    this._setTravelPrompt();
  }

  _setTravelPrompt() {
    if (this._ship != null) {
      if (this._ship.currentNode == null && this._destination.gravity) {
        this.setPrompt('land here');
        return;
      }
      this.setPrompt('fly here');
    } else if (this._destination.gravity) {
      this.setPrompt('hike here');
    } else {
      this.setPrompt('jetpack here');
    }
  }

  getCost() {
    return 1;
  }

  execute() {
    feed.clear();

    if (this._player.currentNode != null) {
      const connection = this._destination.getConnection(this._player.currentNode);

      if (connection != null) {
        if (!connection.traversibleFrom(this._player.currentNode)) {
          connection.fireFailEvent();
          feed.publish(connection.getWrongWayText(), true);
          return;
        }

        connection.fireTraverseEvent();
        connection.traverse();

        if (connection.hasDescription()) {
          feed.publish('you traverse ' + connection.getDescription());
        }
      }
    }

    if (this._destination.hasDescription()) {
      feed.publish('you reach ' + this._destination.getDescription());
    }

    if (this._ship != null) {
      this._ship.moveToNode(this._destination);
    }

    messenger.sendMessage('reset reachability');
    this._player.moveToNode(this._destination);
    this._observer.onTravelAttempt(true, this._destination, this._destination.getConnection(this._player.currentNode));
    timeLoop.spendActionPoints(this.getCost());
  }
}
