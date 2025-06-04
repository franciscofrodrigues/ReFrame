import os

# Localização de ficheiros
BASE_PATH = os.path.dirname(os.path.abspath(__file__))

# Client
CLIENT_PATH = os.path.join(BASE_PATH, "..", "client")

# Server
# SERVER_PATH = os.path.join(BASE_PATH, "server")
SERVER_PATH = "server"

# Weights
WEIGHTS_PATH = os.path.join(SERVER_PATH, "weights")
FASTSAM_WEIGHTS = os.path.join(WEIGHTS_PATH, "FastSAM-x.pt")
YOLO_WEIGHTS = os.path.join(WEIGHTS_PATH, "yolo11x.pt")

# Resources
RES_PATH = os.path.join(SERVER_PATH, "res")
OUTPUTS_PATH = os.path.join(RES_PATH, "outputs")
UPLOADS_PATH = os.path.join(RES_PATH, "uploads")

# Atributos gerais
DEBUG_MODE = True