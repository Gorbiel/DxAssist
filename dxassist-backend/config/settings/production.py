"""
Production settings for DxAssist.
Strict security and performance settings.
"""

import os
from datetime import timedelta

from .common import *

# SECURITY: Secret key must be set in environment
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set!")

# SECURITY: Debug must be off in production
DEBUG = False

# SECURITY: Explicitly set allowed hosts
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
if not ALLOWED_HOSTS or ALLOWED_HOSTS == [""]:
    raise ValueError("ALLOWED_HOSTS environment variable is not set!")

# Database - use env vars (required in production)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        # Connection pooling and optimizations
        "CONN_MAX_AGE": 600,
        "ATOMIC_REQUESTS": True,
    }
}

# SECURITY: HTTPS only
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# SECURITY: Additional headers
SECURE_CONTENT_SECURITY_POLICY = {
    "default-src": ("'self'",),
}

# CORS Configuration - Strict in production
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "https://example.com").split(
    ","
)
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = os.getenv(
    "CSRF_TRUSTED_ORIGINS",
    "https://example.com,https://www.example.com",
).split(",")

SERVE_MEDIA_FILES = os.getenv("SERVE_MEDIA_FILES", "false").lower() in {
    "1",
    "true",
    "yes",
}

# JWT Token Settings - Production Overrides
# These are stricter than development for security

SIMPLE_JWT = {
    # Shorter access token lifetime for security
    # If a token is compromised, it's only valid for 30 minutes
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", "30"))
    ),
    # Refresh tokens valid for 30 days (enforces re-login every month for security)
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_LIFETIME_DAYS", "30"))
    ),
    # Security: Rotate refresh tokens on each refresh request
    "ROTATE_REFRESH_TOKENS": True,
    # Security: Blacklist old tokens after rotation
    "BLACKLIST_AFTER_ROTATION": True,
    # HS256 is sufficient for most cases; can switch to RS256 if needed
    "ALGORITHM": os.getenv("JWT_ALGORITHM", "HS256"),
    # Signing/verification keys intentionally omitted here so SimpleJWT will
    # use Django's SECRET_KEY by default. If you need RS256 set VERIFYING_KEY
    # and SIGNING_KEY explicitly in a secure way (e.g. from a secret store).
    # Standard bearer token authentication
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    # User identification
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    # Token identification
    "JTI_CLAIM": "jti",
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    # Security: Check if token is blacklisted
    "CHECK_REVOKE_TOKEN": True,
    # Performance: Don't update user.last_login on every token generation (prevents DB writes)
    "UPDATE_LAST_LOGIN": False,
    # Sliding token settings (unused but included for completeness)
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
    "SLIDING_TOKEN_LIFETIME": timedelta(hours=5),
}

# Logging - error tracking in production
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
