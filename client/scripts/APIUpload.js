// Atualizar número de ficheiros (imagens) selecionados
const upload_image_input = document.querySelector('#upload_image_form input[type="file"]');
const upload_image_message = document.getElementById("upload_image_message");
upload_image_input.addEventListener("change", () => {
  const count = upload_image_input.files.length;
  upload_image_message.textContent = `${count} Selected`;
});

// Form de UPLOAD
const upload_image_form = document.getElementById("upload_image_form");
upload_image_form.addEventListener("submit", (event) => {
  event.preventDefault();
  upload_images(upload_image_form);
  toggle_loader(true);
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
async function check_current_state(uuid) {
  const call_interval = setInterval(async () => {
    const url = `${endpoint_api}/upload/${uuid}/status`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const task = await response.json();
      update_loader_info(task.step);

      if (task.status === "Process End") {
        clearInterval(call_interval);
        await get_masks(task.folder_name, task.result);
        toggle_loader(false);
        group_masks(masks, semantic_groups);
        save_import(task);
      }
    } catch (error) {
      clearInterval(call_interval);
      console.error(error.message);
    }
  }, 1000);
}

// Guardar Import na sessionStorage
function save_import(task) {
  let tasks = JSON.parse(sessionStorage.getItem("imports") || "[]");
  tasks.push(task);
  sessionStorage.setItem("imports", JSON.stringify(tasks));
  update_imports_list();
}

const imports_container = document.getElementById("imports_container");
const imports_dropdown = document.querySelector("select[name='imports_dropdown']");
imports_dropdown.addEventListener("change", async () => {
  await get_import_masks();
  group_masks(masks, semantic_groups);
});

async function get_import_masks() {
  const imports = sessionStorage.getItem("imports");
  const data = JSON.parse(imports);
  const index = imports_dropdown.selectedIndex - 1;

  await get_masks(data[index].folder_name, data[index].result);
}

function update_imports_list() {
  const imports = sessionStorage.getItem("imports");
  if (imports) {
    imports_container.style.display = "block";
    const data = JSON.parse(imports);
    for (let i = 0; i < data.length; i++) {
      let select_option = document.createElement("option");
      select_option.value = data[i].folder_name;
      select_option.innerHTML = `Import ${i}`;
      imports_dropdown.appendChild(select_option);
    }
  } else {
    imports_container.style.display = "none";
  }
}
