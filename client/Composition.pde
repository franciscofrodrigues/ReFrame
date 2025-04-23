class Composition {

  PImage[] masks;
  float scale_factor;
  int canvas_left, canvas_top, canvas_width, canvas_height;
  float img_ratio, img_width, img_height;
  float std, mean_width_1, mean_width_2, mean_height_1, mean_height_2;

  PVector[] pos;

  Composition(PImage[] masks, float scale_factor, float std, String label) {
    this.masks = masks;
    this.scale_factor = scale_factor;
    this.std = std;

    canvas_left = sidebarW + paddingUI*2;
    canvas_top = paddingUI;
    canvas_width = mainW;
    canvas_height = height-paddingUI*2;

    mean_width_1 = canvas_width/3;
    mean_width_2 = 2*(canvas_width/3);
    mean_height_1 = canvas_height/3;
    mean_height_2 = 2*(canvas_height/3);

    pos = new PVector[masks.length];
    for (int i=0; i<pos.length; i++) {
      pos[i] = thirds_grid();
    }
  }

  PVector thirds_grid() {
    PVector pos = new PVector(0, 0, 0);

    if (random(1) < 0.5) {
      pos.x = randomGaussian() * std + mean_width_1;
    } else {
      pos.x = randomGaussian() * std + mean_width_2;
    }
    if (random(1) < 0.5) {
      pos.y = randomGaussian() * std + mean_height_1;
    } else {
      pos.y = randomGaussian() * std + mean_height_2;
    }

    pos.z = random(100, 300);

    return pos;
  }

  void draw() {
    if (masks != null) {
      for (int i=0; i<masks.length; i++) {
        if (masks_images[i] != null) {
          //img_ratio = (float) masks[i].height / masks[i].width;
          //img_width = 100;
          //img_height = img_width*img_ratio;

          img_ratio = (float) masks[i].width / masks[i].height;
          img_height = pos[i].z;
          img_width = img_height*img_ratio;

          image(masks[i], canvas_left + (pos[i].x-img_width/2), canvas_top + (pos[i].y-img_height/2), img_width, img_height);
        }
      }
    }
  }
}
