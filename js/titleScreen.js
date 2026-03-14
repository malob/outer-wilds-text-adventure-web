// TitleScreen + EndScreen
// Ported from TitleScreen.pde

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
