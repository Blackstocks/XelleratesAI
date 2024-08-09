import pandas as pd
import json
import sys

class Extract():
    def __init__(self, mis_file_path) -> None:
        self.mis_file_path = mis_file_path
        
    def unmerge_cells(self, df):
        df = df.ffill(axis=0).ffill(axis=1)
        return df
    
        
    def extract_data(self, df, row_label, quarterly_months, type_map, month_map):
        data = {}
        yearly_columns = [col for col in df.columns if 'Yearly' in df.iloc[1, col]]
        year_column = min(yearly_columns)
        # latest_year_data = df.iloc[:, latest_year_column]

        # print(yearly_columns)
        # print(latest_year_column)
        # print(latest_year_data)
        
        
        # print(yearly_data)
        data['Yearly'] = []
        for year in yearly_columns:
            
            yearly_data = df.loc[type_map[row_label], year_column]
            t = {
            'month': df.loc[2, year_column],
            'value': yearly_data
            }
            data['Yearly'].append(t)
            
            year_column+=1
            
        # Extract yearly data
        # data['Yearly'] = [{
        #     'month': 'all',
        #     'value': yearly_data
        # }]
        
        # Extract quarterly data
        
        monthly_columns = [col for col in df.columns if 'Monthly' in df.iloc[1, col]]
        month_column = min(monthly_columns)
        
        for quarter, months in quarterly_months.items():
            quarter_data = []
            for month in months:
                month = month.split("'")[0]
                value = df.loc[type_map[row_label], month_column]
                quarter_data.append({
                    'month': month_map[month],  # Extracting the month number
                    'value': value
                })
                month_column+=1
            data[quarter] = quarter_data  
              
        return data
    
    
def main():
        # Define quarterly months
    try:
            quarters = {
                'Q1': ["Apr'23", "May'23", "Jun'23"],
                'Q2': ["Jul'23", "Aug'23", "Sep'23"],
                'Q3': ["Oct'23", "Nov'23", "Dec'23"],
                'Q4': ["Jan'24", "Feb'24", "Mar'24"]
            }
            type_map = {
                'Sales': 3,
            'Purchase': 4,
            'CM 1 - Gross Profit (A)': 5
            }
            month_map = {
                "Jan": "01",
                "Feb": "02",
                "Mar": "03",
                "Apr": "04",
                "May": "05",
                "Jun": "06",
                "Jul": "07",
                "Aug": "08",
                "Sep": "09",
                "Oct": "10",
                "Nov": "11",
                "Dec": "12"
            }
            
            mis_file_path = '/Users/kush/Downloads/MIS - Fy24.xlsx'
            extractor = Extract(mis_file_path)

            # Extract revenue, expense, and profit
            df = pd.read_excel(mis_file_path, sheet_name=None, header=None)
            df = {sheet_name: extractor.unmerge_cells(d) for sheet_name, d in df.items()}
            df = df['Financial MIS']
            revenue = extractor.extract_data(df, 'Sales', quarters, type_map, month_map)
            expense = extractor.extract_data(df, 'Purchase', quarters, type_map, month_map)
            profit = extractor.extract_data(df, 'CM 1 - Gross Profit (A)', quarters, type_map, month_map)

            # Combine all data
            financial_data = {
                'revenue': revenue,
                'expense': expense,
                'profit': profit
            }

            financial_data = json.dumps(financial_data, indent=4)
            
            print(financial_data)
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()

