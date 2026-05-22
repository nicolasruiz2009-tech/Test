"""
Embed real photos into the Fete des Mamans PPT.

Usage:
  python embed_photos.py photo1.jpg photo2.jpg photo3.jpg

  photo1.jpg -> slide 2 (porte-cle empreinte de doigt)
  photo2.jpg -> slide 3 (vide-poche empreinte de main)
  photo3.jpg -> slide 5 (carnet de bons)

The script replaces the central illustration on each target slide with the
provided photo, keeping the existing layout and text intact.
"""
import sys
from pathlib import Path
from pptx import Presentation
from pptx.util import Emu

SLIDE_TARGETS = {
    1: "slide 2 - porte-cle empreinte de doigt",
    2: "slide 3 - vide-poche empreinte de main",
    4: "slide 5 - carnet de bons",
}


def find_illustration_anchor(slide):
    """Return the (left, top, width, height) of the largest group/picture
    in the central area of the slide. We treat that as the illustration to
    replace."""
    candidates = []
    for shape in slide.shapes:
        if shape.has_text_frame and shape.text_frame.text.strip():
            continue
        try:
            area = shape.width * shape.height
        except Exception:
            continue
        candidates.append((area, shape))
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][1]


def main(photos):
    src = Path("fete_mamans.pptx")
    dst = Path("fete_mamans_avec_photos.pptx")
    prs = Presentation(src)

    slide_indices = list(SLIDE_TARGETS.keys())
    if len(photos) != len(slide_indices):
        sys.exit(f"Need {len(slide_indices)} photos, got {len(photos)}")

    for idx, photo_path in zip(slide_indices, photos):
        slide = prs.slides[idx]
        anchor = find_illustration_anchor(slide)
        if anchor is None:
            print(f"[warn] no anchor found on slide {idx + 1}, skipping")
            continue
        left, top, width, height = anchor.left, anchor.top, anchor.width, anchor.height
        sp = anchor._element
        sp.getparent().remove(sp)
        slide.shapes.add_picture(photo_path, left, top, width=width, height=height)
        print(f"[ok]   {SLIDE_TARGETS[idx]} <- {photo_path}")

    prs.save(dst)
    print(f"\nSaved: {dst}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    main(sys.argv[1:4])
