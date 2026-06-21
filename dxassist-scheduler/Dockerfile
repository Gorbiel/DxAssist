FROM python:3.10-slim

WORKDIR /app

RUN pip install --no-cache-dir pyyaml

COPY main.py .
COPY config.yaml .

CMD ["python", "main.py"]