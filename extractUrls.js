const axios = require(‘axios’);
const { Transform } = require(‘stream’);
const zlib = require(‘zlib’);

const URL = ’https://antm-pt-prod-dataz-nogbd-nophi-us-east1.s3.amazonaws.com/anthem/2024-07-01_anthem_index.json.gz';

// Function to fetch and process the data
async function fetchAndProcessData() {
try {
// Fetch the compressed file
const response = await axios.get(URL, { responseType: ‘arraybuffer’ });

// Create a readable stream from the response data
const dataStream = require('stream').Readable.from(response.data);

// Create a gunzip stream to decompress the data
const gunzip = zlib.createGunzip();

// Define the transformation stream to process JSON data
const transform = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    try {
      const json = JSON.parse(chunk.toString());

      // Check if it's an array of items
      if (Array.isArray(json)) {
        json.forEach(item => {
          if (item.network && item.network.includes('PPO') &&
              item.state === 'NY' &&
              item.carrier === 'Anthem') {
            console.log(item.url);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
    callback();
  }
});

// Pipe the data through gunzip and transform streams
dataStream.pipe(gunzip).pipe(transform);
} catch (error) {
console.error(‘Error fetching data:’, error);
}
}

// Execute the function
fetchAndProcessData();
Explanation
Fetching Data: The axios library fetches the GZIP compressed JSON file.
Decompression: zlib.createGunzip() decompresses the file.
Processing: The Transform stream processes each chunk of data. It parses JSON and filters it based on criteria.
