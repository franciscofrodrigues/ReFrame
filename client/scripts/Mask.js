class Mask {
  constructor(mask, inverted_mask, contained_masks, label, semantic_group) {
    this.mask = mask;
    this.inverted_mask = inverted_mask;
    this.contained_masks = contained_masks;
    this.label = label;
    this.semantic_group = semantic_group;

    this.x = 0;
    this.y = 0;
    this.w = 100;
    this.h = 100;
    this.mask_ratio = 0;

    this.inverted_mask_copy = this.mask_to_shape(this.inverted_mask, color(360, 100, 100, 255));
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    // noFill();
    // stroke(accent_color);
    // strokeWeight(1);
    // rect(this.x, this.y, this.w, this.h);

    fill(0);
    noStroke();
    text(this.label, this.x-this.w/2, this.y-this.h/2);

    image(this.mask, this.x, this.y, this.w, this.h);
    this.mask.filter(GRAY);

    push();
    blendMode(MULTIPLY);
    image(this.inverted_mask_copy, this.x, this.y, this.w, this.h);
    pop();
  }

  update() {
    this.mask_ratio = this.mask.width / this.mask.height;
    this.w = this.h * this.mask_ratio;
    // this.mask_ratio = this.mask.height / this.mask.width;
    // this.h = this.w * this.mask_ratio;

    // this.inverted_mask_copy = this.mask_to_shape(this.inverted_mask, color(360, 100, 100, 255));
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
