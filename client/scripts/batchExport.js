// const batch_accent_colors = ["#29E7CD", "#FEEA00", "#FF5A5F"];
// const batch_complementary_colors = ["#FFFFFF", "#FFFFFF", "#FFFFFFF"];
// const batch_ratios = [1, 0.75, 1.3333333333, 0.8, 0.5625, 1.7777777778];
// const grid_types = [0, 1, 2];

const batch_colors = ["#29E7CD"];
const batch_ratios = [0.75];
const grid_types = [0,1,2];

const settings = {
  runs: 5,
  color: batch_colors,
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
      for (let k = 0; k < settings.color.length; k++) {
        for (let l = 0; l < settings.grid.length; l++) {
          for (let h = 0; h < settings.runs; h++) {
            seed = Date.now();
            randomSeed(seed);

            // Propriedades Composition
            comp_graphics_h = height * 0.8;
            comp_graphics_w = comp_graphics_h * settings.ratio[j];

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
            comp_graphics.colorMode(HSB, 360, 100, 100, 255);
            comp_graphics.imageMode(CENTER);
            comp_graphics.rectMode(CENTER);
            comp_graphics.textFont(font);
            comp_graphics.textSize(12);

            user_color = settings.color[k];

            // Composition
            composition = new Composition(comp_graphics, comp_graphics_w, comp_graphics_h, settings.grid[l], user_color, 1, 1);
            composition.semantic_groups = semantic_groups;

            composition.recompose();
            comp_graphics.background(comp_bg_color);
            composition.run();

            // Guardar outputs
            // await save_output(`[${j}_${k}_${l}]`);

            // Preview de 1s
            await new Promise((r) => setTimeout(r, 500));
            // await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }
    }
  }
  apply_changes();
}
