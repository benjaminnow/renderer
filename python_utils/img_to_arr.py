import numpy as np
from PIL import Image
import json

in_file = '../experiments/minnow.jpg'
out_filename = 'minnow_texture'

img = Image.open(in_file)
img.putalpha(255)
arr = np.array(img)
arr_flat = arr.flatten()

texture_data = {}

texture_data['data'] = arr_flat.tolist()
texture_data['width'] = img.size[0]
texture_data['height'] = img.size[1]

with open(f"../json_files/{out_filename}.json", "w") as outfile:
    json.dump(texture_data, outfile)
