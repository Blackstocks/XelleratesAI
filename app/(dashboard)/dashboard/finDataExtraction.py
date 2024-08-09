import os
import json
import pandas as pd
import re
import sys
import requests
from io import BytesIO
import io
from tabulate import tabulate
import google.generativeai as genai

prompt_template = """
You are an expert data extractor professor at a top university. Your task is to extract the total revenue, total expenditure and profit from the given data.

You Should:
1. Carefully analyse the comma separated data given.
2. Identify the monthly and yearly data of total revenue, total expenditure and profit (if present).
3. Categorise the data by month or year (whihchever you think is suitable).

Go through the data line by line and carefully analyse everything and put it in a json file in below format:

```json
{{
	"total_revenue":[
		{{
			"year": "The year of the total_revenue in 20XX form or YX if the year is not mentioned in numbers. "none" if the year is not present in the data.",
			"month": "The month of the total_revenue in MM form. Example: 01 if month is January, 11 if the month is November. "all" if the there is no specified month but year is mentioned. This would mean the value given is of all months of year 20XX.",
			"calculation": "The formula (if any) used to calculate total_revenue.",
			"value": "The value of the total_revenue."
		}}
	],
	"total_expenditure":[
		{{
			"year": "The year of the total_expenditure in 20XX form. "none" if the year is not present in the data.",
			"month": "The month of the total_expenditure in MM form. Example: 01 if month is January, 11 if the month is November. "all" if the there is no specified month but year is mentioned. This would mean the value given is of all months of year 20XX.",
			"calculation": "The formula (if any) used to calculate total_expenditure.",
			"value": "The value of the total_expenditure."
		}}
	],
	"profit":[
		{{
			"year": "The year of the profit in 20XX form. "none" if the year is not present in the data.",
			"month": "The month of the profit in MM form. Example: 01 if month is January, 11 if the month is November. "all" if the there is no specified month but year is mentioned. This would mean the value given is of all months of year 20XX.",
			"calculation": "The formula (if any) used to calculate profit.",
			"value": "The value of the profit."
		}}
	]
	
}}
```

Where:

- “total_revenue” or “total_expenditure” or “profit” is whether the data is of total_revenue
- “year” is the year in which the entity is calculated.
- “month” is the month in which the entity is calculated.
- “calculation” is the formula used to calculate the entity.
- “value” is the value (in numbers) of the entity.


** INSTRUCTIONS **

- The data provided is MIS reports of some company. The spreadsheet is converted into pandas dataframe and then given to you.
- The exact word for revenue, expenditure and profit may or may not be present in the data so you have to analyse the data and then find the revenue, expenditure and profit.
- The structure of the data may be different in every file like the months/year might be in column or row, the sum of months might be done horizontally, the month and year data may be mixed and many more.
- You should categorise the total revenue, total expenditure and profit year-wise or month-wise based on whatever data is given.
- You should write loss in terms of profit itself. Meaning Loss = negative of Profit. Example: If Loss = 100 then write it as Profit = -100
- Note that I'm going to use python json.loads() function to parse the json file, so please make sure the format is correct (don't add ',' before enclosing '}}' or ']' characters).
- Generate the complete json file and don't omit anything.
- Use '```json' and '```' to enclose the json file.
- Use double slash n for new line character.


** Here is one example for your reference: **

```json
{{
    "total_revenue": [
            {{"year": "2022", "month": “all”, "calculation": "Sales", "value": "31894829.0"}},
            {{"year": "2023", "month": “all”, "calculation": "Sales", "value": "38713096.0"}},
            {{"year": "2023", "month": "04", "calculation": "Sales", "value": "5640000.0"}},
            {{"year": "2023", "month": "05", "calculation": "Sales", "value": "6070000.0"}},
            {{"year": "2023", "month": "06", "calculation": "Sales", "value": "5990000.0"}},
            {{"year": "2023", "month": "07", "calculation": "Sales", "value": "7170000.0"}},
            {{"year": "2023", "month": "08", "calculation": "Sales", "value": "8810000.0"}},
            {{"year": "2023", "month": "09", "calculation": "Sales", "value": "8410000.0"}},
            {{"year": "2023", "month": "10", "calculation": "Sales", "value": "13700000.0"}},
            {{"year": "2023", "month": "11", "calculation": "Sales", "value": "12500000.0"}},
            {{"year": "2023", "month": "12", "calculation": "Sales", "value": "14870000.0"}},
            {{"year": "2024", "month": "01", "calculation": "Sales", "value": "15140000.0"}},
            {{"year": "2024", "month": "02", "calculation": "Sales", "value": "21150000.0"}},
            {{"year": "2024", "month": "03", "calculation": "Sales", "value": "22340000.0"}}
        ],
        "total_expenditure": [
            {{"year": "2022", "month": “all”, "calculation": "Purchase + Operational Expense(B) + HO Expense ( D )", "value": "92473245.0"}},
            {{"year": "2023", "month": “all”, "calculation": "Purchase + Operational Expense(B) + HO Expense ( D )", "value": "83386987.0"}},
            {{"year": "2023", "month": "04", "calculation": "Purchase + Operational Expense(B) + HO Expense ( D )", "value": "9559351.0"}},
            {{"year": "2023", "month": "05", "calculation": "Purchase + Operational Expense(B) + HO Expense ( D )", "value": "8522013.0"}}
        ],
        "profit": [
            {{"year": "2022", "month": “all”, "calculation": "CM 3 -  EBITDA (E=C-D)", "value": "-97313451.0"}},
            {{"year": "2023", "month": “all”, "calculation": "CM 3 -  EBITDA (E=C-D)", "value": "-82211138.0"}},
            {{"year": "2023", "month": "04", "calculation": "CM 3 -  EBITDA (E=C-D)", "value": "-8983120.0"}},
            {{"year": "2023", "month": "05", "calculation": "CM 3 -  EBITDA (E=C-D)", "value": "-7582689.0"}}
    ]
}}
```

The data is below. (If there are different sheets then the data will be in form of a dictionary with sheetname as key : comma separated sheet content as its value):
{data}

Take a deep breath and solve the problem step by step.

"""

prompt_template_target = """
You are an expert data extractor professor at a top university. Your task is to extract the {target} from the given data.

You Should:
1. Carefully analyse the comma separated data given.
2. Identify the monthly and yearly data of {target} (if present).
3. Categorise the data by month or year (whihchever you think is suitable).

Go through the data line by line and carefully analyse everything and put it in a json file in below format:

```json
{{
	"{target}":[
		{{
			"year":[,
                {{
                    "month": "The month of the {target} in MM form. Example: 01 if month is January, 11 if the month is November. "all" if the there is no specified month but year is mentioned. This would mean the value given is of all months of year 20XX.",
                    "calculation": "The formula (if any) used to calculate {target}.",
                    "value": "The value of the {target}."
                }}
            ]
		}}
	]
}}
```

Where:
- “year” is The year of the {target} in 20XX form or YX if the year is not mentioned in numbers. "none" if the year is not present in the data.
- “month” is the month in which the entity is calculated.
- “calculation” is the formula used to calculate the entity.
- “value” is the value (in numbers) of the entity.


** INSTRUCTIONS **

- The data provided is MIS reports of some company. The spreadsheet is converted into pandas dataframe and then given to you.
- The exact word for {target} may or may not be present in the data so you have to analyse the data and then find the {target}
- The structure of the data may be different in every file like the months/year might be in column or row, the sum of months might be done horizontally, the month and year data may be mixed and many more.
- You should categorise the {target} year-wise or month-wise based on whatever data is given.
- You should write loss in terms of profit itself. Meaning Loss = negative of Profit. Example: If Loss = 100 then write it as Profit = -100
- Note that I'm going to use python json.loads() function to parse the json file, so please make sure the format is correct (don't add ',' before enclosing '}}' or ']' characters).
- Generate the complete json file and don't omit anything.
- Use '```json' and '```' to enclose the json file.
- Use double slash n for new line character.


** Here is one example for your reference: **

```json
{{
    "{target}": [
        {{"2022":[ {{"month": “all”, "calculation": "Sales", "value": "31894829.0"}}]}},
        {{"2023": [
            {{"month": “all”, "calculation": "Sales", "value": "38713096.0"}},
            {{"month": "04", "calculation": "Sales", "value": "5640000.0"}},
            {{"month": "05", "calculation": "Sales", "value": "6070000.0"}},
            {{"month": "06", "calculation": "Sales", "value": "5990000.0"}},
            {{"month": "07", "calculation": "Sales", "value": "7170000.0"}},
            {{"month": "08", "calculation": "Sales", "value": "8810000.0"}},
            {{"month": "09", "calculation": "Sales", "value": "8410000.0"}},
            {{"month": "10", "calculation": "Sales", "value": "13700000.0"}},
            {{"month": "11", "calculation": "Sales", "value": "12500000.0"}},
            {{"month": "12", "calculation": "Sales", "value": "14870000.0"}}
        ]}},
        {{"2024:"[
            {{"month": "01", "calculation": "Sales", "value": "15140000.0"}},
            {{"year": "2024", "month": "02", "calculation": "Sales", "value": "21150000.0"}},
            {{"year": "2024", "month": "03", "calculation": "Sales", "value": "22340000.0"}}
        ]}}
    ]
}}
```

The data is below. (If there are different sheets then the data will be in form of a dictionary with sheetname as key : comma separated sheet content as its value):
{data}

Take a deep breath and solve the problem step by step.

"""

prompt_template_short="""
You are an expert data extractor professor at a top university. Your task is to extract the Revenue, Expense and Profit of the latest year present in the data from the given data.

You Should:
1. Carefully analyse the comma separated data given.
2. Identify the monthly and yearly data of Revenue, Expense and Profit (if present).
3. Categorise the data by month or year (whihchever you think is suitable).

Go through the data line by line and carefully analyse everything and put it in a json file in below format:

```json
{{
    "financials": [
        {{"name": "Financials", "value": "Updated Financial Data"}},
        {{"name": "Revenue", "value": "X", "calculation": "formula used to calculate the revenue."}},
        {{"name": "Expenses", "value": "Y", "calculation": "formula used to calculate the Expenses."}},
        {{"name": "Profit/Loss", "value": "Z", "calculation": "formula used to calculate the Profit/Loss."}},
    ]
}}
```

Where:
- {{"name": "Financials", "value": "Updated Financial Data"}} : this part remains constant in every file
- "Revenue" is the value which is the revenue of the latest year present in data. If only there are multiple months in latest year, then sum the revenue of each month.
- "Expenses" is the value which is the Expense of the latest year present in data. If only there are multiple months in latest year, then sum the expenses of each month.
- “Profit/Loss” is the value which is the Profit/Loss, this is simply calculated by doing Revenue - Expenses. 


** INSTRUCTIONS **

- The data provided is MIS reports of some company. The spreadsheet is converted into pandas dataframe and then given to you.
- The exact word for Revenue, Expense may or may not be present in the data so you have to analyse the data and then find the Revenue, Expense
- The structure of the data may be different in every file like the months/year might be in column or row, the sum of months might be done horizontally, the month and year data may be mixed and many more.
- You should categorise the Revenue, Expense and Profit year-wise or month-wise based on whatever data is given.
- Note that I'm going to use python json.loads() function to parse the json file, so please make sure the format is correct (don't add ',' before enclosing '}}' or ']' characters).
- Generate the complete json file and don't omit anything.
- Use '```json' and '```' to enclose the json file.
- Use double slash n for new line character.
- You should round all the values (numbers) to two digits.


** Here is one example for your reference: **

```json
{{
    "financials": [
        {{"name": "Financials", "value": "Updated Financial Data"}},
        {{"name": "Revenue", "value": "$200,000"}},
        {{"name": "Expenses", "value": "$150,000"}},
        {{"name": "Profit/Loss", "value": "$50,000"}},
    ]
}}
```

Where:
- {{"name": "Financials", "value": "Updated Financial Data"}} : this part remains constant in every file
- "Revenue" is the value which is the revenue of the latest year present in data. If there are multiple months in latest year, the revenue will be sum of revenues of each month.
- "Expenses" is the value which is the Expense of the latest year present in data. If there are multiple months in latest year, the expenses will be sum of expenses of each month.
- “Profit/Loss” is the value which is the Profit/Loss, this is simply calculated by doing Revenue - Expenses. 


The data is below. (If there are different sheets then the data will be in form of a dictionary with sheetname as key : comma separated sheet content as its value):
{data}

Take a deep breath and solve the problem step by step.

"""

prompt_template_short1= """
You are an expert data extractor professor at a top university, renowned for your ability to decipher complex financial datasets. Your task is to analyze the provided data, which represents MIS (Management Information System) reports, and extract the Revenue, Expense, and Profit for the latest reporting period present. 

Crucially, the structure and format of this data will vary between instances. You must rely on your advanced understanding of financial reporting principles and data analysis techniques to complete this extraction.

Here's a breakdown of the steps involved:

1. **Identify the Reporting Period:**
    * Analyze the data to determine the most granular reporting period available (e.g., monthly, quarterly, yearly).  The latest available period is the target.
    * Dates and time periods may be expressed in various formats – be prepared to parse them effectively. 

2. **Locate Key Financial Metrics:**
    * Identify the columns or data points representing "Revenue," "Expense," and "Profit/Loss." 
    * Column names will not be consistent.  Search for synonyms and variations like:
       * **Revenue:** Net Sales, Gross Sales, Total Revenue, Turnover
       * **Expenses:** Cost of Goods Sold (COGS), Operating Expenses, Total Expenses
       * **Profit/Loss:**  Net Income, Profit Before Tax, Operating Profit, Net Profit Margin

3. **Extract Data for the Latest Period:**
    * Once you've located the relevant metrics and the latest reporting period, extract the corresponding values.

4. **Calculate Profit/Loss (if necessary):**
    * If a "Profit/Loss" value isn't directly provided, calculate it using the extracted Revenue and Expense figures: Profit/Loss = Revenue - Expenses.

5. **Structure the Output:**
    * Present your extracted data in a JSON file with the following format:

    ```json
    {{
        "financials": [
            {{"name": "Financials", "value": "Updated Financial Data"}},
            {{"name": "Revenue", "value": "X", "calculation": "Explain how you determined the revenue value (e.g., 'Extracted from the latest month's 'Net Sales' column')"}},
            {{"name": "Expenses", "value": "Y", "calculation": "Explain how you determined the expenses value"}},
            {{"name": "Profit/Loss", "value": "Z", "calculation": "Explain how you determined the profit/loss value"}}
        ]
    }}
    ```
   
    * Ensure the JSON format is valid; avoid trailing commas in arrays and objects.
    * Use '\\n' for new line characters within the JSON.
    * Round all numerical values to two decimal places.

Remember, your goal is to demonstrate your expertise in extracting meaningful insights from diverse financial data.  Adaptive reasoning and a keen understanding of financial reporting are crucial. 
"""

prompt_template_target_Qwise = """
You are an expert data extractor professor at a top university, renowned for your ability to decipher complex financial datasets. Your task is to analyze the provided data, which represents MIS (Management Information System) reports, and extract the {target} for the latest reporting period present. 
Crucially, the structure and format of this data will vary between instances. You must rely on your advanced understanding of financial reporting principles and data analysis techniques to complete this extraction.

You Should:
1. Carefully analyse the comma separated data given.
2. Identify the monthly and yearly data of {target} (if present).
3. Categorise the data by month or year (whihchever you think is suitable).

Here's a breakdown of the steps involved:

1. **Identify the Latest Year and its Reporting Period:**
    * Analyze the data to determine the latest year present in the data.
    * Then determine the most granular reporting period available for the latest year (e.g., monthly, quarterly, yearly).
    * Dates and time periods may be expressed in various formats – be prepared to parse them effectively. 

2. **Locate Key Financial Metrics:**
    * Identify the columns or data points representing "{target}".
    * **Important:** The data points of {target} might be further segregated into different categories. For instance, you might find "Net {target} by Channel A," "Net {target} by Channel B," and so on.  In these cases, **calculate the overall {target} for each month by summing up all its subcategories.**
    * Column names will not be consistent.  Search for synonyms and variations like:
       * **Revenue:** Net Sales, Gross Sales, Total Revenue, Turnover if target is total_revenue
       * **Expenses:** Cost of Goods Sold (COGS), Operating Expenses, Total Expenses if target is total_expense
       * **Profit/Loss:**  Net Income, Profit Before Tax, Operating Profit, Net Profit Margin if target is profit

3. **Extract Data for the Latest Period:**
    * Once you've located the relevant metric for the latest year, extract the corresponding values.
    * Categorise the extracted data into quarters:
        * Q1: January (01) - March (03)
        * Q2: April (04) - June (06)
        * Q3: July (07) -  September (09)
        * Q4: October (10) - December (12)

4. **Calculate Quarterly {target} (if necessary):**
    * If the data is more granular than quarterly, sum the values within each quarter to derive the quarterly {target}.

5. **Structure the Output:**
    * Present your extracted data in a JSON file with the following format:


Go through the data line by line and carefully analyse everything and put it in a json file in below format:

```json
{{
	"{target}":[
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "calculation": "The formula (if any) used to calculate {target}.",
                    "value": "The value of the {target}."
                }}
            ]
		}}
	]
}}
```

Where:
- "QX" is the quater (Q1, Q2, Q3, Q4) of the {target} in the latest year in the QX format.
- “month” is the month of the {target} in MM form. Example: 01 if month is January, 11 if the month is November."
- “calculation” is the formula used to calculate the {target}.
- “value” is the value (in numbers) of the {target}.


** INSTRUCTIONS **
    * Ensure the JSON format is valid; avoid trailing commas in arrays and objects.
    * Use double slash n for new line characters within the JSON.
    * Round all numerical values to two decimal places.
    * If the provided data does not contain the entire year's data, include the available data in the respective quarter. For example, if you only have data up to May, your JSON output should include Q1 and data up to May in Q2, leaving the remaining months in Q2, Q3, and Q4 empty.
    * If the data of a specific month is not present then do not include the month in the QX.


** Here is one example for your reference: **

```json
{{
    "{target}": [
        {{"Q1":[ 
            {{"month": 01, "calculation": "Sales", "value": "31894829.0"}},
            {{"month": 02, "calculation": "Sales", "value": "41894829.0"}},
            {{"month": 03, "calculation": "Sales", "value": "37694829.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "calculation": "Sales", "value": "5640000.0"}},
            {{"month": "05", "calculation": "Sales", "value": "6070000.0"}},
            {{"month": "06", "calculation": "Sales", "value": "5990000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "calculation": "Sales", "value": "7170000.0"}},
            {{"month": "08", "calculation": "Sales", "value": "8810000.0"}},
            {{"month": "09", "calculation": "Sales", "value": "8410000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "calculation": "Sales", "value": "13700000.0"}},
            {{"month": "11", "calculation": "Sales", "value": "12500000.0"}},
            {{"month": "12", "calculation": "Sales", "value": "14870000.0"}}
        ]}}
    ]
}}
```

The data is below. (If there are different sheets then the data will be in form of a dictionary with sheetname as key : comma separated sheet content as its value):
{data}

Remember, your goal is to demonstrate your expertise in extracting meaningful insights from diverse financial data.  Adaptive reasoning and a keen understanding of financial reporting are crucial.

"""

prompt_template_Qwise = """
You are an expert data extractor professor at a top university, renowned for your ability to decipher complex financial datasets. Your task is to analyze the provided data, which represents MIS (Management Information System) reports, and extract the Revenue, Expense and Profit for the latest reporting period present. 
Crucially, the structure and format of this data will vary between instances. You must rely on your advanced understanding of financial reporting principles and data analysis techniques to complete this extraction.

Here's a breakdown of the steps involved:

1. **Identify the Latest Year and its Reporting Period:**
    * **Data Structuring:** The provided data is in a comma-separated format. Carefully analyze this data and convert it into a well-structured table. This table should have clearly defined columns and rows, making it easy to identify individual data points and their relationships.
    * **Latest Year Identification:**  Examine the structured table to determine the latest year present in the data. 
    * **Reporting Period Granularity:**  Determine the most granular reporting period available for that latest year. This could be monthly, quarterly, or yearly, depending on how the data is presented.
    * **Date and Time Parsing:**  Be prepared to handle dates and time periods expressed in various formats. Accurately parse these values to ensure you correctly identify the latest reporting period.

2. **Locate Key Financial Metrics:**
    * Identify the columns or data points representing "Revenue," "Expense," and "Profit."
    * **Crucially, monthly Revenue, Expense, and Profit values might be spread across multiple rows within each month's data.  For example, you might have separate rows or columns for "Amazon Revenue," "Flipkart Revenue," and "Myntra Revenue" within January's data. You MUST identify all relevant rows and columns for each metric within each month and sum their values to get the overall monthly Revenue, Expense, and Profit.**
    * Column names will not be consistent.  Search for synonyms and variations like:
       * **Revenue:** Net Sales, Gross Sales, Total Revenue, Turnover 
       * **Expenses:** Cost of Goods Sold (COGS), Operating Expenses, Total Expenses, Advertisements, etc
       * **Profit/Loss:**  Net Income, Profit Before Tax, Operating Profit, Net Profit Margin

3. **Extract Data for the Latest Period:**
    * Once you've located the relevant metric for the latest year, extract the corresponding values.
    * Categorise the extracted data into quarters:
        * Q1: January (01) - March (03)
        * Q2: April (04) - June (06)
        * Q3: July (07) -  September (09)
        * Q4: October (10) - December (12)

4. **Calculate all theree - Revenue, Expense and Profit:**
    * **As mentioned in step 2, sum up the values of all relevant subcategories within each month to obtain the overall monthly Revenue, Expense, and Profit.**

5. **Structure the Output:**
    * Present your extracted data in a JSON file with the following format:


Go through the data line by line and carefully analyse everything and put it in a json file in below format:

```json
{{
	"revenue":
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "calculation": "The formula (if any) used to calculate Revenue, Expense and Profit.",
                    "value": "The value of the Revenue, Expense and Profit."
                }}
            ]
		}},
	"expense":
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "calculation": "The formula (if any) used to calculate Revenue, Expense and Profit.",
                    "value": "The value of the Revenue, Expense and Profit."
                }}
            ]
		}},
	"profit":
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "calculation": "The formula (if any) used to calculate Revenue, Expense and Profit.",
                    "value": "The value of the Revenue, Expense and Profit."
                }}
            ]
		}}
}}
```

Where:
- "QX" is the quater (Q1, Q2, Q3, Q4) of the Revenue or Expense or Profit in the latest year in the QX format.
- “month” is the month of the Revenue, Expense and Profit in MM form. Example: 01 if month is January, 11 if the month is November."
- “calculation” is the formula used to calculate the Revenue, Expense and Profit.
- “value” is the value (in numbers) of the Revenue, Expense and Profit.


** INSTRUCTIONS **
    * Ensure the JSON format is valid; avoid trailing commas in arrays and objects.
    * Use double slash n for new line characters within the JSON.
    * Round all numerical values to two decimal places.
    * If the provided data does not contain the entire year's data, include the available data in the respective quarter. For example, if you only have data up to May, your JSON output should include Q1 and data up to May in Q2, leaving the remaining months in Q2, Q3, and Q4 empty.
    * If the data of a specific month is not present, then do not include the month in the QX.
    * Each QX should come only once in revenue, expense and profit as you are calculating it for the latest year only.
    * Ensure proper formatting is used for the JSON file. Ensure all brackets are properly closed. 


** Here is one example for your reference: **

```json
{{
    "revenue": 
        {{"Q1":[ 
            {{"month": 01, "calculation": "Sales", "value": "31894829.0"}},
            {{"month": 02, "calculation": "Sales", "value": "41894829.0"}},
            {{"month": 03, "calculation": "Sales", "value": "37694829.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "calculation": "Sales", "value": "5640000.0"}},
            {{"month": "05", "calculation": "Sales", "value": "6070000.0"}},
            {{"month": "06", "calculation": "Sales", "value": "5990000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "calculation": "Sales", "value": "7170000.0"}},
            {{"month": "08", "calculation": "Sales", "value": "8810000.0"}},
            {{"month": "09", "calculation": "Sales", "value": "8410000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "calculation": "Sales", "value": "13700000.0"}},
            {{"month": "11", "calculation": "Sales", "value": "12500000.0"}},
            {{"month": "12", "calculation": "Sales", "value": "14870000.0"}}
        ]}},
    "expense":
        {{"Q1":[ 
            {{"month": 01, "calculation": "Advertisements", "value": "3189429.0"}},
            {{"month": 02, "calculation": "Advertisements", "value": "4189829.0"}},
            {{"month": 03, "calculation": "Advertisements", "value": "3769429.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "calculation": "Advertisements", "value": "560000.0"}},
            {{"month": "05", "calculation": "Advertisements", "value": "607000.0"}},
            {{"month": "06", "calculation": "Advertisements", "value": "599000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "calculation": "Advertisements", "value": "717000.0"}},
            {{"month": "08", "calculation": "Advertisements", "value": "881000.0"}},
            {{"month": "09", "calculation": "Advertisements", "value": "841000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "calculation": "Advertisements", "value": "1370000.0"}},
            {{"month": "11", "calculation": "Advertisements", "value": "1250000.0"}},
            {{"month": "12", "calculation": "Advertisements", "value": "1487000.0"}}
        ]}},
    "profit": 
        {{"Q1":[ 
            {{"month": 01, "calculation": "revenue - expense", "value": "1894829.0"}},
            {{"month": 02, "calculation": "revenue - expense", "value": "1894829.0"}},
            {{"month": 03, "calculation": "revenue - expense", "value": "7694829.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "calculation": "revenue - expense", "value": "640000.0"}},
            {{"month": "05", "calculation": "revenue - expense", "value": "070000.0"}},
            {{"month": "06", "calculation": "revenue - expense", "value": "990000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "calculation": "revenue - expense", "value": "170000.0"}},
            {{"month": "08", "calculation": "revenue - expense", "value": "810000.0"}},
            {{"month": "09", "calculation": "revenue - expense", "value": "410000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "calculation": "revenue - expense", "value": "3700000.0"}},
            {{"month": "11", "calculation": "revenue - expense", "value": "2500000.0"}},
            {{"month": "12", "calculation": "revenue - expense", "value": "4870000.0"}}
        ]}}
}}
```

The data is below. (If there are different sheets then the data will be in form of a dictionary with sheetname as key : comma separated sheet content as its value):
{data}

Remember, your goal is to demonstrate your expertise in extracting meaningful insights from diverse financial data.  Adaptive reasoning and a keen understanding of financial reporting are crucial.

"""

prompt_template_Qwise_fixed_template = prompt_template_Qwise = """
You are an expert data extractor professor at a top university, renowned for your ability to decipher complex financial datasets. Your task is to analyze the provided data, which represents MIS (Management Information System) reports, and extract the Revenue, Expense and Profit for the latest reporting period present. 
Crucially, the structure and format of this data will vary between instances. You must rely on your advanced understanding of financial reporting principles and data analysis techniques to complete this extraction.

Here's a breakdown of the steps involved:

1. **Identify the Latest Year and its Reporting Period:**
    * **Data Structuring:** The provided data is in a comma-separated format. Carefully analyze this data and convert it into a well-structured table. This table should have clearly defined columns and rows, making it easy to identify individual data points and their relationships.
    * **Latest Year Identification:**  Examine the structured table to determine the latest year present in the data. 
    * **Reporting Period Granularity:**  Determine the most granular reporting period available for that latest year. This could be monthly, quarterly, or yearly, depending on how the data is presented.
    * **Date and Time Parsing:**  Be prepared to handle dates and time periods expressed in various formats. Accurately parse these values to ensure you correctly identify the latest reporting period.

2. **Locate Key Financial Metrics:**
    * Identify the columns or data points representing "Revenue," "Expense," and "Profit."
    * **Crucially, monthly Revenue, Expense, and Profit values might be spread across multiple rows within each month's data.  For example, you might have separate rows or columns for "Amazon Revenue," "Flipkart Revenue," and "Myntra Revenue" within January's data. You MUST identify all relevant rows and columns for each metric within each month and sum their values to get the overall monthly Revenue, Expense, and Profit.**
    * Column names will mostly be consistent:
        * Revenue: is denoted by Sales
        * Expense is denoted by Purchase
        

3. **Extract Data for the Latest Period:**
    * Once you've located the relevant metric for the latest year, extract the corresponding values.
    * Categorise the extracted data into quarters:
        * Q1: January (01) - March (03)
        * Q2: April (04) - June (06)
        * Q3: July (07) -  September (09)
        * Q4: October (10) - December (12)

4. **Calculate all theree - Revenue, Expense and Profit:**
    * **As mentioned in step 2, sum up the values of all relevant subcategories within each month to obtain the overall monthly Revenue, Expense, and Profit.**

5. **Structure the Output:**
    * Present your extracted data in a JSON file with the following format:


Go through the data line by line and carefully analyse everything and put it in a json file in below format:

```json
{{
	"revenue":
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "value": "The value of the Revenue, Expense and Profit."
                }}
            ]
		}},
        {{
			"yearly":[,
                {{
                    "month": "all",
                    "value": "The value of the Revenue of the latest year."
                }}
            ]
		}}    
	"expense":
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "value": "The value of the Revenue, Expense and Profit."
                }}
            ]
		}},
        {{
			"yearly":[,
                {{
                    "month": "all",
                    "value": "The value of the Revenue of the latest year."
                }}
            ]
		}} 
	"profit":
		{{
			"QX":[,
                {{
                    "month": "MM",
                    "value": "The value of the Revenue, Expense and Profit."
                }}
            ]
		}},
        {{
			"yearly":[,
                {{
                    "month": "all",
                    "value": "The value of the Revenue of the latest year."
                }}
            ]
		}} 
}}
```

Where:
- "QX" is the quater (Q1, Q2, Q3, Q4) of the Revenue or Expense or Profit in the latest year in the QX format.
- “month” is the month of the Revenue, Expense and Profit in MM form. Example: 01 if month is January, 11 if the month is November."
- “value” is the value (in numbers) of the Revenue, Expense and Profit.
- "yearly" is the value of the Revenue, Expense and Profit of the latest year available in the Yearly section of the data.


** INSTRUCTIONS **
    * Ensure the JSON format is valid; avoid trailing commas in arrays and objects.
    * Use double slash n for new line characters within the JSON.
    * Round all numerical values to two decimal places.
    * If the provided data does not contain the entire year's data, include the available data in the respective quarter. For example, if you only have data up to May, your JSON output should include Q1 and data up to May in Q2, leaving the remaining months in Q2, Q3, and Q4 empty.
    * If the data of a specific month is not present, then do not include the month in the QX.
    * Each QX should come only once in revenue, expense and profit as you are calculating it for the latest year only.
    * Ensure proper formatting is used for the JSON file. Ensure all brackets are properly closed. 


** Here is one example for your reference: **

```json
{{
    "revenue": 
        {{"Q1":[ 
            {{"month": 01, "value": "31894829.0"}},
            {{"month": 02, "value": "41894829.0"}},
            {{"month": 03, "value": "37694829.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "value": "5640000.0"}},
            {{"month": "05", "value": "6070000.0"}},
            {{"month": "06", "value": "5990000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "value": "7170000.0"}},
            {{"month": "08", "value": "8810000.0"}},
            {{"month": "09", "value": "8410000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "value": "13700000.0"}},
            {{"month": "11", "value": "12500000.0"}},
            {{"month": "12", "value": "14870000.0"}}
        ]}},
        {{"yearly:"[
            {{"month": "all", "value": "3700000.0"}},
        ]}}
    "expense":
        {{"Q1":[ 
            {{"month": 01, "value": "3189429.0"}},
            {{"month": 02, "value": "4189829.0"}},
            {{"month": 03, "value": "3769429.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "value": "560000.0"}},
            {{"month": "05", "value": "607000.0"}},
            {{"month": "06", "value": "599000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "value": "717000.0"}},
            {{"month": "08", "value": "881000.0"}},
            {{"month": "09", "value": "841000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "value": "1370000.0"}},
            {{"month": "11", "value": "1250000.0"}},
            {{"month": "12", "value": "1487000.0"}}
        ]}},
        {{"yearly:"[
            {{"month": "all", "value": "3700000.0"}},
        ]}}
    "profit": 
        {{"Q1":[ 
            {{"month": 01, "value": "1894829.0"}},
            {{"month": 02, "value": "1894829.0"}},
            {{"month": 03, "value": "7694829.0"}}            
        ]}},
        {{"Q2": [
            {{"month": "04", "value": "640000.0"}},
            {{"month": "05", "value": "070000.0"}},
            {{"month": "06", "value": "990000.0"}}
        ]}},
        {{"Q3:"[
            {{"month": "07", "value": "170000.0"}},
            {{"month": "08", "value": "810000.0"}},
            {{"month": "09", "value": "410000.0"}}
        ]}},
        {{"Q4:"[
            {{"month": "10", "value": "3700000.0"}},
            {{"month": "11", "value": "2500000.0"}},
            {{"month": "12", "value": "4870000.0"}}
        ]}},
        {{"yearly:"[
            {{"month": "all", "value": "3700000.0"}},
        ]}}
}}
```

The data is below. (If there are different sheets then the data will be in form of a dictionary with sheetname as key : comma separated sheet content as its value):
{data}

Remember, your goal is to demonstrate your expertise in extracting meaningful insights from diverse financial data.  Adaptive reasoning and a keen understanding of financial reporting are crucial.

"""


class Extract():
    def __init__(self, mis_file_path) -> None:
        self.mis_file_path = mis_file_path
        
    def llm_call(self, prompt):
        # with open("/Users/kush/Files/Data_Science/Intern/Task/codes/config.json") as f:
        #     config = json.load(f)
        genai.configure(api_key = "AIzaSyBJdbweKlzVAHRjzIlAUHze_AUBoLkPOUY")
        
        generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 100000,
        "response_mime_type": "application/json",
        }
        model = genai.GenerativeModel('gemini-1.5-pro', generation_config=generation_config,)
        response = model.generate_content(prompt)
        return response.text

        
    def _extract(self, path, state):
        try:
            # Check if path is a URL
            if path.startswith("http://") or path.startswith("https://"):
                response = requests.get(path)
                response.raise_for_status()  # Check for HTTP errors
                data = pd.read_excel(io.BytesIO(response.content), sheet_name=None)
            else:
                data = pd.read_excel(path, sheet_name=None)
            
            isSheets = False
            
            if isinstance(data, pd.DataFrame):
                csv_data = data.to_csv(index=False)
                # csv_data = tabulate(data, headers='keys', tablefmt='pretty') 
            elif isinstance(data, dict):
                isSheets = True
                data_sheets = {}
                for sheet_name, data in data.items():
                    csv_data = data.to_csv(index=False)
                    # csv_data = tabulate(data, headers='keys', tablefmt='pretty') 
                    data_sheets[sheet_name] = csv_data
            else:
                print("Error: Unexpected data format.")
                
            if isSheets == False:
                prompt = prompt_template_Qwise.format(data=csv_data)
            else:
                prompt = prompt_template_Qwise.format(data=data_sheets)
                
            # print(prompt,'\n\n\n')
            response = self.llm_call(prompt=prompt)
            
            print(response)
            
            output = response
            pattern = r"```json(.*?)```"
            match = re.search(pattern, output, re.DOTALL)
            if match:
                output = match.group(1).strip()
                
            update = json.loads(output, strict=False)
            state = update
            
            return state
            
        except Exception as e:
            print(f"An error occurred: {e}", file=sys.stderr)
            return None

    
    
    def _extract_individual(self, path, state):
        
        
        try:
            if path.startswith("http://") or path.startswith("https://"):
                response = requests.get(path)
                response.raise_for_status()  # Check for HTTP errors
                data = pd.read_excel(io.BytesIO(response.content), sheet_name=None)
            else:
                data = pd.read_excel(path, sheet_name=None)
        
            isSheets = False
            
            if isinstance(data, pd.DataFrame):
                # csv_data = data.to_csv(index=False)
                csv_data = tabulate(data, headers='keys', tablefmt='pretty') 
            elif isinstance(data, dict):
                isSheets = True
                data_sheets = {}
                for sheet_name, data in data.items():
                    data_sheets[sheet_name] = data.to_csv(index=False)
            else:
                print("Error: Unexpected data format.")
                
            final_output = {}
            targets = ["total_revenue", "total_expenditure", "profit"]
            
            for target in targets:
                
                if isSheets == False:
                    prompt = prompt_template_target_Qwise.format(data=csv_data, target = target)
                else:
                    prompt = prompt_template_target_Qwise.format(data=data_sheets, target = target)
                
                final_output[target] = None
                response = self.llm_call(prompt=prompt)
                
                print(response)
            
                output = response
                pattern = r"```json(.*?)```"
                match = re.search(pattern, output, re.DOTALL)
                if match:
                    output = match.group(1).strip()
                
                output = json.loads(output)
                final_output.update(output)
                
            # update = json.loads(str(final_output), strict=False)
            update = final_output
            state = update
            # with open("output.json", "w") as f:
            #     json.dump(update, f, indent=4)
                
            return state
        
        except Exception as e:
            print(f"An error occurred: {e}", file=sys.stderr)
            return None
        
def save_json(data, output_file):
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def main():
    try:
        if len(sys.argv) < 2:
            print("Error: MIS file path not provided")
            sys.exit(1)

        mis_file_path = sys.argv[1]
                
        # mis_file_path = "/Users/kush/Files/Data_Science/Intern/Task/files/Mildcares - Channel wise sales MIS Report.xlsx"
        
        extractor = Extract(mis_file_path)
        state = []
        data = extractor._extract(mis_file_path, state)
        
        if data is not None:
            save_json(data, 'output.json')
        else:
            print("Error: Data extraction failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        
if __name__ == "__main__":
    main()