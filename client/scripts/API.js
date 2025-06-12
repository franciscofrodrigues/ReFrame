const upload_image_form = document.getElementById("upload_image_form");
upload_image_form.addEventListener("submit", (event) => {
  event.preventDefault();
  upload_images(upload_image_form);
});

const upload_image_input = document.querySelector('#upload_image_form input[type="file"]');
const upload_image_message = document.getElementById('upload_image_message');
upload_image_input.addEventListener("change", () => {
  const count = upload_image_input.files.length;
  upload_image_message.textContent = `${count} file(s) selected.`;
});

async function upload_images(form) {
  const url = `${endpoint_api}/upload`;
  const form_data = new FormData(form);

  const request = new Request(url, {
    method: "POST",
    body: form_data,
  });

  try {
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

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
