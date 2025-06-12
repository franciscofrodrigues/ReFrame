// UI
let cnv, cnv_parent, css_styles;
let bg_color, comp_bg_color, comp_shadow_color, fg_color, accent_color;

// API
let port_api, endpoint_api, folder_name;
let result_json;

// Composition
let comp_graphics, comp_graphics_ratio, comp_graphics_w, comp_graphics_h;
let masks, masks_pool, semantic_groups, composition;
let masks_pool_visible;

function setup() {
  cnv = createCanvas(100, 100);
  cnv.parent("#canvas");
  resize_canvas();

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
  folder_name = "25-06-10_21-39-29-358597";

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

  composition = new Composition(comp_graphics, 0, 0, comp_graphics_w, comp_graphics_h, 0);
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

  // Input de upload de imagens
  // let upload_input = createFileInput(upload_input_changed, true);
  // upload_input.id("upload_input");
  // upload_input.parent("#upload_input_container");
}

function draw() {
  background(bg_color);

  if (masks_pool_visible) {
    masks_pool.run();
  } else {
    comp_graphics.background(comp_bg_color);
    composition.run();
    // add_grain(comp_graphics, 10);

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
  if (key === "s") {
    let grain_output = createGraphics(comp_graphics.width, comp_graphics.height);
    grain_output.copy(comp_graphics, 0, 0, width, height, 0, 0, grain_output.width, grain_output.height);
    add_grain(grain_output, 10);
    save(grain_output, "canvas.png");
  }

  if (key === "p") {
    masks_pool_visible = !masks_pool_visible;
  }
}

function windowResized() {
  resize_canvas();
}

function resize_canvas() {
  cnv_parent = document.querySelector("#canvas");
  resizeCanvas(cnv_parent.offsetWidth, cnv_parent.offsetHeight);

  // Composition
  comp_graphics_ratio = 3 / 4;
  comp_graphics_h = height * 0.8;
  comp_graphics_w = comp_graphics_h * comp_graphics_ratio;
}

// function upload_input_changed(file) {
//   if (file.type === 'image') {
//     let img = createImg(file.data, '');
//     img.hide();
//     images.push(img);
//   }
// }

// function uploadInputChanged(event) {
//     const files = event.target.files;
//     for (let file of files) {
//         console.log('File uploaded:', file.name);
//         // Handle each file, e.g., send it to your server
//     }
// }

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