import { useState } from "react";
export function App() { const [name,setName]=useState(""); const valid=name.trim().length>0; return <form onSubmit={e=>e.preventDefault()}><label htmlFor="name">Name</label><input id="name" value={name} onChange={e=>setName(e.target.value)}/><p role="status">{valid?"Ready":"Name is required"}</p><button disabled={!valid}>Save</button></form>; }
