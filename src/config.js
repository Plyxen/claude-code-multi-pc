// Local settings: ~/.claude-coop/config.json holds one profile per crew you
// joined (hub URL, token, your name and role). Tokens never go into a project.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PROFILE_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/

export function coopHome() {
  return process.env.COOP_HOME || join(homedir(), '.claude-coop')
}

function configPath() {
  return join(coopHome(), 'config.json')
}

export function loadConfig() {
  try {
    const config = JSON.parse(readFileSync(configPath(), 'utf8'))
    return { profiles: {}, ...config }
  } catch (error) {
    if (error.code === 'ENOENT') return { profiles: {} }
    throw new Error(`Can't read ${configPath()}: ${error.message}`)
  }
}

export function saveConfig(config) {
  writePrivate(configPath(), `${JSON.stringify(config, null, 2)}\n`)
}

export function getProfile(name) {
  const config = loadConfig()
  const profileName = name || process.env.COOP_PROFILE || config.default
  if (!profileName) throw new Error('You haven\'t joined a crew yet. Run: coop join --hub <url> --token <token>')
  const profile = config.profiles[profileName]
  if (!profile) {
    const known = Object.keys(config.profiles)
    throw new Error(`No crew profile named "${profileName}". ${known.length ? `Yours: ${known.join(', ')}` : 'Join a crew first: coop join --hub <url> --token <token>'}`)
  }
  return { name: profileName, ...profile }
}

export function saveProfile(name, profile) {
  if (!PROFILE_RE.test(name)) throw new Error(`Profile name "${name}" is not valid: use lowercase letters, digits, - and _.`)
  const config = loadConfig()
  config.profiles[name] = profile
  if (!config.default || !config.profiles[config.default]) config.default = name
  saveConfig(config)
  return config
}

export function setDefaultProfile(name) {
  const config = loadConfig()
  if (!config.profiles[name]) throw new Error(`No crew profile named "${name}".`)
  config.default = name
  saveConfig(config)
}

export function profileSlug(text) {
  const slug = String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return slug || 'default'
}

// Per-profile state for the MCP server (the event cursor), so a restarted
// session doesn't replay old events.
export function readState(profileName) {
  try {
    return JSON.parse(readFileSync(join(coopHome(), 'state', `${profileName}.json`), 'utf8'))
  } catch {
    return {}
  }
}

export function writeState(profileName, state) {
  writePrivate(join(coopHome(), 'state', `${profileName}.json`), JSON.stringify(state))
}

export function writePrivate(path, text) {
  mkdirSync(join(path, '..'), { recursive: true })
  const temp = `${path}.${process.pid}.tmp`
  writeFileSync(temp, text, { mode: 0o600 })
  renameSync(temp, path)
}
