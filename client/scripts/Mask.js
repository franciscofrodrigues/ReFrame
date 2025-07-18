class Mask {
  constructor(mask, inverted_mask, contained_masks, label, semantic_group) {
    randomSeed(seed);
    
    this.mask = mask;    
    this.x = -10;
    this.y = -10;
    this.w = 10;
    this.h = 10;
    this.mask_ratio = 1;

    this.inverted_mask = inverted_mask;
    this.offsetX_range = [-this.w / 10, this.w / 10];
    this.offsetY_range = [-this.h / 10, this.h / 10];
    this.inverse_offsetX = random(this.offsetX_range[0], this.offsetX_range[1]);
    this.inverse_offsetY = random(this.offsetY_range[0], this.offsetY_range[1]);

    this.contained_masks = contained_masks;
    this.label = label;
    this.semantic_group = semantic_group;

    this.scl_range = [1, 3];
    this.scl_noise = random(this.scl_range[0], this.scl_range[1]);

    this.accent_color = accent_color;
    this.complementary_color = complementary_color;
    this.init_shapes();
  }

  run(pg) {
    this.update(pg);
    this.render(pg);
  }

  render(pg) {
    // DEBUG
    if (debug) {
      pg.push();
      pg.translate(0, 0, 3);
      pg.noFill();
      pg.stroke(debug_color);
      pg.strokeWeight(1);
      pg.rect(this.x, this.y, this.w, this.h);

      pg.fill(0);
      pg.noStroke();
      pg.text(this.label, this.x - this.w / 2, this.y - this.h / 2);
      pg.pop();
    }

    // Máscara Inversa
    if (this.inverted_mask_copy) {
      pg.push();
      pg.blendMode(MULTIPLY);
      // pg.tint(this.complementary_color);
      pg.tint(this.pick_color());
      pg.translate(0, 0, 1);
      // pg.translate(-this.w, 0, -2);
      // pg.scale(-1, 1);
      pg.image(this.inverted_mask_copy, this.x + this.inverse_offsetX, this.y + this.inverse_offsetY, this.w, this.h);
      // pg.image(this.inverted_mask_copy, this.x, this.y, this.w, this.h);
      pg.pop();
    }

    // Máscara Original
    pg.push();
    pg.translate(0, 0, 1);
    pg.image(this.mask, this.x, this.y, this.w, this.h);
    pg.pop();

    // Máscaras Contidas
    pg.push();
    pg.blendMode(MULTIPLY);
    // pg.blendMode(EXCLUSION); / pg.blendMode(HARD_LIGHT); / pg.blendMode(SOFT_LIGHT);
    pg.translate(this.x, this.y);
    for (let i = 0; i < this.contained_masks.length; i++) {
      if (this.contained_mask_copies[i]) {
        // Máscara ao longo da curva bezier
        pg.push();
        // pg.translate(-this.w / 2, -this.h / 2, -1);
        pg.translate(-this.w / 2, -this.h / 2, 1);
        let scaled = createVector(this.contained_mask_centroids[i].x * this.w, this.contained_mask_centroids[i].y * this.h);
        let line = this.bezier_lines[i];
        this.shape_along_line(pg, this.contained_mask_copies[i], scaled, this.contained_colors[i], line, this.contained_bezier_steps[i]);
        // this.shape_along_line(pg, this.contained_mask_copies[i], scaled, this.accent_color, line, 5);
        pg.pop();

        // Máscara sobreposta à original
        pg.push();
        // pg.translate(0, 0, 1);
        // pg.blendMode(NORMAL);
        pg.blendMode(MULTIPLY);
        pg.tint(this.accent_color);
        // pg.tint(this.contained_colors[i]);
        // pg.image(this.contained_mask_copies[i], 0, 0, this.w, this.h);
        pg.pop();
      }
    }
    pg.pop();
  }

  update(pg) {}

  recompose() {
    this.accent_color = accent_color;
    this.complementary_color = complementary_color;
    this.init_shapes();

    this.offsetX_range = [-this.w / 10, this.w / 10];
    this.offsetY_range = [-this.h / 10, this.h / 10];
    this.inverse_offsetX = random(this.offsetX_range[0], this.offsetX_range[1]);
    this.inverse_offsetY = random(this.offsetY_range[0], this.offsetY_range[1]);

    this.scl_noise = random(this.scl_range[0], this.scl_range[1]);
  }

  // Verificar sobreposições entre máscaras
  overlaps(other) {
    return abs(this.x - other.x) < (this.w + other.w) / 2 && abs(this.y - other.y) < (this.h + other.h) / 2;
  }

  // ---------------------------------------------------------------------------

  // SHAPES
  init_shapes() {
    if (this.contained_masks && this.contained_masks.length > 0) {
      this.contained_mask_centroids = [];
      this.contained_mask_copies = [];
      this.bezier_lines = [];
      this.contained_bezier_steps = [];
      this.contained_colors = [];

      for (let i = 0; i < this.contained_masks.length; i++) {
        this.contained_mask_copies[i] = this.mask_to_shape(this.contained_masks[i]);
        this.contained_mask_centroids[i] = this.get_shape_centroid(this.contained_masks[i]);
        this.bezier_lines[i] = this.bezier_line(this.contained_mask_centroids[i], 100, 20, false);
        this.contained_bezier_steps[i] = round(random(1, 20));
        this.contained_colors[i] = this.pick_color();
      }
    }

    if (this.inverted_mask) {
      this.inverted_mask_copy = this.mask_to_shape(this.inverted_mask);
    }
  }

  // Converter máscara binária em forma
  mask_to_shape(img) {
    let copy = createImage(img.width, img.height);

    copy.loadPixels();
    img.loadPixels();
    for (let x = 0; x < img.width; x++) {
      for (let y = 0; y < img.height; y++) {
        const i = 4 * (y * img.width + x);

        let b = img.pixels[i];
        if (b < 50) {
          let transparent = color(0, 0, 0, 0);
          copy.set(x, y, transparent);
        } else {
          let white = color(0, 0, 100, 255);
          copy.set(x, y, white);
        }
      }
    }
    copy.updatePixels();
    return copy;
  }

  // Calcular o centróide da máscara
  get_shape_centroid(img) {
    let sum_x = 0;
    let sum_y = 0;
    let count = 0;

    img.loadPixels();
    for (let x = 0; x < img.width; x++) {
      for (let y = 0; y < img.height; y++) {
        const i = 4 * (y * img.width + x);

        let b = img.pixels[i];
        if (b > 50) {
          sum_x += x;
          sum_y += y;
          count++;
        }
      }
    }

    let centroid = createVector(sum_x / count, sum_y / count);
    let normalized = createVector(centroid.x / img.width, centroid.y / img.height);
    return normalized;
  }

  pick_color() {
    let color_palette = ["#00FFFF", "#FF00FF", "#FFFF00"];
    return color_palette[int(random(color_palette.length))];
  }

  // ---------------------------------------------------------------------------

  // BEZIER
  bezier_line(start_point, end_point_offset, control_offset, straight) {
    let end_point = createVector(start_point.x + random(-end_point_offset, end_point_offset), start_point.y + random(-end_point_offset, end_point_offset));

    // Obter ponto inicial e final
    let x1 = start_point.x;
    let y1 = start_point.y;
    let x4 = end_point.x;
    let y4 = end_point.y;

    // Obter pontos de controlo intermédios
    let x2, y2, x3, y3;
    if (straight) {
      x2 = x1;
      y2 = y1;
      x3 = x4;
      y3 = y4;
    } else {
      x2 = lerp(x1, x4, 0.25) + random(-control_offset, control_offset);
      y2 = lerp(x1, x4, 0.25) + random(-control_offset, control_offset);
      x3 = lerp(x1, x4, 0.75) + random(-control_offset, control_offset);
      y3 = lerp(x1, x4, 0.75) + random(-control_offset, control_offset);
    }

    return { x1, y1, x2, y2, x3, y3, x4, y4 };
  }

  shape_along_line(pg, img, centroid, mask_color, line, steps) {
    let inc = 1 / steps;
    for (let t = inc; t <= 1; t += inc) {
      // Cálculo de coordenadas ao longo da curva bezier
      let x = bezierPoint(line.x1 + centroid.x, line.x2 + centroid.x, line.x3 + centroid.x, line.x4 + centroid.x, t);
      let y = bezierPoint(line.y1 + centroid.y, line.y2 + centroid.y, line.y3 + centroid.y, line.y4 + centroid.y, t);

      // Cálculo do ângulo para uma dada posição
      let tangent_x = bezierTangent(line.x1 + centroid.x, line.x2 + centroid.x, line.x3 + centroid.x, line.x4 + centroid.x, t);
      let tangent_y = bezierTangent(line.y1 + centroid.y, line.y2 + centroid.y, line.y3 + centroid.y, line.y4 + centroid.y, t);
      let ang = atan2(tangent_y, tangent_x) * t;

      // Escala em função do incremento
      // let scl = map(t, inc, 1, 1, 0.5);
      let scl = map(t, 0, 1, 1, 0.5);
      let scaled_w = this.w * scl;
      let scaled_h = this.h * scl;

      // Cor (tints)
      // let c = color(hue(mask_color), map(t, inc, 1, saturation(mask_color), 10), map(t, inc, 1, brightness(mask_color), 95));
      let c = color(hue(mask_color), saturation(mask_color), brightness(mask_color));

      // Formas
      pg.push();
      pg.translate(x, y);
      pg.rotate(ang);
      pg.translate(-centroid.x * scl, -centroid.y * scl);

      pg.tint(c);
      pg.image(img, scaled_w / 2, scaled_h / 2, scaled_w, scaled_h);
      pg.pop();
    }

    // DEBUG
    if (debug) {
      pg.push();
      pg.translate(0, 0, 3);
      pg.noFill();
      pg.stroke(debug_color);
      pg.bezier(line.x1 + centroid.x, line.y1 + centroid.y, line.x2 + centroid.x, line.y2 + centroid.y, line.x3 + centroid.x, line.y3 + centroid.y, line.x4 + centroid.x, line.y4 + centroid.y);
      pg.pop();
    }
  }
}
