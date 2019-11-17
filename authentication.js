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

    async checkAvilability(values, name, days) {
        const sheets = google.sheets({ version: 'v4', oAuth2Client });
        var row = days[values.Date[0]];
        var sheetName = values.Date[1] + "/" + values.Date[2];

        var request = {
            spreadsheetId: sheetInfo.attendanceId,
            range: sheetName + "!" + row + name,
            auth: oAuth2Client,
        };
        var num = null;
        //const num = await sheets.spreadsheets.values.get(request);
        await sheets.spreadsheets.values.get(request, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            
            if (rows.length) {
                num = rows[0][0];
                console.log('Name, Major:');
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    console.log(`${row[0]}, ${row[4]}`);
                });
            } else {
                console.log('No data found.');
            }
        });
        return num;
    }


    async getValues(values, name, days) {
        const sheets = google.sheets({ version: 'v4', oAuth2Client });
        var row = days[values.Date[0]];
        var sheetName = values.Date[1] + "/" + values.Date[2];
        var range = sheetName + "!" + row + name;
        return new Promise((resolve, reject) => {
            
            // [START sheets_get_values]
            sheets.spreadsheets.values.get({
                spreadsheetId: sheetInfo.attendanceId,
                range: range,
            }, (err, result) => {
                if (err) {
                    // Handle error
                    console.log(err);
                    // [START_EXCLUDE silent]
                    reject(err);
                    // [END_EXCLUDE]
                } else {
                    const numRows = result.values ? result.values.length : 0;
                    console.log(`${numRows} rows retrieved.`);
                    // [START_EXCLUDE silent]
                    resolve(result);
                    // [END_EXCLUDE]
                }
            });
            // [END sheets_get_values]
        });
    };


    /*function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: sheetInfo.attendanceId,
        range: 'Class Data!A2:E',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Name, Major:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log(`${row[0]}, ${row[4]}`);
            });
        } else {
            console.log('No data found.');
        }
    });*/

}

module.exports = DataAccessLayer
