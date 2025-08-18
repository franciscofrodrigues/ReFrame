class PoolCell {
  constructor(mask, x, y, w, h, margin, selected) {
    this.mask = mask;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.margin = margin;
    this.hover_grow = this.margin * 0.4;
    this.scl = min(this.w / this.mask.mask.width, this.h / this.mask.mask.height);

    this.border_radius = 5;
    this.hover = false;
    this.selected = selected;
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    push();
    translate(this.x, this.y);

    push();
    translate(this.w / 2, this.h / 2);

    this.render_rectangle();

    if (this.mask) image(this.mask.mask, 0, 0, this.mask.pool_w, this.mask.pool_h);

    if (!this.selected) this.render_overlay();
    pop();

    this.render_selection_mark();
    pop();
  }

  update() {
    this.resize_mask_img();
  }

  // ---------------------------------------------------------------------------

  rect_dims() {
    let rect_w, rect_h;

    if (this.hover) {
      rect_w = this.w + this.hover_grow;
      rect_h = this.h + this.hover_grow;
    } else {
      rect_w = this.w;
      rect_h = this.h;
    }

    return [rect_w, rect_h];
  }

  render_rectangle() {
    drawingContext.shadowOffsetX = 10;
    drawingContext.shadowOffsetY = 10;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = comp_shadow_color;

    fill(fg_color);
    noStroke();
    let [w, h] = this.rect_dims();
    rect(0, 0, w, h, this.border_radius);
  }

  render_overlay() {
    let overlay_color = color(hue(bg_color), saturation(bg_color), brightness(bg_color), overlay_alpha);
    fill(overlay_color);
    noStroke();
    let [w, h] = this.rect_dims();
    rect(0, 0, w, h, this.border_radius);
  }

  render_selection_mark() {
    let size = 14;
    let padding = size * 0.4;

    push();
    translate(size, size);

    noFill();
    stroke(0);
    strokeWeight(1);
    ellipse(0, 0, size, size);

    if (this.selected) {
      noStroke();
      fill(0);
      ellipse(0, 0, size - padding, size - padding);
    }
    pop();
  }

  resize_mask_img() {
    this.mask.pool_w = this.mask.mask.width * this.scl * 0.8;
    this.mask.pool_h = this.mask.mask.height * this.scl * 0.8;
  }

  // ---------------------------------------------------------------------------

  is_hover(x, y) {
    if (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h) {
      this.hover = true;
    } else {
      this.hover = false;
    }
  }

  pressed() {
    if (this.hover) {
      if (this.selected) {
        this.unselect();
      } else {
        this.select();
      }
    }
  }

  select() {
    this.selected = true;
    let index = unselected_masks.indexOf(this.mask);
    unselected_masks.splice(index, 1);

    if (!masks.includes(this.mask)) {
      masks.push(this.mask);
    }
  }

  unselect() {
    this.selected = false;
    let index = masks.indexOf(this.mask);
    masks.splice(index, 1);

    if (!unselected_masks.includes(this.mask)) {
      unselected_masks.push(this.mask);
    }
  }
}
