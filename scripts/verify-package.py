#!/usr/bin/env python3
"""Verify source ZIP manifest, hashes, traversal safety and archive structure."""
import hashlib
import json
import sys
from pathlib import PurePosixPath
import re
from zipfile import ZipFile

MAX_SOURCE_FILES = 1000
MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024
MAX_SINGLE_FILE_BYTES = 20 * 1024 * 1024


def verify(path):
    with ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise ValueError('CRC failure')
        infos = archive.infolist()
        entries = [info.filename for info in infos]
        if len(infos) > MAX_SOURCE_FILES + 1:
            raise ValueError('Too many archive entries')
        if sum(info.file_size for info in infos) > MAX_UNCOMPRESSED_BYTES:
            raise ValueError('Archive exceeds uncompressed size limit')
        for info in infos:
            if info.is_dir() or info.file_size > MAX_SINGLE_FILE_BYTES:
                raise ValueError('Unsupported archive entry or oversized file')
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError('Symlink archive entry forbidden')
        if len(entries) != len(set(entries)):
            raise ValueError('Duplicate archive entries')
        prefix = 'social-eyes-mobile/'
        for name in entries:
            parts = PurePosixPath(name).parts
            if not name.startswith(prefix) or '..' in parts or name.startswith('/') or '\\' in name or any(part in ('', '.') for part in parts):
                raise ValueError('Unsafe archive path')
        manifest_name = prefix + 'PACKAGE_MANIFEST.json'
        if manifest_name not in entries:
            raise ValueError('Missing manifest')
        manifest = json.loads(archive.read(manifest_name))
        if manifest.get('schema') != 1 or not isinstance(manifest.get('files'), dict):
            raise ValueError('Invalid manifest')
        for name, digest in manifest['files'].items():
            if not isinstance(name, str) or not name or name.startswith('/') or '\\' in name or any(part in ('', '.', '..') for part in name.split('/')):
                raise ValueError('Unsafe manifest path')
            if not isinstance(digest, str) or re.fullmatch(r'[0-9a-f]{64}', digest) is None:
                raise ValueError('Invalid manifest digest')
        expected = {prefix + name for name in manifest['files']}
        if set(entries) != expected | {manifest_name}:
            raise ValueError('Manifest/archive mismatch')
        for name, digest in manifest['files'].items():
            if hashlib.sha256(archive.read(prefix + name)).hexdigest() != digest:
                raise ValueError(f'Hash mismatch: {name}')
        return len(expected)


if __name__ == '__main__':
    try:
        print(f'PASS: verified {verify(sys.argv[1])} source files')
    except (ValueError, IndexError, OSError, KeyError) as exc:
        raise SystemExit(f'FAIL: {exc}') from exc
