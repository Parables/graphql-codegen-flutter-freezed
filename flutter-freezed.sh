#!/bin/bash

# get the location of the process
SCRIPT_PATH="${BASH_SOURCE}"
while [ -L "${SCRIPT_PATH}" ]; do
    SCRIPT_DIR="$(cd -P "$(dirname "${SCRIPT_PATH}")" >/dev/null 2>&1 && pwd)"
    SCRIPT_PATH="$(readlink "${SCRIPT_PATH}")"
    [[ ${SCRIPT_PATH} != /* ]] && SCRIPT_PATH="${SCRIPT_DIR}/${SCRIPT_PATH}"
done
SCRIPT_PATH="$(readlink -f "${SCRIPT_PATH}")"
SCRIPT_DIR="$(cd -P "$(dirname -- "${SCRIPT_PATH}")" >/dev/null 2>&1 && pwd)"

# get the current working directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "cwd    dir:==> ${DIR}"

# change into the process location so that it can use the `package.json` file there
cd "$SCRIPT_DIR" || exit

echo "target dir:==> ${DIR}"
echo "Script dir:==> ${SCRIPT_DIR}"

# fire the generator
npm run gen -- --config "$DIR/codegen.yml" "$@"
