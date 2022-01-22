const axios = require('axios');

const MY_API_KEY = 'AIzaSyDePPdWErHwr3klW_CxPvpMuB_OX7vMKtA';

async function getPathRoadsAPI(myPath) {
  const config = {
    method: 'get',
    url: `https://roads.googleapis.com/v1/snapToRoads?path=${myPath}&interpolate=true&key=${MY_API_KEY}`,
    headers: {}
  };

  return await axios(config);
}

module.exports = { getPathRoadsAPI };
