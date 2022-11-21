import json
import re

data = {"verts": [], "faces": []}

file_name = "teapot"

with open(f"obj_files/{file_name}.obj") as file:
    for line in file:
        line = line.rstrip()
        if len(line) > 0 and line[0] == "v":
            match = re.findall("(-{0,1}\d+.\d+)", line)
            match = [float(n) for n in match]
            data["verts"].append(match)
        elif len(line) > 0 and line[0] == "f":
            match = re.findall("(\d+)", line)
            match = [int(n) for n in match]
            data["faces"].append(match)

print(data)

with open(f"json_files/{file_name}.json", "w") as outfile:
    json.dump(data, outfile)