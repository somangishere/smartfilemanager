import { NavLink, useNavigate } from "react-router-dom";
import {
 LayoutDashboard,
 Upload,
 FileText,
 Search,
 MessageSquare,
 Plus,
 Trash2
} from "lucide-react";

export default function Sidebar({
 chatSessions=[],
 setChatSessions,
 activeChat,
 setActiveChat
}) {

const navigate = useNavigate();

const base =
"relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200";



/* OPEN EXISTING CHAT */
const openChat=(chatId)=>{
 setActiveChat(chatId);
 navigate("/search");
};



/* NEW CHAT */
const createNewChat=()=>{

 const newChatId="chat-"+Date.now();

 const newChat={
   id:newChatId,
   title:"New Chat",
   messages:[]
 };


 // reset dulu biar gak nabrak session lama
 setActiveChat(null);

 setTimeout(()=>{

   setChatSessions(prev=>[
      newChat,
      ...prev
   ]);

   setActiveChat(newChatId);

   navigate("/search");

 },50);

};



/* DELETE CHAT */
const deleteChat=(e,chatId)=>{

 e.stopPropagation();

 const filtered=
  chatSessions.filter(
   c=>c.id!==chatId
  );

 setChatSessions(filtered);


 if(activeChat===chatId){

   if(filtered.length>0){

      // pindah ke chat berikutnya + buka search
      setActiveChat(filtered[0].id);

      setTimeout(()=>{
        navigate("/search");
      },50)

   }else{

      setActiveChat(null);

      setTimeout(()=>{
        navigate("/search");
      },50)

   }

 }

};



return(

<div className="
glass
w-72
h-full
rounded-3xl
px-6
py-8
flex
flex-col
">

<h1 className="
font-serif
text-xl
font-semibold
mb-10
tracking-tight
text-ink-900
">
Smart File Manager
</h1>



{/* NAV */}
<nav className="space-y-2">

{[
{to:"/",icon:LayoutDashboard,label:"Dashboard"},
{to:"/upload",icon:Upload,label:"Upload"},
{to:"/documents",icon:FileText,label:"Documents"},
{to:"/search",icon:Search,label:"Search"}

].map(({to,icon:Icon,label})=>(

<NavLink key={to} to={to} end={to === "/"}>
{({isActive})=>(

<div
className={`${base}
${isActive
? "bg-accent-500 text-paper-200"
: "text-ink-500 hover:bg-white/5"}
`}
>

<Icon
size={18}
className="shrink-0"
/>

<span className="text-sm">
{label}
</span>

</div>

)}
</NavLink>

))}

</nav>





{/* CHAT HISTORY */}
<div className="
mt-8
border-t
border-ink-200
pt-6
flex-1
min-h-0
">

<div className="
flex
items-center
justify-between
mb-4
">

<p className="
text-xs
uppercase
tracking-widest
text-ink-400
font-semibold
">
Recent Chats
</p>


<button
onClick={createNewChat}
className="
flex
items-center
gap-1
text-xs
bg-accent-500
text-paper-200
px-3
py-1.5
rounded-full
hover:bg-accent-600
active:scale-[0.98]
transition
"
>
<Plus size={12}/>
New
</button>

</div>




{chatSessions.length===0 &&(

<div className="
text-sm
text-ink-400
italic
">
No chats yet
</div>

)}



{chatSessions.length>0&&(

<div className="
space-y-2
overflow-y-auto
max-h-[420px]
pr-1
">

{chatSessions.map(chat=>(

<div
key={chat.id}
className="group relative"
>

<button
onClick={()=>
 openChat(chat.id)
}
className={`
w-full
text-left
p-3
rounded-xl
text-sm
transition-all
flex
items-center
gap-3
overflow-hidden
pr-10
${activeChat===chat.id
? "bg-accent-50 border border-accent-200"
: "hover:bg-white/5"}
`}
>

<MessageSquare
size={14}
className={`
shrink-0
${activeChat===chat.id
? "text-accent-600"
: "text-ink-400"}
`}
/>


<div className="
flex-1
min-w-0
">

<span className="
block
truncate
font-medium
">
{chat.title || "Untitled Chat"}
</span>

</div>

</button>



<button
onClick={(e)=>
 deleteChat(e,chat.id)
}
className="
absolute
right-3
top-1/2
-translate-y-1/2
opacity-0
group-hover:opacity-100
transition
text-ink-400
hover:text-red-500
"
>
<Trash2 size={14}/>
</button>


</div>

))}

</div>

)}

</div>

</div>

)

}