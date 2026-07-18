from typing import Any

from sqlalchemy import func

from app.core.config import settings


def date_trunc(granularity: str, column: Any) -> Any:
    is_sqlite = settings.database_url.startswith('sqlite')

    if is_sqlite:
        if granularity == 'week':
            return func.date(column, '-' + func.strftime('%w', column) + ' days').label('period')
        if granularity == 'month':
            return func.date(column, 'start of month', '+1 month', '-1 day').label('period')
        return func.strftime('%Y-%m-%d', column).label('period')
    else:
        return func.date_trunc(granularity, column).label('period')
