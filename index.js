const express = require('express');
const app = express();
const path = require('path')

const pipedriveApi = require('./pipedriveApi');
const pipedriveApiClient = pipedriveApi.apiClient
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const PORT = 3000;
const ROOT_URL = `http://localhost:${PORT}`

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
        if(!pipedriveApi.checkToken()){
            pipedriveApi.setToken(req.session)
        }

        // token is already set in the session
        // now make API calls as required
        // client will automatically refresh the token when it expires and call the token update callback
        const currentUserData = await pipedriveApi.getUserData()

        res.render('iframe', {
			name: currentUserData.name,
            root_url: ROOT_URL
		});
    } else {
        const authUrl = pipedriveApiClient.buildAuthorizationUrl();;

        res.redirect(authUrl);
    }
});

app.get('/test_post_deal',async (req, res)=>{
    if (req.session.accessToken !== null && req.session.accessToken !== undefined) {
        if(!pipedriveApi.checkToken()){
            pipedriveApi.setToken(req.session)
        }

        const postRequstAction = pipedriveApi.addNewDeal
        const postReqAnswer = await postRequstAction()

        res.render('outcome', {
			status: postReqAnswer.status,
            message: postReqAnswer.message
		});
    } else {
        const authUrl = pipedriveApiClient.buildAuthorizationUrl();;

        res.redirect(authUrl);
    }
})

app.get('/test_post_deal-field',async (req, res)=>{
    if (req.session.accessToken !== null && req.session.accessToken !== undefined) {
        if(!pipedriveApi.checkToken()){
            pipedriveApi.setToken(req.session)
        }

        const postRequstAction = pipedriveApi.addNewDealField
        const postReqAnswer = await postRequstAction()

        res.render('outcome', {
			status: postReqAnswer.status,
            message: postReqAnswer.message
		});
    } else {
        const authUrl = pipedriveApiClient.buildAuthorizationUrl();;

        res.redirect(authUrl);
    }
})

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