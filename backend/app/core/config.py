from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application Settings Configuration class powered by Pydantic.
    Loads values from environment variables or '.env' files, with standard fallback values.
    """
    # ── General Application Settings ──
    app_name: str = "PROFIT Loyalty"
    app_version: str = "1.0.0"
    debug: bool = True
    allowed_origins: str = "http://localhost:3000"

    # ── Database Configurations ──
    # Note: Isolated database file path to prevent watch-reload loops in dev mode.
    database_url: str = "sqlite+aiosqlite:///./data/profit.db"

    # ── Security & Authentication Configurations ──
    secret_key: str = "dev-secret-key-please-change-in-production-min-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    # ── Redis Configurations ──
    redis_url: str = "redis://localhost:6379/0"

    # ── Wheel of Fortune Game Configurations ──
    wheel_free_interval_hours: int = 72
    wheel_paid_cost_md: int = 50

    # ── Referral Program Configurations ──
    referral_bonus_md: int = 100

    @property
    def origins_list(self) -> list[str]:
        """Parses comma-separated allowed CORS origins into a list of strings."""
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Returns a cached, singleton instance of the Settings class to avoid heavy re-parsing."""
    return Settings()
