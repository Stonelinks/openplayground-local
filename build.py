import os
import shutil
import subprocess
import sys


debug = True if sys.argv[1] == "debug" else False

if not debug:
    os.environ["NODE_ENV"] = "production"

os.chdir("./app")

if debug:
    subprocess.run(["parcel", "build", "--no-optimize", "src/index.html"])
else:
    subprocess.run(
        ["parcel", "build", "src/index.html", "--no-cache", "--no-source-maps"]
    )

os.chdir("..")

if os.path.exists("./server/static"):
    shutil.rmtree("./server/static")

shutil.copytree("./app/dist", "./server/static")
