const https = require('https');

const PATH = 'https://api.recruitment.shq.nz';
const API_KEY = 'h523hDtETbkJ3nSJL323hjYLXbCyDaRZ';

function fetchData(path) {
  return new Promise((resolve, reject) => {
    const url = `${PATH}${path}?api_key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(`Error parsing JSON: ${error.message}`);
        }
      });
    }).on('error', (err) => {
      reject(`Request error: ${err.message}`);
    });
  });
}

function formatDNSRecord(record) {
  return `    Record Type: ${record.type}\n` +
         `    Name       : ${record.name}\n`
}

async function main() {
  try {
    const client_id = 100;
    console.log('Retrieving domains for client ID:', client_id);
    
    const domainsResponse = await fetchData(`/domains/${client_id}`);
    
    console.log('\nDomains and DNS Records for Business Systems International:\n');
    
    for (const domain of domainsResponse) {
      console.log(`Domain: ${domain.name}`);
      
      for (const zone of domain.zones || []) {
        console.log(`  DNS Zone: ${zone.name}`);
        
        const zoneResponse = await fetchData(zone.uri);
        
        if (!zoneResponse.records || zoneResponse.records.length === 0) {
          console.log('    No DNS records found for this zone.\n');
          continue;
        }
        
        for (const record of zoneResponse.records) {
          console.log(formatDNSRecord(record));
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

main();
