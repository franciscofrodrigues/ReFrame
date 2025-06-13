// Atualizar número de ficheiros (imagens) selecionados
const upload_image_input = document.querySelector('#upload_image_form input[type="file"]');
const upload_image_message = document.getElementById("upload_image_message");
upload_image_input.addEventListener("change", () => {
  const count = upload_image_input.files.length;
  upload_image_message.textContent = `${count} file(s) selected.`;
});


// Form de UPLOAD
const upload_image_form = document.getElementById("upload_image_form");
upload_image_form.addEventListener("submit", (event) => {
  event.preventDefault();
  upload_images(upload_image_form);
});


// UPLOAD
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
    check_current_state(result.uuid);
  } catch (error) {
    console.error("Error:", error);
  }
}


// Obter mensagens do progresso de UPLOAD e processamento
const upload_step = document.getElementById("upload_step");
async function check_current_state(uuid) {
  const call_interval = setInterval(async () => {
    const url = `${endpoint_api}/upload/${uuid}/status`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const task = await response.json();
      upload_step.textContent = task.step;

      if (task.status === "Process end") {
        clearInterval(call_interval);
        get_masks(task.folder_name, task.result);
      }
    } catch (error) {
      clearInterval(call_interval);
      console.error(error.message);
    }
  }, 1000);
}

// ------------------------------------------------------------------------------


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
  result_json = await get_result_data(data);

  for (let i = 0; i < result_json.length; i++) {
    for (let j = 0; j < result_json[i].length; j++) {
      let mask = get_mask_img(folder_name, i, j, false);
      let inverted_mask = get_mask_img(folder_name, i, j, true);

      let contained_masks = [];
      for (let k = 0; k < result_json[i][j]["contained"].length; k++) {
        contained_masks.push(get_contained_mask_img(folder_name, i, j, k));
      }

      let label = result_json[i][j]["label"];
      let semantic_group = i;

      masks.push(new Mask(mask, inverted_mask, contained_masks, label, semantic_group));
    }
  }
}
