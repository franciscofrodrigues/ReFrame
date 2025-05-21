int[] get_mask_indexes(String folder_name) {
  GetRequest get = new GetRequest(endpointAPI + "/masks/" + folder_name);
  get.send();

  JSONObject response = parseJSONObject(get.getContent());

  JSONArray input_images = response.getJSONArray("input_images");
  JSONArray detection = response.getJSONArray("detection");
  JSONArray segmentation = response.getJSONArray("segmentation");
  JSONArray concepts = response.getJSONArray("concepts");

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

int[] get_related_masks_indexes() {
  GetRequest get = new GetRequest(endpointAPI + "/masks/" + folder_name + "/related");
  get.send();

  JSONArray response = parseJSONArray(get.getContent());
  int[] masks_indexes = new int[response.size()];
  
  for(int i=0; i<response.size(); i++) {
    masks_indexes[i] = response.getInt(i);
  }

  return masks_indexes;
}



ArrayList<Mask> get_result_masks() {
  ArrayList<Mask> masks = new ArrayList<Mask>();
  
  GetRequest get = new GetRequest(endpointAPI + "/masks/" + folder_name + "/results");
  get.send();

  JSONArray response = parseJSONArray(get.getContent());
  
  for(int i=0; i<response.size(); i++) {
    JSONObject item = response.getJSONObject(i);
    
    String result_image_path = item.getString("result_image_path");
    PImage mask = loadImage("../" + result_image_path);
    
    String label = item.getString("label");
    
    masks.add(new Mask(mask, label));
  }
  
  return masks;
}
