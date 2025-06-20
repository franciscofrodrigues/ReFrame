const loader_container = document.getElementById("loader_container");
const loader_info = document.getElementById("loader_info");

function toggle_loader(loading) {
  if (loading) {
    loader_container.style.display = "flex";
  } else {
    loader_container.style.display = "none";
  }
}

function update_loader_info(loader_info_content) {
  if (loader_info.textContent !== loader_info_content || loader_info.textContent !== "") loader_info.textContent = loader_info_content;
}
