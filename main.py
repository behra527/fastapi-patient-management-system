
from fastapi import FastAPI

app = FastAPI(
    title="API Fundamentals Lab",
    description="A learning project for HTTP methods and API communication.",
    version="1.0.0",
)


@app.get("/")
def root():
    """Return the API health message."""
    return {
        "message": "API Fundamentals Lab is running",
        "status": "success",
    }
