class Composition {
  constructor(pg, x, y, w, h, grid_type) {
    this.pg = pg;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.grid_type = grid_type;

    this.semantic_groups = [];
    // this.min_group_w = this.w / 4;
    // this.max_group_w = this.w / 2;
    // this.min_group_h = this.h / 4;
    // this.max_group_h = this.h / 2;

    this.min_group_w = this.w*0.5;
    this.max_group_w = this.w*1.2;
    this.min_group_h = this.h*0.5;
    this.max_group_h = this.h*1.2;

    this.calc_random_point();
  }

  run() {
    this.update();
    this.render();
  }

  render() {
    // pg.push();
    // pg.translate(this.x + this.w / 2, this.y + this.h / 2);

    // pg.noFill();
    // pg.stroke(accent_color);
    // pg.strokeWeight(1);
    // pg.rect(0, 0, this.w, this.h);
    // pg.pop();

    for (let semantic_group of this.semantic_groups) {
      semantic_group.run(this.pg);
    }
  }

  update() {}

  calc_random_point() {    
    this.random_point = createVector(random(100, this.w - 100), random(100, this.h - 100));
  }

  recompose() {
    // Recalcular o posicionamento do "random_point"
    this.calc_random_point();

    for (let i = 0; i < this.semantic_groups.length; i++) {
      // Grid Type
      let pos;
      if (this.grid_type == 0) pos = this.thirds_grid();
      else if (this.grid_type == 1) pos = this.center_grid(i);
      else if (this.grid_type == 2) pos = this.random_point_grid(i);

      // Tamanho dos "SemanticGroup"
      let group_w = map(i, 0, this.semantic_groups.length, this.min_group_w, this.max_group_w);
      let group_h = map(i, 0, this.semantic_groups.length, this.min_group_h, this.max_group_h);

      // Atualizar Posição, Tamanho e Ângulo
      this.semantic_groups[i].x = pos.x;
      this.semantic_groups[i].y = pos.y;
      this.semantic_groups[i].w = group_w;
      this.semantic_groups[i].h = group_h;
      this.semantic_groups[i].ang = pos.z;
      this.semantic_groups[i].recompose();
    }
  }

  add_semantic_group(semantic_group) {
    this.semantic_groups.push(semantic_group);
  }

  // ---------------------------------------------------------------------------

  // GRID
  thirds_grid() {
    let pos = createVector(0, 0);
    let std = this.w/10;
    let mean_width_1 = this.w / 3;
    let mean_width_2 = 2 * (this.w / 3);
    let mean_height_1 = this.h / 3;
    let mean_height_2 = 2 * (this.h / 3);

    // Distribuição Horizontal
    if (random(1) < 0.5) {
      pos.x = randomGaussian() * std + mean_width_1;
    } else {
      pos.x = randomGaussian() * std + mean_width_2;
    }

    // Distribuição Vertical
    if (random(1) < 0.5) {
      pos.y = randomGaussian() * std + mean_height_1;
    } else {
      pos.y = randomGaussian() * std + mean_height_2;
    }
    return pos;
  }

  center_grid(index) {
    let pos = createVector(0, 0);
    let ang = random(TWO_PI);
    let ang_inc = 0.01;

    // Elemento Central
    if (index == this.semantic_groups.length - 1) {
      pos.x = this.w / 2;
      pos.y = this.h / 2;
    } else {
      // Elementos ao Redor do Elemento Central
      pos.x = this.w / 2 + (cos(ang + index * ang_inc) * this.max_group_w) / 2;
      pos.y = this.h / 2 + (sin(ang + index * ang_inc) * this.max_group_h) / 2;
    }
    return pos;
  }

  random_point_grid(index) {
    let pos = createVector(0, 0, 0);

    // Cantos "Composition"
    let corners = [createVector(0, 0), createVector(0, this.h), createVector(this.w, this.h), createVector(this.w, 0)];
    corners = shuffle(corners);

    // Calcular orientação do "SemanticGroup"
    let dir = p5.Vector.sub(this.random_point, corners[index]);
    pos.z = PI / 2 + atan2(dir.y, dir.x);

    // let dist = dist(random_point.x, random_point.y, corners[index].x, corners[index].y);

    // Calcular a posição central entre os "corners" e o "random_point"
    pos.x = (this.random_point.x + corners[index].x) / 2;
    pos.y = (this.random_point.y + corners[index].y) / 2;
    return pos;
  }
}
