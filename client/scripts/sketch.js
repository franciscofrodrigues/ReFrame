// UI
let cnv_parent, css_styles;
let bg_color, comp_bg_color, comp_shadow_color, fg_color, accent_color;

// API
let port_api, endpoint_api, folder_name;
let result_json;

// Composition
let comp_graphics, comp_graphics_ratio, comp_graphics_w, comp_graphics_h;
let masks, masks_pool, semantic_groups, composition;
let masks_pool_visible;

function setup() {
  cnv_parent = select("#canvas");
  let cnv = createCanvas(cnv_parent.width, cnv_parent.height);
  cnv.parent("#canvas");

  // Propriedades Sketch
  colorMode(HSB, 360, 100, 100, 255);
  imageMode(CENTER);
  rectMode(CENTER);

  // Cores
  css_styles = window.getComputedStyle(document.body);
  bg_color = css_styles.getPropertyValue("--bg-color");
  comp_bg_color = css_styles.getPropertyValue("--cnv-color");
  comp_shadow_color = css_styles.getPropertyValue("--cnv-shadow");
  fg_color = color(0, 0, 0);
  accent_color = color(30, 100, 100);

  // API
  port_api = "8000";
  endpoint_api = `http://localhost:${port_api}`;
  folder_name = "25-05-30_15-25-54-936976";

  // Inicializar "masks" e "semantic_groups"
  masks = [];
  semantic_groups = [];

  // Composition
  comp_graphics_ratio = 3 / 4;
  comp_graphics_h = height * 0.8;
  comp_graphics_w = comp_graphics_h * comp_graphics_ratio;

  comp_graphics = createGraphics(comp_graphics_w, comp_graphics_h);
  comp_graphics.colorMode(HSB, 360, 100, 100, 255);
  comp_graphics.imageMode(CENTER);
  comp_graphics.rectMode(CENTER);

  composition = new Composition(comp_graphics, 0, 0, comp_graphics_w, comp_graphics_h, 1);
  composition.semantic_groups = semantic_groups;

  // Mask Pool
  masks_pool = new MasksPool(masks, 0, 0, width, height, 5, 5);
  masks_pool_visible = false;

  // Botões
  let composition_btn = select("#composition_btn");
  composition_btn.mousePressed(() => {
    composition.recompose();
  });

  let masks_btn = select("#masks_btn");
  masks_btn.mousePressed(() => {
    get_masks();
    group_masks(masks, semantic_groups);
  });
}

function draw() {
  background(bg_color);

  if (masks_pool_visible) {
    masks_pool.run();
  } else {
    comp_graphics.background(comp_bg_color);
    composition.run();
    addGrain(comp_graphics, 10);

    // Drop Shadow
    push();
    drawingContext.shadowOffsetX = 10;
    drawingContext.shadowOffsetY = 10;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = comp_shadow_color;
    noStroke();
    rect(width / 2, height / 2, comp_graphics.width, comp_graphics.height);
    pop();

    image(comp_graphics, width / 2, height / 2);
  }
}

function keyPressed() {
  if (key === "s") {
    save(comp_graphics, "canvas.png");
  }

  if (key === "p") {
    masks_pool_visible = !masks_pool_visible;
  }
}

// https://editor.p5js.org/ogt/sketches/sk1qsRr_n
function addGrain(pg, num) {
  pg.loadPixels();
  for (let i = 0; i < pg.width * pixelDensity() * (pg.height * pixelDensity()) * 4; i += 4) {
    let noise = map(random(), 0, 1, -num, num);
    pg.pixels[i] = pg.pixels[i] + noise;
    pg.pixels[i + 1] = pg.pixels[i + 1] + noise;
    pg.pixels[i + 2] = pg.pixels[i + 2] + noise;
    pg.pixels[i + 3] = pg.pixels[i + 3] + noise;
  }
  pg.updatePixels();
}

function group_masks(masks, semantic_groups) {
  for (let mask of masks) {
    let found = false;

    for (let group of semantic_groups) {
      if (group.semantic_group == mask.semantic_group) {
        group.masks.push(mask);
        found = true;
        break;
      }
    }
    if (!found) {
      let semantic_group = new SemanticGroup(mask.semantic_group);
      semantic_group.masks.push(mask);
      semantic_groups.push(semantic_group);
    }
  }
}
