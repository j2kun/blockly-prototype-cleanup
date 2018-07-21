class Vector {
  constructor(x, y, attrs) {
    this.x = x;
    this.y = y;
    this.attrs = attrs;
  }

  copy() {
    return this.preservingAttrs(this.x, this.y);
  }

  preservingAttrs(x, y) {
    return new Vector(x, y, this.attrs);
  }

  normalized() {
    let norm = 1.0 * this.norm();
    return this.preservingAttrs(this.x / norm, this.y / norm);
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add(vector) {
    return this.preservingAttrs(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return this.preservingAttrs(this.x - vector.x, this.y - vector.y);
  }

  scale(length) {
    return this.preservingAttrs(this.x * length, this.y * length);
  }

  distance(vector) {
    return this.subtract(vector).norm();
  }

  midpoint(b) {
    return this.preservingAttrs((this.x + b.x) / 2, (this.y + b.y) / 2);
  }

  toString() {
    return "[" + this.x + ", " + this.y + "]";
  }
}


class Rectangle {
  constructor(topLeft, width, height, attrs) {
    this.topLeft = topLeft;
    this.width = width;
    this.height = height;
    this.attrs = attrs;
  }

  bottomRight() {
    return new Vector(this.topLeft.x + this.width,
      this.topLeft.y - this.height);
  }

  center() {
    return this.bottomRight().midpoint(this.topLeft);
  }
}

module.exports = {
  Vector,
  Rectangle,
};
