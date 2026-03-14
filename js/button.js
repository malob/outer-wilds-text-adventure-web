// Button — ported from Button.pde
class Button extends Entity {
  constructor(buttonID, x, y, w, h) {
    super(new Vector2(x ?? 0, y ?? 0));
    this.id = buttonID;
    this._disabledPrompt = buttonID;
    this._bounds = new Vector2(w ?? 150, h ?? 50);

    this.hoverState = false;
    this.visible = true;
    this.enabled = true;
    this._observer = null;
    this._buttonDown = false;
    this._wasMousePressed = false;
    this._buttonColor = null; // set lazily on first draw
    this._hasDisabledPrompt = false;
  }

  _getButtonColor() {
    if (this._buttonColor === null) {
      this._buttonColor = color(0, 0, 100);
    }
    return this._buttonColor;
  }

  setColor(newColor) {
    this._buttonColor = newColor;
  }

  setDisabledPrompt(prompt) {
    this._disabledPrompt = prompt;
    this._hasDisabledPrompt = true;
  }

  getWidth() {
    return this._bounds.x;
  }

  setObserver(observer) {
    this._observer = observer;
  }

  isMouseDown() {
    return mouseIsPressed;
  }

  update() {
    if (!this.enabled) {
      this._buttonDown = false;
      this.hoverState = false;
      return;
    }

    if (this.isPointInBounds(mouseX, mouseY)) {
      if (!this.hoverState) {
        this.hoverState = true;
        this.onButtonEnterHover();
        if (this._observer) this._observer.onButtonEnterHover(this);
      }

      if (!this._wasMousePressed && this.isMouseDown()) {
        this._buttonDown = true;
      }
      // fire event on release
      if (this._buttonDown && !this.isMouseDown()) {
        this._buttonDown = false;
        this.onButtonUp();
        if (this._observer) this._observer.onButtonUp(this);
      }
    } else {
      this._buttonDown = false;

      if (this.hoverState) {
        this.hoverState = false;
        this.onButtonExitHover();
        if (this._observer) this._observer.onButtonExitHover(this);
      }
    }

    this._wasMousePressed = this.isMouseDown();
  }

  onButtonExitHover() {}
  onButtonEnterHover() {}
  onButtonUp() {}

  draw() {
    if (!this.visible) return;

    let alpha = 100;
    if (!this.enabled) alpha = 25;

    const bc = this._getButtonColor();
    stroke(hue(bc), saturation(bc), brightness(bc), alpha);
    fill(0, 0, 0);

    if (this.hoverState) {
      if (this._buttonDown) {
        stroke(0, 100, 100);
      } else {
        stroke(200, 100, 100);
      }
    }

    this.drawShape();
    this.drawText(alpha);
  }

  drawShape() {
    rectMode(CENTER);
    rect(this.screenPosition.x, this.screenPosition.y, this._bounds.x, this._bounds.y);
  }

  drawText(alpha) {
    fill(0, 0, 100, alpha);
    textSize(14);
    smallFont();
    textAlign(CENTER, CENTER);

    if (this.enabled) {
      text(this.id, this.screenPosition.x, this.screenPosition.y);
    } else {
      text(this._disabledPrompt, this.screenPosition.x, this.screenPosition.y);
    }
  }

  isPointInBounds(x, y) {
    if (x > this.screenPosition.x - this._bounds.x * 0.5 && x < this.screenPosition.x + this._bounds.x * 0.5) {
      if (y > this.screenPosition.y - this._bounds.y * 0.5 && y < this.screenPosition.y + this._bounds.y * 0.5) {
        return true;
      }
    }
    return false;
  }
}
