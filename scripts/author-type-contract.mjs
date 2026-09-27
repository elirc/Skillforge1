import { mkdir, writeFile } from 'node:fs/promises';
const directory='content/typescript-starter/12-compile-time-contracts/01-model-safe-patches';
await mkdir(directory,{recursive:true});
await writeFile('content/typescript-starter/12-compile-time-contracts/module.json',JSON.stringify({id:'sf_typescript_compile_contracts',title:'Compile-time contracts'},null,2)+'\n');
const typeChecks=`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Require<T extends true> = T;
type CheckKeys = Require<Equal<keyof ProductPatch, 'name' | 'price'>>;
type CheckName = Require<Equal<ProductPatch['name'], string | undefined>>;
type CheckPrice = Require<Equal<ProductPatch['price'], number | undefined>>;
const partial: ProductPatch = { name: 'Pen' };
const empty: ProductPatch = {};
// @ts-expect-error IDs cannot be patched
const badId: ProductPatch = { id: 'other' };
// @ts-expect-error prices remain numbers
const badPrice: ProductPatch = { price: 'cheap' };`;
await writeFile(`${directory}/lesson.json`,JSON.stringify({id:'sf_typescript_safe_patch',title:'Model a Safe Patch: Compile-only Lab',estimatedMinutes:15,contentBlocks:[{type:'prose',body:'A patch can omit fields while preserving the type of fields it includes. It should not expose an immutable ID. Compose Omit and Partial instead of copying the entity shape by hand. This lab grades compiler assertions, including rejected examples, without running JavaScript.'},{type:'code-example',language:'typescript',code:"interface Person { id: string; nickname: string; }\ntype Rename = Partial<Omit<Person, 'id'>>;\nconst change: Rename = { nickname: 'Ada' };"},{type:'callout',tone:'warning',body:'Partial<Product> still allows an ID. A broad Record or any removes useful guarantees. The exact key and property assertions below detect those shortcuts.'},{type:'prose',body:'Define ProductPatch so name and price are optional with their original types, and id is excluded. Read diagnostics as feedback about the contract. @ts-expect-error itself fails if an invalid example becomes accepted, so negative cases matter too.'}],knowledgeItems:[{id:'sf_typescript_safe_patch_code',type:'CODE',prompt:'Define ProductPatch with optional name and price, excluding id.',conceptTags:['typescript','utility-types','testing'],exercise:'patch',language:'typescript',typeChecks,hints:['Remove id before making the remaining properties optional.','Compose Partial with Omit; preserve the original Product definition.'],walkthrough:'Omit<Product, id> removes the immutable key. Partial makes the remaining properties optional without widening their value types. Positive and negative assignments protect the contract.'}]},null,2)+'\n');
const header='interface Product { id: string; name: string; price: number; }\n';
await writeFile(`${directory}/patch.starter.ts`,header+'type ProductPatch = Product;\nexport {};\n');
await writeFile(`${directory}/patch.solution.ts`,header+"export type ProductPatch = Partial<Omit<Product, 'id'>>;\nexport {};\n");
await writeFile(`${directory}/patch.tests.ts`,'export const functionName = "typeContract";\nexport const tests = [{name:"Compile-time contract",args:[],expected:true}];\n');
