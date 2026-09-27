import { useState } from "react";
export function App({initial=0}:{initial?:number}) { const [count,setCount]=useState(initial); return <div><output>{count}</output><button onClick={()=>{setCount(value=>value+1);setCount(value=>value+1);}}>Add two</button></div>; }
