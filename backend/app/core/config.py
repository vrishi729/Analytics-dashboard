from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

UPLOAD_DIR = Path('uploads')


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix='DEMANDIQ_',
        env_file='.env',
        env_file_encoding='utf-8',
    )

    app_name: str = 'DemandIQ API'
    debug: bool = False

    database_url: str = 'sqlite+aiosqlite:///./demandiq_dev.db'

    jwt_secret_key: str = 'change-me-in-production'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    cors_origins: list[str] = ['http://localhost:5173']

    upload_max_size_mb: int = 10

    @property
    def upload_max_size_bytes(self) -> int:
        return self.upload_max_size_mb * 1024 * 1024


settings = Settings()
