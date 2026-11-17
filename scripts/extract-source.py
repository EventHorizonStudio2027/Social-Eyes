#!/usr/bin/env python3
"""Safely restore a verified source ZIP, omitting packaging-only metadata."""
from pathlib import Path
from zipfile import ZipFile
import sys
import runpy
import tempfile
import shutil
verify = runpy.run_path(str(Path(__file__).with_name("verify-package.py")))["verify"]


def extract(archive_path: Path, destination: Path):
    """Verify first; stage files privately and publish only after full extraction."""
    verify(archive_path)
    destination = destination.absolute()
    if destination.is_symlink():
        raise ValueError('Destination cannot be a symlink')
    if destination.exists():
        raise ValueError('Destination must be empty and absent to avoid overwriting files')
    if not destination.parent.is_dir():
        raise ValueError('Destination parent must exist')
    staged = Path(tempfile.mkdtemp(prefix='.social-eyes-stage-', dir=destination.parent))
    try:
        with ZipFile(archive_path) as archive:
            for name in archive.namelist():
                relative = name.removeprefix('social-eyes-mobile/')
                if relative == 'PACKAGE_MANIFEST.json':
                    continue
                target = staged / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.read(name))
        staged.rename(destination)
    finally:
        if staged.exists():
            shutil.rmtree(staged)
    return destination


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: extract-source.py ARCHIVE.zip EMPTY_DESTINATION')
    try:
        print(f'PASS: extracted verified source into {extract(Path(sys.argv[1]), Path(sys.argv[2]))}')
    except (ValueError, OSError) as exc:
        raise SystemExit(f'FAIL: {exc}') from exc
