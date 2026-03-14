// TimeLoop — ported from TimeLoop.pde
class TimeLoop {
  constructor() {
    this.ACTION_POINTS_PER_LOOP = 15;
    this._actionPoints = 0;
    this._isTimeLoopEnabled = true;
    this._triggerSupernova = false;
  }

  init() {
    this._actionPoints = this.ACTION_POINTS_PER_LOOP;
    this._isTimeLoopEnabled = true;
    this._triggerSupernova = false;

    feed.publish('You wake up next to a campfire near your village\'s launch tower. Today\'s the big day!');
    feed.publish('In the sky, you notice a bright object flying away from Giant\'s Deep...', true);

    messenger.addObserver(this);
  }

  onReceiveGlobalMessage(message) {
    if (message.id === 'disable time loop' && this._isTimeLoopEnabled) {
      this._isTimeLoopEnabled = false;
      feed.publish('you disable the time loop device', true);
    }
  }

  lateUpdate() {
    if (this._triggerSupernova) {
      this._triggerSupernova = false;
      gameManager.swapScreen(new SupernovaScreen());
    }
  }

  getEnabled() {
    return this._isTimeLoopEnabled;
  }

  getLoopPercent() {
    return (this.ACTION_POINTS_PER_LOOP - this._actionPoints) / this.ACTION_POINTS_PER_LOOP;
  }

  getActionPoints() {
    return this._actionPoints;
  }

  waitFor(minutes) {
    feed.publish('you chill out for 1 minute', true);
    this.spendActionPoints(minutes);
  }

  spendActionPoints(points) {
    if (playerData.isPlayerAtEOTU()) return;

    const lastActionPoints = this._actionPoints;

    this._actionPoints = max(0, this._actionPoints - points);
    messenger.sendMessage('action points spent');

    // detect when you have 1/4 your action points remaining
    if (lastActionPoints > this.ACTION_POINTS_PER_LOOP * 0.25 &&
        this._actionPoints <= this.ACTION_POINTS_PER_LOOP * 0.25) {
      feed.publish('you notice the Sun is getting awfully big and red', true);
    }

    if (this._actionPoints === 0) {
      this._triggerSupernova = true;
    }
  }

  renderTimer() {
    if (playerData.isPlayerAtEOTU()) return;

    const r = 50;
    const x = 50;
    const y = height - 50;

    stroke(0, 0, 100);
    fill(0, 0, 0);
    ellipse(x, y, r, r);
    fill(30, 100, 100);
    arc(x, y, r, r, 0 - PI * 0.5 + TAU * this.getLoopPercent(), 1.5 * PI);
  }
}
