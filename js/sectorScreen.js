// SectorScreen - main gameplay screen + SectorEditor
// Ported from SectorScreen.pde and SectorEditor.pde

class SectorScreen extends Screen {
  constructor(sector, player, ship) {
    super();

    this._actions = [];
    this._editor = new SectorEditor(sector);

    this._player = player;
    this._ship = ship;
    this._sector = sector;
    this._focusNode = null;
    this._actionlessPrompt = 'inaccessible';

    this.addButtonToToolbar(this._databaseButton = new Button('Use Database', 0, 0, 150, 50));
    this.addButtonToToolbar(this._telescopeButton = new Button('Scan for Signals', 0, 0, 150, 50));
    this._telescopeButton.setDisabledPrompt('Scan for Signals\n(view obstructed)');

    this.addButtonToToolbar(this._waitButton = new Button('Wait [1 min]', 0, 0, 150, 50));
    this.addButtonToToolbar(this._liftoffButton = new Button('Leave Sector', 0, 0, 150, 50));
    this._liftoffButton.setDisabledPrompt('Leave Sector\n(must be at ship)');
  }

  onEnter() {
    this._sector.addNodeButtonObserver(this);
    this._sector.addNodeButtonObserver(this._editor);
    this._sector.updateNodeRanges(this.isPlayerInShip(), this._player.currentNode);
    this._focusNode = null;
  }

  onExit() {
    this._sector.removeAllNodeButtonObservers();
  }

  onButtonUp(button) {
    if (button === this._databaseButton) {
      gameManager.databaseScreen.setObserver(this);
      gameManager.pushScreen(gameManager.databaseScreen);
    } else if (button === this._liftoffButton) {
      this._sector.removeActor(this._player);
      this._sector.removeActor(this._ship);
      gameManager.loadSolarSystemMap();
      feed.clear();
      feed.publish('you leave ' + this._sector.getName());
    } else if (button === this._telescopeButton) {
      gameManager.loadTelescopeView();
    } else if (button === this._waitButton) {
      timeLoop.waitFor(1);
    }
  }

  // DatabaseObserver
  onInvokeClue(clue) {
    if (this._player.currentNode != null && this._player.currentNode.isExplorable()) {
      const exploreData = this._player.currentNode.getExploreData();
      exploreData.parseJSON();

      if (exploreData.canClueBeInvoked(clue.id)) {
        gameManager.popScreen();
        gameManager.pushScreen(new ExploreScreen(this._player.currentNode));
        exploreData.invokeClue(clue.id);
        exploreData.explore();
        return;
      }
    }

    if (this._player.currentSector != null && this._player.currentSector.canClueBeInvoked(clue)) {
      this._player.currentSector.invokeClue(clue);
    } else {
      feed.publish("that doesn't help you right now", true);
    }
  }

  update() {
    this._liftoffButton.enabled = (this._player.currentNode === this._ship.currentNode);
    this._telescopeButton.enabled = (this._player.currentNode != null && this._player.currentNode.allowTelescope && this._player.currentSector.allowTelescope());

    this._sector.update();
    if (EDIT_MODE) this._editor.update();
  }

  renderBackground() {
    super.renderBackground();
    this._sector.renderBackground();
  }

  render() {
    this._sector.render();
    feed.render();
    timeLoop.renderTimer();

    fill(0, 0, 100);
    textSize(18);
    mediumFont();
    textAlign(RIGHT);
    text(this._sector.getName(), width - 20, height - 100);

    if (!this.active) return;
    if (EDIT_MODE) this._editor.render();

    this.drawNodeGUI(this._focusNode, this._actions);
  }

  drawNodeGUI(target, actions) {
    if (target == null || (this._actions.length === 0 && target === this._player.currentNode)) return;

    smallFont();

    const yOffset = 60;
    let promptWidth = textWidth(this._actionlessPrompt);

    for (let i = 0; i < actions.length; i++) {
      promptWidth = max(promptWidth, textWidth(actions[i].getPrompt()));
    }

    stroke(200, 100, 100);
    fill(0, 0, 0);
    rectMode(CORNER);
    rect(target.screenPosition.x - promptWidth * 0.5 - 10,
         target.screenPosition.y + yOffset - 15,
         promptWidth + 15,
         max(20, 20 * actions.length) + 10);

    fill(0, 0, 100);
    textAlign(LEFT, CENTER);

    for (let i = 0; i < actions.length; i++) {
      text(actions[i].getPrompt(), target.screenPosition.x - promptWidth * 0.5, target.screenPosition.y + yOffset + 20 * i);
    }

    if (actions.length === 0) {
      text(this._actionlessPrompt, target.screenPosition.x - promptWidth * 0.5, target.screenPosition.y + yOffset);
    }
  }

  // NodeActionObserver
  onTravelAttempt(succeeded, node, connection) {}
  onExploreNode(node) {}
  onProbeNode(node) {}

  // NodeButtonObserver
  onNodeSelected(node) {
    for (let i = 0; i < this._actions.length; i++) {
      if (this._actions[i].getMouseButton() === mouseButton) {
        this._actions[i].execute();
        break;
      }
    }
    this.refreshAvailableActions();
  }

  onNodeGainFocus(node) {
    this._focusNode = node;
    this.refreshAvailableActions();
  }

  onNodeLoseFocus(node) {
    if (node === this._focusNode) {
      this._focusNode = null;
      this.refreshAvailableActions();
    }
  }

  refreshAvailableActions() {
    this._actions = [];

    if (this._focusNode == null) return;

    if (this._player.currentNode !== this._focusNode) {
      if (this._focusNode.inRange()) {
        if (this._focusNode.isProbeable()) {
          this._actions.push(new ProbeAction(RIGHT, this._player, this._focusNode, this));
        }

        if (this.isPlayerInShip() && this._focusNode.shipAccess) {
          this._actions.push(new TravelAction(LEFT, this._player, this._ship, this._focusNode, this));
        } else {
          this._actions.push(new TravelAction(LEFT, this._player, this._focusNode, this));
        }
      }
    } else {
      if (this._focusNode.isExplorable()) {
        this._actions.push(new ExploreAction(LEFT, this._focusNode, this));
      }
    }
  }

  isPlayerInShip() {
    return (this._player.currentNode === this._ship.currentNode);
  }
}

// SectorEditor - drag nodes in edit mode
class SectorEditor {
  constructor(sector) {
    this._activeSector = sector;
    this._saveButton = new Button('Save', width - 75, height - 50, 100, 50);
    this._saveButton.setObserver(this);
    this._selection = null;
    this._dragging = false;
  }

  update() {
    this._saveButton.update();

    if (this._selection != null) {
      if (this._dragging) {
        this._selection.setScreenPosition(new Vector2(mouseX, mouseY));

        if (!mouseIsPressed) {
          this._selection.savePosition();
          this._selection = null;
          this._dragging = false;
        }
      }

      this._dragging = (mouseIsPressed && mouseButton === CENTER);
    }
  }

  render() {
    this._saveButton.render();
  }

  onButtonUp(button) {
    if (button === this._saveButton) {
      this._activeSector.saveSectorJSON();
    }
  }

  onNodeGainFocus(node) {
    this._selection = node;
  }

  onNodeLoseFocus(node) {
    if (!this._dragging) {
      this._selection = null;
    }
  }

  onNodeSelected(node) {}
  onButtonEnterHover(button) {}
  onButtonExitHover(button) {}
}
