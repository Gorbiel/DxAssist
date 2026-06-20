"""
Django settings loader.
Selects appropriate settings based on environment.
"""

import os

# Determine which settings module to load
env = os.getenv("ENVIRONMENT", "dev").lower()

if env == "production":
    from .production import *  # noqa: F401, F403
elif env == "test":
    from .test import *  # noqa: F401, F403
else:  # dev is default
    from .dev import *  # noqa: F401, F403
