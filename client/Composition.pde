class Composition {

  PGraphics pg;

  //ArrayList<Mask> masks;
  PImage[] masks;
  int[] chosen_masks;
  int num_masks;

  int canvas_left, canvas_top, canvas_width, canvas_height;

  float img_ratio, img_width, img_height;
  float scale_factor;

  float std, mean_width_1, mean_width_2, mean_height_1, mean_height_2;
  PVector[] pos;

  Composition(PImage[] masks, int num_masks, float scale_factor, float std) {
    this.masks = masks;
    this.num_masks = num_masks;
    this.scale_factor = scale_factor;
    this.std = std;

    //canvas_left = sidebarW + paddingUI*2;
    //canvas_top = paddingUI;
    //canvas_width = mainW;
    //canvas_height = height-paddingUI*2;
    
    canvas_left = 0;
    canvas_top = 0;
    canvas_width = width;
    canvas_height = height;

    mean_width_1 = canvas_width/3;
    mean_width_2 = 2*(canvas_width/3);
    mean_height_1 = canvas_height/3;
    mean_height_2 = 2*(canvas_height/3);

    chosen_masks = new int[num_masks];
    for (int i=0; i<chosen_masks.length; i++) {
      chosen_masks[i] = int(random(masks.length));
    }

    pos = new PVector[masks.length];
    for (int i=0; i<pos.length; i++) {
      pos[i] = thirds_grid();
    }

    pg = createGraphics(canvas_width, canvas_height);
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

    pos.z = random(canvas_height/5, canvas_height/2);

    return pos;
  }

  void draw() {
    pg.beginDraw();
    pg.clear();

    if (masks != null) {
      for (int i=0; i<chosen_masks.length; i++) {
        int index = chosen_masks[i];
        if (masks_images[index] != null) {
          img_ratio = (float) masks[index].width / masks[index].height;
          img_height = pos[i].z;
          img_width = img_height*img_ratio;

          pg.image(masks[index], (pos[i].x-img_width/2), (pos[i].y-img_height/2), img_width, img_height);
        }
      }
    }

    pg.endDraw();
    image(pg, canvas_left, canvas_top);
  }
}
