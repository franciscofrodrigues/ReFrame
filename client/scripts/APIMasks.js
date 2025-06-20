// JSON
async function get_result_data(data) {
  result = await data["result"];
  return result;
}

// Carregar "largest_mask" e máscara invertida
function get_mask_img(folder_name, group_index, result_index, inverse) {
  const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}.png?inverse=${inverse}`;
  const img = loadImage(url);
  return img;
}

// Carregar máscara contidas
function get_contained_mask_img(folder_name, group_index, result_index, contained_index) {
  const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}/contained/${contained_index}.png`;
  const img = loadImage(url);
  return img;
}

// Obter máscaras resultantes da pipeline
async function get_masks(folder_name, data) {
  masks.length = 0;
  semantic_groups.length = 0;
  result_json = await get_result_data(data);

  for (let i = 0; i < result_json.length; i++) {
    for (let j = 0; j < result_json[i].length; j++) {
      let mask = await get_mask_img(folder_name, i, j, false);
      let inverted_mask = await get_mask_img(folder_name, i, j, true);
      // let inverted_mask = null;

      let contained_masks = [];
      for (let k = 0; k < result_json[i][j]["contained"].length; k++) {
        contained_masks.push(await get_contained_mask_img(folder_name, i, j, k));
      }

      let label = result_json[i][j]["label"];
      let semantic_group = i;

      masks.push(new Mask(mask, inverted_mask, contained_masks, label, semantic_group));      
    }
  }
}
