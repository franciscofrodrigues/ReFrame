class MasksPool {
  constructor(masks, x, y, w, h, border_radius, margin, num_cols, num_rows) {
    this.masks = masks;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    // this.margin = margin;
    // this.border_radius = border_radius;
    this.margin = 20;
    this.border_radius = 5;

    this.num_cols = num_cols;
    this.num_rows = num_rows;
    this.cell_w = this.w / this.num_cols;
    this.cell_h = this.h / this.num_rows;
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    // Grelha de "Masks"
    push();
    translate(-this.w / 2, -this.h / 2);
    translate(this.cell_w / 2, this.cell_h / 2);

    for (let i = 0; i < this.masks.length; i++) {
      let x = i % this.num_cols;
      let y = int(i / this.num_cols);

      // Drop Shadow
      push();
      // drawingContext.shadowOffsetX = 10;
      // drawingContext.shadowOffsetY = 10;
      // drawingContext.shadowBlur = 20;
      // drawingContext.shadowColor = comp_shadow_color;
      noStroke();
      fill(fg_color);
      rect(x * this.cell_w, y * this.cell_h, this.cell_w - this.margin, this.cell_h - this.margin, this.border_radius);
      pop();

      image(this.masks[i].mask, x * this.cell_w, y * this.cell_h, this.masks[i].pool_w - this.margin, this.masks[i].pool_h - this.margin);
    }
    pop();
  }

  update() {
    let scl = 0;
    for (let mask of this.masks) {
      scl = min(this.cell_w / mask.mask.width, this.cell_h / mask.mask.height);
      mask.pool_w = mask.mask.width * scl * 0.8;
      mask.pool_h = mask.mask.height * scl * 0.8;
    }
  }
}
