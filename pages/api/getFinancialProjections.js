import xlsx from 'xlsx';
import axios from 'axios';
import {GoogleGenerativeAI} from "@google/generative-ai";


const TEMPLATE = `
You are a meticulous and expert financial analyst, renowned for your exceptional ability to extract precise insights from complex financial projections. Your task is to analyze the provided data, representing financial projections for a business, and accurately extract the yearly revenue projections from various revenue streams.

The data is presented in a comma-separated format, similar to an Excel sheet, and requires careful structuring before analysis. Follow the instructions below with utmost precision:

1. Data Structuring:
  * The provided data is in a comma-separated format. Visualize this data as an Excel sheet and transform it into a well-organized table, accurately reflecting the rows and columns as they would appear in Excel.
  * Critically identify the header rows. The headers may span multiple rows and could deviate from standard formats. Carefully determine which rows contain headers and clarify what each column represents.
  * Empty cells in header rows must inherit the header from the preceding filled cell. For example, if "Revenue from Agri Inputs - B2B" appears above certain columns and the adjacent cells are empty, these should be treated as part of the same header.
  * Standardize numerical values by removing commas and spaces. Convert all numbers into a numeric format before further processing.
2. Identify Revenue Streams:
  * After structuring the data, identify all distinct revenue streams. These may include labels like "Revenue from X" or "Sales of Y".
  * Be alert for subcategories within revenue streams. For example, "Revenue from Product A" and "Revenue from Product B" could both fall under a broader "Product Revenue" category.
3. Extract Yearly Revenue:
  * For each identified revenue stream, extract the yearly revenue projections.
  * Monthly revenue data (M0, M1, M2, etc.) needs to be aggregated to determine the yearly totals. Utilize the month labels (e.g., Apr-24, May-24) to ensure that revenue is correctly attributed to the appropriate year.
4. Adapt to Data Variations:
  * The format and structure of the provided data might vary between different financial projection reports. Adapt your approach dynamically to handle these variations while ensuring accuracy.
5. Output Structure:
  * Present your findings in a JSON format, structured as follows:
json
{
      "revenue_projections": [
        {
          "revenue_stream": "Name of Revenue Stream 1",
          "yearly_data": [
            {"YYYY":[
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              ]
            },
            {"YYYY":[
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              ]
            }

            //... yearly data for this stream
          ]
        },
        {
          "revenue_stream": "Name of Revenue Stream 2",
          "yearly_data": [
            {"YYYY":[
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              ]
            },
            {"YYYY":[
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              { "M: "the month of the year",
              "X": "Value in lakhs"},
              ]
            }

            //... yearly data for this stream
          ]
        }
      ]
    }


  * Ensure JSON format validity: Use double quotes for all keys and string values, and ensure no trailing commas.
  * Round all revenue projections to two decimal places.

- Additional Instructions:
* Exercise extreme precision in your analysis to avoid any hallucinations. Base your extractions solely on the provided data.
* Do not extrapolate or make assumptions beyond what is explicitly stated in the data.
* Your primary role is to accurately report the numbers as they appear in the data and to map them to the correct fields in the JSON output.

Example Data:
,Figures in," 100,000 ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,Revenue Streams,,M0,M1,M2,M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13,M14,M15,M16,M17,M18,M19,M20,M21,M22,M23,M24,M25,M26,M27,M28,M29,M30,M31,M32,M33,M34,M35,M36,M37,M38,M39,M40,M41,M42,M43,M44,M45,M46,M47,M48,M49,M50,M51,M52,M53,M54,M55,M56,M57,M58,M59,M60,-,,,,,
,,1,Apr-24,May-24,Jun-24,Jul-24,Aug-24,Sep-24,Oct-24,Nov-24,Dec-24,Jan-25,Feb-25,Mar-25,Apr-25,May-25,Jun-25,Jul-25,Aug-25,Sep-25,Oct-25,Nov-25,Dec-25,Jan-26,Feb-26,Mar-26,Apr-26,May-26,Jun-26,Jul-26,Aug-26,Sep-26,Oct-26,Nov-26,Dec-26,Jan-27,Feb-27,Mar-27,Apr-27,May-27,Jun-27,Jul-27,Aug-27,Sep-27,Oct-27,Nov-27,Dec-27,Jan-28,Feb-28,Mar-28,Apr-28,May-28,Jun-28,Jul-28,Aug-28,Sep-28,Oct-28,Nov-28,Dec-28,Jan-29,Feb-29,Mar-29,Apr-29,-,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, - ,,,,,
, Total No. of Farmers- From Online & Offline Marketing ,," 3,476 "," 3,611 "," 3,756 "," 3,914 "," 4,834 "," 5,017 "," 5,216 "," 5,627 "," 6,623 "," 6,888 "," 7,175 "," 7,485 "," 8,569 "," 10,696 "," 11,078 "," 11,484 "," 11,914 "," 12,370 "," 13,603 "," 14,799 "," 15,381 "," 15,997 "," 16,651 "," 17,344 "," 18,828 "," 28,194 "," 28,633 "," 29,080 "," 29,536 "," 30,002 "," 31,226 "," 33,846 "," 34,381 "," 34,927 "," 35,483 "," 36,051 "," 37,380 "," 67,858 "," 68,450 "," 69,047 "," 69,651 "," 70,260 "," 71,646 "," 78,709 "," 79,399 "," 80,097 "," 80,802 "," 81,513 "," 83,002 "," 240,512 "," 242,803 "," 245,117 "," 247,455 "," 249,816 "," 253,001 "," 336,776 "," 340,020 "," 343,295 "," 346,604 "," 349,946 "," 354,121 ", - ,,,,,
, Cumulative No. of Farmers- From Online & Offline Marketing ,," 3,476 "," 7,086 "," 10,843 "," 14,756 "," 19,590 "," 24,607 "," 29,823 "," 35,450 "," 42,073 "," 48,962 "," 56,137 "," 63,622 "," 72,190 "," 82,886 "," 93,964 "," 105,448 "," 117,362 "," 129,732 "," 143,335 "," 158,134 "," 173,515 "," 189,513 "," 206,163 "," 223,507 "," 242,335 "," 270,530 "," 299,162 "," 328,243 "," 357,779 "," 387,781 "," 419,007 "," 452,853 "," 487,234 "," 522,161 "," 557,645 "," 593,696 "," 631,076 "," 698,935 "," 767,385 "," 836,432 "," 906,083 "," 976,344 "," 1,047,990 "," 1,126,698 "," 1,206,098 "," 1,286,195 "," 1,366,996 "," 1,448,510 "," 1,531,512 "," 1,772,024 "," 2,014,827 "," 2,259,944 "," 2,507,399 "," 2,757,215 "," 3,010,216 "," 3,346,992 "," 3,687,012 "," 4,030,307 "," 4,376,911 "," 4,726,857 "," 5,080,978 ", - ,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, - ,,,,,
 1 , Revenue from Subscription from Farmers ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, - ,,,,,
, No of Subscribed Farmers ,, 180 , 189 , 198 , 208 , 219 , 230 , 241 , 253 , 266 , 279 , 293 , 308 , 323 , 339 , 356 , 374 , 393 , 413 , 433 , 455 , 478 , 501 , 527 , 553 , 581 , 610 , 640 , 672 , 706 , 741 , 778 , 817 , 858 , 901 , 946 , 993 ," 1,043 "," 1,095 "," 1,149 "," 1,207 "," 1,267 "," 1,331 "," 1,397 "," 1,467 "," 1,540 "," 1,617 "," 1,698 "," 1,783 "," 1,872 "," 1,966 "," 2,064 "," 2,167 "," 2,276 "," 2,389 "," 2,509 "," 2,634 "," 2,766 "," 2,904 "," 3,050 "," 3,202 "," 3,362 ", - ,,,,,
, Cumulative no of subscribers ,, 180 , 369 , 567 , 776 , 995 ," 1,224 "," 1,466 "," 1,719 "," 1,985 "," 2,264 "," 2,557 "," 2,865 "," 3,188 "," 3,528 "," 3,884 "," 4,258 "," 4,651 "," 5,064 "," 5,497 "," 5,952 "," 6,429 "," 6,931 "," 7,457 "," 8,010 "," 8,591 "," 9,200 "," 9,840 "," 10,512 "," 11,218 "," 11,959 "," 12,737 "," 13,554 "," 14,411 "," 15,312 "," 16,258 "," 17,251 "," 18,293 "," 19,388 "," 20,537 "," 21,744 "," 23,011 "," 24,342 "," 25,739 "," 27,206 "," 28,746 "," 30,363 "," 32,061 "," 33,845 "," 35,717 "," 37,683 "," 39,747 "," 41,914 "," 44,190 "," 46,579 "," 49,088 "," 51,723 "," 54,489 "," 57,393 "," 60,443 "," 63,645 "," 67,007 ",,,,,,
, Churn rate ,50%,,,,,,,,,,,,, 90 , 185 , 284 , 388 , 497 , 612 , 733 , 859 , 992 ," 1,132 "," 1,279 "," 1,433 "," 1,594 "," 1,764 "," 1,942 "," 2,129 "," 2,326 "," 2,532 "," 2,749 "," 2,976 "," 3,215 "," 3,465 "," 3,729 "," 4,005 "," 4,295 "," 4,600 "," 4,920 "," 5,256 "," 5,609 "," 5,979 "," 6,368 "," 6,777 "," 7,206 "," 7,656 "," 8,129 "," 8,625 "," 9,147 "," 9,694 "," 10,269 "," 10,872 "," 11,506 "," 12,171 "," 12,869 "," 13,603 "," 14,373 "," 15,182 "," 16,031 "," 16,922 "," 17,858 ",,,,,,
, Total no. of Retained Subscribers ,, 180 , 369 , 567 , 776 , 995 ," 1,224 "," 1,466 "," 1,719 "," 1,985 "," 2,264 "," 2,557 "," 2,865 "," 3,098 "," 3,343 "," 3,600 "," 3,870 "," 4,154 "," 4,452 "," 4,764 "," 5,092 "," 5,437 "," 5,799 "," 6,179 "," 6,578 "," 6,997 "," 7,437 "," 7,898 "," 8,383 "," 8,892 "," 9,427 "," 9,988 "," 10,578 "," 11,197 "," 11,847 "," 12,529 "," 13,245 "," 13,998 "," 14,788 "," 15,617 "," 16,488 "," 17,402 "," 18,362 "," 19,370 "," 20,429 "," 21,540 "," 22,707 "," 23,933 "," 25,219 "," 26,570 "," 27,989 "," 29,478 "," 31,042 "," 32,684 "," 34,408 "," 36,219 "," 38,120 "," 40,116 "," 42,212 "," 44,412 "," 46,723 "," 49,149 ",,,,,,
, Pricing (per year) , 299 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, - ,,,,,
, Total Revenue generated from Subscription ,,0.54,1.10,1.70,2.32,2.97,3.66,4.38,5.14,5.93,6.77,7.65,8.57,9.26,10.00,10.77,11.57,12.42,13.31,14.25,15.23,16.26,17.34,18.47,19.67,20.92,22.24,23.62,25.07,26.59,28.19,29.87,31.63,33.48,35.42,37.46,39.60,41.85,44.21,46.69,49.30,52.03,54.90,57.92,61.08,64.41,67.89,71.56,75.41,79.45,83.69,88.14,92.82,97.73,102.88,108.29,113.98,119.95,126.21,132.79,139.70,146.96, - ,,,,,
, Cumulative Revenue generated from Subscription ,,0.54,1.64,3.34,5.66,8.63,12.29,16.67,21.81,27.75,34.52,42.16,50.73,59.99,69.99,80.76,92.33,104.75,118.06,132.30,147.53,163.79,181.13,199.60,219.27,240.19,262.42,286.04,311.11,337.70,365.88,395.75,427.38,460.85,496.27,533.74,573.34,615.19,659.41,706.10,755.40,807.43,862.34,920.25,981.34,"1,045.74","1,113.64","1,185.19","1,260.60","1,340.05","1,423.73","1,511.87","1,604.69","1,702.41","1,805.29","1,913.59","2,027.57","2,147.51","2,273.73","2,406.52","2,546.22","2,693.17", - ,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, - ,,,,,
 2 , Revenue from Agri Inputs - B2F ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, - ,,,,,
, No. of Orders per month ,, 550 , 500 , 350 , 350 , 350 , 600 , 700 , 900 , 600 , 700 , 800 , 800 , 660 , 600 , 420 , 420 , 420 , 720 , 840 ," 1,080 ", 720 , 840 , 960 , 960 , 891 , 810 , 567 , 567 , 567 , 972 ," 1,134 "," 1,458 ", 972 ," 1,134 "," 1,296 "," 1,296 "," 1,381 "," 1,256 ", 879 , 879 , 879 ," 1,507 "," 1,758 "," 2,260 "," 1,507 "," 1,758 "," 2,009 "," 2,009 "," 2,762 "," 2,511 "," 1,758 "," 1,758 "," 1,758 "," 3,013 "," 3,515 "," 4,520 "," 3,013 "," 3,515 "," 4,018 "," 4,018 "," 5,524 ",,,,,,
, Avg. Order value ," 7,500 "," 7,500 ",,,,,,," 7,950 ",,,,,," 8,427 ",,,,,," 9,270 ",,,,,," 10,382 ",,,,,," 11,628 ",,,,,," 13,256 ",,,,,," 15,112 ",,,,,," 17,227 ",,,,,," 19,811 ",,,,,, - ,,,,,
, Total Revenue from Agri Inputs - B2F ,, 41 , 38 , 26 , 26 , 26 , 45 , 53 , 68 , 45 , 53 , 60 , 60 , 50 , 45 , 32 , 32 , 32 , 54 , 63 , 81 , 54 , 63 , 72 , 72 , 67 , 61 , 43 , 43 , 43 , 73 , 85 , 109 , 73 , 85 , 97 , 97 , 104 , 94 , 66 , 66 , 66 , 113 , 132 , 169 , 113 , 132 , 151 , 151 , 207 , 188 , 132 , 132 , 132 , 226 , 264 , 339 , 226 , 264 , 301 , 301 , 414 , - ,,,,,
, Cumulative Revenue from Agri Inputs - B2F ,, 41 , 79 , 105 , 131 , 158 , 203 , 255 , 323 , 368 , 420 , 480 , 540 , 590 , 635 , 666 , 698 , 729 , 783 , 846 , 927 , 981 ," 1,044 "," 1,116 "," 1,188 "," 1,255 "," 1,316 "," 1,358 "," 1,401 "," 1,443 "," 1,516 "," 1,601 "," 1,710 "," 1,783 "," 1,868 "," 1,966 "," 2,063 "," 2,166 "," 2,261 "," 2,326 "," 2,392 "," 2,458 "," 2,571 "," 2,703 "," 2,873 "," 2,986 "," 3,117 "," 3,268 "," 3,419 "," 3,626 "," 3,814 "," 3,946 "," 4,078 "," 4,210 "," 4,436 "," 4,699 "," 5,038 "," 5,264 "," 5,528 "," 5,829 "," 6,131 "," 6,545 ",,,,,,
,,, -   ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,#REF!,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,#REF!,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,


The output:
{
  "revenue_projections": [
    {
      "revenue_stream": "Revenue from Subscription from Farmers",
      "yearly_data": [
        {
          "2024": [
            { "MM": "Apr-24", "value": "0.54" },
            { "MM": "May-24", "value": "1.10" },
            { "MM": "Jun-24", "value": "1.70" },
            { "MM": "Jul-24", "value": "2.32" },
            { "MM": "Aug-24", "value": "2.97" },
            { "MM": "Sep-24", "value": "3.66" },
            { "MM": "Oct-24", "value": "4.38" },
            { "MM": "Nov-24", "value": "5.14" },
            { "MM": "Dec-24", "value": "5.93" }
          ]
        },
        {
          "2025": [
            { "MM": "Jan-25", "value": "6.77" },
            { "MM": "Feb-25", "value": "7.65" },
            { "MM": "Mar-25", "value": "8.57" },
            { "MM": "Apr-25", "value": "9.26" },
            { "MM": "May-25", "value": "10.00" },
            { "MM": "Jun-25", "value": "10.77" },
            { "MM": "Jul-25", "value": "11.57" },
            { "MM": "Aug-25", "value": "12.42" },
            { "MM": "Sep-25", "value": "13.31" },
            { "MM": "Oct-25", "value": "14.25" },
            { "MM": "Nov-25", "value": "15.23" },
            { "MM": "Dec-25", "value": "16.26" }
          ]
        },
        {
          "2026": [
            { "MM": "Jan-26", "value": "17.34" },
            { "MM": "Feb-26", "value": "18.47" },
            { "MM": "Mar-26", "value": "19.67" },
            { "MM": "Apr-26", "value": "20.92" },
            { "MM": "May-26", "value": "22.24" },
            { "MM": "Jun-26", "value": "23.62" },
            { "MM": "Jul-26", "value": "25.07" },
            { "MM": "Aug-26", "value": "26.59" },
            { "MM": "Sep-26", "value": "28.19" },
            { "MM": "Oct-26", "value": "29.87" },
            { "MM": "Nov-26", "value": "31.63" },
            { "MM": "Dec-26", "value": "33.48" }
          ]
        },
        {
          "2027": [
            { "MM": "Jan-27", "value": "35.42" },
            { "MM": "Feb-27", "value": "37.46" },
            { "MM": "Mar-27", "value": "39.60" },
            { "MM": "Apr-27", "value": "41.85" },
            { "MM": "May-27", "value": "44.21" },
            { "MM": "Jun-27", "value": "46.69" },
            { "MM": "Jul-27", "value": "49.30" },
            { "MM": "Aug-27", "value": "52.03" },
            { "MM": "Sep-27", "value": "54.90" },
            { "MM": "Oct-27", "value": "57.92" },
            { "MM": "Nov-27", "value": "61.08" },
            { "MM": "Dec-27", "value": "64.41" }
          ]
        },
        {
          "2028": [
            { "MM": "Jan-28", "value": "67.89" },
            { "MM": "Feb-28", "value": "71.56" },
            { "MM": "Mar-28", "value": "75.41" },
            { "MM": "Apr-28", "value": "79.45" },
            { "MM": "May-28", "value": "83.69" },
            { "MM": "Jun-28", "value": "88.14" },
            { "MM": "Jul-28", "value": "92.82" },
            { "MM": "Aug-28", "value": "97.73" },
            { "MM": "Sep-28", "value": "102.88" },
            { "MM": "Oct-28", "value": "108.29" },
            { "MM": "Nov-28", "value": "113.98" },
            { "MM": "Dec-28", "value": "119.95" }
          ]
        },
        {
          "2029": [
            { "MM": "Jan-29", "value": "126.21" },
            { "MM": "Feb-29", "value": "132.79" },
            { "MM": "Mar-29", "value": "139.70" },
            { "MM": "Apr-29", "value": "146.96" }
          ]
        }
      ]
    },
    {
      "revenue_stream": "Revenue from Agri Inputs - B2F",
      "yearly_data": [
        {
          "2024": [
            { "MM": "Apr-24", "value": "41.00" },
            { "MM": "May-24", "value": "38.00" },
            { "MM": "Jun-24", "value": "26.00" },
            { "MM": "Jul-24", "value": "26.00" },
            { "MM": "Aug-24", "value": "26.00" },
            { "MM": "Sep-24", "value": "45.00" },
            { "MM": "Oct-24", "value": "53.00" },
            { "MM": "Nov-24", "value": "68.00" },
            { "MM": "Dec-24", "value": "45.00" }
          ]
        },
        {
          "2025": [
            { "MM": "Jan-25", "value": "53.00" },
            { "MM": "Feb-25", "value": "60.00" },
            { "MM": "Mar-25", "value": "60.00" },
            { "MM": "Apr-25", "value": "50.00" },
            { "MM": "May-25", "value": "45.00" },
            { "MM": "Jun-25", "value": "32.00" },
            { "MM": "Jul-25", "value": "32.00" },
            { "MM": "Aug-25", "value": "32.00" },
            { "MM": "Sep-25", "value": "54.00" },
            { "MM": "Oct-25", "value": "63.00" },
            { "MM": "Nov-25", "value": "81.00" },
            { "MM": "Dec-25", "value": "54.00" }
          ]
        },
        {
          "2026": [
            { "MM": "Jan-26", "value": "63.00" },
            { "MM": "Feb-26", "value": "72.00" },
            { "MM": "Mar-26", "value": "72.00" },
            { "MM": "Apr-26", "value": "67.00" },
            { "MM": "May-26", "value": "61.00" },
            { "MM": "Jun-26", "value": "43.00" },
            { "MM": "Jul-26", "value": "43.00" },
            { "MM": "Aug-26", "value": "43.00" },
            { "MM": "Sep-26", "value": "73.00" },
            { "MM": "Oct-26", "value": "85.00" },
            { "MM": "Nov-26", "value": "109.00" },
            { "MM": "Dec-26", "value": "73.00" }
          ]
        },
        {
          "2027": [
            { "MM": "Jan-27", "value": "85.00" },
            { "MM": "Feb-27", "value": "97.00" },
            { "MM": "Mar-27", "value": "97.00" },
            { "MM": "Apr-27", "value": "104.00" },
            { "MM": "May-27", "value": "94.00" },
            { "MM": "Jun-27", "value": "66.00" },
            { "MM": "Jul-27", "value": "66.00" },
            { "MM": "Aug-27", "value": "66.00" },
            { "MM": "Sep-27", "value": "113.00" },
            { "MM": "Oct-27", "value": "132.00" },
            { "MM": "Nov-27", "value": "169.00" },
            { "MM": "Dec-27", "value": "113.00" }
          ]
        },
        {
          "2028": [
            { "MM": "Jan-28", "value": "132.00" },
            { "MM": "Feb-28", "value": "151.00" },
            { "MM": "Mar-28", "value": "151.00" },
            { "MM": "Apr-28", "value": "207.00" },
            { "MM": "May-28", "value": "188.00" },
            { "MM": "Jun-28", "value": "132.00" },
            { "MM": "Jul-28", "value": "132.00" },
            { "MM": "Aug-28", "value": "132.00" },
            { "MM": "Sep-28", "value": "226.00" },
            { "MM": "Oct-28", "value": "264.00" },
            { "MM": "Nov-28", "value": "339.00" },
            { "MM": "Dec-28", "value": "226.00" }
          ]
        },
        {
          "2029": [
            { "MM": "Jan-29", "value": "264.00" },
            { "MM": "Feb-29", "value": "301.00" },
            { "MM": "Mar-29", "value": "301.00" },
            { "MM": "Apr-29", "value": "414.00" }
          ]
        }
      ]
    },
    {
      "revenue_stream": "Revenue from Agri Inputs - B2B",
      "yearly_data": [
        {
          "2024": [
            { "MM": "Apr-24", "value": "900.00" },
            { "MM": "May-24", "value": "990.00" },
            { "MM": "Jun-24", "value": "1089.00" },
            { "MM": "Jul-24", "value": "1198.00" },
            { "MM": "Aug-24", "value": "1318.00" },
            { "MM": "Sep-24", "value": "1449.00" },
            { "MM": "Oct-24", "value": "1594.00" },
            { "MM": "Nov-24", "value": "1754.00" },
            { "MM": "Dec-24", "value": "1403.00" }
          ]
        },
        {
          "2025": [
            { "MM": "Jan-25", "value": "1333.00" },
            { "MM": "Feb-25", "value": "1200.00" },
            { "MM": "Mar-25", "value": "840.00" },
            { "MM": "Apr-25", "value": "1125.00" },
            { "MM": "May-25", "value": "1238.00" },
            { "MM": "Jun-25", "value": "1361.00" },
            { "MM": "Jul-25", "value": "1497.00" },
            { "MM": "Aug-25", "value": "1647.00" },
            { "MM": "Sep-25", "value": "1812.00" },
            { "MM": "Oct-25", "value": "1993.00" },
            { "MM": "Nov-25", "value": "2192.00" },
            { "MM": "Dec-25", "value": "1754.00" }
          ]
        },
        {
          "2026": [
            { "MM": "Jan-26", "value": "1666.00" },
            { "MM": "Feb-26", "value": "1500.00" },
            { "MM": "Mar-26", "value": "1050.00" },
            { "MM": "Apr-26", "value": "1406.00" },
            { "MM": "May-26", "value": "1547.00" },
            { "MM": "Jun-26", "value": "1702.00" },
            { "MM": "Jul-26", "value": "1872.00" },
            { "MM": "Aug-26", "value": "2059.00" },
            { "MM": "Sep-26", "value": "2265.00" },
            { "MM": "Oct-26", "value": "2491.00" },
            { "MM": "Nov-26", "value": "2740.00" },
            { "MM": "Dec-26", "value": "2192.00" }
          ]
        },
        {
          "2027": [
            { "MM": "Jan-27", "value": "2083.00" },
            { "MM": "Feb-27", "value": "1874.00" },
            { "MM": "Mar-27", "value": "1312.00" },
            { "MM": "Apr-27", "value": "1758.00" },
            { "MM": "May-27", "value": "1934.00" },
            { "MM": "Jun-27", "value": "2127.00" },
            { "MM": "Jul-27", "value": "2340.00" },
            { "MM": "Aug-27", "value": "2574.00" },
            { "MM": "Sep-27", "value": "2831.00" },
            { "MM": "Oct-27", "value": "3114.00" },
            { "MM": "Nov-27", "value": "3425.00" },
            { "MM": "Dec-27", "value": "2740.00" }
          ]
        },
        {
          "2028": [
            { "MM": "Jan-28", "value": "2603.00" },
            { "MM": "Feb-28", "value": "2343.00" },
            { "MM": "Mar-28", "value": "1640.00" },
            { "MM": "Apr-28", "value": "2197.00" },
            { "MM": "May-28", "value": "2417.00" },
            { "MM": "Jun-28", "value": "2659.00" },
            { "MM": "Jul-28", "value": "2925.00" },
            { "MM": "Aug-28", "value": "3217.00" },
            { "MM": "Sep-28", "value": "3539.00" },
            { "MM": "Oct-28", "value": "3893.00" },
            { "MM": "Nov-28", "value": "4282.00" },
            { "MM": "Dec-28", "value": "3425.00" }
          ]
        },
        {
          "2029": [
            { "MM": "Jan-29", "value": "3254.00" },
            { "MM": "Feb-29", "value": "2929.00" },
            { "MM": "Mar-29", "value": "2050.00" },
            { "MM": "Apr-29", "value": "2747.00" }
          ]
        }
      ]
    }
  ]
}

Take a moment to approach this task step by step, ensuring the highest level of accuracy in your JSON output.

Below is the data:
{data}

Now, proceed with the task and output the JSON file only.
`

async function selectRevenueSheet(fileUrl) {
    try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const data = response.data;
        const workbook = xlsx.read(data, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;

        let selectedSheetName;

        if (sheetNames.length === 1) {
            selectedSheetName = sheetNames[0];
        } else {
            selectedSheetName = sheetNames.find(sheetName => 
                sheetName.toLowerCase().includes('revenue')
            );
        }

        if (!selectedSheetName) {
            console.log("No sheet with 'revenue' found. Selecting the first sheet.");
            selectedSheetName = sheetNames[0];
        }

        const selectedSheet = workbook.Sheets[selectedSheetName];

        let csvData = xlsx.utils.sheet_to_csv(selectedSheet);

        let rows = csvData.split('\n');

        rows = rows.map(row => {
            const cells = row.split(',');

            if (cells.every(cell => cell.trim() === '')) {
                return '';
            } else {
                return row; 
            }
        });
        csvData = rows.filter(row => row !== '').join('\n').trim();

        // console.log('csvData: ', csvData);
        return csvData;
    } catch (error) {
        console.error("Error processing the Excel file:", error);
        throw new Error("Failed to process the Excel file.");
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const fileUrl  = req.body;

    if (!fileUrl) {
        return res.status(400).json({ message: 'fileUrl is required in the request body' });
    }

    try {
        const financialProjectionData = await selectRevenueSheet(fileUrl);

        const genAI = new GoogleGenerativeAI('AIzaSyC5SHITdbn39r46lODI_6YFRIo3Z6zo_5Y');
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = TEMPLATE.replace('{data}', financialProjectionData);

        const result = await model.generateContent(prompt);

        const jsonResponse = JSON.parse(result.response.text());
        return res.status(200).json(jsonResponse);

    } catch (error) {
        console.error("Error generating financial response:", error);
        return res.status(500).json({ message: 'Failed to generate financial response.' });
    }
}
