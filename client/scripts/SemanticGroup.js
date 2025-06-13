class SemanticGroup {
  constructor(semantic_group) {
    this.semantic_group = semantic_group;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.ang = 0;

    this.masks = [];
    this.mask_inc = 0;
  }


  run(pg) {
    this.update(pg);
    this.render(pg);
  }


  render(pg) {
    pg.push();
    pg.translate(this.x, this.y);
    pg.rotate(this.ang);

    pg.noFill();
    pg.stroke(accent_color);
    pg.strokeWeight(1);
    pg.rect(0, 0, this.w, this.h);

    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].run(pg);

      if (this.masks.length > 1) this.masks[i].x = -this.w / 2 + this.masks[i].w / 2 + i * this.mask_inc;
      else this.masks[i].x = 0;
    }
    pg.pop();
  }


  update(pg) {
    for (let i = 0; i < this.masks.length; i++) {
      let scl = min(this.w / this.masks[i].mask.width, this.h / this.masks[i].mask.height);
      this.masks[i].h = this.masks[i].mask.height * scl;

      this.mask_inc = this.w / this.masks.length;
    }
  }

  
  recompose() {
    for (let mask of this.masks) {
      mask.recompose();
    }
  }
}
