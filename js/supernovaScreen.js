// SupernovaScreen + FlashbackScreen + GameOverScreen
// Ported from SupernovaScreen.pde

class SupernovaScreen extends Screen {
  constructor() {
    super();
    this.initTime = 0;
    this.collapseTime = 0;
    this.supernovaTime = 0;
    this.collapsePercent = 0;
    this.supernovaPercent = 0;

    this.SUN_SIZE = 300;
    this.COLLAPSE_DURATION = 2000;
    this.SUPERNOVA_SIZE = 2000;
    this.SUPERNOVA_DURATION = 2000;
  }

  onEnter() {
    this.initTime = millis();
    this.collapseTime = this.initTime + 1 * 500;
    this.supernovaTime = this.collapseTime + this.COLLAPSE_DURATION;

    feed.clear();
    feed.publish('the sun is going supernova!', true);
  }

  onExit() {}

  update() {
    this.collapsePercent = constrain((millis() - this.collapseTime) / this.COLLAPSE_DURATION, 0, 1);
    this.collapsePercent = this.collapsePercent * this.collapsePercent * this.collapsePercent;

    this.supernovaPercent = constrain((millis() - this.supernovaTime) / this.SUPERNOVA_DURATION, 0, 1);
    this.supernovaPercent = this.supernovaPercent * this.supernovaPercent;

    if (this.supernovaPercent === 1) {
      playerData.killPlayer();
    }
  }

  render() {
    push();
    translate(width / 2, height / 2);

    // draw supernova
    noStroke();
    fill(300 * this.supernovaPercent, 100, 100);
    ellipse(0, 0,
      5 + this.SUPERNOVA_SIZE * this.supernovaPercent,
      5 + this.SUPERNOVA_SIZE * this.supernovaPercent * (1 - this.supernovaPercent * 0.5));

    // draw sun
    if (this.collapsePercent < 1) {
      stroke(40, 100, 100);
      fill(0, 0, 0);
      ellipse(0, 0,
        this.SUN_SIZE * (1 - this.collapsePercent),
        this.SUN_SIZE * (1 - this.collapsePercent));
    }

    pop();

    feed.render();
  }

  onButtonUp(button) {}
}

class FlashbackScreen extends Screen {
  constructor() {
    super();
    this.initTime = 0;
    this.lastSpawnTime = 0;
    this.flashbackPercent = 0;
    this._ringSizes = [];
    this.FLASHBACK_DURATION = 2200;
  }

  onEnter() {
    this.initTime = millis();
    feed.clear();
    feed.publish('?!gnineppah s\'tahW', true);
  }

  onExit() {}

  update() {
    if (millis() - this.lastSpawnTime > 50 && random(1) > 0.3) {
      this.lastSpawnTime = millis();
      this._ringSizes.push(5.0);
    }

    for (let i = 0; i < this._ringSizes.length; i++) {
      this._ringSizes[i] = this._ringSizes[i] + this._ringSizes[i] * 0.1 + 0.5;
    }

    if (this.getFlashBackPercent() === 1) {
      gameManager.resetTimeLoop();
    }
  }

  getFlashBackPercent() {
    return constrain((millis() - this.initTime) / this.FLASHBACK_DURATION, 0, 1);
  }

  render() {
    push();
    translate(width / 2, height / 2);

    for (let i = 0; i < this._ringSizes.length; i++) {
      stroke(0, 0, 100);
      noFill();
      ellipse(0, 0, this._ringSizes[i], this._ringSizes[i]);
    }

    pop();

    const fadeAlpha = constrain((this.getFlashBackPercent() - 0.9) / 0.1, 0, 1);
    fill(0, 0, 100, fadeAlpha * 100);
    rectMode(CORNER);
    rect(0, 0, width, height);

    feed.render();
  }

  onButtonUp(button) {}
}

class GameOverScreen extends Screen {
  constructor() {
    super();
    this.addButtonToToolbar(new Button('Try Again'));
  }

  update() {}

  render() {
    fill(0, 90, 90);
    textAlign(CENTER, CENTER);
    textSize(100);
    text('You Are Dead', width / 2, height / 2);
  }

  onButtonUp(button) {
    gameManager.resetTimeLoop();
  }
}
