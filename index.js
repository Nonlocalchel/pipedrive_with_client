const express = require('express');
const app = express();
const path = require('path')
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const config = require('./config');

app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['key1']
}));
const PORT = 3000;

const pipedrive = require('pipedrive');

const apiClient = new pipedrive.ApiClient();

let oauth2 = apiClient.authentications.oauth2;
oauth2.clientId = config.clientID || ''; // OAuth 2 Client ID
oauth2.clientSecret = config.clientSecret || ''; // OAuth 2 Client Secret
oauth2.redirectUri = config.callbackURL || ''; // OAuth 2 Redirection endpoint or Callback Uri

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.get('/', async (req, res) => {
    if (req.session.accessToken !== null && req.session.accessToken !== undefined) {

        if(!oauth2.accessToken){
            oauth2.accessToken = req.session.accessToken
            oauth2.refreshToken  = req.session.refreshToken
        }

        // token is already set in the session
        // now make API calls as required
        // client will automatically refresh the token when it expires and call the token update callback
        const apiUser = new pipedrive.UsersApi(apiClient);
        const currentUser = await apiUser.getCurrentUser();

        res.render('iframe', {
			name: currentUser.data.name
		});
    } else {
        const authUrl = apiClient.buildAuthorizationUrl();;

        res.redirect(authUrl);
    }
});

app.get('/auth/pipedrive/callback', (req, res) => {
    console.log(1)
    const authCode = req.query.code;
    const promise = apiClient.authorize(authCode);

    promise.then(() => {
        req.session.accessToken = apiClient.authentications.oauth2.accessToken;
        req.session.refreshToken = apiClient.authentications.oauth2.refreshToken;
        res.redirect('/');
    }, (exception) => {
        // error occurred, exception will be of type src/exceptions/OAuthProviderException
    });
});
