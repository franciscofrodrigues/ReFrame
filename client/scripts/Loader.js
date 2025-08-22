const loader_container = document.getElementById("loader_container");
const loader_info = document.getElementById("loader_info");
const loader_time = 500;

function toggle_loader(loading) {
  setTimeout(() => {
    if (loading) {
      loader_container.style.display = "flex";
    } else {
      loader_container.style.display = "none";
    }
  }, loader_time);
}

function update_loader_info(loader_info_content) {
  if (loader_info.textContent !== loader_info_content || loader_info.textContent !== "") loader_info.textContent = loader_info_content;
}
