"""Create the transparent hero portrait and edge-check composites with rembg.

Install dependencies with: python -m pip install "rembg[cpu]" pillow
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image, ImageFilter


PROJECT_ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("U2NET_HOME", str(PROJECT_ROOT / ".rembg-models"))

from rembg import new_session, remove  # noqa: E402


def trim_transparency(image: Image.Image) -> Image.Image:
    """Trim empty pixels while retaining 4% headroom and light side padding."""
    alpha = image.getchannel("A")
    visible = alpha.point(lambda value: 255 if value > 1 else 0)
    bounds = visible.getbbox()
    if bounds is None:
        raise ValueError("The extracted image contains no visible subject.")

    left, top, right, bottom = bounds
    subject_width = right - left
    subject_height = bottom - top
    side_padding = round(subject_width * 0.02)
    top_padding = round(subject_height * 0.04)

    crop_box = (
        max(0, left - side_padding),
        max(0, top - top_padding),
        min(image.width, right + side_padding),
        bottom,
    )
    return image.crop(crop_box)


def defringe_alpha(image: Image.Image) -> Image.Image:
    """Erode the alpha edge by one pixel, then feather it by half a pixel."""
    result = image.copy()
    alpha = result.getchannel("A")
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    result.putalpha(alpha)
    return result


def save_composite(image: Image.Image, color: str, destination: Path) -> None:
    background = Image.new("RGBA", image.size, color)
    composite = Image.alpha_composite(background, image).convert("RGB")
    composite.save(destination, format="PNG", optimize=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=PROJECT_ROOT / "Anagha-Portfolio-Headshot.png",
        help="Portrait source with its original studio background.",
    )
    parser.add_argument(
        "--model",
        default="isnet-general-use",
        choices=("isnet-general-use", "u2net_human_seg"),
        help="rembg segmentation model.",
    )
    parser.add_argument(
        "--defringe",
        action="store_true",
        help="Apply a one-pixel alpha erosion and 0.5-pixel feather.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.source.resolve()
    assets_dir = PROJECT_ROOT / "assets"
    scratch_dir = PROJECT_ROOT / "scratch"
    assets_dir.mkdir(parents=True, exist_ok=True)
    scratch_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as portrait:
        portrait.load()
        session = new_session(args.model)
        extracted = remove(
            portrait.convert("RGBA"),
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        ).convert("RGBA")

    cutout = trim_transparency(extracted)
    if args.defringe:
        cutout = defringe_alpha(cutout)

    png_path = assets_dir / "anagha-portrait.png"
    webp_path = assets_dir / "anagha-portrait.webp"
    dark_test_path = scratch_dir / "anagha-portrait-dark-test.png"
    light_test_path = scratch_dir / "anagha-portrait-light-test.png"

    cutout.save(png_path, format="PNG", optimize=True)
    cutout.save(webp_path, format="WEBP", quality=90, method=6)
    save_composite(cutout, "#180f0b", dark_test_path)
    save_composite(cutout, "#f3e7d3", light_test_path)

    print(f"Model: {args.model}")
    print(f"Source: {source}")
    print(f"Output dimensions: {cutout.width}x{cutout.height}")
    print(f"Defringed: {'yes' if args.defringe else 'no'}")
    print(f"PNG: {png_path}")
    print(f"WebP: {webp_path}")
    print(f"Dark edge test: {dark_test_path}")
    print(f"Light edge test: {light_test_path}")


if __name__ == "__main__":
    main()
