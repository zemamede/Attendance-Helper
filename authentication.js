const fs = require('fs');
const { google } = require('googleapis');
const auth = require('./auth.json');
const sheetInfo = require('./googleSheet.json');
const Promise = require('promise');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

var oAuth2Client = null;

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content));
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log(authUrl);
    code = auth.authCode;
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
    });
}

class DataAccessLayer {

    updateAttendance(value, values, name, days) {
        const sheets = google.sheets({ version: 'v4', oAuth2Client });
        var row = days[values.Date[0]];
        var sheetName = values.Date[1] + "/" + values.Date[2];
        var request = {
            spreadsheetId: sheetInfo.attendanceId,
            range: sheetName + "!" + row + name,
            valueInputOption: 'RAW', 
            resource: {
                values: [[value]]
            },
            auth: oAuth2Client,
        };

       sheets.spreadsheets.values.update(request);
    }

    async createMonth(values,defaultId){
        const sheets = google.sheets({ version: 'v4', oAuth2Client });
        var request = {
            // The ID of the spreadsheet containing the sheet to copy.
            spreadsheetId: sheetInfo.attendanceId,
        
            // The ID of the sheet to copy.
            sheetId: defaultId,  // TODO: Update placeholder value.
        
            resource: {
              // The ID of the spreadsheet to copy the sheet to.
              destinationSpreadsheetId: sheetInfo.attendanceId,  // TODO: Update placeholder value.
        
              // TODO: Add desired properties to the request body.
            },
        
            auth: oAuth2Client,
          };
        
          sheets.spreadsheets.sheets.copyTo(request, function(err, response) {
            if (err) {
              console.error(err);
              return;
            }
          });

          //change spreadsheet name to default convention mm/yyyy
          var sheetName = values.Date[0] + "/" + values.Date[1];
          var request = {
            // The spreadsheet to request.
            spreadsheetId: sheetInfo.attendanceId,
            ranges: [], 
            includeGridData: false, 
            auth: oAuth2Client,
          };
          sheets.spreadsheets.get(request, function(err, response) {
            if (err) {
              console.error(err);
              return;
            }
        
            // TODO: Change code below to process the `response` object:
            console.log(JSON.stringify(response, null, 2));
            for(var i=0; i < response.data.sheets.length(); i ++){
                if(response.data.sheets[i].properties.title == "Copy of Default"){
                    console.log("ok");
                }
            }
          });

        
    }

    async checkAttendance(values, name) {
        const sheets = google.sheets({ version: 'v4', oAuth2Client });
        var sheetName = values.Date[0] + "/" + values.Date[1];

        var request = {
            spreadsheetId: sheetInfo.attendanceId,
            range: sheetName + "!AG" + name,
            auth: oAuth2Client,
        };
        return await sheets.spreadsheets.values.get(request);
    }

    async checkAvilability(values, name, days) {
        const sheets = google.sheets({ version: 'v4', oAuth2Client });
        var row = days[values.Date[0]];
        var sheetName = values.Date[1] + "/" + values.Date[2];

        var request = {
            spreadsheetId: sheetInfo.attendanceId,
            range: sheetName + "!" + row + name,
            auth: oAuth2Client,
        };
        return await sheets.spreadsheets.values.get(request);
    }
}

module.exports = DataAccessLayer
