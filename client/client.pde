import http.requests.*;
import drop.*;

Button button;
SDrop drop;
DListener dropListener;
Composition composition;

int sidebarW, mainW, paddingUI;
color bgColor, fgColor, textColor; // UI
color buttonLabelColor, buttonColor, buttonHoverColor; // BOTÕES
color dropLabelColor, dropColor, dropHoverColor; // DROP FIELD

String info;

String portAPI, endpointAPI; // API

PImage[] masks_images;
String folder_name;

void settings() {
  size(1280, 720);
}

void setup() {
  // API
  portAPI = "8000";
  endpointAPI = "http://127.0.0.1:" + portAPI;

  // CORES
  // UI
  bgColor = color(255);
  fgColor = color(30);
  textColor = color(0);

  // BOTÕES
  buttonLabelColor = color(255);
  buttonColor = color(0, 0, 200);
  buttonHoverColor = color(0, 0, 150);

  // DROP FIELD
  dropLabelColor = color(255);
  dropColor = color(0, 0, 200);
  dropHoverColor = color(0, 0, 150);

  // INIT
  paddingUI = 10;
  sidebarW = 100;
  mainW = width - sidebarW - paddingUI*3;
  info = "Status";

  // BOTÕES
  button = new Button(sidebarW/2 + paddingUI, height-15-paddingUI, sidebarW, 30, buttonColor, buttonHoverColor, buttonLabelColor, "GET"); // x, y, w, h, text_color, base_color, state_color, label

  // DROP FIELD
  drop = new SDrop(this);
  dropListener = new DListener(sidebarW/2 + paddingUI, height/2-15-paddingUI/2, sidebarW, height-paddingUI*3-30, color(0, 0, 200), color(0, 0, 150), color(255), "DROP FILES HERE");
  drop.addDropListener(dropListener);
}


void draw() {
  background(bgColor);

  fill(230);
  rect(sidebarW + paddingUI*2, paddingUI, mainW, height-paddingUI*2, 5);

  // BOTÕES
  button.draw();
  button.update();

  // DROP FIELD
  dropListener.draw();

  push();
  fill(0);
  textAlign(RIGHT, BOTTOM);
  text(info, width-paddingUI*2, height-paddingUI*2);
  pop();

  // MASKS
  if (masks_images != null) composition.draw();
}


void mousePressed() {
  if (button.click()) {
    // selectInput("Select a file:", "upload_img");

    // OBTER MÁSCARAS
    folder_name = "25-04-23_16-15-55-788138";
    //info = "A carregar máscaras...";
    int[] mask_indexes = get_mask_indexes(folder_name);
    masks_images = get_masks(mask_indexes);

    // COMPOSITION
    composition = new Composition(masks_images, random(5), random(20), "person");
  }
}

int[] get_mask_indexes(String folder_name) {
  GetRequest get = new GetRequest(endpointAPI + "/masks/" + folder_name);
  get.send();

  JSONObject response = parseJSONObject(get.getContent());

  JSONArray input_images = response.getJSONArray("input_images");
  //JSONArray detection = response.getJSONArray("detection");
  JSONArray segmentation = response.getJSONArray("segmentation");
  //JSONArray concepts = response.getJSONArray("concepts");

  int input_images_size = input_images.size();
  int[] largest_mask = new int[input_images_size];
  int[] image_indexes = new int[input_images_size];

  for (int i=0; i<image_indexes.length; i++) {
    image_indexes[i] = -1;
  }

  for (int i=0; i<segmentation.size(); i++) {
    JSONObject item = segmentation.getJSONObject(i);

    int item_image_index = item.getInt("input_image_index");
    int item_mask_pixels = item.getInt("mask_pixels");

    // OBTER A MAIOR MÁSCARA DE DETERMINDA IMAGEM DE INPUT
    if (item_mask_pixels > largest_mask[item_image_index]) {
      largest_mask[item_image_index] = item_mask_pixels;
      image_indexes[item_image_index] = i;
    }
  }
  return image_indexes;
}

PImage[] get_masks(int[] indexes) {
  // GET REQUEST - FICHEIROS DE MASKS
  PImage[] result_masks = new PImage[indexes.length];
  for (int i=0; i<indexes.length; i++) {
    if (indexes[i] != -1) {
      result_masks[i] = loadImage(endpointAPI + "/masks/" + folder_name + "/" + indexes[i] + ".png");
    }
  }
  return result_masks;
}

void dropEvent(DropEvent theDropEvent) {
}
