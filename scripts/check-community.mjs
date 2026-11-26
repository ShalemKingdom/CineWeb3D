import {readFile,access} from 'node:fs/promises';
const required=['README.md','LICENSE','CONTRIBUTING.md','SECURITY.md','CODE_OF_CONDUCT.md','CHANGELOG.md','ROADMAP.md','.github/CODEOWNERS','.github/ISSUE_TEMPLATE/bug.yml','.github/ISSUE_TEMPLATE/feature.yml','.github/ISSUE_TEMPLATE/config.yml','.github/pull_request_template.md','docs/contributor-validation.md','docs/repository-protection.md','docs/release-readiness.md','.github/rulesets/main.json','.github/rulesets/sandbox.json'];
for(const path of required)await access(path);
const read=p=>readFile(p,'utf8');
const configs=[['main',JSON.parse(await read('.github/rulesets/main.json'))],['sandbox',JSON.parse(await read('.github/rulesets/sandbox.json'))]];
for(const [branch,c] of configs){
 if(c.target!=='branch'||c.enforcement!=='active'||c.bypass_actors.length||JSON.stringify(c.conditions.ref_name.include)!==JSON.stringify(['refs/heads/'+branch])||c.conditions.ref_name.exclude.length)throw Error('Invalid branch policy '+branch);
 for(const type of ['deletion','non_fast_forward'])if(!c.rules.some(r=>r.type===type))throw Error('Missing '+type);
}
const main=configs[0][1];
const pr=main.rules.find(r=>r.type==='pull_request')?.parameters;
if(!pr?.required_review_thread_resolution||pr.required_approving_review_count!==0)throw Error('Invalid solo-maintainer PR policy');
const checks=main.rules.find(r=>r.type==='required_status_checks')?.parameters;
if(!checks?.strict_required_status_checks_policy)throw Error('Strict status checks required');
const workflowMap={build:'ci.yml',shield:'security-shield.yml',skill:'agent-skill.yml',showcase:'commercial-showcase.yml',quality:'seo-performance.yml',media:'video-smoke.yml',community:'community-readiness.yml'};
if(JSON.stringify(checks.required_status_checks.map(x=>x.context).sort())!==JSON.stringify(Object.keys(workflowMap).sort()))throw Error('Required checks differ');
for(const [job,file] of Object.entries(workflowMap)){
 const body=await read('.github/workflows/'+file);
 if(!body.includes('pull_request')||!body.includes('\n  '+job+':')||!body.includes('contents: read'))throw Error('Missing PR job or permissions: '+job);
}
console.log('Community readiness:',required.length,'files, 2 proposed rulesets and',Object.keys(workflowMap).length,'PR checks verified locally. GitHub settings are NOT activated by this check.');
