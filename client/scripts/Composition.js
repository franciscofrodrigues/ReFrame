class Composition {
  constructor(pg, w, h, grid_type) {
    randomSeed(seed);
        
    this.pg = pg;
    this.x = 0;
    this.y = 0;
    this.w = w;
    this.h = h;
    this.grid_type = grid_type;

    this.semantic_groups = [];
    this.min_group_w = this.w * 0.2;
    this.max_group_w = this.w * 0.6;
    this.min_group_h = this.h * 0.2;
    this.max_group_h = this.h * 0.6;
    this.group_w = random(this.min_group_w, this.max_group_w);
    this.group_h = random(this.min_group_h, this.max_group_h);

    this.calc_random_point();
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
      this.pg.push();
      this.pg.translate(this.x + this.w / 2, this.y + this.h / 2, 3);

      this.pg.noFill();
      this.pg.stroke(debug_color);
      this.pg.strokeWeight(1);
      this.pg.rect(0, 0, this.w, this.h);
      this.pg.pop();
    }

    this.pg.pop();
  }

  update() {    
  }

  recompose() {
    // Recalcular o posicionamento do "random_point"
    this.calc_random_point();
    shuffle(this.semantic_groups, true);

    for (let i = 0; i < this.semantic_groups.length; i++) {
      this.reposition(i);
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
    this.semantic_groups[index].recompose();
  }

  calc_random_point() {
    // this.random_point = createVector(random(this.w / 2 - this.w / 5, this.w / 2 + this.w / 5), random(this.h / 2 - this.h / 5, this.h / 2 + this.h / 5));
    this.random_point = createVector(random(-this.w / 2, this.w / 2), random(-this.h / 2, this.h / 2));
  }

  // ---------------------------------------------------------------------------

  // GRID
  // Posicionar elementos na grelha
  place_in_grid(index) {
    let pos;
    if (this.grid_type == 0) pos = this.thirds_grid();
    else if (this.grid_type == 1) pos = this.center_grid(index);
    else if (this.grid_type == 2) pos = this.random_point_grid(index);
    return pos;
  }

  thirds_grid() {
    let pos = createVector(0, 0);
    // let std = this.w / 20;
    let std = this.w * 0.01;
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
    return pos;
  }

  center_grid(index) {
    let pos = createVector(0, 0);
    let ang = random(TWO_PI);
    let ang_inc = QUARTER_PI;

    // Elemento Central
    if (index == this.semantic_groups.length - 1) {
      pos.x = this.w / 2;
      pos.y = this.h / 2;
    } else {
      // Elementos ao redor do Elemento Central
      pos.x = this.w / 2 + (cos(ang + index * ang_inc) * this.max_group_w) / 2;
      pos.y = this.h / 2 + (sin(ang + index * ang_inc) * this.max_group_h) / 2;
    }
    return pos;
  }

  random_point_grid(index) {
    let pos = createVector(0, 0, 0);

    // Cantos "Composition"
    let corners = [createVector(0, 0), createVector(0, this.h), createVector(this.w, this.h), createVector(this.w, 0)];
    shuffle(corners, true);

    // Calcular orientação do "SemanticGroup"
    let dir = p5.Vector.sub(this.random_point, corners[index]);
    pos.z = PI / 2 + atan2(dir.y, dir.x);

    // Calcular a posição central entre os "corners" e o "random_point"
    pos.x = (this.random_point.x + corners[index % corners.length].x) / 2;
    pos.y = (this.random_point.y + corners[index % corners.length].y) / 2;
    return pos;
  }
}
