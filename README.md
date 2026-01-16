# ReFrame

ReFrame is a web-based system developed as part of a Master's Dissertation exploring the intersection of Graphic Design, Generative Design, and Computer Vision. It automates the extraction of semantic layers from images to enable new conceptual paths in visual representation.

## Table of Contents

- [About](#about)
    - [Key Concepts](#key-concepts)
- [Getting Started](#getting-started)
    - [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)
- [Credits](#credits)

## About

In the field of Graphic Design, visual layers play a fundamental role in constructing perception and creating meaning. ReFrame explores this duality by treating layers not just as visual elements, but as carriers of symbolic interpretation.

The system integrates **object detection** and **image segmentation** methods to decompose images into their constituent layers. Using generative computational methods, it allows for the **recomposition and recontextualization** of these elements.

ReFrame establishes a balance between automated rules and user decisions, offering a tangible exploration of multiple conceptual paths to generate unique graphic materials.

## Key Concepts

- **Visual Decomposition:** Breaking down raw images into semantic masks.
- **Generative Recomposition:** Algorithmic reassembly of layers to create new meanings.
- **Semantic Relationships:** Identifying contextual links between extracted objects to suggest meaningful compositions.

## Getting Started
### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/franciscofrodrigues/ReFrame.git
   cd ReFrame
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv <name>
   ```

3. **Activate virtual environment**
    ```bash
    source <name>/bin/activate
    ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the Application**
    ```bash
    python server/main.py
    ```

### Usage

1. Open your web browser and navigate to `http://localhost:8000`.
2. Upload one or more images using the web interface.
3. Monitor the processing progress in real-time.
4. Once processing completes, browse the extracted masks.
5. Create distinct compositions using different parameters and export the results.

### API Endpoints

For complete API documentation with interactive testing, visit the [FastAPI - Swagger UI](http://localhost:8000/docs) after running the application.

#### Upload Endpoint

<details>
<summary><code>POST /upload</code> - Submit images for processing</summary><br>

To send files from client-side to server-side using multipart/form-data for processing.

**Request**: Image files in multipart format<br>
**Response**: Task UUID and initial status

</details>

<details>
<summary><code>GET /upload/{uuid}/status</code> - Check processing status</summary><br>

To check server-side pipeline processing status of a specific upload UUID.

**Parameters**: `uuid` - Task identifier from upload response<br>
**Response**: Current processing step, status, and labels information

</details>

#### Masks Endpoint

<details>
<summary><code>GET /masks/{folder_name}/result</code> - Get processing results</summary><br>

To get resulting data from the server-side processing pipeline.

**Parameters**: `folder_name` - Output folder from status response<br>
**Response**: Complete JSON structure with all extracted data

</details>

<details>
<summary><code>GET /masks/{folder_name}/result/{group_index}/{result_index}.png</code> - Get mask image</summary><br>

To get a specific resulting mask and/or inverse. Specify the type of mask with the boolean query parameter `inverse` set to `true` or `false` depending on which mask you want.

**Parameters**: 
- `folder_name` - Output folder name
- `group_index` - Semantic group index
- `result_index` - Mask index
- `inverse` (query) - Boolean for inverse mask

</details>

<details>
<summary><code>GET /masks/{folder_name}/result/{group_index}/{result_index}/contained/{contained_index}.png</code> - Get contained masks</summary><br>

To get all masks contained within a specific resulting mask.

**Parameters**:
- `folder_name` - Output folder name
- `group_index` - Semantic group index
- `result_index` - Mask index
- `contained_index` - Index of contained mask

</details>

## License

This project is licensed under the [AGPL-3.0 License](LICENSE).

## Credits

This project was developed as the part of Master's Dissertation *"ReFrame: Decomposição e Recomposição de Informação Visual"*, within the scope of the **MSc in Design and Multimedia** of the **University of Coimbra**.

### Contributors
- [Francisco Rodrigues](https://github.com/franciscofrodrigues)