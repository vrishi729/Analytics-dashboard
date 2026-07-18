import csv
import random
from datetime import datetime, timedelta

random.seed(42)

products = [
    # (name, category, base_price, avg_qty, qty_std, growth_weight)
    ("Smartphone",    "Electronics",  699, 1.4,  0.5,  1.12),
    ("Laptop",        "Electronics",  999, 1.05, 0.2,  1.14),
    ("Gaming Laptop", "Electronics", 1499, 1.02, 0.1,  1.10),
    ("Tablet",        "Electronics",  499, 1.15, 0.3,  1.11),
    ("Smartwatch",    "Electronics",  249, 1.3,  0.5,  1.13),
    ("Monitor",       "Electronics",  299, 1.1,  0.3,  1.09),
    ("Mechanical Keyboard", "Accessories", 129, 2.8, 0.8,  1.08),
    ("Gaming Mouse",         "Accessories",  79, 3.0, 1.0,  1.07),
    ("Webcam",        "Accessories",   89, 1.5,  0.5,  1.06),
    ("Earbuds",       "Audio",        149, 2.0,  0.7,  1.10),
    ("Speaker",       "Audio",        199, 1.4,  0.5,  1.09),
    ("Headphone",     "Audio",        179, 1.3,  0.5,  1.08),
]

months = [
    # (days, seasonality_factor)
    (31, 0.85),  # Jan - post-holiday dip
    (28, 0.80),  # Feb - slow
    (31, 0.90),  # Mar
    (30, 0.95),  # Apr
    (31, 1.00),  # May
    (30, 1.05),  # Jun
    (31, 1.10),  # Jul
    (31, 1.10),  # Aug - back to school
    (30, 1.05),  # Sep
    (31, 1.00),  # Oct
    (30, 1.60),  # Nov - Black Friday
    (31, 1.80),  # Dec - Christmas
]

rows = []
start_year = 2021
end_year = 2025

daily_target = 15  # ~15 orders per day average

for year in range(start_year, end_year + 1):
    annual_growth = 1.0 + (year - start_year) * 0.04  # 4% compound per year
    for month_idx, (days_in_month, seasonality) in enumerate(months, 1):
        month_growth = annual_growth
        # Extra bump for holiday months that compounds over years
        if month_idx == 11:
            month_growth *= 1.0 + (year - start_year) * 0.02
        elif month_idx == 12:
            month_growth *= 1.0 + (year - start_year) * 0.02

        orders_this_month = int(daily_target * days_in_month * seasonality * month_growth)

        for _ in range(orders_this_month):
            day = random.randint(1, days_in_month)
            date = datetime(year, month_idx, day)

            product = random.choice(products)
            name, category, base_price, avg_qty, qty_std, prod_growth_base = product

            # Slightly trend prices up over time
            price_trend = 1.0 + (year - start_year) * 0.015
            price = round(base_price * price_trend, 2)

            qty = max(1, round(random.gauss(avg_qty, qty_std)))

            rows.append([date.strftime("%Y-%m-%d"), name, category, qty, price])

# Sort by date
rows.sort(key=lambda r: r[0])

output_path = "/mnt/c/Users/HP/project/Analyitics dashboard/demandiq/data/user_data.csv"
with open(output_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Order Date", "Product Name", "Category", "Quantity Sold", "Unit Price"])
    writer.writerows(rows)

print(f"Generated {len(rows)} rows → {output_path}")

# Quick summary
from collections import Counter, defaultdict
prod_counts = Counter(r[1] for r in rows)
prod_qty = defaultdict(int)
prod_orders = defaultdict(int)
for r in rows:
    prod_qty[r[1]] += r[3]
    prod_orders[r[1]] += 1

print(f"\n{'Product':<22} {'Orders':>7} {'Units':>7} {'Avg/Order':>10}")
print("-" * 50)
for name, cnt in sorted(prod_counts.items()):
    u = prod_qty[name]
    o = prod_orders[name]
    print(f"{name:<22} {o:>7} {u:>7} {u/o:>8.2f}")
