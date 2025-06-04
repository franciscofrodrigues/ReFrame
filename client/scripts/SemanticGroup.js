class SemanticGroup {
  constructor(semantic_group) {
    this.semantic_group = semantic_group;
    this.x = 0;
    this.y = 0;
    this.w = 100;
    this.h = 100;
    this.ang = 0;

    this.masks = [];
    this.mask_inc = 0;
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    push();
    translate(this.x, this.y);
    rotate(this.ang);

    noFill();
    stroke(accent_color);
    strokeWeight(1);
    rect(0, 0, this.w, this.h);

    // for (let mask of this.masks) {
    //   mask.run();
    // }

    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].run();

      if (this.masks.length > 1) this.masks[i].x = -this.w / 2 + this.masks[i].w / 2 + i * this.mask_inc;
      else this.masks[i].x = 0;
    }
    pop();
  }

  update() {
    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].h = this.h;
      // this.masks[i].w = this.w / this.masks.length;
      this.mask_inc = this.w / this.masks.length;
    }
  }
}
