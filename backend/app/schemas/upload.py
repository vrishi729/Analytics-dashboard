from typing import Any

from pydantic import BaseModel


class HealthSummaryResponse(BaseModel):
    total_rows: int
    missing_required_columns: list[str]
    missing_optional_columns: list[str]
    duplicate_rows: int
    invalid_dates: int
    negative_quantities: int
    missing_values: dict[str, int]
    empty_columns: list[str]
    type_errors: dict[str, list[str]]
    is_valid: bool


class UploadResponse(BaseModel):
    dataset_id: str
    filename: str
    row_count: int
    is_valid: bool
    health_summary: dict[str, Any] | None = None
