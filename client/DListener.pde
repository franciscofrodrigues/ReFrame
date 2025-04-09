class DListener extends DropListener {

  PVector pos = new PVector(0, 0);
  float w, h, radius;
  color cDropField, cBase, cHover, cText;
  String text;

  DListener(float x, float y, float w, float h, color cBase, color cHover, color cText, String text) {
    this.w = w;
    this.h = h;
    this.cBase = cBase;
    this.cHover = cHover;
    this.cText = cText;
    this.text = text;

    this.cDropField = cBase;
    this.radius = 5;
    pos.x = x-w/2;
    pos.y = y-h/2;

    setTargetRect(pos.x, pos.y, w, h); // TARGET
  }

  void display() {
    // DROP FIELD
    fill(cDropField);
    rect(pos.x, pos.y, w, h, radius);

    // TEXTO (LABEL)
    fill(cText);
    textAlign(CENTER, CENTER);
    text(text, pos.x + w/2, pos.y + h/2);
  }

  // HOVER
  void dropEnter() {
    cDropField = cHover;
  }

  // LEAVE
  void dropLeave() {
    cDropField = cBase;
  }

  // EVENT
  void dropEvent(DropEvent theDropEvent) {
    if (theDropEvent.isImage()) {
      File f = theDropEvent.file();
      uploadFile(new File[] { f });
    }
  }

  // --------API--------
  
  // CARREGAR FICHEIROS PARA BACKEND
  void uploadFile(File[] files) {
    for (int i=0; i<files.length; i++) {
        // POST REQUEST
        PostRequest post = new PostRequest(endpointAPI + "/upload");
        post.addFile("files", files[i]);
        post.send();

        println(post.getContent()); // RESPONSE
    }
  }
}
