#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"
REPO='https://github.com/FatesPassage/Social-Eyes.git'
DEST="$HOME/Social-Eyes-GitHub"
printf '\nSocial Eyes | GitHub source publisher\n'
command -v git >/dev/null || { echo 'Install Git via xcode-select --install'; exit 1; }
command -v python3 >/dev/null || { echo 'Install Python 3'; exit 1; }
python3 - "$ROOT" <<'PYINNER'
import importlib.util, pathlib, sys
root=pathlib.Path(sys.argv[1])
spec=importlib.util.spec_from_file_location('pack',root/'scripts/package-project.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
print('Validated',len(module.source_files(root/'__not_an_archive__.zip')),'source files for transfer')
PYINNER
if [ ! -d "$DEST/.git" ]; then
  if [ -e "$DEST" ]; then echo "Refusing to overwrite $DEST"; exit 1; fi
  git clone "$REPO" "$DEST"
fi
cd "$DEST"
if [ "$(git remote get-url origin)" != "$REPO" ]; then echo 'Unexpected Git remote'; exit 1; fi
if [ -n "$(git status --porcelain)" ]; then echo 'Checkout has uncommitted changes; stopping'; exit 1; fi
git pull --ff-only origin main
python3 - "$ROOT" "$DEST" <<'PYINNER'
import importlib.util,pathlib,shutil,sys
root,dest=map(pathlib.Path,sys.argv[1:])
spec=importlib.util.spec_from_file_location('pack',root/'scripts/package-project.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
files=module.source_files(root/'__not_an_archive__.zip')
for name,_ in files:
    target=dest/name
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(root/name,target)
print('Copied',len(files),'source files into private Git checkout')
PYINNER
git add -A
if git diff --cached --quiet; then
  echo 'Source already matches the checkout.'
else
  git diff --cached --stat
  printf '\nPress Return to publish these files, or Control-C to cancel: '
  read -r _
  git commit -m 'Import complete Social Eyes Phase 1 application source'
  git push origin main
fi
printf '\nPublished source: https://github.com/FatesPassage/Social-Eyes\n'
read -r -p 'Press Return to close... ' _ || true
