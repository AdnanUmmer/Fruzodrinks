import os
from .base import *  # noqa: F403

DEBUG = False
SECRET_KEY = os.urandom(64).hex()
ALLOWED_HOSTS = ['localhost']