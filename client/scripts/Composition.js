class Composition {
  constructor(pg, w, h, grid_type, user_color, color_variation_type, max_group_w_factor, max_group_h_factor) {
    randomSeed(seed);

    this.pg = pg;
    this.x = 0;
    this.y = 0;
    this.w = w;
    this.h = h;
    this.grid_type = grid_type;

    this.user_color = user_color;
    this.complementary_color = this.get_complementary_color(this.user_color);
    this.color_variation_type = color_variation_type;

    this.semantic_groups = [];

    this.max_group_w_factor = max_group_w_factor;
    this.max_group_h_factor = max_group_h_factor;

    this.min_group_w = this.w * 0.2;
    this.max_group_w = this.w * max_group_w_factor;
    this.min_group_h = this.h * 0.2;
    this.max_group_h = this.h * max_group_h_factor;
    this.group_w = random(this.min_group_w, this.max_group_w);
    this.group_h = random(this.min_group_h, this.max_group_h);

    // this.group_ang = [-PI / 3, -QUARTER_PI, -PI / 6, 0, -PI / 6, QUARTER_PI, PI / 3];
    this.group_ang = [-QUARTER_PI, -PI / 6, 0, -PI / 6, QUARTER_PI];

    this.random_point = this.calc_random_point();
    this.center_ellipse_w = random(this.w * 0.4, this.w * 0.8) / 2;
    this.center_ellipse_h = random(this.h * 0.4, this.h * 0.8) / 2;
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    this.pg.push();
    this.pg.translate(-this.w / 2, -this.h / 2); // WEBGL

    for (let semantic_group of this.semantic_groups) {
      semantic_group.run(this.pg);
    }

    // DEBUG
    if (debug) {
      // this.pg.push();
      // this.pg.translate(this.x + this.w / 2, this.y + this.h / 2, 3);

      // this.pg.noFill();
      // this.pg.stroke(debug_color);
      // this.pg.strokeWeight(1);
      // this.pg.rect(0, 0, this.w, this.h);
      // this.pg.pop();

      if (this.grid_type == 2) {
        this.pg.noStroke();
        this.pg.fill(debug_color);
        this.pg.circle(this.random_point.x, this.random_point.y, 5);
      }
    }

    this.pg.pop();
  }

  update() {}

  recompose() {
    // Recalcular o posicionamento do "random_point"
    this.random_point = this.calc_random_point();
    shuffle(this.semantic_groups, true);

    this.center_ellipse_w = random(this.w * 0.4, this.w * 0.8) / 2;
    this.center_ellipse_h = random(this.h * 0.4, this.h * 0.8) / 2;

    this.main_palette = this.get_main_palette(this.user_color, this.complementary_color);

    for (let i = 0; i < this.semantic_groups.length; i++) {
      this.reposition(i);
      this.semantic_groups[i].color = this.main_palette[i];
      this.semantic_groups[i].color_variation_type = this.color_variation_type;
      this.semantic_groups[i].recompose();
    }
  }

  reposition(index) {
    let pos = this.place_in_grid(index);

    // Atualizar Posição, Tamanho e Ângulo
    this.semantic_groups[index].x = constrain(pos.x, 0, this.w);
    this.semantic_groups[index].y = constrain(pos.y, 0, this.h);
    this.semantic_groups[index].w = this.group_w;
    this.semantic_groups[index].h = this.group_h;
    this.semantic_groups[index].ang = pos.z;
  }

  calc_random_point() {
    // this.random_point = createVector(random(this.w / 2 - this.w / 5, this.w / 2 + this.w / 5), random(this.h / 2 - this.h / 5, this.h / 2 + this.h / 5));
    let padding = this.w * 0.2;
    return createVector(random(padding, this.w - padding), random(padding, this.h - padding));
  }

  // ---------------------------------------------------------------------------

  get_complementary_color(c) {
    let complementary_hue = (hue(c) + 180) % 360;
    let complementary = color(complementary_hue, saturation(c), brightness(c));
    return complementary;
  }

  get_main_palette(c1, c2) {
    let num_steps = this.semantic_groups.length;
    let hue_step = 30;

    let main_palette = [];
    main_palette.push(c1, c2);

    let step_dir = false;
    for (let i = 2; i < num_steps; i++) {
      let step;
      if (step_dir) {
        step = -hue_step * (i + 1);
      } else {
        step = hue_step * (i + 1);
      }

      let step_color;
      if (i % 2 == 0) {
        step_color = color((hue(c1) + step + 360) % 360, saturation(c1), brightness(c1));
      } else {
        step_color = color((hue(c2) + step + 360) % 360, saturation(c2), brightness(c2));
      }

      step_dir = !step_dir;
      main_palette.push(step_color);
    }
    return main_palette;
  }

  pick_group_color() {
    let main_palette = get_main_palette(this.user_color, this.complementary_color);
    return random(main_palette);
  }

  // ---------------------------------------------------------------------------

  // GRID
  // Posicionar elementos na grelha
  place_in_grid(index) {
    let pos;
    if (this.grid_type == 0) pos = this.thirds_grid();
    else if (this.grid_type == 1) pos = this.center_grid(index);
    else if (this.grid_type == 2) pos = this.random_point_grid(index, this.random_point);
    return pos;
  }

  thirds_grid() {
    let pos = createVector(0, 0);
    let std = this.w / 20;
    let mean_width_1 = this.w / 3;
    let mean_width_2 = 2 * (this.w / 3);
    let mean_height_1 = this.h / 3;
    let mean_height_2 = 2 * (this.h / 3);

    // Distribuição Horizontal
    if (random() < 0.5) {
      pos.x = randomGaussian() * std + mean_width_1;
    } else {
      pos.x = randomGaussian() * std + mean_width_2;
    }

    // Distribuição Vertical
    if (random() < 0.5) {
      pos.y = randomGaussian() * std + mean_height_1;
    } else {
      pos.y = randomGaussian() * std + mean_height_2;
    }

    pos.z = random(this.group_ang);

    return pos;
  }

  center_grid(index) {
    let pos = createVector(0, 0);
    let ang = random(TWO_PI);
    let ang_inc = TWO_PI / this.semantic_groups.length;
    let std = this.w / 20;

    // Elemento Central
    if (index == 0) {
      pos.x = randomGaussian() * std + this.w / 2;
      pos.y = randomGaussian() * std + this.h / 2;
    } else {
      // Elementos ao redor do Elemento Central
      pos.x = randomGaussian() * std + this.w / 2 + cos(ang + index * ang_inc) * this.center_ellipse_w;
      pos.y = randomGaussian() * std + this.h / 2 + sin(ang + index * ang_inc) * this.center_ellipse_h;
      // pos.x = randomGaussian() * std + this.w / 2 + cos(ang + index * ang_inc) * this.semantic_groups[0].w;
      // pos.y = randomGaussian() * std + this.h / 2 + sin(ang + index * ang_inc) * this.semantic_groups[0].h;
    }

    pos.z = random(this.group_ang);

    return pos;
  }

  random_point_grid(index, random_point) {
    let pos = createVector(0, 0, 0);
    let std = this.w / 20;

    // Cantos "Composition"
    let corners = [createVector(0, 0), createVector(0, this.h), createVector(this.w, this.h), createVector(this.w, 0)];
    shuffle(corners, true);

    // Calcular orientação do "SemanticGroup"
    let dir = p5.Vector.sub(random_point, corners[index]);
    pos.z = PI / 2 + atan2(dir.y, dir.x);

    // Calcular a posição central entre os "corners" e o "random_point"
    // pos.x = (random_point.x + corners[index % corners.length].x) / 2;
    // pos.y = (random_point.y + corners[index % corners.length].y) / 2;
    pos.x = (randomGaussian() * std + random_point.x + corners[index % corners.length].x) / 2;
    pos.y = (randomGaussian() * std + random_point.y + corners[index % corners.length].y) / 2;
    return pos;
  }
}
