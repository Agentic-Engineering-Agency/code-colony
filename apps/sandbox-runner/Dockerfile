# Placeholder image for the sandbox-runner Worker.
#
# Per ADR-0001, the agent runtime is supplied by the @cloudflare/sandbox SDK
# (see https://github.com/cloudflare/sandbox-sdk). This Dockerfile exists so
# wrangler.toml's [[containers]] block has a buildable image while the runner
# is scaffolded; it is intentionally minimal and is not pushed to a registry
# at this stage. CC-SBX-03 swaps it for the SDK-published runtime image.

FROM node:20-alpine

RUN apk add --no-cache git bash

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /workspace

EXPOSE 3000

CMD ["/entrypoint.sh"]
