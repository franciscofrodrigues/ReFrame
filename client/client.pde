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
  //size(1280, 720);
  size(800, 900);
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
  button = new Button(sidebarW/2 + paddingUI, height-15-paddingUI, sidebarW, 30, buttonColor, buttonHoverColor, buttonLabelColor, "GENERATE"); // x, y, w, h, text_color, base_color, state_color, label

  // DROP FIELD
  drop = new SDrop(this);
  dropListener = new DListener(sidebarW/2 + paddingUI, height/2-15-paddingUI/2, sidebarW, height-paddingUI*3-30, color(0, 0, 200), color(0, 0, 150), color(255), "DROP FILES HERE");
  drop.addDropListener(dropListener);
}


void draw() {
  background(bgColor);

  //fill(240);
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
    folder_name = "25-04-24_08-26-53-707909";
    //info = "A carregar máscaras...";
    int[] mask_indexes = get_mask_indexes(folder_name);
    masks_images = get_masks(mask_indexes);

    // COMPOSITION
    composition = new Composition(masks_images, int(random(2, masks_images.length)), 1, random(10, 100), "person");
  }
}

void dropEvent(DropEvent theDropEvent) {
}
