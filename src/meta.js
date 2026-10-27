// Where claude-code-multi-pc lives, for the install hints it prints.
export const REPO = 'Plyxen/claude-code-multi-pc'
export const INSTALL_COMMAND = `npm install -g github:${REPO}`

// What a lead sends a friend after inviting them. The token works like a
// password, so it goes in a DM, never in a public channel.
export function inviteText({ hub, name, token, crew }) {
  return [
    `You're invited to the claude-code-multi-pc crew "${crew}" as "${name}".`,
    '',
    '1. Install (needs Node.js 22.13+ and Claude Code):',
    `   ${INSTALL_COMMAND}`,
    '2. Join the crew:',
    `   coop join --hub ${hub} --token ${token}`,
    '3. In your copy of the project (a git clone you can push branches from):',
    '   coop start',
    '',
    `Setup guide: https://github.com/${REPO}/blob/main/docs/worker-setup.md`,
  ].join('\n')
}
