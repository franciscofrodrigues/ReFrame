const batch_accent_colors = ["#29E7CD", "#FEEA00", "#FF5A5F"];
const batch_complementary_colors = ["#FFFFFF", "#FFFFFF", "#FFFFFFF"];
const batch_ratios = [1, 0.75, 1.3333333333, 0.8, 0.5625, 1.7777777778];
const grid_types = [0, 1, 2];

const settings = {
  accent_color: batch_accent_colors,
  complementary_color: batch_complementary_colors,
  ratio: batch_ratios,
  grid: grid_types,
};

const imports = sessionStorage.getItem("imports");
const data = JSON.parse(imports);

async function batch_export() {
  for (let i = 0; i < data.length; i++) {
    // Obter Máscaras
    await get_masks(data[i].folder_name);

    for (let j = 0; j < settings.ratio.length; j++) {
      for (let k = 0; k < settings.accent_color.length; k++) {
        for (let l = 0; l < settings.grid.length; l++) {          
            // Propriedades Composition
            comp_graphics_h = height * 0.8;
            comp_graphics_w = comp_graphics_h * settings.ratio[j];

            comp_graphics = createGraphics(comp_graphics_w, comp_graphics_h);
            comp_graphics.colorMode(HSB, 360, 100, 100, 255);
            comp_graphics.imageMode(CENTER);
            comp_graphics.rectMode(CENTER);

            // Composition
            composition = new Composition(comp_graphics, comp_graphics_w, comp_graphics_h, settings.grid[l]);
            composition.semantic_groups = semantic_groups;

            accent_color = settings.accent_color[k];
            complementary_color = settings.complementary_color[k];

            composition.recompose();
            comp_graphics.background(comp_bg_color);
            composition.run();

            // Guardar outputs
            await save_output(`[${j}_${k}_${l}]`);
            await new Promise(r => setTimeout(r, 100));
        }
      }
    }
  }
}
