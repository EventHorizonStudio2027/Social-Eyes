#!/usr/bin/env python3
"""Create a deterministic, fail-closed complete-source ZIP for Social Eyes."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {'.git', '.expo', 'node_modules', 'dist', 'web-build', '__pycache__', '.pytest_cache'}
SKIP_FILES = {'.DS_Store'}
PRIVATE_SUFFIXES = {'.pem', '.p12', '.pfx', '.key', '.p8', '.jks', '.keystore', '.mobileprovision'}
PRIVATE_NAMES = {'.npmrc', '.netrc', '.pypirc', 'google-services.json', 'GoogleService-Info.plist', 'credentials.json', 'credentials.local.json'}
SECRET_PATTERNS = [re.compile(rb'sb_secret_[A-Za-z0-9_-]{8,}'),
                   re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')]


def source_files(destination):
    files = []
    for item in ROOT.rglob('*'):
        rel = item.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if item.is_symlink():
            raise RuntimeError(f'Symbolic link forbidden: {rel}')
        if not item.is_file() or item.resolve() == destination:
            continue
        if item.name in SKIP_FILES or item.name.endswith('.log'):
            continue
        if item.name in PRIVATE_NAMES or item.suffix.lower() in PRIVATE_SUFFIXES:
            raise RuntimeError(f'Sensitive configuration or signing file forbidden: {rel}')
        if rel.as_posix() == 'PACKAGE_MANIFEST.json':
            raise RuntimeError('Reserved manifest filename in source tree')
        if any(part == '.env' or part.startswith('.env.') for part in rel.parts) and item.name != '.env.example':
            raise RuntimeError(f'Private environment file forbidden: {rel}')
        data = item.read_bytes()
        if any(pattern.search(data) for pattern in SECRET_PATTERNS):
            raise RuntimeError(f'Potential secret content forbidden: {rel}')
        files.append((rel.as_posix(), data))
    return sorted(files)


def package(destination):
    destination = destination.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    files = source_files(destination)
    manifest = {'schema': 1, 'files': {name: hashlib.sha256(data).hexdigest() for name, data in files}}
    payload = files + [('PACKAGE_MANIFEST.json', (json.dumps(manifest, indent=2, sort_keys=True) + '\n').encode())]
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in payload:
            info = ZipInfo('social-eyes-mobile/' + name, date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
        if archive.testzip() is not None:
            raise RuntimeError('Archive integrity check failed')
    print(f'PASS: complete reproducible source archive ({len(files)} files): {destination}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: package-project.py DESTINATION.zip')
    try:
        package(Path(sys.argv[1]))
    except RuntimeError as exc:
        raise SystemExit(f'FAIL: {exc}') from exc
