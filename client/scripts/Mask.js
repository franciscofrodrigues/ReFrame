class Mask {
  constructor(mask, inverted_mask, contained_masks, label, semantic_group) {
    this.mask = mask;

    this.inverted_mask = inverted_mask;
    this.chosen_inverse = false;
    this.inverse_offsetX = random(-10, 10);
    this.inverse_offsetY = random(-10, 10);

    this.contained_masks = contained_masks;
    this.label = label;
    this.semantic_group = semantic_group;

    this.x = -10;
    this.y = -10;
    this.w = 10;
    this.h = 10;
    this.mask_ratio = 1;

    this.accent_color = accent_color;
    this.complementary_color = complementary_color;
    this.init_shapes();
  }

  run(pg) {
    this.update(pg);
    this.render(pg);
  }

  render(pg) {
    if (debug) {
      pg.noFill();
      pg.stroke(accent_color);
      pg.strokeWeight(1);
      pg.rect(this.x, this.y, this.w, this.h);

      pg.fill(0);
      pg.noStroke();
      pg.text(this.label, this.x - this.w / 2, this.y - this.h / 2);
    }

    pg.push();
    pg.blendMode(MULTIPLY);
    // pg.tint(255, 127);
    // if (this.inverted_mask_copy && this.chosen_inverse) pg.image(this.inverted_mask_copy, this.x + this.inverse_offsetX, this.y + this.inverse_offsetY, this.w * 1.2, this.h * 1.2);
    pg.pop();

    pg.image(this.mask, this.x, this.y, this.w, this.h);
    // this.mask.filter(GRAY);

    pg.push();
    pg.blendMode(MULTIPLY);
    for (let i = 0; i < this.contained_masks.length; i++) {
      if (this.contained_mask_copy[i]) pg.image(this.contained_mask_copy[i], this.x, this.y, this.w, this.h);
    }
    pg.pop();
  }

  update(pg) {
    // this.mask_ratio = this.mask.width / this.mask.height;
    // this.w = this.h * this.mask_ratio;

    // this.x = constrain(this.x, 0, pg.width - this.w);
    // this.y = constrain(this.y, 0, pg.height - this.h);
  }

  recompose() {
    this.accent_color = accent_color;
    this.complementary_color = complementary_color;
    this.init_shapes();

    this.inverse_offsetX = random(-this.w / 10, this.w / 10);
    this.inverse_offsetY = random(-this.h / 10, this.h / 10);
  }

  init_shapes() {
    if (this.contained_masks && this.contained_masks.length > 0) {
      // this.chosen_contained = int(random(this.contained_masks.length));
      // this.contained_mask_copy = this.mask_to_shape(this.contained_masks[this.chosen_contained], this.accent_color);
      this.contained_mask_copy = [];
      for (let i = 0; i < this.contained_masks.length; i++) {
        this.contained_mask_copy[i] = this.mask_to_shape(this.contained_masks[i], this.accent_color);
      }
    }

    if (this.inverted_mask && this.chosen_inverse) {
      this.inverted_mask_copy = this.mask_to_shape(this.inverted_mask, this.complementary_color);
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
