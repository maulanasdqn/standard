#!/usr/bin/env bash
set -euo pipefail

STE_VERSION="0.2.2"
STE_RELEASES="https://github.com/maulanasdqn/llm-airlines-standard/releases/download"
INSTALL_DIR="${STE_INSTALL_DIR:-$HOME/.local/bin}"

target_of() {
	local machine
	case "$(uname -m)" in
		x86_64 | amd64) machine="x86_64" ;;
		arm64 | aarch64) machine="aarch64" ;;
		*) echo "ste-install: no ste build for the machine $(uname -m)" >&2; exit 1 ;;
	esac
	case "$(uname -s)" in
		Darwin) echo "$machine-apple-darwin" ;;
		Linux) echo "$machine-unknown-linux-musl" ;;
		*) echo "ste-install: no ste build for the system $(uname -s)" >&2; exit 1 ;;
	esac
}

sha256_of_target() {
	case "$1" in
		aarch64-apple-darwin) echo "8b8b8f34ae7556bb4005d62171d45192d05dfaf1ba054379f3fe7e63362054b9" ;;
		x86_64-apple-darwin) echo "73c0c4313e014e48f5c56038101bd6fa454083701b4c51a471558393c3e20df5" ;;
		aarch64-unknown-linux-musl) echo "f8abcecd20b50d28a8ecfc8ce29f5051c39fa57baea04e97113fa476290100b0" ;;
		x86_64-unknown-linux-musl) echo "e048a707e564683f796f7c54d71091192b37b52924b34612935c4b4e31b7d369" ;;
	esac
}

sha256_of_file() {
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$1" | cut -d' ' -f1
	else
		shasum -a 256 "$1" | cut -d' ' -f1
	fi
}

if command -v ste >/dev/null 2>&1 && [ "$(ste --version)" = "ste $STE_VERSION" ]; then
	echo "ste $STE_VERSION is already installed"
	exit 0
fi

target="$(target_of)"
archive="ste-$target.tar.gz"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

curl -fsSL "$STE_RELEASES/v$STE_VERSION/$archive" -o "$work/$archive"

if [ "$(sha256_of_file "$work/$archive")" != "$(sha256_of_target "$target")" ]; then
	echo "ste-install: the SHA-256 of $archive is not the pinned value. Do not use this download" >&2
	exit 1
fi

tar -xzf "$work/$archive" -C "$work"
mkdir -p "$INSTALL_DIR"
install -m 0755 "$work/ste" "$INSTALL_DIR/ste"
echo "Installed ste $STE_VERSION in $INSTALL_DIR"

if [ -n "${GITHUB_PATH:-}" ]; then
	echo "$INSTALL_DIR" >>"$GITHUB_PATH"
elif ! command -v ste >/dev/null 2>&1; then
	echo "Add $INSTALL_DIR to PATH, so that the git hooks can find ste"
fi
