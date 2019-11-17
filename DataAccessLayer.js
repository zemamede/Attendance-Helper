const sheetInfo =  require('./googleSheet.json');

class DataAccessLayer{

    updateAttendance(bool,google,date,name){
        var request = {
            // The ID of the spreadsheet to update.
            spreadsheetId: sheetInfo.attendanceId,  
            // The A1 notation of the values to update.
            range: "12/2019!B3",  // TODO: Update placeholder value.
            
            // How the input data should be interpreted.
            valueInputOption: '✔',  // TODO: Update placeholder value.
        
            resource: {
                values : "✔"
            },
        
            auth: authClient,
          };
    }
    






}

module.exports = DataAccessLayer

































/**
function listMajors(auth) {
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
    });
}
*/