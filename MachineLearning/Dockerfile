# 1. use a lightweight python base image
FROM python:3.10-slim

# 2. set environment variables to prevent python from buffering stdout (logs instantly)
ENV PYTHONBUFFERED=1

# 3. install SYSTEM dependencies
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 4. set the working directory inside the container
WORKDIR /app

# 5. copy requirements first (to leverage Docker layer caching)
COPY requirements.txt .

# 6. install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY download_base_model.py .

RUN python download_base_model.py

# 7. copy the rest of backend code (including your saved model)
COPY . .

# 8. expose the port Flask runs on
EXPOSE 5000

# 9. the command to run when the container starts
# use 'gunicorn' (production server) instead of python app.py (dev server)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
