import os
import struct

assets_dir = "C:/saas project/assets_slides"
files = [f for f in os.listdir(assets_dir) if f.endswith(".png")]

print(f"Found {len(files)} png files in {assets_dir}:")
for f in files:
    path = os.path.join(assets_dir, f)
    try:
        with open(path, "rb") as fh:
            data = fh.read(24)
            # Verify PNG signature
            if data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR":
                w, h = struct.unpack(">II", data[16:24])
                print(f"File: {f}")
                print(f"  Size: {w}x{h}")
            else:
                print(f"File: {f} (Not a standard PNG or unrecognized header)")
    except Exception as e:
        print(f"Error reading {f}: {e}")
