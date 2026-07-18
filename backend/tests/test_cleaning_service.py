import pandas as pd

from app.services.cleaning_service import clean_dataframe


def _make_df(data: dict) -> pd.DataFrame:
    return pd.DataFrame(data)


def test_removes_duplicates():
    df = _make_df(
        {
            'order_date': ['2024-01-05', '2024-01-05', '2024-01-06'],
            'product_name': ['Coffee', 'Coffee', 'Milk'],
            'quantity_sold': [15, 15, 30],
            'unit_price': [12.5, 12.5, 3.99],
            'category': ['Beverages', 'Beverages', 'Dairy'],
        }
    )
    header_map = {
        'order_date': 'order_date',
        'product_name': 'product_name',
        'quantity_sold': 'quantity_sold',
        'unit_price': 'unit_price',
        'category': 'category',
    }
    cleaned, report = clean_dataframe(df, header_map)
    assert report['duplicates_removed'] == 1
    assert len(cleaned) == 2


def test_drops_missing_dates():
    df = _make_df(
        {
            'order_date': ['2024-01-05', None],
            'product_name': ['Coffee', 'Milk'],
            'quantity_sold': [15, 30],
            'unit_price': [12.5, 3.99],
            'category': ['Beverages', 'Dairy'],
        }
    )
    header_map = {
        'order_date': 'order_date',
        'product_name': 'product_name',
        'quantity_sold': 'quantity_sold',
        'unit_price': 'unit_price',
        'category': 'category',
    }
    cleaned, report = clean_dataframe(df, header_map)
    assert report['rows_dropped_missing_date'] >= 1
    assert len(cleaned) == 1


def test_drops_negative_quantities():
    df = _make_df(
        {
            'order_date': ['2024-01-05', '2024-01-06'],
            'product_name': ['Coffee', 'Milk'],
            'quantity_sold': [-5, 30],
            'unit_price': [12.5, 3.99],
            'category': ['Beverages', 'Dairy'],
        }
    )
    header_map = {
        'order_date': 'order_date',
        'product_name': 'product_name',
        'quantity_sold': 'quantity_sold',
        'unit_price': 'unit_price',
        'category': 'category',
    }
    cleaned, report = clean_dataframe(df, header_map)
    assert report['rows_dropped_missing_quantity'] >= 1
    assert len(cleaned) == 1


def test_imputes_category():
    df = _make_df(
        {
            'order_date': ['2024-01-05'],
            'product_name': ['Coffee'],
            'quantity_sold': [15],
            'unit_price': [12.5],
            'category': [None],
        }
    )
    header_map = {
        'order_date': 'order_date',
        'product_name': 'product_name',
        'quantity_sold': 'quantity_sold',
        'unit_price': 'unit_price',
        'category': 'category',
    }
    cleaned, report = clean_dataframe(df, header_map)
    assert report['categories_imputed'] == 1
    assert cleaned['category'].iloc[0] == 'Uncategorized'


def test_computes_revenue():
    df = _make_df(
        {
            'order_date': ['2024-01-05'],
            'product_name': ['Coffee'],
            'quantity_sold': [15],
            'unit_price': [12.5],
            'revenue': [None],
        }
    )
    header_map = {
        'order_date': 'order_date',
        'product_name': 'product_name',
        'quantity_sold': 'quantity_sold',
        'unit_price': 'unit_price',
        'revenue': 'revenue',
    }
    cleaned, report = clean_dataframe(df, header_map)
    assert report['revenues_computed'] == 1
    assert cleaned['revenue'].iloc[0] == 15 * 12.5


def test_normalizes_product_names():
    df = _make_df(
        {
            'order_date': ['2024-01-05'],
            'product_name': ['  COFFEE   BEANS  '],
            'quantity_sold': [15],
            'unit_price': [12.5],
        }
    )
    header_map = {
        'order_date': 'order_date',
        'product_name': 'product_name',
        'quantity_sold': 'quantity_sold',
        'unit_price': 'unit_price',
    }
    cleaned, report = clean_dataframe(df, header_map)
    assert cleaned['product_name'].iloc[0] == 'Coffee Beans'
    assert report['product_names_normalized'] == 1
