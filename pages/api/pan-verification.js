export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Only POST requests allowed' });
    }
  
    try {
      const { orgPan, orgName, doi } = req.body;
  
      // Validate required fields
      if (!orgPan || !orgName || !doi) {
        return res.status(400).json({ message: 'orgPan, orgName, and doi are required' });
      }
  
      // Construct the request body based on the provided structure
      const requestBody = {
        txnId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a', // You can generate a unique transaction ID here
        orgPan,
        verificationData: {
          orgName,
          doi,
        },
        consentArtifact: {
          consent: {
            consentId: '499a5a4a-7dda-4f20-9b67-e24589627061', // You can generate a unique consent ID here
            timestamp: new Date().toISOString(),
            dataConsumer: {
              id: 'XelleratesAI',
            },
            dataProvider: {
              id: 'IncomeTaxDept',
            },
            purpose: {
              description: 'PAN Verification',
            },
            user: {
              idType: 'AADHAAR', // Can be changed if necessary
              idNumber: '123412341234', // Placeholder; if not used, consider if this field should be omitted
              mobile: '', // Omitted or left empty as per your requirements
              email: '',  // Omitted or left empty as per your requirements
            },
            data: {
              id: 'PAN',
            },
            permission: {
              access: 'VIEWSTORE',
              dateRange: {
                from: '2020-11-19T07:34:06.711Z',
                to: '2020-12-19T07:34:06.711Z',
              },
              frequency: {
                unit: 'string',
                value: 0,
                repeats: 0,
              },
            },
          },
          signature: {
            signature: 'string', // Digital signature if required
          },
        },
      };
  
      // Make the POST request to the PAN verification API
      const response = await fetch('https://apisetu.gov.in/verify/v1/pan/org', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-APISETU-CLIENTID': process.env.NEXT_PUBLIC_APISETU_CLIENTID,
          'X-APISETU-APIKEY': process.env.NEXT_PUBLIC_APISETU_APIKEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return res.status(200).json(data);
      } else {
        return res.status(response.status).json({
          message: 'Failed to verify PAN',
          error: data,
        });
      }
    } catch (error) {
      console.error('Error verifying PAN:', error);
      return res.status(500).json({ message: 'Internal Server Error', error });
    }
  }
  