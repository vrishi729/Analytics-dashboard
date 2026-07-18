from typing import Any

from pydantic import BaseModel


class CleaningReport(BaseModel):
    rows_before: int
    rows_after: int
    duplicates_removed: int
    rows_dropped_missing_date: int
    rows_dropped_missing_product: int
    rows_dropped_missing_quantity: int
    rows_dropped_missing_price: int
    categories_imputed: int
    revenues_computed: int
    product_names_normalized: int


class CleanSummary(BaseModel):
    products: int
    categories: int
    date_range: str | None = None
    product_names: list[str] = []
    category_names: list[str] = []


class CleaningResponse(BaseModel):
    dataset_id: str
    cleaning_report: dict[str, Any]
    total_cleaned_records: int
    summary: CleanSummary | None = None
