from sentence_transformers import SentenceTransformer

# This MUST match how your DB embeddings were created
MODEL_NAME = "all-MiniLM-L6-v2"

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed(text: str) -> list[float]:
    """
    Generate a 384-dim embedding using MiniLM-L6.
    """
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()
