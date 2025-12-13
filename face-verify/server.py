"""
Face Verification API Server
Supports both GPU (Sakura Cloud) and CPU (local) environments
"""

import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from insightface.app import FaceAnalysis
import numpy as np
import cv2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment configuration
USE_GPU = os.getenv("USE_GPU", "false").lower() == "true"
CTX_ID = 0 if USE_GPU else -1

app = FastAPI(
    title="Face Verification API",
    description="Verify if two face images belong to the same person",
    version="1.0.0"
)

# CORS settings for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize face analysis model
logger.info(f"Initializing face analysis model (GPU: {USE_GPU}, ctx_id: {CTX_ID})")
face_app = FaceAnalysis(
    name="buffalo_l",  # High accuracy model
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
)
face_app.prepare(ctx_id=CTX_ID, det_size=(640, 640))

# Verification threshold
SIMILARITY_THRESHOLD = 0.4


def read_image_from_bytes(file_bytes: bytes) -> np.ndarray:
    """Convert bytes to OpenCV image array"""
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image")
    return img


def extract_face_embedding(img: np.ndarray) -> np.ndarray:
    """Extract face embedding vector from image"""
    faces = face_app.get(img)
    if len(faces) == 0:
        raise ValueError("No face detected in image")
    if len(faces) > 1:
        logger.warning(f"Multiple faces detected ({len(faces)}), using the largest one")
        # Select the largest face by area
        faces = sorted(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)
    return faces[0].embedding


def calculate_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings"""
    similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
    return float(similarity)


@app.post("/verify")
async def verify_faces(
    card_image: UploadFile = File(..., description="My Number Card face image"),
    live_image: UploadFile = File(..., description="Live camera face image")
):
    """
    Verify if the face on My Number Card matches the live camera face.

    Returns:
        - is_match: Whether the faces match (similarity > threshold)
        - similarity: Cosine similarity score (0.0 to 1.0)
        - threshold: The threshold used for matching
        - message: Human readable result message
    """
    try:
        # Read images
        card_bytes = await card_image.read()
        live_bytes = await live_image.read()

        card_img = read_image_from_bytes(card_bytes)
        live_img = read_image_from_bytes(live_bytes)

        logger.info(f"Card image size: {card_img.shape}")
        logger.info(f"Live image size: {live_img.shape}")

        # Extract face embeddings
        try:
            card_embedding = extract_face_embedding(card_img)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "card_face_not_detected",
                    "message": "マイナンバーカードから顔を検出できませんでした。カード全体が写るように撮影してください。"
                }
            )

        try:
            live_embedding = extract_face_embedding(live_img)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "live_face_not_detected",
                    "message": "カメラ映像から顔を検出できませんでした。顔全体がカメラに写るようにしてください。"
                }
            )

        # Calculate similarity
        similarity = calculate_similarity(card_embedding, live_embedding)
        is_match = similarity > SIMILARITY_THRESHOLD

        logger.info(f"Verification result: similarity={similarity:.4f}, is_match={is_match}")

        return {
            "is_match": is_match,
            "similarity": round(similarity, 4),
            "threshold": SIMILARITY_THRESHOLD,
            "message": "本人確認に成功しました" if is_match else "本人確認に失敗しました。もう一度お試しください。"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "verification_failed",
                "message": f"認証処理中にエラーが発生しました: {str(e)}"
            }
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "gpu": USE_GPU,
        "model": "buffalo_l"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
