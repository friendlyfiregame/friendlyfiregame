#!/usr/bin/env bash

# Prerequisites:
# This script uses id3v2 and ffmpeg to convert the Ogg Vorbis files
# used by the game to MP3 files that can be published on Steam.

source_files="${SOUNDTRACK_SOURCE_FILES:-"$(find ./assets/music -name "*.ogg")"}"
target_dir="${SOUNDTRACK_TARGET_DIR:-"./dist/soundtrack"}"

#/**
# $1 - source filename
# $2 - target directory
#*
function convert_and_rename() {
    local source_file="${1}" target_dir="${2}" target_file
    if [ ! -d "${target_dir}" ]; then
        echo "Not a directory: \"${target_dir}\"" >&2
        return 1
    fi
    trck="$(id3v2 -l "${source_file}" | grep '^TRCK' | sed 's/^TRCK.*: //' | sed 's/\/.*$//' | sed 's/\<\([0-9]\{1\}\)\>/0\1/; s/\<0*\([0-9]\{2\}\)\>/\1/')"
    tit2="$(id3v2 -l "${source_file}" | grep '^TIT2' | sed 's/^TIT2.*: //' | tr '[:upper:]' '[:lower:]' | sed 's/[ -()]/_/g')"
    target_file="${target_dir}/${trck}_${tit2}.mp3"
    if [ -f "${target_file}" ]; then
        # Target file does already exist. Delete it before we proceed.
        rm "${target_file}"
    fi
    ffmpeg -i "${source_file}" -map_metadata 0:s:0 -id3v2_version 3 -write_id3v1 1 "${target_file}"
}


#/**
# $1 - source directory to be packed
# $2 - target zip file
#*
function create_zip_bundle() {
    local source_dir target_file target_dir target_file_abs target_dir_abs
    source_dir="${1}"
    target_file="${2}"
    target_dir="$(dirname "${target_file}")"
    target_dir_abs="$(readlink -e "${target_dir}")"
    target_file_abs="${target_dir_abs}/$(basename "${target_file}")"

    if [ ! -d "${source_dir}" ]; then
        echo "Not a directory: \"${source_dir}\"" >&2
        return 1
    fi
    if [ ! -d "${target_dir_abs}" ]; then
        echo "Not a directory: \"${target_dir_abs}\"" >&2
        return 1
    fi
    (
        cd "${source_dir}" || (echo "Failed to change to directory: \"source\"" >&2; exit 1)
        zip -r "${target_file_abs}" "." || (echo "Failed to create zip file: \"${target_file_abs}\"" >&2; exit 1)
    )
}

set -e -u -o pipefail

if [ ! -d "${target_dir}" ]; then
    mkdir -p "${target_dir}"
fi

for source_file in ${source_files}; do
    convert_and_rename "${source_file}" "${target_dir}"
done
create_zip_bundle "${target_dir}" "${target_dir}/bundle.zip"
