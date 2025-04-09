class Button {
  boolean hover = false;

  PVector pos = new PVector(0, 0);
  float w, h, radius;
  color cButton, cBase, cHover, cText;
  String text;

  Button(float x, float y, float w, float h, color cBase, color cHover, color cText, String text) {
    this.w = w;
    this.h = h;
    this.cText = cText;
    this.cBase = cBase;
    this.cHover = cHover;
    this.text = text;

    this.cButton = cBase;
    this.radius = 5;
    pos.x = x-w/2;
    pos.y = y-h/2;
  }

  void display() {
    // BOTÃO
    noStroke();
    fill(cButton);
    rect(pos.x, pos.y, w, h, radius);

    // TEXTO (LABEL) BOTÃO
    fill(cText);
    textAlign(CENTER, CENTER);
    text(text, pos.x + w/2, pos.y + h/2);
  }

  void update() {
    // HOVER
    hover = (mouseX > pos.x && mouseX < pos.x + w && mouseY > pos.y && mouseY < pos.y + h);
    
    if (hover) cButton = cHover;
    else cButton = cBase;
  }

  boolean click() {
    return hover && mousePressed;
  }
}