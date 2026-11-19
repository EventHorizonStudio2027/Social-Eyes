#!/usr/bin/env python3
"""Generate original Social Eyes native PNG artwork with Python stdlib only."""
import math
import os
import struct
import zlib
from pathlib import Path

SIZE = 1024
OUT = Path('assets/images')
(OUT / 'brand').mkdir(parents=True, exist_ok=True)

def png(path, pixels, rgba=False):
    channels = 4 if rgba else 3
    raw = bytearray()
    for y in range(SIZE):
        raw.append(0)
        for x in range(SIZE):
            raw.extend(pixels(x, y))
    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)
    header = struct.pack('!2I5B', SIZE, SIZE, 8, 6 if rgba else 2, 0, 0, 0)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b''))

def artwork(x, y, transparent=False):
    dx, dy = (x - 512) / 370, (y - 512) / 370
    r = math.hypot(dx, dy)
    background = (10 + int(13 * (1 - y / SIZE)), 16 + int(15 * (1 - x / SIZE)), 38 + int(19 * (y / SIZE)))
    if transparent:
        background = (0, 0, 0)
    # Stylized eye with luminous cyan iris, dark pupil and violet edge.
    oval = (dx / 1.04) ** 2 + (dy / .47) ** 2
    eyelid = abs(dy) - .45 * math.sqrt(max(0, 1 - (dx / 1.04) ** 2)) if abs(dx) <= 1.04 else 1
    iris = math.hypot(dx, dy)
    if oval < 1 and iris < .245:
        color = (10, 25, 50)
    elif oval < 1 and iris < .37:
        color = (37 + int(25 * r), 207 - int(40 * r), 224)
    elif oval < 1 and iris < .51:
        color = (118, 237, 243)
    elif oval < 1:
        color = (221, 244, 252)
    else:
        color = background
    if abs(eyelid) < .028 and abs(dx) < 1.05:
        color = (158, 118, 245)
    # Small sparkle makes the eye feel human rather than surveillance-oriented.
    if math.hypot(dx + .14, dy + .13) < .07:
        color = (255, 255, 255)
    if transparent:
        return (*color, 0 if color == background else 255)
    return color

png(OUT / 'social-eyes-icon.png', lambda x, y: artwork(x, y))
png(OUT / 'social-eyes-adaptive-foreground.png', lambda x, y: artwork(x, y, True), True)
png(OUT / 'social-eyes-mark.png', lambda x, y: artwork(x, y, True), True)

for name, center in [('aurora', (87, 52, 160)), ('violet-haze', (87, 41, 128)), ('cyan-depth', (17, 89, 118))]:
    # Deterministic atmospheric gradients, no external image dependencies.
    def gradient(x, y, c=center):
        glow = max(0, 1 - math.hypot((x - 660) / 820, (y - 260) / 650))
        wave = math.sin(x / 83 + y / 147) * 5
        return tuple(max(0, min(255, int(9 + v * glow * .75 + wave))) for v in c)
    png(OUT / 'brand' / (name + '.png'), gradient)
print('Generated 6 original PNG brand assets')

# Asset generation is deterministic; committed PNGs are the build inputs.
