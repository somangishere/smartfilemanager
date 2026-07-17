import { useEffect,useState } from "react";
import API from "../api/api";
import {
 FileText,
 Sparkles,
 X,
 Trash2
} from "lucide-react";


export default function Documents(){

const [docs,setDocs]=useState([]);
const [selectedDoc,setSelectedDoc]=useState(null);
const [loading,setLoading]=useState(false);
const [deletingAll,setDeletingAll]=useState(false);



const fetchDocs=async()=>{

try{

const res=await API.get(
"/documents"
)

setDocs(
 res.data
)

}
catch(err){
console.error(err)
}

}



const fetchDetail=async(doc)=>{

setLoading(true)

try{

const res=await API.get(
 `/documents/${doc.id}`
)

setSelectedDoc({
 ...doc,
 summary:res.data.summary,
 extracted_text:
   res.data.extracted_text
})

}
catch(err){
console.error(err)
}

setLoading(false)

}




const handleDelete=async(
e,
doc
)=>{

e.stopPropagation()

const confirmed=
window.confirm(
`Delete "${doc.file_name}" permanently?`
)

if(!confirmed) return;


try{

await API.delete(
 `/documents/${doc.id}`
)

fetchDocs()

if(
 selectedDoc?.id===doc.id
){
 setSelectedDoc(null)
}

}
catch(err){

console.error(err)

alert(
"Delete failed"
)

}

}




const handleDeleteAll=async()=>{

if(!docs.length){

alert(
"No documents to delete"
)

return;
}


const first=
window.confirm(
"Delete ALL documents?"
)

if(!first) return;


const second=
window.confirm(
"This will also clear vector memory. Continue?"
)

if(!second) return;



try{

setDeletingAll(true)


const res=
await API.delete(
"/documents/delete-all"
)


console.log(
res.data
)


setDocs([])

setSelectedDoc(null)


alert(
`Deleted ${res.data.deleted} documents`
)


}
catch(err){

console.error(err)

alert(
"Delete all failed"
)

}
finally{

setDeletingAll(false)

}

}



useEffect(()=>{

fetchDocs()

},[])




return(

<div className="
h-full
flex
flex-col
">


{/* HEADER */}
<div className="
flex
items-center
justify-between
mb-8
">

<div>

<h1 className="
text-3xl
font-bold
text-ink-900
">
Documents
</h1>

<p className="
text-ink-500
mt-1
">
{docs.length}
documents in your workspace
</p>

</div>



<button
onClick={handleDeleteAll}
disabled={deletingAll}
className="
flex
items-center
gap-2
bg-red-600
text-white
px-4
py-2
rounded-full
hover:opacity-90
active:scale-[0.98]
disabled:opacity-50
transition
"
>
<Trash2 size={16}/>

{
deletingAll
? "Deleting..."
: "Delete All"
}

</button>


</div>




{/* EMPTY */}
{docs.length===0 &&(

<div className="
flex
items-center
justify-center
h-[60vh]
text-ink-400
">
No documents uploaded yet
</div>

)}



{/* LIST */}
<div className="
space-y-4
overflow-y-auto
">

{docs.map(doc=>{

const size=
doc.size ||
(
doc.file_size
? (
doc.file_size/1024/1024
).toFixed(1)+" MB"
:"—"
)


const date=
doc.created_at
? new Date(
 doc.created_at
).toLocaleDateString(
"en-US",
{
month:"short",
day:"numeric",
year:"numeric"
}
)
:"—"



return(

<div
key={doc.id}
onClick={()=>
fetchDetail(doc)
}
className="
group
glass-soft
p-4
rounded-xl
flex
justify-between
items-center
cursor-pointer
hover:bg-white/10
transition
"
>

{/* LEFT */}
<div className="
flex
items-center
gap-4
">

<div className="
bg-white/5
p-3
rounded-lg
">
<FileText
size={18}
className="
text-ink-900
"
/>
</div>


<div>

<p className="
font-medium
text-ink-900
">
{doc.file_name}
</p>


<p className="
text-sm
text-ink-500
line-clamp-1
max-w-[500px]
">
{
doc.summary ||
"No description available"
}
</p>

</div>

</div>




{/* RIGHT */}
<div className="
flex
items-center
gap-4
text-sm
text-ink-400
">

<span className="
bg-white/5
px-3
py-1
rounded-full
text-ink-700
font-mono
text-xs
">
{size}
</span>


<span>
{date}
</span>



<button
onClick={(e)=>
handleDelete(
e,
doc
)
}
className="
opacity-0
group-hover:opacity-100
transition
text-red-500
hover:text-red-700
"
>
<Trash2 size={18}/>
</button>


</div>

</div>

)

})}

</div>




{/* MODAL */}
{selectedDoc&&(

<div
className="
fixed
inset-0
bg-black/40
backdrop-blur-sm
flex
items-center
justify-center
z-50
"
onClick={()=>
setSelectedDoc(null)
}
>

<div
className="
glass
w-full
max-w-3xl
max-h-[85vh]
rounded-2xl
shadow-xl
flex
flex-col
"
onClick={(e)=>
e.stopPropagation()
}
>

{/* HEADER */}
<div className="
flex
justify-between
items-start
p-6
border-b
border-ink-100
">

<div>

<h2 className="
text-xl
font-semibold
text-ink-900
">
{selectedDoc.file_name}
</h2>

<p className="
text-sm
text-ink-500
mt-1
">
{
selectedDoc.size ||
"Unknown size"
}
</p>

</div>


<button
onClick={()=>
setSelectedDoc(null)
}
>
<X className="
text-ink-400
hover:text-ink-900
"/>
</button>

</div>



{/* BODY */}
<div className="
p-6
overflow-y-auto
flex-1
">

{loading ? (

<p className="
text-ink-500
">
Loading...
</p>

):(

<>

<div className="mb-6">

<h3 className="
flex
items-center
gap-2
font-semibold
mb-2
text-ink-900
">
<Sparkles size={16} className="text-accent-600" />
AI Summary
</h3>


<div className="
glass-soft
p-4
rounded-xl
text-ink-700
">
{
selectedDoc.summary ||
"No summary available"
}
</div>

</div>



<div>

<h3 className="
flex
items-center
gap-2
font-semibold
mb-2
text-ink-900
">
<FileText size={16} className="text-ink-400" />
Extracted Text
</h3>

<div className="
glass-soft
p-4
rounded-xl
text-sm
text-ink-700
font-mono
whitespace-pre-line
">
{
selectedDoc.extracted_text ||
"No text available"
}
</div>

</div>

</>

)}

</div>



{/* FOOTER */}
<div className="
p-4
border-t
border-ink-100
flex
justify-end
">

<button
onClick={()=>
setSelectedDoc(null)
}
className="
px-4
py-2
border
border-ink-200
rounded-full
hover:bg-white/5
active:scale-[0.98]
transition
"
>
Close
</button>

</div>


</div>

</div>

)}

</div>

)

}