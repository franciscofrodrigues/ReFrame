class PreviewChanges {
  constructor(x, y, w, h, ratio_values, comp, comp_w, comp_h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.comp = comp;
    this.comp_w = comp_w;
    this.comp_h = comp_h;
    this.ratio_comp_w = 0;
    this.ratio_comp_h = 0;

    this.pg = createGraphics(this.w, this.h);
    this.pg.colorMode(HSB, 360, 100, 100, 255);
    this.pg.imageMode(CENTER);
    this.pg.rectMode(CENTER);
    this.pg.ellipseMode(CENTER);
    this.pg.textFont(font);
    this.pg.textSize(12);

    this.ratio_slider = select("#canvas_ratio");
    this.ratio_values = ratio_values;
    this.ratio_preview = false;

    this.grid_inputs = selectAll('input[name="distribution"]');
    this.grid_type = 0;
    this.grid_preview = false;

    this.group_width_input = select('input[name="group_width"]');
    this.group_height_input = select('input[name="group_height"]');
    this.group_w_factor = this.group_width_input.value();
    this.group_h_factor = this.group_height_input.value();
    this.group_size_preview = false;

    this.preview = false;
    this.preview_timer = 0;
    this.preview_duration = 3000;
    this.ratio_preview_duration = 1000;
    this.num_preview_points = 500;

    this.center_ellipse_w = random(this.comp_w * 0.4, this.comp_w * 0.8);
    this.center_ellipse_h = random(this.comp_h * 0.4, this.comp_h * 0.8);
    this.target_ellipse_w = this.center_ellipse_w;
    this.target_ellipse_h = this.center_ellipse_h;
    this.random_point = this.comp.calc_random_point(this.comp_w, this.comp_h);

    this.framecount_change = 60;
    this.amplitude = 10;
    this.phase = 0.05;

    this.change_listener();
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    if (this.preview) {
      this.pg.clear();

      this.pg.push();
      this.pg.translate(this.w / 2, this.h / 2);

      let overlay_color = color(hue(bg_color), saturation(bg_color), brightness(bg_color), overlay_alpha);
      this.pg.fill(overlay_color);
      this.pg.noStroke();
      this.pg.rect(0, 0, width, height);

      if (this.ratio_preview) this.ratio_animation();

      if (this.grid_preview) {
        if (this.grid_type == 0) this.thirds_grid_preview();
        if (this.grid_type == 1) this.center_grid_preview();
        if (this.grid_type == 2) this.random_point_grid_preview();
      }

      if (this.group_size_preview) this.group_size_animation();

      this.pg.pop();

      image(this.pg, this.w / 2, this.h / 2, this.w, this.h);
    }
  }

  update() {
    if (this.preview) {
      if (this.grid_preview && millis() - this.preview_timer > this.preview_duration) {
        this.grid_preview = false;
        this.preview = false;
      }

      if (this.ratio_preview && millis() - this.preview_timer > this.ratio_preview_duration) {
        this.ratio_preview = false;
        this.preview = false;
      }

      if (this.group_size_preview && millis() - this.preview_timer > this.ratio_preview_duration) {
        this.group_size_preview = false;
        this.preview = false;
      }
    }
  }

  // ---------------------------------------------------------------------------

  thirds_grid_preview() {
    this.pg.push();
    this.pg.translate(-this.comp_w / 2, -this.comp_h / 2);

    let mean_width_1 = this.comp_w / 3;
    let mean_width_2 = 2 * (this.comp_w / 3);
    let mean_height_1 = this.comp_h / 3;
    let mean_height_2 = 2 * (this.comp_h / 3);

    this.pg.noFill();
    this.pg.stroke(debug_color);
    this.pg.strokeWeight(1);
    this.pg.line(mean_width_1, 0, mean_width_1, this.comp_h);
    this.pg.line(mean_width_2, 0, mean_width_2, this.comp_h);
    this.pg.line(0, mean_height_1, this.comp_w, mean_height_1);
    this.pg.line(0, mean_height_2, this.comp_w, mean_height_2);

    this.render_prob_points(0, this.phase, this.amplitude);
    this.pg.pop();
  }

  center_grid_preview() {
    if (frameCount % this.framecount_change === 0) {
      randomSeed(Date.now());
      this.target_ellipse_w = random(this.comp_w * 0.4, this.comp_w * 0.8);
      this.target_ellipse_h = random(this.comp_h * 0.4, this.comp_h * 0.8);
      randomSeed(seed);
    }

    this.center_ellipse_w = lerp(this.center_ellipse_w, this.target_ellipse_w, 0.1);
    this.center_ellipse_h = lerp(this.center_ellipse_h, this.target_ellipse_h, 0.1);

    this.pg.push();
    this.pg.translate(-this.comp_w / 2, -this.comp_h / 2);

    this.pg.noFill();
    this.pg.stroke(debug_color);
    this.pg.strokeWeight(1);
    this.pg.ellipse(this.comp_w / 2, this.comp_h / 2, this.center_ellipse_w, this.center_ellipse_h);

    this.render_prob_points(1, this.phase, this.amplitude);
    this.pg.pop();
  }

  random_point_grid_preview() {
    if (frameCount % this.framecount_change === 0) {
      randomSeed(Date.now());
      this.target_random_point = this.comp.calc_random_point(this.comp_w, this.comp_h);
      randomSeed(seed);
    }

    this.random_point.lerp(this.target_random_point, 0.1);

    this.pg.push();
    this.pg.translate(-this.comp_w / 2, -this.comp_h / 2);

    let corners = [createVector(0, 0), createVector(0, this.comp_h), createVector(this.comp_w, this.comp_h), createVector(this.comp_w, 0)];

    this.pg.noFill();
    this.pg.stroke(debug_color);
    this.pg.strokeWeight(1);
    this.pg.line(corners[0].x, corners[0].y, this.random_point.x, this.random_point.y);
    this.pg.line(corners[1].x, corners[1].y, this.random_point.x, this.random_point.y);
    this.pg.line(corners[2].x, corners[2].y, this.random_point.x, this.random_point.y);
    this.pg.line(corners[3].x, corners[3].y, this.random_point.x, this.random_point.y);

    this.render_prob_points(2, this.phase, this.amplitude);
    this.pg.pop();
  }

  // ---------------------------------------------------------------------------

  render_prob_points(grid_type, phase, amplitude) {
    this.ang = millis() * 0.001;

    for (let i = 0; i < this.num_preview_points; i++) {
      let pos;
      if (grid_type === 0) pos = this.comp.thirds_grid(this.comp_w, this.comp_h);
      if (grid_type === 1) pos = this.center_grid(i, this.comp_w, this.comp_h);
      if (grid_type === 2) pos = this.comp.random_point_grid(i, this.comp_w, this.comp_h, this.random_point);
      pos.x += sin(this.ang + i * phase) * amplitude;
      pos.y += cos(this.ang + i * phase) * amplitude;

      this.pg.noStroke();
      this.pg.fill(debug_color);
      this.pg.circle(pos.x, pos.y, 2);
    }
  }

  // ---------------------------------------------------------------------------

  ratio_animation() {
    let ratio = this.ratio_values[this.ratio_slider.value()];
    this.ratio_comp_h = this.h * 0.8;
    this.ratio_comp_w = this.ratio_comp_h * ratio;

    this.pg.push();
    this.pg.noStroke();
    this.pg.fill(comp_bg_color);
    this.pg.rect(0, 0, this.ratio_comp_w, this.ratio_comp_h);
    this.pg.pop();
  }

  grid_animation(radio_checked) {
    this.grid_type = radio_checked.value();
  }

  group_size_animation() {
    this.pg.push();
    this.pg.stroke(debug_color);
    this.pg.strokeWeight(1);
    this.pg.noFill();
    this.pg.rect(0, 0, this.comp_w*this.group_width_input.value(), this.comp_h*this.group_height_input.value());
    this.pg.pop();
  }

  disable_animations() {
    this.ratio_preview = false;
    this.grid_preview = false;
    this.group_size_preview = false;
  }

  // ---------------------------------------------------------------------------

  change_listener() {
    this.ratio_slider.input(() => {
      this.disable_animations();
      this.ratio_preview = true;
      this.preview = true;
      this.preview_timer = millis();
    });

    for (let i = 0; i < this.grid_inputs.length; i++) {
      this.grid_inputs[i].changed(() => {
        this.disable_animations();
        this.grid_preview = true;
        this.preview = true;
        this.preview_timer = millis();
        this.grid_animation(this.grid_inputs[i]);
      });
    }

    this.group_width_input.input(() => {
      this.disable_animations();
      this.group_size_preview = true;
      this.preview = true;
      this.preview_timer = millis();
    });
    this.group_height_input.input(() => {
      this.disable_animations();
      this.group_size_preview = true;
      this.preview = true;
      this.preview_timer = millis();
    });
  }

  // ---------------------------------------------------------------------------

  center_grid(index, w, h) {
    let pos = createVector(0, 0);
    let std = w / 50;
    let num_groups = 3;
    let ang = random(TWO_PI);
    let ang_inc = TWO_PI / num_groups;

    if (index <= this.num_preview_points * 0.2) {
      pos.x = randomGaussian() * std + w / 2;
      pos.y = randomGaussian() * std + h / 2;
    } else {
      pos.x = randomGaussian() * std + w / 2 + (cos(ang + index * ang_inc) * this.center_ellipse_w) / 2;
      pos.y = randomGaussian() * std + h / 2 + (sin(ang + index * ang_inc) * this.center_ellipse_h) / 2;
    }

    return pos;
  }
}
