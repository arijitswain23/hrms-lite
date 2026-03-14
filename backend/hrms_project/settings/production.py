"""
HRMS Lite – Production Settings
Extends base settings with production-specific overrides.
"""
from .base import *  # noqa: F401, F403

DEBUG = False

# Restrict hosts in production — set via environment variable
ALLOWED_HOSTS = ["*"] # noqa: F405

# CORS: only allow the deployed frontend
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = ["https://hrms-lite-olo9.onrender.com/api"]  # noqa: F405

# Security headers
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
