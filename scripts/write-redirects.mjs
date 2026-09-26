// Writes dist/_redirects so the netlify.app URL redirects to the custom domain.
// Hostnames come from env vars set in Netlify, so they stay out of the repo.
import { appendFileSync, mkdirSync } from 'node:fs'

const { NETLIFY_HOST, CUSTOM_DOMAIN } = process.env

if (NETLIFY_HOST && CUSTOM_DOMAIN) {
  mkdirSync('dist', { recursive: true })
  appendFileSync(
    'dist/_redirects',
    `https://${NETLIFY_HOST}/* https://${CUSTOM_DOMAIN}/:splat 301!\n` +
      `http://${NETLIFY_HOST}/* https://${CUSTOM_DOMAIN}/:splat 301!\n`
  )
}
