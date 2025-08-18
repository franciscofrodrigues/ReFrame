// UI
let cnv, cnv_parent, css_styles, font, mask_selection;
let bg_color, fg_color, comp_shadow_color, user_color, comp_bg_color, debug_color, overlay_alpha;
let zoom, zoom_pos;

// API
let port_api, endpoint_api, folder_name;
let result_json;

// Composition
let comp_graphics, comp_graphics_ratio, comp_graphics_w, comp_graphics_h;
let masks, unselected_masks, masks_pool, semantic_groups, composition, ratio_values;

let seed;
let masks_pool_visible, debug;

// ---------------------------------------------------------------------------

function preload() {
  font = loadFont("assets/fonts/Roboto-Regular.ttf");
}

function setup() {
  cnv = createCanvas(100, 100);
  // cnv = createCanvas(100, 100);
  cnv.drawingContext = cnv.elt.getContext("2d", { willReadFrequently: true });
  cnv.parent("#canvas");

  // API
  // port_api = "8000";
  // endpoint_api = `http://localhost:${port_api}`;
  endpoint_api = `https://loc-mixed-edited-jeremy.trycloudflare.com`;

  // Inicializar "masks", "unselected_masks" e "semantic_groups"
  masks = [];
  unselected_masks = [];
  semantic_groups = [];

  // Default
  apply_changes();
  update_imports_list();

  // Propriedades Sketch
  colorMode(HSB, 360, 100, 100, 255);
  imageMode(CENTER);
  rectMode(CENTER);

  // Cores
  css_styles = window.getComputedStyle(document.body);
  bg_color = css_styles.getPropertyValue("--bg-color");
  fg_color = css_styles.getPropertyValue("--fg-color");
  comp_shadow_color = css_styles.getPropertyValue("--cnv-shadow");
  comp_bg_color = color("#F7F6F5");
  debug_color = color(0, 0, 0, 255);
  overlay_alpha = 150;

  // Botões
  let apply_changes_btn = select("#apply_changes_btn");
  apply_changes_btn.mousePressed(() => {
    apply_changes();    
  });

  let export_btn = select("#export_btn");
  export_btn.mousePressed(() => {
    save_output();
  });

  // Mask Pool
  // masks_pool = new MasksPool(masks, -width / 2, -height / 2, width, height, 5, 5);
  masks_pool = new MasksPool(masks, unselected_masks, 0, 0, width, height, 5, 5);
  masks_pool_visible = false;

  // Preview Changes
  preview_changes = new PreviewChanges(0, 0, width, height, ratio_values, composition);

  // Ajustar ao ecrã
  resize_canvas();

  // Zoom
  zoom = 1;
  zoom_pos = createVector(width / 2, height / 2);

  debug = false;
}

function draw() {
  background(bg_color);
  randomSeed(seed);

  if (mask_selection) {
    masks_pool.run();
  } else {
    translate(zoom_pos.x, zoom_pos.y);
    scale(zoom);
    translate(-zoom_pos.x, -zoom_pos.y);

    comp_graphics.background(comp_bg_color);

    if (!preview_changes.preview) {
      composition.run();
    }

    // Drop Shadow
    push();
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    // drawingContext.shadowOffsetX = 10;
    // drawingContext.shadowOffsetY = 10;
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = comp_shadow_color;
    noStroke();
    fill(bg_color);
    // rect(0, 0, comp_graphics_w, comp_graphics_h);
    rect(width / 2, height / 2, comp_graphics_w, comp_graphics_h);
    pop();

    // image(comp_graphics, 0, 0, comp_graphics_w, comp_graphics_h);
    image(comp_graphics, width / 2, height / 2, comp_graphics_w, comp_graphics_h);

    // Preview Changes
    preview_changes.run();
  }
}

// ---------------------------------------------------------------------------

function keyPressed() {
  if (key === "b" || key === "B") {
    batch_export();
  }

  if (key === "s" || key == "S") {
    save_output();
  }

  if (key === "p" || key === "P") {
    mask_selection = !mask_selection;
    masks_pool = new MasksPool(masks, unselected_masks, 0, 0, width, height, 5, 5);
    group_masks(masks, semantic_groups);
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

  composition.w = comp_graphics_w;
  composition.h = comp_graphics_h;

  // Mask Pool
  masks_pool = new MasksPool(masks, unselected_masks, 0, 0, width, height, 5, 5);

  // Preview Changes
  preview_changes = new PreviewChanges(0, 0, width, height, ratio_values, composition);
}

function mousePressed() {
  masks_pool.pressed();
}

function mouseWheel(event) {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    zoom -= event.delta * 0.001;
    zoom = constrain(zoom, 0.5, 2);
  }
}

// ---------------------------------------------------------------------------

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
  seed = Date.now();

  const ratio_slider = select("#canvas_ratio");
  ratio_values = {
    0: 16 / 9,
    12.5: 3 / 2,
    25: 4 / 3,
    37.5: 5 / 4,
    50: 1 / 1,
    62.5: 3 / 4,
    75: 4 / 5,
    87.5: 2 / 3,
    100: 9 / 16,
  };

  const grid_type = select('input[name="distribution"]:checked').value();

  const user_color_picker = select('input[name="user_color"]');
  user_color = color(user_color_picker.value());

  const max_group_w_factor = select('input[name="group_width"]').value();
  const max_group_h_factor = select('input[name="group_height"]').value();

  // Composition
  comp_graphics_ratio = ratio_values[ratio_slider.value()];
  comp_graphics_h = height * 0.8;
  comp_graphics_w = comp_graphics_h * comp_graphics_ratio;

  if (comp_graphics) {
    comp_graphics.remove();
    comp_graphics = undefined;

    // ----
    // WebGL context loss -- p5.Graphics (davepagurek)
    const prevRemove = p5.Graphics.prototype.remove;
    p5.Graphics.prototype.remove = function () {
      const ext = this.drawingContext.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      prevRemove.call(this);
    };
    // ----
  }

  comp_graphics = createGraphics(comp_graphics_w, comp_graphics_h, WEBGL);
  // comp_graphics = createGraphics(comp_graphics_w, comp_graphics_h);
  // comp_graphics.drawingContext = comp_graphics.elt.getContext("2d", { willReadFrequently: true });
  comp_graphics.colorMode(HSB, 360, 100, 100, 255);
  comp_graphics.imageMode(CENTER);
  comp_graphics.rectMode(CENTER);
  comp_graphics.textFont(font);
  comp_graphics.textSize(12);

  composition = new Composition(comp_graphics, comp_graphics_w, comp_graphics_h, grid_type, user_color, max_group_w_factor, max_group_h_factor);
  composition.semantic_groups = semantic_groups;
  composition.recompose();

  // Preview Changes
  preview_changes = new PreviewChanges(0, 0, width, height, ratio_values, composition);
  preview_changes.preview = false;
}

// ---------------------------------------------------------------------------

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

  let comp_scaled_w = comp_graphics.width * 2;
  let comp_scaled_h = comp_graphics.height * 2;

  let grain_output = createGraphics(comp_scaled_w, comp_scaled_h);
  grain_output.copy(comp_graphics, -comp_graphics.width / 2, -comp_graphics.height / 2, comp_graphics.width, comp_graphics.height, 0, 0, grain_output.width, grain_output.height);
  add_grain(grain_output, 5);
  save(grain_output, `${filename}_seed_${seed}.png`);
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
