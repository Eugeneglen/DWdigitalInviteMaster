#!/bin/bash
# dev.sh — launches Next.js with memory constraints for the 3.9GB sandbox
# Tailwind CSS is pre-generated (tailwind-output.css) to bypass PostCSS worker OOM.
# To regenerate CSS after adding new Tailwind classes:
#   NODE_OPTIONS="--max-old-space-size=768" npx tailwindcss -i src/app/tailwind-input.css -o src/app/tailwind-output.css --minify

cd "$(dirname "$0")"
export NODE_OPTIONS="--max-old-space-size=512"
exec bun run dev