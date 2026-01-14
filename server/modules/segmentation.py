from utils.file_export import get_filename, save_output

import cv2
import numpy as np
from ultralytics import FastSAM


class Segmentation:
    def __init__(self, weights_path, input_files, outputs_path, input_counter):
        self.model = FastSAM(weights_path)
        self.input_files = input_files
        self.outputs_path = outputs_path
        self.input_counter = input_counter

        # Configuração do modelo
        self.device = "cpu"
        self.retina_masks = True
        self.save = False
        self.batch = 4
        self.imgsz = 640
        self.conf = 0.7
        self.iou = 0.4

    def mask_img(self, binary_mask, original_img):
        result_img = cv2.bitwise_and(
            original_img, original_img, mask=binary_mask
        )  # Máscara de corte à imagem

        # Preto e Branco
        result_img_bw = cv2.cvtColor(result_img, cv2.COLOR_BGR2GRAY)
        result_img_rgba = cv2.cvtColor(result_img_bw, cv2.COLOR_GRAY2BGRA)

        result_img_rgba[binary_mask == 0] = [0, 0, 0, 0]  # Preto para transparente
        return result_img_rgba

    def get_binary_mask(self, mask):
        mask_np = mask.cpu().numpy()  # Converter de tensor para numpy
        mask_binary = mask_np.astype(np.uint8) * 255  # Máscara binária
        return mask_binary

    def get_confidence(self, box):
        raw_conf = float(box.conf.item())
        conf = round(raw_conf * 100)
        return conf

    def get_largest_mask(self, masks):
        largest_mask_pixels = -1

        for mask in masks:
            if mask["mask_pixels"] >= largest_mask_pixels:
                largest_mask_pixels = mask["mask_pixels"]
                largest_mask = mask
        return largest_mask

    # ------------------------------------------------------------------------------

    # SEGMENTAÇÃO DE IMAGEM de VÁRIAS imagens
    def run(self):
        # Inferência
        results = self.model(
            self.input_files,
            device=self.device,
            retina_masks=self.retina_masks,
            save=self.save,
            batch=self.batch,
            imgsz=self.imgsz,
            conf=self.conf,
            iou=self.iou,
        )

        data = []
        if results:
            for i, result in enumerate(results):
                input_file = result.path
                input_filename = get_filename(input_file)
                original_img = cv2.imread(input_file)

                # result.show()

                if result.masks:
                    for j, mask in enumerate(result.masks.data):
                        confidence = self.get_confidence(result.boxes[j])  # CONFIDENCE

                        # MÁSCARA BINÁRIA
                        mask_binary = self.get_binary_mask(mask)
                        binary_output_path = save_output(
                            self.outputs_path,
                            mask_binary,
                            f"binary_[{input_filename}]",
                            "segmentation",
                        )
                        white_count = int(np.sum(mask_binary == 255))

                        # Aplicar MÁSCARA a IMAGEM ORIGINAL
                        masked_img = self.mask_img(mask_binary, original_img)
                        output_path = save_output(
                            self.outputs_path,
                            masked_img,
                            f"[{input_filename}]",
                            "segmentation",
                        )

                        data.append(
                            {
                                "input_image_index": self.input_counter,
                                "detection_index": i,
                                "mask_index": j,
                                "confidence": confidence,
                                "mask_pixels": white_count,
                                "binary_mask_path": binary_output_path,
                                "result_image_path": output_path,
                            }
                        )

            return data


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    segmentation = Segmentation("weights/FastSAM-x.pt", "res/uploads", "res/outputs", 0)
    segmentation_data = segmentation.run()
    print(segmentation_data)
