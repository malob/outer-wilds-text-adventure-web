// Vector2 — ported from Vector2.pde
class Vector2 {
  constructor(xOrVec, y) {
    if (xOrVec instanceof Vector2) {
      this.x = xOrVec.x;
      this.y = xOrVec.y;
    } else {
      this.x = xOrVec ?? 0;
      this.y = y ?? 0;
    }
  }

  assign(vec) {
    this.x = vec.x;
    this.y = vec.y;
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  dist(v) {
    return v.sub(this).magnitude();
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mult(value) {
    return new Vector2(this.x * value, this.y * value);
  }

  scale(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  magnitude() {
    return Math.max(Math.sqrt(this.x * this.x + this.y * this.y), 0.001);
  }

  normalize() {
    const mag = this.magnitude();
    this.x /= mag;
    this.y /= mag;
    return this;
  }

  normalized() {
    const mag = this.magnitude();
    return new Vector2(this.x / mag, this.y / mag);
  }

  theta() {
    return Math.atan2(this.y, this.x);
  }

  dx() {
    return this.x / this.magnitude();
  }

  dy() {
    return this.y / this.magnitude();
  }

  leftNormal() {
    return new Vector2(this.y, -this.x);
  }

  rightNormal() {
    return new Vector2(-this.y, this.x);
  }

  dot(v1) {
    return this.x * v1.x + this.y * v1.y;
  }

  scaledDot(v1) {
    return this.x * v1.dx() + this.y * v1.dy();
  }

  projectOnto(v2) {
    const d = this.scaledDot(v2);
    return new Vector2(d * v2.dx(), d * v2.dy());
  }
}
