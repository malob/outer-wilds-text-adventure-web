// SplashScreen (new to web port), TitleScreen, EndScreen
// TitleScreen and EndScreen ported from TitleScreen.pde
// SplashScreen provides fan content attribution and a user gesture to unlock audio.

class SplashScreen extends Screen {
  constructor() {
    super();
    this._linkOverlay = null;
    this.addButton(new Button('Start Game', width / 2, height - 50, 200, 50));
  }

  _createLink(url, label, topPercent) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.textContent = label;
    a.style.cssText =
      'pointer-events:auto; color:#999; text-decoration:none; ' +
      'position:absolute; left:50%; top:' + topPercent + '%; transform:translate(-50%,-50%);';
    a.addEventListener('mouseover', function() { this.style.color = '#fff'; });
    a.addEventListener('mouseout', function() { this.style.color = '#999'; });
    return a;
  }

  onEnter() {
    // Create HTML link overlay positioned on top of the canvas
    this._linkOverlay = document.createElement('div');
    this._linkOverlay.style.cssText =
      'position:absolute; pointer-events:none; font-family:Consolas,"Courier New",monospace; font-size:13px; text-align:center;';
    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();
    this._linkOverlay.style.left = rect.left + 'px';
    this._linkOverlay.style.top = rect.top + 'px';
    this._linkOverlay.style.width = rect.width + 'px';
    this._linkOverlay.style.height = rect.height + 'px';

    const mobiusY = (height / 2 + 65) / height * 100;
    const githubY = (height / 2 + 90) / height * 100;

    this._linkOverlay.appendChild(this._createLink(
      'https://www.mobiusdigitalgames.com/outer-wilds-text-adventure.html',
      'mobiusdigitalgames.com/outer-wilds-text-adventure.html', mobiusY));
    this._linkOverlay.appendChild(this._createLink(
      'https://github.com/malob/outer-wilds-text-adventure-web',
      'github.com/malob/outer-wilds-text-adventure-web', githubY));

    document.body.appendChild(this._linkOverlay);
  }

  onExit() {
    if (this._linkOverlay) {
      this._linkOverlay.remove();
      this._linkOverlay = null;
    }
  }

  update() {}

  render() {
    fill(0, 0, 60);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('This is an unofficial web port of', width / 2, height / 2 - 160);

    fill(142, 90, 90);
    textSize(70);
    text('Outer Wilds', width / 2, height / 2 - 90);

    fill(0, 0, 100);
    textSize(22);
    text('A Thrilling Graphical Text Adventure', width / 2, height / 2 - 25);

    fill(0, 0, 50);
    textSize(14);
    text('Originally created by Alex Beachum at Mobius Digital (2014)', width / 2, height / 2 + 30);

    // URLs are rendered as clickable HTML links overlaid on the canvas
    // (created in onEnter, removed in onExit) — not drawn on canvas.
  }

  onButtonUp(button) {
    if (button.id === 'Start Game') {
      AudioManager.unlock();
      gameManager.swapScreen(gameManager.titleScreen);
    }
  }
}

class TitleScreen extends Screen {
  constructor() {
    super();
    this.addButton(new Button('New Game', width / 2 - 110, height - 50, 200, 50));
    this.addButton(new Button('Quit', width / 2 + 110, height - 50, 200, 50));
  }

  onEnter() {
    if (SKIP_TITLE) {
      gameManager.loadSector(SectorName.TIMBER_HEARTH);
      return;
    }

    AudioManager.play(SoundLibrary.kazooTheme);
  }

  onExit() {
    AudioManager.pause();
  }

  update() {}

  render() {
    fill(142, 90, 90);
    textAlign(CENTER, CENTER);
    textSize(100);
    text('Outer Wilds', width / 2, height / 2 - 50);

    fill(0, 0, 100);
    textSize(22);
    text('a thrilling graphical text adventure', width / 2, height / 2 + 50);
  }

  onButtonUp(button) {
    if (button.id === 'New Game') {
      gameManager.loadSector(SectorName.TIMBER_HEARTH);
    } else if (button.id === 'Quit') {
      // Original calls Processing's exit(); browsers can't close their own tab.
      console.log('Quit requested');
    }
  }
}

class EndScreen extends Screen {
  constructor() {
    super();
    this.addButton(new Button('Exit', width / 2, height - 50, 200, 50));
  }

  onEnter() {
    AudioManager.play(SoundLibrary.kazooTheme);
  }

  onExit() {
    AudioManager.pause();
  }

  update() {}

  render() {
    fill(142, 90, 90);
    textAlign(CENTER, CENTER);
    textSize(100);
    text('Outer Wilds', width / 2, height / 2 - 50);

    fill(0, 0, 100);
    textSize(22);
    text('thanks for playing!', width / 2, height / 2 + 50);
  }

  onButtonUp(button) {
    if (button.id === 'Exit') {
      // Original calls Processing's exit(); browsers can't close their own tab.
      console.log('Exit requested');
    }
  }
}
