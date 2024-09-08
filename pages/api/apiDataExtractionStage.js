import { supabase } from '@/lib/supabaseclient';
import xlsx from 'xlsx';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

class Extract {
    constructor(misFilePath) {
        this.misFilePath = misFilePath;
    }

    async downloadFile(url) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
        });
        return response.data; // Return file data as a buffer
    }

    unmergeCells(sheet) {
        const range = xlsx.utils.decode_range(sheet['!ref']);
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cell = sheet[xlsx.utils.encode_cell({ r: row, c: col })];
                if (cell && cell.v !== undefined) {
                    for (let i = row + 1; i <= range.e.r; i++) {
                        const nextCell = sheet[xlsx.utils.encode_cell({ r: i, c: col })];
                        if (nextCell && nextCell.v === undefined) {
                            nextCell.v = cell.v;
                        } else {
                            break;
                        }
                    }
                    for (let j = col + 1; j <= range.e.c; j++) {
                        const nextCell = sheet[xlsx.utils.encode_cell({ r: row, c: j })];
                        if (nextCell && nextCell.v === undefined) {
                            nextCell.v = cell.v;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    extractData(sheet, rowLabel, quarterlyMonths, typeMap, monthMap) {
        const data = {};
        const headers = [];
        
        const range = xlsx.utils.decode_range(sheet['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cell = sheet[xlsx.utils.encode_cell({ r: 1, c: col })];
            headers.push(cell ? { v: cell.v, c: col } : null);
        }
    
        const yearlyRowIndex = headers.findIndex(header => header && header.v && header.v.includes('Yearly'));
        if (yearlyRowIndex === -1) {
            throw new Error('Yearly row not found');
        }
    
        const yearNamesRow = 2; 
        const yearColumns = [];
        const yearNames = [];
        
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cell = sheet[xlsx.utils.encode_cell({ r: yearNamesRow, c: col })];
            if (cell && cell.v && cell.v.includes('FY')) {
                yearNames.push(cell.v);
                yearColumns.push(col);
            }
        }
    
        data['Yearly'] = [];
        for (let i = 0; i < yearColumns.length; i++) {
            const yearColumn = yearColumns[i];
            const yearName = yearNames[i];
            const yearlyData = sheet[xlsx.utils.encode_cell({ r: typeMap[rowLabel], c: yearColumn })]?.v || 0;
            data['Yearly'].push({
                'month': yearName,
                'value': yearlyData
            });
        }
    
        const monthlyColumns = headers.filter(header => header && header.v && header.v.includes('Monthly')).map(header => header.c);
        
        let monthColumn = Math.min(...monthlyColumns);
        for (const [quarter, months] of Object.entries(quarterlyMonths)) {
            const quarterData = [];
            
            for (const month of months) {
                const formattedMonth = month.split("'")[0];
                const value = sheet[xlsx.utils.encode_cell({ r: typeMap[rowLabel], c: monthColumn })]?.v || 0;
                quarterData.push({
                    'month': monthMap[formattedMonth],
                    'value': value
                });
                monthColumn += 1;
            }
            data[quarter] = quarterData;
        }
    
        return data;
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
      // Extract the 'mis' string from the request body
      const { mis } = req.body;

      //console.log("mis", mis);
  
      // Parse the 'mis' string to a JavaScript array
      let misFilePathArray;
      try {
        misFilePathArray = JSON.parse(mis); // Parse the JSON string into an array
      } catch (error) {
        return res.status(400).json({ error: 'Invalid MIS file path format' });
      }

      //console.log("misFilePathArray ", mis);
  
      // Ensure the array is not empty
      if (!misFilePathArray || misFilePathArray.length === 0) {
        return res.status(400).json({ error: 'MIS file path is required' });
      }
  
      // Extract the first URL from the array
      const misfile = misFilePathArray[0];
      console.log("MIS file in API: ", misfile);
  
      if (!misfile) {
        return res.status(404).json({ error: 'MIS file not found' });
      }
  
      try {
        const extractor = new Extract();
        const fileBuffer = await extractor.downloadFile(misfile);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = 'Financial MIS';
        const sheet = workbook.Sheets[sheetName];
  
        extractor.unmergeCells(sheet);
  
        const quarters = {
          'Q1': ["Apr'23", "May'23", "Jun'23"],
          'Q2': ["Jul'23", "Aug'23", "Sep'23"],
          'Q3': ["Oct'23", "Nov'23", "Dec'23"],
          'Q4': ["Jan'24", "Feb'24", "Mar'24"]
        };
  
        const typeMap = {
          'Sales': 3,
          'Purchase': 4,
          'CM 1 - Gross Profit (A)': 5
        };
  
        const monthMap = {
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
        };
  
        const revenue = extractor.extractData(sheet, 'Sales', quarters, typeMap, monthMap);
        const expense = extractor.extractData(sheet, 'Purchase', quarters, typeMap, monthMap);
        const profit = extractor.extractData(sheet, 'CM 1 - Gross Profit (A)', quarters, typeMap, monthMap);
  
        const financialData = {
          'revenue': revenue,
          'expense': expense,
          'profit': profit
        };
  
        res.status(200).json(financialData);
      } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Server error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  