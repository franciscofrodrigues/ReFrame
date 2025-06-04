// UI
let bg_color, fg_color;

// API
let port_api, endpoint_api, folder_name;
let result_json;

let masks, semantic_groups, composition;

function setup() {
  createCanvas(500, 700);
  frameRate(1);

  colorMode(HSB, 360, 100, 100, 255);
  imageMode(CENTER);
  rectMode(CENTER);

  bg_color = color(0, 0, 100);
  fg_color = color(0, 0, 0);
  accent_color = color(30, 100, 100);

  port_api = "8000";
  endpoint_api = `http://localhost:${port_api}`;
  folder_name = "25-05-30_15-25-54-936976";  

  masks = [];
  semantic_groups = [];

  composition = new Composition(0, 0, width, height, 0);
  composition.semantic_groups = semantic_groups;

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
  composition.run();
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
