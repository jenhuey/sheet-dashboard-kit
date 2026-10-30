// Show the live version / access / URL of a project's dashboard.
// usage: node deployment_info.mjs <project dir>
import path from 'node:path';
import { deploymentInfo, fail, readJson } from './lib.mjs';

if (!process.argv[2]) fail('usage: node deployment_info.mjs <project dir>');
const p = readJson(path.join(path.resolve(process.argv[2]), 'project.json'));
console.log(JSON.stringify(await deploymentInfo(p.scriptId, p.deploymentId), null, 1));
