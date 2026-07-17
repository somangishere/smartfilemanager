from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance so routes and main.py both reference
# the same limiter without a circular import.
limiter = Limiter(key_func=get_remote_address)
