# Localização de ficheiros
WEIGHTS_PATH = f'./weights'
FASTSAM_WEIGHTS = f'{WEIGHTS_PATH}/FastSAM-x.pt'
YOLO_WEIGHTS = f'{WEIGHTS_PATH}/yolo11x.pt'

RES_PATH = './res'
SEG_MODEL = 'fastsam'
SEG_INPUTS = f'./{RES_PATH}/seg_inputs'
SEG_OUTPUTS = f'./{RES_PATH}/seg_outputs/{SEG_MODEL}'

CLASS_MODEL = 'yolo'
CLASS_INPUTS = SEG_OUTPUTS
CLASS_OUPUTS = f'./{RES_PATH}/class_outputs/{CLASS_MODEL}'

# Atributos gerais
DEBUG_MODE = True