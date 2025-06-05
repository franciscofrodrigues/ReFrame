async function get_result_data() {
  const url = `${endpoint_api}/masks/${folder_name}/result`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

function get_mask_img(group_index, result_index, inverse) {
  const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}.png?inverse=${inverse}`;
  const img = loadImage(url);
  return img;
}

function get_contained_mask_img(group_index, result_index, contained_index) {
  const url = `${endpoint_api}/masks/${folder_name}/result/${group_index}/${result_index}/contained/${contained_index}.png`;
  const img = loadImage(url);
  return img;
}

async function get_masks() {
  result_json = await get_result_data();

  for (let i = 0; i < result_json.length; i++) {
    for (let j = 0; j < result_json[i].length; j++) {
      let mask = get_mask_img(i, j, false);
      let inverted_mask = get_mask_img(i, j, true);

      let contained_masks = [];
      for (let k = 0; k < result_json[i][j]["contained"].length; k++) {
        contained_masks.push(get_contained_mask_img(i, j, k));
      }

      let label = result_json[i][j]["label"];
      let semantic_group = i;

      masks.push(new Mask(mask, inverted_mask, contained_masks, label, semantic_group));
    }
  }
}
