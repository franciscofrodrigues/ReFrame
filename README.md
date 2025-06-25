# Decomposing Visual Information

---

### Virtual Environment
#### Create

```bash
python -m venv <name>
```

#### Activate

```bash
source <name>/bin/activate
```

---

### Requirements
#### Install

```bash
pip install -r requirements.txt
```

---

### Run

```bash
python3 server/main.py
```

---

### API
#### Documentation

After running the application access [FastAPI - Swagger UI](http://localhost:8000/docs) to see all the API documentation.

#### Endpoints
##### Upload
<details>
<summary>/upload</summary>
To send files from client-side to server-side using *multipart/form-data*.
</details>

<details>
<summary>/upload/{uuid}/status</summary>
To check server-side pipeline processing status of a specific upload *uuid*.
</details>

##### Masks

<details>
<summary>/masks/{folder_name}/result</summary>
To get resulting data from the server-side processing pipeline.
</details>

<details>
<summary>/masks/{folder_name}/result/{group_index}/{result_index}.png</summary>
To get a specific resulting mask and/or inverse. Specify the type of mask with the boolean query **inverse**  set **true** or **false** depending on which mask you want.
</details>

<details>
<summary>/masks/{folder_name}/result/{group_index}/{result_index}/contained/{contained_index}.png</summary>
To get a all masks contained on a specific resulting mask.
</details>