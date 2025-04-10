import http.requests.*;
import drop.*;

Button button;
SDrop drop;
DListener dropListener;

int sidebarW, mainW, paddingUI;
color bgColor, fgColor, textColor; // UI
color buttonLabelColor, buttonColor, buttonHoverColor; // BOTÕES
color dropLabelColor, dropColor, dropHoverColor; // DROP FIELD

String portAPI, endpointAPI; // API

String img_response;
PImage img;

void setup() {
  size(1280, 720);
  
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
  
  if(img != null) image(img, sidebarW + paddingUI*2, paddingUI, img.width/2, img.height/2); 
}


void mousePressed() {
  if (button.click()) {
    // selectInput("Select a file:", "upload_img");
    
    img_response = getImg();
    //print(img_response);
    
    JSONArray img_array = parseJSONArray(img_response);
    String img_path = img_array.getString(int(random(img_array.size())));
    
    img = loadImage("../" + img_path);
  }
}


String getImg() {
  // GET REQUEST
  GetRequest get = new GetRequest(endpointAPI + "/upload/" + "img19_1744270482");
  get.send();

  String response = get.getContent(); // RESPONSE
  //println(response);
  
  return response;
}


void dropEvent(DropEvent theDropEvent) {
}
