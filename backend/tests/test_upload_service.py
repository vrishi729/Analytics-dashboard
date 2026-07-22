from pathlib import Path

import pytest

from app.services.upload_service import (
    ValidationError,
    parse_and_validate,
    validate_and_summarize,
)

FIXTURES = Path(__file__).parent / 'fixtures'


def _read_fixture(name: str) -> tuple[bytes, str, int]:
    path = FIXTURES / name
    content = path.read_bytes()
    return content, name, len(content)


def test_valid_csv_parses_successfully():
    content, filename, size = _read_fixture('valid_sales.csv')
    df, summary, stored = parse_and_validate(content, filename, size)
    assert summary.is_valid
    assert summary.total_rows == 10
    assert summary.missing_required_columns == []
    assert len(stored) > 0


def test_missing_required_columns_fails():
    content, filename, size = _read_fixture('missing_columns.csv')
    df, summary, stored = parse_and_validate(content, filename, size)
    assert not summary.is_valid
    assert 'unit_price' in summary.missing_required_columns


def test_alt_headers_are_mapped():
    content, filename, size = _read_fixture('alt_headers.csv')
    df, summary, stored = parse_and_validate(content, filename, size)
    assert summary.is_valid
    assert summary.total_rows == 2
    assert 'order_date' in df.columns
    assert 'product_name' in df.columns
    assert 'quantity_sold' in df.columns
    assert 'unit_price' in df.columns


def test_duplicates_detected():
    content, filename, size = _read_fixture('with_duplicates.csv')
    df, summary, stored = parse_and_validate(content, filename, size)
    assert summary.duplicate_rows == 1


def test_negative_quantities_detected():
    content, filename, size = _read_fixture('with_negatives.csv')
    df, summary, stored = parse_and_validate(content, filename, size)
    assert summary.negative_quantities == 1


def test_invalid_dates_detected():
    content, filename, size = _read_fixture('invalid_dates.csv')
    df, summary, stored = parse_and_validate(content, filename, size)
    assert summary.invalid_dates == 1


def test_unsupported_extension():
    with pytest.raises(ValidationError, match='Unsupported file type'):
        parse_and_validate(b'', 'data.pdf', 100)


def test_file_too_large():
    with pytest.raises(ValidationError, match='exceeds the maximum'):
        parse_and_validate(b'a' * (11 * 1024 * 1024), 'big.csv', 11 * 1024 * 1024)


def test_empty_dataframe():
    df, summary, stored = parse_and_validate(b'', 'empty.csv', 0)
    assert not summary.is_valid
    assert 'order_date' in summary.missing_required_columns


def test_validate_summarize_empty_columns():
    import pandas as pd

    df = pd.DataFrame({'Order Date': [], 'Product Name': [], 'Quantity Sold': [], 'Unit Price': []})
    summary = validate_and_summarize(df)
    assert summary.total_rows == 0
