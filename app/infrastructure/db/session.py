"""
BrandShield AI - Asynchronous Database Session & Connection Lifecycle
Engineered for high-concurrency PostgreSQL 16+ with pgvector support.
"""

from collections.abc import AsyncGenerator
import logging
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

logger = logging.getLogger("brandshield.infrastructure.db")
settings = get_settings()

# ==============================================================================
# Asynchronous Database Engine Configuration
# ==============================================================================

async_engine: AsyncEngine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,  # Proactively verifies connection liveness to handle stale socket drops
    future=True,
)

# ==============================================================================
# Async Session Factory
# ==============================================================================

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Prevents eager post-commit attribute eviction in async pipelines
    autoflush=False,         # Prevents unintended flushing during complex multi-step validations
)


# ==============================================================================
# Dependency Injection Session Generator
# ==============================================================================

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an isolated transactional asynchronous database session.
    Enforces atomic transaction boundaries: automatically commits upon clean exit,
    executes an immediate rollback on unhandled exceptions, and safely returns the
    connection to the connection pool.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            logger.error(
                "Transaction aborted and rolled back due to unhandled exception: %s",
                exc,
                exc_info=True,
            )
            raise
        finally:
            await session.close()


# ==============================================================================
# Engine Lifecycle & Extension Management
# ==============================================================================

async def init_db_extensions(engine: AsyncEngine | None = None) -> None:
    """
    Idempotently verifies and registers required PostgreSQL extensions
    ('vector' for pgvector HNSW indexing, 'pg_trgm' for trigram text similarity,
    and 'uuid-ossp' for native UUID generation).
    """
    target_engine = engine or async_engine
    logger.info("Verifying PostgreSQL extensions (vector, pg_trgm, uuid-ossp)...")

    async with target_engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))

    logger.info("PostgreSQL extensions initialized successfully.")


async def init_db_tables(engine: AsyncEngine | None = None) -> None:
    """
    Idempotently creates and verifies all database tables and native enum types.
    """
    target_engine = engine or async_engine
    logger.info("Verifying and creating database tables...")
    from app.infrastructure.db.base import Base
    import app.infrastructure.db.models  # noqa: F401 - registers models
    from app.domain.enums import (
        CreatorAction,
        DetectorSource,
        FindingCategory,
        GuidelineCategory,
        ReviewSignOff,
        SeverityLevel,
        TriageStatus,
        UserRole,
        WorkflowState,
    )

    enum_definitions = [
        ("user_role_enum", UserRole),
        ("workflow_state_enum", WorkflowState),
        ("guideline_category_enum", GuidelineCategory),
        ("finding_category_enum", FindingCategory),
        ("severity_level_enum", SeverityLevel),
        ("triage_status_enum", TriageStatus),
        ("detector_source_enum", DetectorSource),
        ("creator_action_enum", CreatorAction),
        ("review_signoff_enum", ReviewSignOff),
    ]

    async with target_engine.begin() as conn:
        # Register PostgreSQL enum types idempotently if running on Postgres
        for type_name, enum_cls in enum_definitions:
            values = ", ".join(f"'{e.value}'" for e in enum_cls)
            await conn.execute(
                text(f"""
                DO $$ BEGIN
                    CREATE TYPE {type_name} AS ENUM ({values});
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
                """)
            )

        # Create all tables declared in Base metadata
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables verified/created successfully.")


async def init_db_seed() -> None:
    """
    Checks if database is unpopulated and executes idempotent seeding if empty.
    """
    from app.infrastructure.db.models import Workspace
    from app.infrastructure.db.seed import seed_database

    logger.info("Checking database seed status...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Workspace.id).limit(1))
        existing_workspace = result.scalar_one_or_none()

        if existing_workspace is None:
            logger.info("Database is empty. Executing idempotent seed script...")
            seed_result = await seed_database(session)
            logger.info("Idempotent database seeding complete: %s", seed_result)
        else:
            logger.info("Database already contains existing tenant workspace(s). Seeding skipped.")


async def check_db_health(session: AsyncSession) -> dict[str, Any]:
    """
    Executes a heartbeat query to validate database reachability, latency,
    and pgvector extension health for readiness/liveness probes.
    """
    try:
        result = await session.execute(text("SELECT 1 AS heartbeat, version() AS pg_version;"))
        row = result.mappings().one()
        return {
            "status": "healthy",
            "heartbeat": row["heartbeat"],
            "postgres_version": row["pg_version"],
        }
    except Exception as exc:
        logger.critical("Database health check failed: %s", exc)
        return {
            "status": "unhealthy",
            "error": str(exc),
        }


async def close_db_connection() -> None:
    """
    Gracefully disposes the database connection pool during application shutdown.
    """
    logger.info("Closing asynchronous database connection pool...")
    await async_engine.dispose()
    logger.info("Database connection pool disposed.")
