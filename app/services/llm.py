import ollama

MODEL_NAME = "qwen2.5:3b"

def ask_llm(prompt: str) -> str:
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a conservative Bible study assistant. "
                    "You must not speculate or invent commentary. "
                    "If the source material is weak, say so plainly."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0.2,
            "top_p": 0.9
        }
    )

    return response["message"]["content"]
