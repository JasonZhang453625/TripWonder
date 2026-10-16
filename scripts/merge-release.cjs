// Keep original contributor commits; the owner creates the production merge commit.
const {execFileSync} = require('node:child_process');
const OWNER = 'JasonZhang453625', REPO = `${OWNER}/TripWonder`;
function gh(args) {
  return execFileSync('gh', args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
}
function json(args) { return JSON.parse(gh(args)); }
function assert(value, message) { if (!value) throw new Error(message); }
function main() {
  const args = process.argv.slice(2), checkOnly = args.includes('--check');
  assert(args.every(arg => arg === '--check' || /^[1-9]\d*$/.test(arg)) &&
    args.filter(arg => /^[1-9]\d*$/.test(arg)).length === 1,
  'Usage: npm run release:merge -- <PR number> [--check]');
  const number = args.find(arg => /^[1-9]\d*$/.test(arg));
  assert(json(['api', 'user']).login === OWNER, `Sign in to gh as ${OWNER} before publishing.`);
  const pr = json(['pr', 'view', number, '--repo', REPO, '--json',
    'state,isDraft,baseRefName,headRefOid,mergeable,statusCheckRollup']);
  assert(pr.state === 'OPEN' && !pr.isDraft && pr.baseRefName === 'main', 'PR must be open, ready and target main.');
  assert(pr.mergeable === 'MERGEABLE', 'Resolve conflicts or wait for GitHub to finish mergeability checks.');
  const checks = pr.statusCheckRollup || [];
  assert(checks.some(check => check.name === 'Build and test' && check.conclusion === 'SUCCESS'),
    'The GitHub Build and test check must pass for this exact PR head.');
  const statuses = json(['api', `repos/${REPO}/commits/${pr.headRefOid}/status`]).statuses;
  for (const check of checks) {
    if (check.context === 'Vercel') {
      const status = statuses.find(item => item.context === 'Vercel');
      if (status?.state === 'failure' && /Deployment was blocked|must have access to the project/i.test(status.description || '')) continue;
    }
    const passed = check.__typename === 'StatusContext' ? check.state === 'SUCCESS' :
      check.status === 'COMPLETED' && ['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(check.conclusion);
    assert(passed, `Check is pending or failed: ${check.name || check.context}`);
  }
  if (checkOnly) { console.log(`Ready: PR #${number} at ${pr.headRefOid}; merge commit by ${OWNER}.`); return; }
  gh(['pr', 'merge', number, '--repo', REPO, '--merge', '--match-head-commit', pr.headRefOid]);
  const result = json(['pr', 'view', number, '--repo', REPO, '--json', 'state,mergeCommit,url']);
  assert(result.state === 'MERGED', 'GitHub has not confirmed the merge.');
  const commit = json(['api', `repos/${REPO}/commits/${result.mergeCommit.oid}`]);
  assert(commit.author?.login === OWNER && commit.parents.length === 2,
    'Merged, but author/parents need verification before claiming deployment success.');
  console.log(`Merged ${result.url}\nCommit: ${result.mergeCommit.oid}\nAuthor: ${commit.author.login}\nWait for Vercel Ready and verify production before reporting it live.`);
}
try { main(); } catch (error) {
  console.error(error.stderr?.toString().trim() || error.message);
  process.exitCode = 1;
}
