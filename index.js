const express = require('express');
const app = express();
const path = require('path')

const pipedriveApi = require('./api');
const pipedriveApiClient = pipedriveApi.apiClient

const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const PORT = 3000;

app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['key1']
}));

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
    if (req.session.accessToken !== null && req.session.accessToken !== undefined) {

        const oauth2 = pipedriveApiClient.authentications.oauth2
        if(!oauth2.accessToken){
            oauth2.accessToken = req.session.accessToken
            oauth2.refreshToken  = req.session.refreshToken
        }

        // token is already set in the session
        // now make API calls as required
        // client will automatically refresh the token when it expires and call the token update callback
        const currentUserData = await pipedriveApi.getUserData()

        res.render('iframe', {
			name: currentUserData.name
		});
    } else {
        const authUrl = pipedriveApiClient.buildAuthorizationUrl();;

        res.redirect(authUrl);
    }
});

app.get('/auth/pipedrive/callback', (req, res) => {
    const authCode = req.query.code;
    const promise = pipedriveApiClient.authorize(authCode);

    promise.then(() => {
        const oauth2 = pipedriveApiClient.authentications.oauth2
        req.session.accessToken = oauth2.accessToken;
        req.session.refreshToken = oauth2.refreshToken;
        res.redirect('/');
    }, (exception) => {
        // error occurred, exception will be of type src/exceptions/OAuthProviderException
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});