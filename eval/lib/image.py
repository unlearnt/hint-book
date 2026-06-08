"""Image loader: resize to longest-side 1024 px and return a base64 data URL."""

import base64
import io
from pathlib import Path

from PIL import Image

ALLOWED_EXT = {".jpg", ".jpeg", ".png"}


def load_image_as_data_url(file_path: Path, max_side: int = 1024) -> dict:
    img = Image.open(file_path)
    img.load()
    is_png = (img.format or "").upper() == "PNG"
    w, h = img.size
    if max(w, h) > max_side:
        img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    if is_png:
        img.save(buf, format="PNG", optimize=True)
        mtype = "image/png"
    else:
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(buf, format="JPEG", quality=92)
        mtype = "image/jpeg"
    data = buf.getvalue()
    b64 = base64.b64encode(data).decode("ascii")
    return {
        "data_url": f"data:{mtype};base64,{b64}",
        "mtype": mtype,
        "bytes": len(data),
    }


def discover_images(example_dir: Path) -> list[Path]:
    """Find front.{jpg,jpeg,png} and back.{...} (in that order) inside an example directory."""

    def pick(stem: str) -> Path | None:
        for f in sorted(example_dir.iterdir()):
            if f.stem.lower() == stem and f.suffix.lower() in ALLOWED_EXT:
                return f
        return None

    found = [p for p in (pick("front"), pick("back")) if p is not None]
    if not found:
        raise FileNotFoundError(f"No front.{{jpg,png}} in {example_dir}")
    return found
