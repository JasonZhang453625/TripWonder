const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../scripts/merge-release.cjs'), 'utf8');
const owner = 'JasonZhang453625';
function run(options = {}) {
  const calls = [], errors = [], logs = [];
  const pr = {state: 'OPEN', isDraft: false, baseRefName: 'main', headRefOid: 'checked-head',
    mergeable: 'MERGEABLE', statusCheckRollup: [
      {__typename: 'CheckRun', name: 'Build and test', status: 'COMPLETED', conclusion: 'SUCCESS'},
      {__typename: 'StatusContext', context: 'Vercel', state: 'FAILURE'}
    ], ...options.pr};
  const process = {argv: ['node', 'script', '123', ...(options.checkOnly ? ['--check'] : [])]};
  function execFileSync(binary, args) {
    assert.equal(binary, 'gh'); calls.push(args);
    if (args[0] === 'api') {
      if (args[1] === 'user') return JSON.stringify({login: options.login || owner});
      if (args[1].endsWith('/status')) return JSON.stringify({statuses: [{context: 'Vercel', state: 'failure',
        description: options.vercelError || 'Git author contributor must have access to the project on Vercel to create deployments.'}]});
      return JSON.stringify({author: {login: options.mergedAuthor || owner}, parents: [{}, {}]});
    }
    if (args[1] === 'merge') return '';
    if (args.at(-1) === 'state,mergeCommit,url') return JSON.stringify({state: 'MERGED', mergeCommit: {oid: 'merged'}, url: 'https://github.com/example/pull/123'});
    return JSON.stringify(pr);
  }
  vm.runInNewContext(source, {require: name => {
    assert.equal(name, 'node:child_process'); return {execFileSync};
  }, process, console: {log: value => logs.push(value), error: value => errors.push(value)}});
  return {calls, errors, logs, failed: process.exitCode === 1,
    merges: calls.filter(args => args[0] === 'pr' && args[1] === 'merge')};
}
test('owner release preserves contributor history and locks the checked head', () => {
  const result = run(); assert.equal(result.failed, false); assert.equal(result.merges.length, 1);
  assert.ok(result.merges[0].includes('--merge')); assert.ok(!result.merges[0].includes('--squash'));
  assert.equal(result.merges[0].at(-1), 'checked-head');
  assert.equal(result.merges[0].at(-2), '--match-head-commit');
});
test('check-only performs no merge', () => { const result = run({checkOnly: true}); assert.equal(result.failed, false); assert.equal(result.merges.length, 0); });
test('collaborator cannot publish under their own login', () => { const result = run({login: 'contributor'}); assert.equal(result.failed, true); assert.equal(result.merges.length, 0); });
test('missing or failing build and unresolved conflicts block the merge', () => {
  for (const pr of [{statusCheckRollup: []}, {statusCheckRollup: [{name: 'Build and test', conclusion: 'FAILURE'}]}, {mergeable: 'CONFLICTING'}, {isDraft: true}, {baseRefName: 'other'}]) {
    const result = run({pr}); assert.equal(result.failed, true); assert.equal(result.merges.length, 0);
  }
});
test('a real Vercel build failure cannot be treated as an author restriction', () => {
  const result = run({vercelError: 'Deployment has failed'}); assert.equal(result.failed, true); assert.equal(result.merges.length, 0);
});
test('unexpected merged author prevents reporting publication success', () => {
  const result = run({mergedAuthor: 'contributor'}); assert.equal(result.failed, true); assert.match(result.errors[0], /author\/parents/);
});
