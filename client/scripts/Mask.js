class Mask {
  constructor(mask, inverted_mask, contained_masks, label, semantic_group) {
    this.mask = mask;

    this.inverted_mask = inverted_mask;
    this.contained_masks = contained_masks;
    this.label = label;
    this.semantic_group = semantic_group;

    this.x = -10;
    this.y = -10;
    this.w = 10;
    this.h = 10;
    this.mask_ratio = 1;

    this.accent_color = accent_color;
    this.init_shapes();
  }

  run(pg) {
    this.update(pg);
    this.render(pg);
  }

  render(pg) {
    // pg.noFill();
    // pg.stroke(accent_color);
    // pg.strokeWeight(1);
    // pg.rect(this.x, this.y, this.w, this.h);

    // pg.fill(0);
    // pg.noStroke();
    // pg.text(this.label, this.x - this.w / 2, this.y - this.h / 2);

    pg.image(this.mask, this.x, this.y, this.w, this.h);    
    // this.mask.filter(GRAY);

    pg.push();
    pg.blendMode(MULTIPLY);
    // pg.image(this.inverted_mask_copy, this.x, this.y, this.w*2, this.h*2);
    if (this.contained_mask_copy) pg.image(this.contained_mask_copy, this.x, this.y, this.w, this.h);
    pg.pop();
  }

  update(pg) {
    this.mask_ratio = this.mask.width / this.mask.height;
    this.w = this.h * this.mask_ratio;
  }

  recompose() {
    this.accent_color = accent_color;
    this.init_shapes();
  }

  init_shapes() {
    if (this.contained_masks && this.contained_masks.length > 0) {
      this.chosen_contained = int(random(this.contained_masks.length));
      this.contained_mask_copy = this.mask_to_shape(this.contained_masks[this.chosen_contained], this.accent_color);
    }

    if (this.inverted_mask) {
      this.inverted_mask_copy = this.mask_to_shape(this.inverted_mask, this.accent_color);
    }
  }

  mask_to_shape(img, c) {
    let copy = createImage(img.width, img.height);

    copy.loadPixels();
    img.loadPixels();
    for (let x = 0; x < img.width; x++) {
      for (let y = 0; y < img.height; y++) {
        const i = 4 * (y * img.width + x);

        let pixel_color = color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3]);
        let b = brightness(pixel_color);
        if (b < 50) {
          copy.pixels[i] = 0;
          copy.pixels[i + 1] = 0;
          copy.pixels[i + 2] = 0;
          copy.pixels[i + 3] = 0;
        } else {
          copy.pixels[i] = red(c);
          copy.pixels[i + 1] = green(c);
          copy.pixels[i + 2] = blue(c);
          copy.pixels[i + 3] = alpha(c);
        }
      }
    }
    copy.updatePixels();
    return copy;
  }
}
