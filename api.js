const pipedrive = require('pipedrive');
const config = require('./config');

const apiClient = new pipedrive.ApiClient();

const oauth2 = apiClient.authentications.oauth2;
oauth2.clientId = config.clientID || ''; // OAuth 2 Client ID
oauth2.clientSecret = config.clientSecret || ''; // OAuth 2 Client Secret
oauth2.redirectUri = config.callbackURL || ''; // OAuth 2 Redirection endpoint or Callback Uri

async function getUserData(){
    const apiUser = new pipedrive.UsersApi(apiClient);
    const currentUser = await apiUser.getCurrentUser();
    return currentUser.data
}

module.exports = {
	getUserData,
	apiClient
};