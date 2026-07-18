import pandas as pd

from app.analytics.forecasting import run_forecast


def test_forecast_returns_expected_keys():
    dates = pd.date_range('2024-01-01', periods=8, freq='D')
    values = [10, 12, 11, 14, 13, 16, 15, 18]
    series = pd.Series(values, index=dates)

    result = run_forecast(series, 'day', steps=3)

    assert 'historical' in result
    assert 'forecast' in result
    assert 'confidence_score' in result
    assert result['model_used'] == 'Holt-Winters'
    assert len(result['forecast']) == 3


def test_forecast_returns_non_negative_values():
    dates = pd.date_range('2024-01-01', periods=6, freq='W')
    values = [20, 22, 19, 24, 21, 25]
    series = pd.Series(values, index=dates)

    result = run_forecast(series, 'week', steps=4)

    for point in result['forecast']:
        assert point['value'] >= 0


def test_forecast_returns_error_for_short_series():
    series = pd.Series([10, 20], index=pd.date_range('2024-01-01', periods=2, freq='D'))

    result = run_forecast(series, 'day', steps=3)

    assert 'error' in result


def test_historical_matches_input():
    dates = pd.date_range('2024-01-01', periods=5, freq='D')
    values = [10, 12, 11, 14, 13]
    series = pd.Series(values, index=dates)

    result = run_forecast(series, 'day', steps=2)

    hist_values = [h['value'] for h in result['historical']]
    assert hist_values == values
