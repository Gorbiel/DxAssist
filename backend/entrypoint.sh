#!/bin/sh
set -e

# optional: wait for postgres (pg_isready must be available in image)
# until pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "$POSTGRES_USER"; do
#   echo "Waiting for postgres..."
#   sleep 1
# done

max_attempts="${MIGRATE_MAX_ATTEMPTS:-5}"
attempt=1

until python manage.py migrate --noinput; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Migrate failed after $attempt attempts."
    exit 1
  fi

  attempt=$((attempt + 1))
  echo "Migrate failed, attempt $attempt/$max_attempts - retrying in 3s..."
  sleep 3
done

exec "$@"
