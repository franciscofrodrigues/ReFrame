function load_image_async(url) {
  return new Promise((resolve, reject) => {
    loadImage(url, img => resolve(img), err => reject(err));
  });
}



// JSON
async function get_result_data(folder_name) {
    const url = `${endpoint_api}/masks/${folder_name}/result`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result_json = await response.json();
      return result_json;
    } catch (error) {
      console.error(error.message);
    }
}

// // Carregar "largest_mask" e máscara invertida
// function get_mask_img(folder_name, group_index, result_index, inverse) {
//   const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}.png?inverse=${inverse}`;
//   const img = loadImage(url);
//   return img;
// }

// // Carregar máscara contidas
// function get_contained_mask_img(folder_name, group_index, result_index, contained_index) {
//   const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}/contained/${contained_index}.png`;
//   const img = loadImage(url);
//   return img;
// }

function get_mask_img(folder_name, group_index, result_index, inverse) {
  const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}.png?inverse=${inverse}`;
  const img = load_image_async(url);
  return img;
}
function get_contained_mask_img(folder_name, group_index, result_index, contained_index) {
  const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}/contained/${contained_index}.png`;
  const img = load_image_async(url);
  return img;
}

// Obter máscaras resultantes da pipeline
async function get_masks(folder_name) {
  masks.length = 0;
  semantic_groups.length = 0;
  toggle_loader(true);
  update_loader_info("Loading Masks...");

  result_json = await get_result_data(folder_name);

  for (let i = 0; i < result_json.length; i++) {
    for (let j = 0; j < result_json[i].length; j++) {
      let mask = await get_mask_img(folder_name, i, j, false);
      let inverted_mask = await get_mask_img(folder_name, i, j, true);

      let contained_masks = [];
      for (let k = 0; k < result_json[i][j]["contained"].length; k++) {
        contained_masks.push(await get_contained_mask_img(folder_name, i, j, k));
      }

      let label = result_json[i][j]["label"];
      let semantic_group = i;

      masks.push(new Mask(mask, inverted_mask, contained_masks, label, semantic_group));      
    }
  }

  group_masks(masks, semantic_groups);
  toggle_loader(false);
  update_loader_info("");
}
