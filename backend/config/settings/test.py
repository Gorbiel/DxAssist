"""
Test settings for DxAssist.
Optimized for fast test runs with PostgreSQL.
"""

import os

from .common import *

# Use a simple secret key for tests
SECRET_KEY = "test-secret-key"

# Disable debug for test consistency
DEBUG = False

ALLOWED_HOSTS = ["*"]

# PostgreSQL database for tests (matches production/dev)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB_TEST", "test_db"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "password"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# Fast password hashing for tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# In-memory email backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Reduce logging noise in tests
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}
