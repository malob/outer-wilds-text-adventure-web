// ExploreData - handles exploration JSON parsing and events
// Ported from ExploreData.pde

class ExploreData {
  constructor(node, nodeObj) {
    this._node = node;
    this._nodeObj = nodeObj;
    this._exploreString = '';
    this._exploreArray = [];
    this._activeExploreObj = null;
    this._dirty = false;
  }

  parseJSON() {
    const exploreVal = this._nodeObj['explore'];

    if (typeof exploreVal === 'string') {
      this._exploreString = exploreVal;
      this._exploreArray = [];
      this._activeExploreObj = null;
    } else if (Array.isArray(exploreVal)) {
      this._exploreString = '';
      this._exploreArray = exploreVal;
      this._activeExploreObj = this._exploreArray[0];
    } else if (typeof exploreVal === 'object') {
      this._exploreString = '';
      this._exploreArray = [];
      this._activeExploreObj = exploreVal;
    } else {
      this._exploreString = 'Nothing to see here!';
      this._exploreArray = [];
      this._activeExploreObj = null;
    }

    this._dirty = true;
  }

  updateActiveExploreData() {
    for (let i = 0; i < this._exploreArray.length; i++) {
      const exploreObj = this._exploreArray[i];

      const turnCycle = exploreObj['turn cycle'] ?? 1;
      const turn = timeLoop.getActionPoints() % turnCycle;

      if ((exploreObj['on turn'] !== undefined) && exploreObj['on turn'] === turn && exploreObj !== this._activeExploreObj) {
        this._activeExploreObj = exploreObj;
        this._dirty = true;
      }
    }
  }

  canClueBeInvoked(clueID) {
    if (clueID === 'QM_2' && this._node.allowQuantumEntanglement()) {
      return true;
    }

    for (let i = 0; i < this._exploreArray.length; i++) {
      const exploreObj = this._exploreArray[i];

      if ((exploreObj['require clue'] || '') === clueID && exploreObj !== this._activeExploreObj) {
        return true;
      }

      // NO LONGER IN USE
      if (exploreObj['clue event'] !== undefined &&
          exploreObj['clue event']['clue id'] === clueID) {
        return true;
      }
    }
    return false;
  }

  invokeClue(clueID) {
    if (clueID === 'QM_2' && this._node.allowQuantumEntanglement()) {
      gameManager.popScreen();
      messenger.sendMessage('quantum entanglement');
    }

    for (let i = 0; i < this._exploreArray.length; i++) {
      const exploreObj = this._exploreArray[i];

      if ((exploreObj['require clue'] || '') === clueID && exploreObj !== this._activeExploreObj) {
        this._activeExploreObj = exploreObj;
        this._dirty = true;
      }

      // NO LONGER IN USE
      if (exploreObj['clue event'] !== undefined) {
        const eventClueID = exploreObj['clue event']['clue id'];
        if (eventClueID === clueID) {
          const eventID = exploreObj['clue event']['event id'];
          messenger.sendMessage(eventID);
        }
      }
    }
  }

  explore() {
    this.updateActiveExploreData();

    if (this._dirty && this._activeExploreObj != null) {
      this.fireEvents(this._activeExploreObj);
      this.discoverClues(this._activeExploreObj);
      this.revealHiddenPaths(this._activeExploreObj);
      this._dirty = false;
    }
  }

  fireEvents(exploreObj) {
    if (exploreObj['fire event'] !== undefined) {
      messenger.sendMessage(exploreObj['fire event']);
    }
    if (exploreObj['move to'] !== undefined) {
      gameManager.swapScreen(new MoveToScreen(exploreObj['text'], exploreObj['move to']));
    }
    if (exploreObj['teleport to'] !== undefined) {
      gameManager.swapScreen(new TeleportScreen(exploreObj['text'], exploreObj['teleport to']));
    }
  }

  discoverClues(exploreObj) {
    if (exploreObj['discover clue'] !== undefined) {
      playerData.discoverClue(exploreObj['discover clue']);
    }
  }

  revealHiddenPaths(exploreObj) {
    if (exploreObj['reveal paths'] !== undefined) {
      const pathArray = exploreObj['reveal paths'];
      for (let i = 0; i < pathArray.length; i++) {
        this._node.getConnection(pathArray[i]).revealHidden();
      }
      feed.publish('you discover a hidden path!', true);
    }
  }

  getExploreText() {
    if (this._activeExploreObj != null) {
      return this._activeExploreObj['text'] || 'no explore text';
    }
    return this._exploreString;
  }
}
