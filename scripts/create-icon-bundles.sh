#!/usr/bin/env bash

# This script can be used to create favicon.ico and appicon.ico

_convert="$(command -v convert)"
if [ -z "${_convert}" ] || [ "${_convert}" == "" ]; then
    echo "convert command not found. Install ImageMagick."
    exit 1
fi

favicon_sizes=("16" "32" "128")
appicon_sizes=("16" "32" "64" "128" "256" "512" "1024")

function create_ico() {
    local dest="${1:-""}"
    local sizes="${2:-""}"

    if [ -z "${dest}" ]; then
        echo "Destination file name not specified."
        exit 1
    fi

    if [ -z "${sizes}" ]; then
        echo "Input sizes not specified."
        exit 1
    fi

    local sources=()
    for size in ${sizes}; do
        sources+=("./assets/appicon.iconset/icon_${size}x${size}.png")
    done
    $_convert "${sources[@]}" "${dest}"
}

set -e -u -o pipefail
create_ico "./assets/favicon.ico" "${favicon_sizes[*]}"
create_ico "./assets/appicon.ico" "${appicon_sizes[*]}"
