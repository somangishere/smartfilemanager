import { useState,useEffect,useRef } from "react";
import API from "../api/api";
import {
 Sparkles,
 Search as SearchIcon,
 Send,
 Trash2
} from "lucide-react";


export default function Search({
 chatSessions,
 setChatSessions,
 activeChat
}){

const [query,setQuery]=useState("");
const [loading,setLoading]=useState(false);

const bottomRef=useRef(null);



const activeSession=
chatSessions.find(
 c=>c.id===activeChat
)

const messages=
activeSession?.messages || [];



useEffect(()=>{

bottomRef.current?.scrollIntoView({
 behavior:"smooth"
})

},[messages,loading])



const handleSearch = async()=>{

if(!query.trim() || loading) return;

const currentQuery=query.trim();

let currentChatId=activeChat;


// create first session if none
if(!currentChatId){

 currentChatId="chat-"+Date.now();

 const firstChat={
   id:currentChatId,
   title:
    currentQuery.length>28
     ? currentQuery.slice(0,28)+"..."
     : currentQuery,
   messages:[]
 }

 setChatSessions(prev=>[
   firstChat,
   ...prev
 ])

}



const userMessage={
 role:"user",
 content:currentQuery
}



// append user + auto rename "New Chat"
setChatSessions(prev=>
prev.map(chat=>
 chat.id===currentChatId
 ?{
   ...chat,

   title:
    chat.title==="New Chat"
     ? (
       currentQuery.length>28
       ? currentQuery.slice(0,28)+"..."
       : currentQuery
      )
     : chat.title,

   messages:[
    ...chat.messages,
    userMessage
   ]
 }
 :chat
)
)



setQuery("");
setLoading(true);



try{

const res=await API.post(
 `/ask?query=${encodeURIComponent(currentQuery)}`
)


const aiMessage={
 role:"assistant",
 content:
  res.data.answer ||
  "No answer found.",
 sources:
  res.data.sources || []
}



setChatSessions(prev=>
prev.map(chat=>
 chat.id===currentChatId
 ?{
   ...chat,
   messages:[
     ...chat.messages,
     aiMessage
   ]
 }
 :chat
)
)

}

catch(err){

console.error(err);

const errMessage={
 role:"assistant",
 content:"Error retrieving response."
}

setChatSessions(prev=>
prev.map(chat=>
 chat.id===currentChatId
 ?{
   ...chat,
   messages:[
     ...chat.messages,
     errMessage
   ]
 }
 :chat
)
)

}

finally{
 setLoading(false)
}

}


const clearChat=()=>{

if(!activeChat) return

setChatSessions(prev=>
prev.map(chat=>
 chat.id===activeChat
 ?{
   ...chat,
   messages:[]
 }
 :chat
)
)

}



return(

<div className="flex flex-col h-[calc(100vh-80px)]">

<div className="flex-1 overflow-y-auto">


{/* HEADER */}
<div className="flex items-center justify-between mb-6">

<div className="flex items-center gap-2">

<Sparkles
size={18}
className="text-accent-600"
/>

<h1 className="text-lg font-semibold text-ink-900">
Document Search
</h1>

<span className="
text-sm
bg-white/5
px-2
py-0.5
rounded-full
text-ink-500
font-mono
">
{messages.filter(
m=>m.role==="user"
).length} search
</span>

</div>


<button
onClick={clearChat}
className="
flex
items-center
gap-1.5
text-sm
text-ink-500
hover:text-red-600
transition
"
>
<Trash2 size={14}/>
Clear History
</button>

</div>



{/* EMPTY */}
{messages.length===0 &&(

<div className="
flex
items-center
justify-center
h-[65vh]
text-ink-400
text-sm
">
Ask anything about your documents...
</div>

)}



{/* THREAD */}
<div className="space-y-6">

{messages.map((msg,index)=>(

<div key={index}>


{msg.role==="user" &&(

<div className="flex justify-end">

<div className="
bg-paper-200
border
border-accent-200/30
text-ink-900
px-5
py-3
rounded-2xl
max-w-xl
">
{msg.content}
</div>

</div>

)}



{msg.role==="assistant" &&(

<div className="
glass-soft
rounded-2xl
p-6
">

<div className="
flex
items-center
gap-2
mb-3
">

<Sparkles
size={16}
className="text-accent-600"
/>

<p className="font-semibold text-ink-900">
Assistant
</p>

</div>


<p className="
text-sm
text-ink-700
whitespace-pre-line
leading-relaxed
">
{msg.content}
</p>



{msg.sources?.length>0 &&(

<div className="
mt-5
space-y-3
">

<p className="
text-xs
uppercase
tracking-wide
text-ink-400
">
Sources
</p>


{msg.sources.map((doc,i)=>(

<div
key={i}
className="
glass-soft
rounded-xl
p-4
"
>

<p className="font-medium text-ink-900">
{doc.file_name || "Unknown.pdf"}
</p>

<p className="
text-sm
text-ink-500
mt-1
">
{doc.summary || "No summary"}
</p>

</div>

))}

</div>

)}

</div>

)}

</div>

))}



{loading&&(

<div className="
glass-soft
rounded-2xl
p-6
">

<div className="
flex
items-center
gap-2
">

<Sparkles
size={16}
className="
text-accent-600
animate-pulse
"
/>

<p className="
text-sm
text-ink-500
">
Thinking...
</p>

</div>

</div>

)}

<div ref={bottomRef}/>

</div>

</div>




{/* INPUT */}
<div className="
sticky
bottom-0
bg-paper
pt-4
pb-2
">

<div className="
glass-soft
flex
items-center
gap-3
rounded-full
px-4
py-3
focus-within:ring-1
focus-within:ring-accent-500
">

<SearchIcon
size={18}
className="text-ink-400"
/>


<input
value={query}
onChange={(e)=>
setQuery(e.target.value)
}
placeholder="Ask anything about your documents..."
className="
flex-1
bg-transparent
outline-none
text-sm
text-ink-900
placeholder-ink-400
"
onKeyDown={(e)=>{
if(e.key==="Enter"){
handleSearch()
}
}}
/>


<button
type="button"
onClick={handleSearch}
disabled={loading}
className="
bg-accent-500
text-paper-200
p-2
rounded-full
hover:bg-accent-600
active:scale-[0.98]
disabled:opacity-50
transition
"
>
<Send size={16}/>
</button>


</div>


<p className="
text-xs
text-ink-400
mt-2
text-center
">
Press Enter to send
</p>

</div>


</div>

)

}