#!/usr/bin/env bash
set -euo pipefail

STE_VERSION="0.2.1"
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
		aarch64-apple-darwin) echo "5fadef756a9a08513f879a3b202ac75ca2371da1443d821f41291d848bafb521" ;;
		x86_64-apple-darwin) echo "1ee11f5994c93b118a6e6a819c81dc3a01c73ca18c1039b206cad965d8ba7a0b" ;;
		aarch64-unknown-linux-musl) echo "f75273b7879d664e32b9e20c8c78d90fd0ce19637b764c3b8d0ac6cbb33f10f4" ;;
		x86_64-unknown-linux-musl) echo "5adcbf43f45dce740740b17078977b2ebf5b18f6d28ee90b65448bccf6c9cce7" ;;
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
