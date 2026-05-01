#!/usr/bin/env bash
# Attach codecolony.online as a custom domain to the Cloudflare Pages project
# code-colony-landing. Idempotent: re-attaches/repairs if the domain is present
# but not in a healthy verified state.
#
# Environment:
#   CLOUDFLARE_ACCOUNT_ID  (required)
#   CLOUDFLARE_API_TOKEN   (required)
#
# This is used by cd-prod.yml because Alchemy's Cloudflare provider does not
# expose a Pages resource, so we attach the apex domain directly via the
# Cloudflare API. Once attached, Cloudflare manages the apex DNS record
# automatically (proxying + TLS).

set -euo pipefail

DOMAIN="${1:-codecolony.online}"
PROJECT="code-colony-landing"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"
TOKEN="${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"

API_BASE="https://api.cloudflare.com/client/v4"
AUTH_HDR="Authorization: Bearer ${TOKEN}"

echo "==> Checking existing domains on Pages project '${PROJECT}' ..."

# Fetch the existing domain entry once and inspect both name (canonical) and
# status. The API response field is `.result[].name`; older docs reference
# `.domain`, but the live shape is `name`. We accept either to be safe.
EXISTING_JSON=$(curl -sS -H "${AUTH_HDR}" \
  "${API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains")

EXISTING_ENTRY=$(echo "${EXISTING_JSON}" | jq -c \
  --arg dom "${DOMAIN}" \
  '.result[]? | select((.name // .domain) == $dom)')

if [ -n "${EXISTING_ENTRY}" ]; then
  STATUS=$(echo "${EXISTING_ENTRY}" | jq -r '.status // .verification_data.status // "unknown"')
  echo "==> Domain '${DOMAIN}' already attached (status=${STATUS})."
  case "${STATUS}" in
    active|pending|verifying|ssl_pending|deployment_pending|initializing)
      echo "==> Status is healthy/in-progress. Nothing to do."
      exit 0
      ;;
    *)
      echo "==> Status '${STATUS}' is not healthy; will attempt re-attach."
      ;;
  esac
fi

echo "==> Attaching '${DOMAIN}' to Pages project '${PROJECT}' ..."

RESPONSE=$(curl -sS -H "${AUTH_HDR}" -H "Content-Type: application/json" \
  -X POST \
  "${API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains" \
  -d "{\"name\":\"${DOMAIN}\"}")

SUCCESS=$(echo "${RESPONSE}" | jq -r '.success')

if [ "${SUCCESS}" != "true" ]; then
  ERRORS=$(echo "${RESPONSE}" | jq -r '.errors[]?.message // .errors // empty')
  # If the error says the domain already exists, treat as success
  if echo "${ERRORS}" | grep -qi "already exists\|already added\|duplicate"; then
    echo "==> Domain '${DOMAIN}' already exists (race or previous run). Treating as success."
    exit 0
  fi
  echo "ERROR: Failed to attach domain '${DOMAIN}': ${ERRORS}" >&2
  echo "Full response: ${RESPONSE}" >&2
  exit 1
fi

echo "==> Domain '${DOMAIN}' attached successfully."
echo "==> Cloudflare will provision the apex DNS record and TLS certificate automatically."

# Verify by listing domains again
echo "==> Current domains on '${PROJECT}':"
curl -sS -H "${AUTH_HDR}" \
  "${API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains" \
  | jq -r '.result[]? | "\(.name // .domain // "?") (\(.status // "?"))"'

exit 0
