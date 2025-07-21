class Mask {
  constructor(mask, inverted_mask, contained_masks, label, semantic_group) {
    randomSeed(seed);

    this.mask = mask;
    this.mask_ratio = 1;
    this.x = -10;
    this.y = -10;
    this.w = 10;
    this.h = 10;
    this.label = label;
    this.semantic_group = semantic_group;

    // orig (original mask), cont (contained mask), inv (inverse mask), rep (repeat)
    this.view_type_options = ["orig", "orig_rep", "orig+cont", "orig+cont_rep", "orig+inv", "orig+inv_rep", "inv_rep"];
    this.view_type = random(this.view_type_options);

    // Inversa
    this.inverted_mask = inverted_mask;
    this.offsetX_range = [-this.w / 10, this.w / 10];
    this.offsetY_range = [-this.h / 10, this.h / 10];
    this.inverse_offsetX = random(this.offsetX_range[0], this.offsetX_range[1]);
    this.inverse_offsetY = random(this.offsetY_range[0], this.offsetY_range[1]);

    // Contidas
    this.contained_masks = contained_masks;

    // Escala
    this.scl_range = [1, 1.5];
    this.scl_noise = random(this.scl_range[0], this.scl_range[1]);

    // Cores
    this.accent_color = accent_color;
    this.complementary_color = complementary_color;

    // Máscaras binárias -> Shapes
    this.init_shapes();

    // Curvas Bezier
    this.curves = [[], [], []];
    this.init_curves();
  }

  run(pg) {
    this.update(pg);
    this.render(pg);
  }

  render(pg) {
    pg.push();
    pg.translate(this.x, this.y);

    // DEBUG
    if (debug) {
      pg.push();
      pg.translate(0, 0, 3);
      pg.noFill();
      pg.stroke(debug_color);
      pg.strokeWeight(1);
      pg.rect(0, 0, this.w, this.h);

      pg.fill(0);      
      pg.noStroke();
      pg.text(this.label, -this.w / 2, -this.h / 2 - 5);
      pg.pop();
    }

    switch (this.view_type) {
      case "orig":
        this.render_mask(pg, false);
        break;
      case "orig_rep":
        this.render_mask(pg, true);
        break;
      case "orig+cont":
        this.render_mask(pg, false);
        this.render_contained(pg, false);
        break;
      case "orig+cont_rep":
        this.render_contained(pg, true);
        this.render_mask(pg, false);
        break;
      case "orig+inv":
        this.render_inverse(pg, false);
        this.render_mask(pg, false);
        break;
      case "orig+inv_rep":
        this.render_inverse(pg, true);
        this.render_mask(pg, false);
        break;
      case "inv_rep":
        this.render_inverse(pg, true);
        break;
    }

    pg.pop();
  }

  update(pg) {}

  recompose() {
    this.view_type = random(this.view_type_options);
    console.log(this.view_type);

    this.accent_color = accent_color;
    this.complementary_color = complementary_color;
    this.init_shapes();
    this.init_curves();

    this.offsetX_range = [-this.w / 10, this.w / 10];
    this.offsetY_range = [-this.h / 10, this.h / 10];
    this.inverse_offsetX = random(this.offsetX_range[0], this.offsetX_range[1]);
    this.inverse_offsetY = random(this.offsetY_range[0], this.offsetY_range[1]);

    this.scl_noise = random(this.scl_range[0], this.scl_range[1]);
  }

  // Verificar sobreposições entre máscaras
  // overlaps(other) {
  //   return abs(this.x - other.x) < (this.w + other.w) / 2 && abs(this.y - other.y) < (this.h + other.h) / 2;
  // }
  overlaps(other) {
    return abs(this.x - other.x) < (this.w + other.w) / 2;
  }

  // ---------------------------------------------------------------------------

  // Original
  render_mask(pg, repeat) {
    if (repeat) {
      // Máscara ao longo da curva bezier
      pg.push();
      pg.translate(-this.w / 2, -this.h / 2);
      let scaled = createVector(this.mask_centroid.x * this.w, this.mask_centroid.y * this.h);
      let line = this.curves[0][0];
      this.shape_along_line(pg, this.mask, scaled, color(0, 0, 100, 255), line, line.steps, false, false, false, true);
      pg.pop();
    } else {
      pg.image(this.mask, 0, 0, this.w, this.h);
    }
  }

  // Inversa
  render_inverse(pg, repeat) {
    if (this.inverted_mask_copy) {
      pg.push();
      pg.blendMode(MULTIPLY);

      if (repeat) {
        // Máscara ao longo da curva bezier
        pg.push();
        pg.translate(-this.w / 2, -this.h / 2);
        let scaled = createVector(this.inverted_mask_centroid.x * this.w, this.inverted_mask_centroid.y * this.h);
        let line = this.curves[1][0];
        this.shape_along_line(pg, this.inverted_mask_copy, scaled, this.pick_color(), line, line.steps, true, true, true, true);
        pg.pop();
      } else {
        pg.push();
        pg.tint(this.pick_color());
        pg.image(this.inverted_mask_copy, this.inverse_offsetX, this.inverse_offsetY, this.w, this.h);
        // pg.image(this.inverted_mask_copy, 0, 0, this.w, this.h);
        pg.pop();
      }

      pg.pop();
    }
  }

  // Contidas
  render_contained(pg, repeat) {
    pg.push();
    pg.blendMode(MULTIPLY);

    for (let i = 0; i < this.contained_masks.length; i++) {
      if (this.contained_mask_copies[i]) {
        if (repeat) {
          // Máscara ao longo da curva bezier
          pg.push();
          pg.translate(-this.w / 2, -this.h / 2);
          let scaled = createVector(this.contained_mask_centroids[i].x * this.w, this.contained_mask_centroids[i].y * this.h);
          let line = this.curves[2][i];
          this.shape_along_line(pg, this.contained_mask_copies[i], scaled, this.pick_color(), line, line.steps, true, true, true, true);
          pg.pop();
        } else {
          pg.push();
          pg.tint(this.pick_color());
          pg.image(this.contained_mask_copies[i], 0, 0, this.w, this.h);
          pg.pop();
        }
      }
    }
    pg.pop();
  }

  // ---------------------------------------------------------------------------

  // SHAPES
  init_shapes() {
    // Original
    this.mask_centroid = this.get_shape_centroid(this.mask);

    // Inversa
    if (this.inverted_mask) {
      this.inverted_mask_copy = this.mask_to_shape(this.inverted_mask);
      this.inverted_mask_centroid = this.get_shape_centroid(this.inverted_mask_copy);
    }

    // Contidas
    if (this.contained_masks && this.contained_masks.length > 0) {
      this.contained_mask_centroids = [];
      this.contained_mask_copies = [];
      for (let i = 0; i < this.contained_masks.length; i++) {
        this.contained_mask_copies[i] = this.mask_to_shape(this.contained_masks[i]);
        this.contained_mask_centroids[i] = this.get_shape_centroid(this.contained_masks[i]);
      }
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
    // let color_palette = ["#00FFFF", "#FF00FF", "#FFFF00"];
    let color_palette = ["#F299B9", "#027333", "#F2AB27", "#F2220F"];
    return random(color_palette);
  }

  // ---------------------------------------------------------------------------

  // BEZIER
  init_curves() {
    this.curves[0][0] = this.bezier_line(this.mask_centroid, 20, 0, true, 1, 10);
    this.curves[1][0] = this.bezier_line(this.inverted_mask_centroid, 200, 0, true, 1, 10);

    for (let i = 0; i < this.contained_masks.length; i++) {
      this.curves[2][i] = this.bezier_line(this.contained_mask_centroids[i], 200, 20, false, 1, 20);
    }
  }

  bezier_line(start_point, end_point_offset, control_offset, straight, min_steps, max_steps) {
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

    let steps = round(random(min_steps, max_steps));

    return { x1, y1, x2, y2, x3, y3, x4, y4, steps };
  }

  shape_along_line(pg, img, centroid, mask_color, line, steps, angle_variation, scale_variation, color_variation, alpha_variation) {
    let inc = 1 / steps;
    // for (let t = 0; t <= 1; t += inc) {
    for (let t = 1; t >= 0; t -= inc) {
      // Cálculo de coordenadas ao longo da curva bezier
      let x = bezierPoint(line.x1 + centroid.x, line.x2 + centroid.x, line.x3 + centroid.x, line.x4 + centroid.x, t);
      let y = bezierPoint(line.y1 + centroid.y, line.y2 + centroid.y, line.y3 + centroid.y, line.y4 + centroid.y, t);

      // Cálculo do ângulo para uma dada posição
      let tangent_x = bezierTangent(line.x1 + centroid.x, line.x2 + centroid.x, line.x3 + centroid.x, line.x4 + centroid.x, t);
      let tangent_y = bezierTangent(line.y1 + centroid.y, line.y2 + centroid.y, line.y3 + centroid.y, line.y4 + centroid.y, t);
      let ang;
      if (angle_variation) {
        ang = atan2(tangent_y, tangent_x) * t;
      } else {
        ang = 0;
      }

      let scl;
      if (scale_variation) {
        // Escala em função do incremento
        scl = map(t, 0, 1, 1, 0.5);
      } else {
        scl = 1;
      }
      let scaled_w = this.w * scl;
      let scaled_h = this.h * scl;

      let alpha_value;
      if (alpha_variation) {
        alpha_value = map(t, 0, 1, alpha(mask_color), 0);
      } else {
        alpha_value = alpha(mask_color);
      }

      let c;
      if (color_variation) {
        // Cor (tints)
        c = color(hue(mask_color), map(t, 0, 1, saturation(mask_color), 0), map(t, 0, 1, brightness(mask_color), 100), alpha_value);
      } else {
        c = color(hue(mask_color), saturation(mask_color), brightness(mask_color), alpha_value);
      }

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
