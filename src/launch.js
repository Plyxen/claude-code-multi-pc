// `coop start`: launch Claude Code with the coop server loaded as a channel,
// so crew events reach the session while it sits idle.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coopHome, writePrivate } from './config.js'
import { WORKER_START_PROMPT, leadSystemPrompt, workerSystemPrompt } from './mcp/instructions.js'

const COOP_BIN = fileURLToPath(new URL('../bin/coop.js', import.meta.url))
const PERMISSION_MODES = ['acceptEdits', 'auto', 'bypassPermissions', 'manual', 'dontAsk', 'plan']

export function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN
  const names = process.platform === 'win32' ? ['claude.exe', 'claude.cmd', 'claude'] : ['claude']
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    for (const name of names) {
      const candidate = join(dir, name)
      if (dir && existsSync(candidate)) return candidate
    }
  }
  const native = join(homedir(), '.local', 'bin', process.platform === 'win32' ? 'claude.exe' : 'claude')
  return existsSync(native) ? native : null
}

export function claudeVersion(bin) {
  const result = runClaude(bin, ['--version'], { sync: true })
  return result.status === 0 ? String(result.stdout).trim() : null
}

// Build the claude command line for a profile. Option order matters: the
// list-valued options (--mcp-config, --dangerously-load-development-channels)
// are followed by another option, so the start prompt stays positional.
export function buildClaudeArgs(profile, { permissionMode, worktree = false, relay = true, prompt, extraArgs = [] } = {}) {
  const mcpConfigPath = join(coopHome(), 'run', `${profile.name}.mcp.json`)
  const env = { COOP_LAUNCHED: '1', ...(relay ? {} : { COOP_RELAY_PERMISSIONS: '0' }) }
  if (process.env.COOP_HOME) env.COOP_HOME = process.env.COOP_HOME
  const mcpConfig = {
    mcpServers: {
      coop: { command: process.execPath, args: [COOP_BIN, 'mcp', '--profile', profile.name], env },
    },
  }
  const isWorker = profile.role === 'worker'
  const mode = permissionMode ?? (isWorker ? profile.permissionMode ?? 'auto' : null)
  if (mode && !PERMISSION_MODES.includes(mode)) throw new Error(`Unknown permission mode "${mode}". Use one of: ${PERMISSION_MODES.join(', ')}`)

  const args = [
    '--mcp-config',
    mcpConfigPath,
    '--dangerously-load-development-channels',
    'server:coop',
    '--name',
    `coop ${profile.role} ${profile.member}`,
  ]
  if (mode) args.push('--permission-mode', mode)
  if (worktree) args.push('--worktree', `coop-${profile.member}`)
  args.push('--append-system-prompt', isWorker ? workerSystemPrompt(profile) : leadSystemPrompt(profile))
  args.push(...extraArgs)
  const startPrompt = prompt ?? (isWorker ? WORKER_START_PROMPT : null)
  if (startPrompt) args.push(startPrompt)
  return { args, mcpConfigPath, mcpConfig }
}

export function startClaude(profile, options = {}) {
  const bin = options.claudeBin ?? findClaude()
  if (!bin) {
    throw new Error('Claude Code (the `claude` command) was not found. Install it (https://code.claude.com/docs/en/quickstart), or point CLAUDE_BIN at it.')
  }
  const { args, mcpConfigPath, mcpConfig } = buildClaudeArgs(profile, options)
  if (options.dryRun) return { bin, args }
  writePrivate(mcpConfigPath, `${JSON.stringify(mcpConfig, null, 2)}\n`)
  const child = runClaude(bin, args)
  return new Promise((resolve) => {
    child.on('exit', (code) => resolve(code ?? 0))
    child.on('error', (error) => {
      console.error(`Couldn't start ${bin}: ${error.message}`)
      resolve(1)
    })
  })
}

// .cmd and .bat files (npm-installed claude on Windows) only run through the
// shell, so their arguments are quoted for cmd.exe.
function runClaude(bin, args, { sync = false } = {}) {
  const viaShell = process.platform === 'win32' && /\.(cmd|bat)$/i.test(bin)
  const run = sync ? spawnSync : spawn
  const options = sync ? { encoding: 'utf8' } : { stdio: 'inherit' }
  if (!viaShell) return run(bin, args, options)
  const quote = (arg) => `"${String(arg).replace(/"/g, "'").replace(/%/g, ' percent')}"`
  return run([bin, ...args].map(quote).join(' '), { ...options, shell: true })
}

export function commandLine(bin, args) {
  return [bin, ...args].map((arg) => (/[\s"']/.test(arg) ? JSON.stringify(arg) : arg)).join(' ')
}
