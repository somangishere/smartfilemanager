import os
from dotenv import load_dotenv
from groq import Groq

from app.services.vector_service import query_chunks

# load env
load_dotenv()

# init client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# 🔥 NORMALIZATION (SOLVE SINGKATAN)
def normalize_query(query: str):
    query = query.lower()

    replacements = {
        "ss": "student service",
        "sop": "standard operating procedure",
    }

    for key, value in replacements.items():
        query = query.replace(key, value)

    return query


def generate_answer(query: str):
    # 🔥 normalize dulu
    normalized_query = normalize_query(query)

    # 🔥 query ke vector DB
    results = query_chunks(normalized_query)

    # 🔥 SAFE CHECK
    if not results.get("documents") or not results["documents"][0]:
        return {
            "answer": "Tidak ditemukan informasi yang relevan dalam dokumen.",
            "source": None
        }

    contexts = results["documents"][0]

    # 🔥 LIMIT CONTEXT (biar fokus)
    MAX_CHUNKS = 5
    contexts = contexts[:MAX_CHUNKS]

    context = "\n\n".join(contexts)

    prompt = f"""
Anda adalah AI yang hanya boleh menjawab berdasarkan konteks.

ATURAN:
- Jangan mengarang
- Jangan menambahkan informasi di luar konteks
- Jika tidak ada jawaban → bilang "Tidak ditemukan dalam dokumen"
- Ambil SEMUA poin penting yang relevan

FORMAT:
- Gunakan bullet points
- Jawaban harus jelas dan tidak terpotong

Context:
{context}

Question:
{query}

Answer:
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        answer = response.choices[0].message.content

        return {
            "answer": answer.strip(),
            "source": contexts
        }

    except Exception as e:
        return {
            "answer": f"Error saat generate jawaban: {str(e)}",
            "source": None
        }