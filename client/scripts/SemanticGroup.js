class SemanticGroup {
  constructor(semantic_group) {
    randomSeed(seed);

    this.semantic_group = semantic_group;
    this.x = -10;
    this.y = -10;
    this.w = 10;
    this.h = 10;
    this.ang = 0;

    this.masks = [];
    this.mask_inc = 0;
  }

  run(pg) {
    this.update(pg);
    this.render(pg);
  }

  render(pg) {
    pg.push();
    pg.translate(this.x, this.y);
    pg.rotate(this.ang);

    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].run(pg);
    }

    // DEBUG
    if (debug) {
      pg.push();
      pg.translate(0, 0, 3);
      pg.noFill();
      pg.stroke(debug_color);
      pg.strokeWeight(1);
      pg.rect(0, 0, this.w, this.h);
      pg.pop();
    }

    pg.pop();
  }

  update(pg) {
    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].ratio = this.masks[i].mask.width / this.masks[i].mask.height;
      this.masks[i].w = (this.w / this.masks.length) * this.masks[i].scl_noise;

      if (this.masks[i].w / this.masks[i].ratio > this.h) {
        this.masks[i].h = this.h;
        this.masks[i].w = this.h * this.masks[i].ratio;
        this.masks[i].y = 0;
      } else {
        this.masks[i].h = this.masks[i].w / this.masks[i].ratio;
      }
    }
  }

  recompose() {
    // Calcular o incremento de acordo com "h" do grupo
    this.mask_inc = this.h / this.masks.length;

    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].recompose();
      this.reposition_masks(i);
    }
    shuffle(this.masks, true);
  }

  reposition_masks(index) {
    // Caso o grupo contenha mais que uma máscara
    if (this.masks.length > 1) {
      const max_tries = 10;
      let tries = 0;
      let overlap = true;

      // Verificar se a máscara é colocada numa posição válida de forma recursiva
      while (overlap && tries < max_tries) {
        // Distribuição horizontal aleatória na largura do grupo
        // Distribuição vertical incremental
        this.masks[index].x = random(-this.w / 2, this.w / 2);
        this.masks[index].y = -this.h / 2 + index * this.mask_inc;
        overlap = false;

        for (let previous_index = 0; previous_index < index; previous_index++) {
          if (this.masks[index].overlaps(this.masks[previous_index])) {
            overlap = true;
            break;
          }
        }
        tries++;
      }
    } else {
      // Posicionamento central
      this.masks[index].x = 0;
      this.masks[index].y = 0;
    }
  }
}
