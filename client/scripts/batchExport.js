const ratios = [0.75];
const grid_types = [0, 1, 2];
const color_variation_types = [0, 1, 2];

const settings = {
  runs: 5,
  ratio: ratios,
  grid: grid_types,
  color_variation: color_variation_types,
};

const imports = sessionStorage.getItem("imports");
const data = JSON.parse(imports);

async function batch_export() {
  for (let i = 0; i < data.length; i++) {
    // Obter Máscaras
    await get_masks(data[i].folder_name);
    imports_dropdown.value = data[i].folder_name;

    for (let j = 0; j < settings.ratio.length; j++) {
      for (let k = 0; k < settings.grid.length; k++) {
        for (let m = 0; m < settings.color_variation.length; m++) {
          for (let n = 0; n < settings.runs; n++) {
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

            user_color = color(random(360), random(10, 100), random(40, 100));

            // Composition
            composition = new Composition(comp_graphics, comp_graphics_w, comp_graphics_h, settings.grid[k], user_color, settings.color_variation[m], 1, 1);
            composition.semantic_groups = semantic_groups;
            composition.recompose();

            // Guardar outputs
            // await save_output(`[${j}_${k}_${l}]`);

            // Preview de 1s
            // await new Promise((r) => setTimeout(r, 500));
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }
    }
  }
}
