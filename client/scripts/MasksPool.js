class MasksPool {
  constructor(masks, unselected_masks, x, y, w, h, num_cols, num_rows) {
    this.masks = masks;
    this.unselected_masks = unselected_masks;

    this.all_masks = [];
    this.all_masks = concat(this.masks, this.unselected_masks);

    this.x = x;
    this.y = y;
    this.margin = 10;
    this.w = w - this.margin;
    this.h = h - this.margin;

    this.num_cols = num_cols;
    this.num_rows = num_rows;
    this.cell_w = this.w / this.num_cols;
    this.cell_h = this.h / this.num_rows;

    this.cells = [];
    this.init_cells();
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    // Grelha de "Masks"
    for (let cell of this.cells) {
      cell.render();
    }

    if(this.cells.length == 0) {
      push();
      textAlign(CENTER, CENTER);
      fill(debug_color);
      textSize(14);
      text("No items to display. Please try uploading some images.", this.w/2, this.h/2);
      pop();
    }
  }

  update() {
    for (let cell of this.cells) {
      cell.update();
      cell.is_hover(mouseX, mouseY);
    }
  }

  pressed() {
    for (let cell of this.cells) {
      cell.pressed();
    }
  }

  // ---------------------------------------------------------------------------

  init_cells() {
    this.cells = [];
    for (let i = 0; i < this.all_masks.length; i++) {
      let col = i % this.num_cols;
      let row = int(i / this.num_cols);

      let selected = masks.includes(this.all_masks[i]);

      let cell = new PoolCell(this.all_masks[i], col * this.cell_w + this.margin, row * this.cell_h + this.margin, this.cell_w - this.margin, this.cell_h - this.margin, this.margin, selected);
      this.cells.push(cell);
    }
  }
}
