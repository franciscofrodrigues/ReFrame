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

    this.scroll = 0;
    this.max_scroll = int(this.all_masks.length / this.num_cols) * this.cell_h;

    this.cells = [];
    this.init_cells();
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    push();
    translate(0, -this.scroll);

    // Grelha de "Masks"
    for (let cell of this.cells) {
      cell.render();
    }
    pop();
  }

  update() {
    for (let cell of this.cells) {
      cell.update();
      cell.is_hover(mouseX, mouseY + this.scroll);
    }
  }

  pressed() {
    for (let cell of this.cells) {
      cell.pressed();
    }
  }

  mouse_wheel(event) {
    this.scroll += event.delta * 0.5;
    this.scroll = constrain(this.scroll, 0, this.max_scroll);
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
