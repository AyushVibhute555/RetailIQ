import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from mlxtend.frequent_patterns import apriori, association_rules
from datetime import datetime, timedelta
import warnings

warnings.filterwarnings("ignore")

def generate_sales_insights(orders_data, timeframe):
    if not orders_data:
        return {
            "chart_data": [], "prediction": 0, "trend": "flat", 
            "detailed_strategies": [], "top_selling": [], 
            "cross_sell_rules": [], "inventory_alerts": [], "buying_patterns": {}
        }

    df_full = pd.DataFrame(orders_data)
    df_full['createdAt'] = pd.to_datetime(df_full['createdAt']).dt.tz_localize(None)
    
    latest_date = df_full['createdAt'].max()

    # ---------------------------------------------------------
    # 0. DYNAMIC TIMEFRAME FILTERING (The Fix)
    # ---------------------------------------------------------
    # Determine the lookback window and the "current" comparison window based on dropdown
    if timeframe == "daily":
        start_date = latest_date - pd.Timedelta(days=14) # Look at last 14 days
        period_alias = "D"
        current_window_start = latest_date - pd.Timedelta(days=1) # Compare last 1 day vs previous 13
        window_name = "day"
    elif timeframe == "weekly":
        start_date = latest_date - pd.Timedelta(weeks=12) # Look at last 12 weeks
        period_alias = "W"
        current_window_start = latest_date - pd.Timedelta(weeks=1) # Compare last 1 week vs previous 11
        window_name = "week"
    elif timeframe == "monthly":
        start_date = latest_date - pd.DateOffset(months=12) # Look at last 12 months
        period_alias = "M"
        current_window_start = latest_date - pd.DateOffset(months=1) # Compare last month vs previous 11
        window_name = "month"
    elif timeframe == "quarterly":
        start_date = latest_date - pd.DateOffset(months=24) # Look at last 2 years
        period_alias = "Q"
        current_window_start = latest_date - pd.DateOffset(months=3) # Compare last quarter
        window_name = "quarter"
    else: # yearly
        start_date = df_full['createdAt'].min() # All time
        period_alias = "Y"
        current_window_start = latest_date - pd.DateOffset(years=1)
        window_name = "year"

    # Filter the active dataframe to ONLY include data from the selected lookback window
    df = df_full[df_full['createdAt'] >= start_date].copy()
    if df.empty:
        df = df_full.copy() # Fallback if filtering yields empty results

    # ---------------------------------------------------------
    # 1. TIME SERIES FORECASTING (Holt-Winters)
    # ---------------------------------------------------------
    grouped = df.groupby(df['createdAt'].dt.to_period(period_alias))['totalAmount'].sum().reset_index()
    grouped['createdAt'] = grouped['createdAt'].astype(str)
    chart_data = grouped.rename(columns={'createdAt': 'time', 'totalAmount': 'sales'}).to_dict(orient="records")

    prediction, trend = 0.0, "flat"
    
    if len(grouped) >= 4:
        try:
            model = ExponentialSmoothing(grouped['totalAmount'], trend='add', seasonal=None, initialization_method="estimated")
            fit_model = model.fit()
            pred_val = fit_model.forecast(1).iloc[0]
            prediction = float(max(0, pred_val))
            
            recent_sales = grouped['totalAmount'].tail(2).values
            trend = "up" if len(recent_sales) > 1 and recent_sales[-1] > recent_sales[0] else "down"
        except Exception:
            prediction = float(grouped['totalAmount'].mean())
    elif len(grouped) > 0:
        prediction = float(grouped['totalAmount'].mean())
        trend = "up" if len(grouped) > 1 and grouped['totalAmount'].iloc[-1] >= grouped['totalAmount'].iloc[0] else "flat"

    # ---------------------------------------------------------
    # 2. MARKET BASKET ANALYSIS (Filtered by timeframe)
    # ---------------------------------------------------------
    basket_data = []
    item_frequencies = {}
    
    if 'items' in df.columns:
        for items_list in df['items'].dropna():
            if isinstance(items_list, list):
                transaction = []
                for item in items_list:
                    name = item.get('name', 'Unknown')
                    qty = item.get('quantity', 0)
                    transaction.append(name)
                    item_frequencies[name] = item_frequencies.get(name, 0) + qty
                basket_data.append(transaction)

    sorted_products = sorted(item_frequencies.items(), key=lambda x: x[1], reverse=True)
    top_selling = [{"name": k, "qty": int(v)} for k, v in sorted_products[:5]]

    cross_sell_rules = []
    if len(basket_data) > 3:
        try:
            unique_items = list(item_frequencies.keys())
            encoded_data = [{item: (item in transaction) for item in unique_items} for transaction in basket_data]
            basket_df = pd.DataFrame(encoded_data)
            
            frequent_itemsets = apriori(basket_df, min_support=0.05, use_colnames=True)
            if not frequent_itemsets.empty:
                rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.2)
                rules = rules.sort_values(by=['lift', 'confidence'], ascending=[False, False])
                
                for _, row in rules.head(3).iterrows():
                    cross_sell_rules.append({
                        "trigger_item": list(row['antecedents'])[0],
                        "recommendation": list(row['consequents'])[0],
                        "confidence": round(row['confidence'] * 100, 1)
                    })
        except Exception:
            pass

    # ---------------------------------------------------------
    # 3. BEHAVIORAL PATTERNS (Filtered by timeframe)
    # ---------------------------------------------------------
    buying_patterns = {}
    try:
        df['day_of_week'] = df['createdAt'].dt.day_name()
        df['hour'] = df['createdAt'].dt.hour

        busiest_day = df['day_of_week'].value_counts().idxmax()
        peak_hour = df['hour'].value_counts().idxmax()
        time_of_day = "Morning (8AM-12PM)" if 8 <= peak_hour < 12 else \
                      "Afternoon (12PM-5PM)" if 12 <= peak_hour < 17 else \
                      "Evening (5PM-9PM)" if 17 <= peak_hour < 21 else "Night"

        avg_basket_size = sum(len(b) for b in basket_data) / len(basket_data) if basket_data else 0

        buying_patterns = {
            "busiest_day": busiest_day,
            "peak_time": time_of_day,
            "avg_basket_size": round(avg_basket_size, 1),
            "insight": f"Maximize staff and ads on {busiest_day}s during {time_of_day.split(' ')[0]} this {window_name}."
        }
    except Exception:
        pass

    # ---------------------------------------------------------
    # 4. SURGE ALERTS (Comparing recent vs history within timeframe)
    # ---------------------------------------------------------
    inventory_alerts = []
    try:
        product_records = []
        for idx, row in df.iterrows():
            if isinstance(row.get('items'), list):
                for item in row['items']:
                    product_records.append({
                        "date": row['createdAt'],
                        "name": item.get('name'),
                        "qty": item.get('quantity', 0)
                    })
        
        pdf = pd.DataFrame(product_records)
        
        if not pdf.empty:
            # Compare current window (e.g. this week) vs historical window (e.g. previous 11 weeks)
            recent_sales = pdf[pdf['date'] >= current_window_start].groupby('name')['qty'].sum()
            historical_sales = pdf[pdf['date'] < current_window_start].groupby('name')['qty'].sum()
            
            hist_days = max(1, (current_window_start - df['createdAt'].min()).days)
            recent_days = max(1, (latest_date - current_window_start).days)
            
            for item in recent_sales.index:
                recent_qty = recent_sales[item]
                hist_qty = historical_sales.get(item, 0)
                
                recent_daily_rate = recent_qty / recent_days
                hist_daily_rate = hist_qty / hist_days if hist_days > 0 else 0
                
                if hist_daily_rate > 0:
                    if recent_daily_rate > hist_daily_rate * 1.3: # 30% surge detected
                        surge_pct = round(((recent_daily_rate / hist_daily_rate) - 1) * 100)
                        inventory_alerts.append({
                            "name": item, "velocity": int(recent_qty),
                            "insight": f"🔥 SURGE: Selling {surge_pct}% faster this {window_name}!"
                        })
                else:
                    if recent_qty >= 2:
                        inventory_alerts.append({
                            "name": item, "velocity": int(recent_qty),
                            "insight": f"Trending! New fast-mover this {window_name}."
                        })
                        
        inventory_alerts = sorted(inventory_alerts, key=lambda x: x['velocity'], reverse=True)[:4]
        
        # Fallback if no surges
        if not inventory_alerts and top_selling:
            for item in top_selling[:3]:
                inventory_alerts.append({
                    "name": item['name'], "velocity": item['qty'],
                    "insight": f"Steady seller this {window_name}. Monitor baseline stock."
                })
    except Exception:
        pass

    # ---------------------------------------------------------
    # 5. DYNAMIC AI STRATEGY COPILOT
    # ---------------------------------------------------------
    detailed_strategies = []

    if trend == "up":
        detailed_strategies.append({"type": "revenue", "title": "Revenue Growth Detected", "desc": f"Sales are trending upwards this {window_name}. Projected next {window_name} revenue is ₹{round(prediction, 2)}. Consider increasing marketing spend to capture this momentum."})
    else:
        detailed_strategies.append({"type": "revenue", "title": "Revenue Softening", "desc": f"Sales momentum is flat or slowing this {window_name}. Consider running a flash sale via Promo Codes to inject cashflow and clear stock."})

    if cross_sell_rules:
        best = cross_sell_rules[0]
        detailed_strategies.append({"type": "marketing", "title": f"Smart {window_name.capitalize()} Bundle", "desc": f"High correlation found. Create a combo offer for '{best['trigger_item']}' and '{best['recommendation']}' to increase your Average Order Value."})

    if inventory_alerts and "SURGE" in inventory_alerts[0]['insight']:
        hot_item = inventory_alerts[0]['name']
        detailed_strategies.append({"type": "inventory", "title": "Stockout Risk", "desc": f"'{hot_item}' is surging rapidly this {window_name}. Reorder immediately from your supplier to prevent out-of-stock losses."})

    if buying_patterns:
        detailed_strategies.append({"type": "behavior", "title": "Peak Optimization", "desc": buying_patterns['insight']})

    return {
        "chart_data": chart_data,
        "prediction": round(prediction, 2),
        "trend": trend,
        "detailed_strategies": detailed_strategies,
        "top_selling": top_selling,
        "cross_sell_rules": cross_sell_rules,
        "inventory_alerts": inventory_alerts,
        "buying_patterns": buying_patterns
    }