from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    return pwd_context.hash(password)  # type: ignore[no-any-return]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)  # type: ignore[no-any-return]


def create_access_token(user_id: str) -> str:
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.access_token_expire_minutes,
    )
    payload: dict[str, Any] = {'sub': user_id, 'exp': expire, 'type': 'access'}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)  # type: ignore[no-any-return]


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(UTC) + timedelta(
        days=settings.refresh_token_expire_days,
    )
    payload: dict[str, Any] = {'sub': user_id, 'exp': expire, 'type': 'refresh'}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)  # type: ignore[no-any-return]


def decode_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload  # type: ignore[no-any-return]
    except JWTError:
        return {}
