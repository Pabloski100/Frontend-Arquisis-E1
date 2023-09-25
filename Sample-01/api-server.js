const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");
require('dotenv').config({ path: './.env' });
const axios = require('axios');


const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.post('/api/getToken', async (req, res) => {
  console.log("API Server: /api/getToken");
  console.log("API Server: AUTH0_CLIENT_ID: " + process.env.AUTH0_CLIENT_ID);
  console.log("API Server: AUTH0_CLIENT_SECRET: " + process.env.AUTH0_CLIENT_SECRET);
  console.log("API Server: AUTH0_AUDIENCE: " + process.env.AUTH0_AUDIENCE);
  var options = {
    method: 'POST',
    url: 'https://dev-c6qwwrh4suoknli2.us.auth0.com/oauth/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE
    })
  };

  try {
    const response = await axios.request(options);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch token.');
  }
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
