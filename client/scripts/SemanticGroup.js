class SemanticGroup {
  constructor(semantic_group) {
    randomSeed(seed);

    this.semantic_group = semantic_group;
    this.x = -10;
    this.y = -10;
    this.w = 10;
    this.h = 10;
    this.ang = 0;
    this.color = color(0,0,100);

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

  update(pg) {}

  recompose() {
    for (let i = 0; i < this.masks.length; i++) {
      this.masks[i].color = this.color;
      this.masks[i].recompose();
      this.scale_masks(i);
      this.reposition_masks(i);
    }
    shuffle(this.masks, true);
  }

  reposition_masks(index) {
    // Calcular o incremento de acordo com altura (h) do grupo
    this.mask_inc = this.h / (this.masks.length - 1);

    // Caso o grupo contenha mais que uma máscara
    if (this.masks.length > 1) {
      const max_tries = 100;
      let tries = 0;
      let overlap = true;

      let mask_min_w = (this.w / this.masks.length) * this.masks[index].scl_range[0];

      // Verificar se a máscara é colocada numa posição válida de forma recursiva
      while (overlap && tries < max_tries) {
        // Distribuição horizontal aleatória na largura do grupo
        this.masks[index].x = random(-this.w / 2 + mask_min_w / 2, this.w / 2 - mask_min_w / 2);

        overlap = false;

        for (let other = 0; other < index; other++) {
          if (this.masks[index].overlaps(this.masks[other])) {
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

  scale_masks(index) {
    this.masks[index].ratio = this.masks[index].mask.width / this.masks[index].mask.height;
    this.masks[index].w = (this.w / this.masks.length) * this.masks[index].scl_noise;

    if (this.masks[index].w / this.masks[index].ratio > this.h) {
      this.masks[index].h = this.h;
      this.masks[index].w = this.h * this.masks[index].ratio;

      // Reposicionar no centro do grupo
      this.masks[index].y = 0;
    } else {
      this.masks[index].h = this.masks[index].w / this.masks[index].ratio;

      // Distribuição vertical incremental
      this.masks[index].y = -this.h / 2 + index * this.mask_inc;
    }
  }
}
