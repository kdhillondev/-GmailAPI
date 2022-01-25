const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');



//read subjects.json file
let subjectsJson = fs.readFileSync("subjects.json","utf-8");
//transform a json string into a javascript array
let threads = JSON.parse(subjectsJson);


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = 'token.json';
//let token='token.js'; //do a token read, then get subject lines
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  try {
      if (fs.existsSync(TOKEN_PATH)) {
        console.log('Started...');
        console.log('Watching emails...');
        setInterval(function() {
            authorize(JSON.parse(content), getSubjectLines);
           
          }, 5000);
      }
     else{
         console.log('Initializing connection');
        authorize(JSON.parse(content), listLabels);
     } 
    } catch(err) {
      console.error(err)
    }

});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.labels.list({
      userId: 'me',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const labels = res.data.labels;
      if (labels.length) {
        console.log('Acess Granted to the following Labels:');
        labels.forEach((label) => {
         console.log(`- ${label.name}`);
        });
      } else {
        console.log('No labels found.');
      }
    });
  }

function getSubjectLines(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const mails = [];
    //email query to find
    const query='thumper lead';
    gmail.users.messages?.list(
        {
            userId: 'me',
            labelIds:'INBOX', //change?
            q: query, //condition
            maxResults: 50,
        },
        (err, res) => {
            if (!res || !res.data || !res.data.messages) {
                console.log('No Messages Found');
                return;
            }
            res.data.messages.forEach((message) => {
               // console.log(`first api call: ${message}`);
                mails.push(message.id ?? '');
            });
            mails.forEach((id) => {
                const req = gmail.users.messages.get(
                    {
                        userId: 'me',
                        id,
                    },
                    (err, res) => {

                        //Checking to see if any new emails found alread exist
                        if(hasValueDeep(threads,res.data.threadId.toString())==false){

                            //create json object of new email thread found
                            var obj = {
                                threadId: res.data.threadId.toString(),
                                snippet: res.data.snippet.toString(),
                                query: query
                            }

                            //append an object to an array
                            threads.push(obj);

                            //transform back the array into a json string
                            subjectsJson = JSON.stringify(threads);

                            //save the json file
                            fs.writeFileSync("subjects.json",subjectsJson,"utf-8");
                            
                            //printing results
                            console.log('Found new email Threads');
                            console.table(obj);
                            }  
                    }
                );
            });
        }

    ); 
 }

 //function used to iterate through json array to find duplicate threads
 function hasValueDeep(json, findValue) {
    const values = Object.values(json);
    let hasValue = values.includes(findValue);
    values.forEach(function(value) {
        if (typeof value === "object") {
            hasValue = hasValue || hasValueDeep(value, findValue);
        }
    })
    return hasValue;
}
