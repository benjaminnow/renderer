import json
import re

data = {"verts": [], "faces": []}

with open("obj_files/ship.obj") as file:
    for line in file:
        if line.rstrip()[0] == "v":
            match = re.findall("(-{0,1}\d+.\d+)", line.rstrip())
            match = [float(n) for n in match]
            data["verts"].append(match)
        elif line.rstrip()[0] == "f":
            match = re.findall("(\d+)", line.rstrip())
            match = [int(n) for n in match]
            data["faces"].append(match)

print(data)

with open("json_files/ship.json", "w") as outfile:
    json.dump(data, outfile)