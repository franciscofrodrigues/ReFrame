class MasksPool {
  constructor(masks, x, y, w, h, num_cols, num_rows) {
    this.masks = masks;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

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
    // Fundo
    fill(bg_color);
    noStroke();
    rect(this.w / 2, this.h / 2, this.w, this.h);

    // Grelha de "Masks"
    push();
    translate(this.cell_w / 2, this.cell_h / 2);

    for (let i = 0; i < this.masks.length; i++) {
      let x = i % this.num_cols;
      let y = floor(i / this.num_cols);

      // Drop Shadow
      push();
      drawingContext.shadowOffsetX = 10;
      drawingContext.shadowOffsetY = 10;
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = comp_shadow_color;
      noStroke();
      rect(x * this.cell_w, y * this.cell_h, this.cell_w-5, this.cell_h-5);
      pop();

      image(this.masks[i].mask, x * this.cell_w, y * this.cell_h, this.masks[i].pool_w, this.masks[i].pool_h);      
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
