import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const run=spawnSync(process.execPath,[require.resolve('tsx/cli'),'scripts/validate-content.ts'],{stdio:'inherit',windowsHide:true,env:{...process.env,SKILLFORGE_CONTENT_COURSES:'react-integration-labs,csharp-foundations,typescript-starter'}});
process.exitCode=run.status??1;
