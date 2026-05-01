#!/bin/sh
# Keep the placeholder container alive. The real runtime is provided by
# @cloudflare/sandbox once the SDK image replaces this scaffold.
exec tail -f /dev/null
