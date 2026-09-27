import { describe, expect, it } from "vitest";
import { runCodeInNodeWorker } from "@/lib/sandbox/node-runner";
import { gradeCode } from "@/server/grade-code";
describe("learner-authored test contracts",()=>{
  const regression={factoryName:"cases",referenceCode:"function eligible(n){return n>=18;}",mutants:["function eligible(n){return n>18;}"]};
  it("requires a valid regression case that catches the original defect",async()=>{
    const input={functionName:"eligible",tests:[{name:"adult",args:[20],expected:true,hidden:false}],regression};
    const safe="function eligible(n){return n>=18;}";
    expect((await runCodeInNodeWorker({...input,code:safe+"function cases(){return [{args:[20],expected:true}];}"})).passed).toBe(false);
    expect((await runCodeInNodeWorker({...input,code:safe+"function cases(){return [{args:[18],expected:true}];}"})).passed).toBe(true);
    expect((await runCodeInNodeWorker({...input,code:safe+"function cases(){return [{args:[18],expected:false}];}"})).passed).toBe(false);
  });
  it("checks compile-only assertions without executing submission side effects",async()=>{
    const request={functionName:"unused",tests:[],typeChecks:"const check: Label = 'ready';"};
    await expect(gradeCode({...request,code:"type Label = number;"},"typescript")).rejects.toThrow("did not compile");
    expect((await gradeCode({...request,code:"type Label = string; throw new Error('must not execute');"},"typescript")).passed).toBe(true);
  },20_000);
});
