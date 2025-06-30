// UI
let cnv, cnv_parent, css_styles;
let bg_color, comp_bg_color, comp_shadow_color, accent_color, complementary_color;

// API
let port_api, endpoint_api, folder_name;
let result_json;

// Composition
let comp_graphics, comp_graphics_ratio, comp_graphics_w, comp_graphics_h;
let masks, masks_pool, semantic_groups, composition;

let masks_pool_visible, debug;

function setup() {
  cnv = createCanvas(100, 100);
  cnv.parent("#canvas");
  randomSeed(millis());

  // API
  port_api = "8000";
  endpoint_api = `http://localhost:${port_api}`;

  // Inicializar "masks" e "semantic_groups"
  masks = [];
  semantic_groups = [];

  // Default
  apply_changes();
  update_imports_list();

  // Propriedades Composition
  comp_graphics.colorMode(HSB, 360, 100, 100, 255);
  comp_graphics.imageMode(CENTER);
  comp_graphics.rectMode(CENTER);  

  // Propriedades Sketch
  colorMode(HSB, 360, 100, 100, 255);
  imageMode(CENTER);
  rectMode(CENTER);

  // Cores
  css_styles = window.getComputedStyle(document.body);
  bg_color = css_styles.getPropertyValue("--bg-color");
  comp_bg_color = css_styles.getPropertyValue("--cnv-color");
  comp_shadow_color = css_styles.getPropertyValue("--cnv-shadow");

  // Botões
  let apply_changes_btn = select("#apply_changes_btn");
  apply_changes_btn.mousePressed(() => {
    apply_changes();
    composition.recompose();
  });

  let export_btn = select("#export_btn");
  export_btn.mousePressed(() => {
    save_output();
  });

  // Ajustar ao ecrã
  resize_canvas();

  // Mask Pool
  masks_pool = new MasksPool(masks, 0, 0, width, height, 5, 5);
  masks_pool_visible = false;

  debug = false;
}

function draw() {
  background(bg_color);
  // randomSeed(2);

  if (masks_pool_visible) {
    masks_pool.run();
  } else {
    comp_graphics.background(comp_bg_color);
    composition.run();

    // Drop Shadow
    push();
    drawingContext.shadowOffsetX = 10;
    drawingContext.shadowOffsetY = 10;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = comp_shadow_color;
    noStroke();
    rect(width / 2, height / 2, comp_graphics.width, comp_graphics.height);
    pop();

    image(comp_graphics, width / 2, height / 2, comp_graphics_w, comp_graphics_h);
  }
}

function keyPressed() {
  if (key === "b" || key === "B") {
    batch_export();
  }

  if (key === "p" || key === "P") {
    masks_pool_visible = !masks_pool_visible;
    masks_pool = new MasksPool(masks, 0, 0, width, height, 5, 5);
  }

  if (key === "d" || key === "D") {
    debug = !debug;
  }
}

function windowResized() {
  resize_canvas();
}

function resize_canvas() {
  cnv_parent = document.querySelector("#canvas");
  resizeCanvas(cnv_parent.offsetWidth, cnv_parent.offsetHeight);

  // Composition
  comp_graphics_h = height * 0.8;
  comp_graphics_w = comp_graphics_h * comp_graphics_ratio;
}

// Agrupar máscaras por grupos semânticos
function group_masks(masks, semantic_groups) {
  semantic_groups.length = 0;
  for (let mask of masks) {
    let found = false;

    for (let group of semantic_groups) {
      if (group.semantic_group === mask.semantic_group) {
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

function apply_changes() {
  const ratio_slider = select("#canvas_ratio");
  const ratio_values = {
    0: 1 / 1,
    25: 3 / 4,
    50: 4 / 3,
    75: 4 / 5,
    100: 9 / 16,
  };

  const grid_type = select('input[name="distribution"]:checked');

  const accent_color_picker = select('input[name="accent_color"]');
  const complementary_color_picker = select('input[name="complementary_color"]');
  accent_color = color(accent_color_picker.value());
  complementary_color = color(complementary_color_picker.value());

  // Composition
  comp_graphics_ratio = ratio_values[ratio_slider.value()];
  comp_graphics_h = height * 0.8;
  comp_graphics_w = comp_graphics_h * comp_graphics_ratio;

  comp_graphics = createGraphics(comp_graphics_w, comp_graphics_h);
  comp_graphics.drawingContext = comp_graphics.elt.getContext("2d", { willReadFrequently: true });
  comp_graphics.colorMode(HSB, 360, 100, 100, 255);
  comp_graphics.imageMode(CENTER);
  comp_graphics.rectMode(CENTER);

  composition = new Composition(comp_graphics, comp_graphics_w, comp_graphics_h, grid_type.value());
  composition.semantic_groups = semantic_groups;
}

async function save_output(additional = "") {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let millis = date.getMilliseconds();

  let filename = null;
  if (additional === "") {
    filename = `${year}${month}${day}_${hour}${minutes}${seconds}${millis}`;
  } else {
    filename = `${year}${month}${day}_${hour}${minutes}${seconds}${millis}_${additional}`;
  }

  let grain_output = createGraphics(comp_graphics.width, comp_graphics.height);
  grain_output.copy(comp_graphics, 0, 0, comp_graphics.width, comp_graphics.height, 0, 0, grain_output.width, grain_output.height);
  add_grain(grain_output, 5);
  save(grain_output, `${filename}.png`);
}

// https://editor.p5js.org/ogt/sketches/sk1qsRr_n
function add_grain(pg, num) {
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
