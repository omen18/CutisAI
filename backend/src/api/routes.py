from fastapi import APIRouter
from .v1.analyse import router as analyse_router
from .v1.health import router as health_router
from .v1.debug import router as debug_router

router = APIRouter()
router.include_router(health_router)
router.include_router(analyse_router)
router.include_router(debug_router)