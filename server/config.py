# Localização de ficheiros
WEIGHTS_PATH = f'./server/weights'
FASTSAM_WEIGHTS = f'{WEIGHTS_PATH}/FastSAM-x.pt'
YOLO_WEIGHTS = f'{WEIGHTS_PATH}/yolo11x.pt'

RES_PATH = './server/res'
SEG_OUTPUTS = f'./{RES_PATH}/seg_outputs'

CLASS_INPUTS = f'./{RES_PATH}/class_inputs'
CLASS_OUPUTS = f'./{RES_PATH}/class_outputs'

# Atributos gerais
DEBUG_MODE = True