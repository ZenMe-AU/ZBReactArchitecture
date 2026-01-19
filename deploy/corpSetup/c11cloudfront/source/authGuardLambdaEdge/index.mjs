"use strict";
const jwt = require("jsonwebtoken");

const CLIENT_ID = "b0ee1412-c79a-48f3-978e-f61f740d7832";
const TENANT_ID = "15fb0613-7977-4551-801b-6aadac824241";
const MS_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhTfqnXJAT9zSM4Xm5QHD
3kIW1tXHj5+1xj35D3ht0s9WogK2nzcwlSDWivqnt1aED3njfI9V6V8rOI5Sde8K
B87QfLH6SmRtG4dLixDfFoulHPamQ9lEp5i8xVZeypRM03O30AGCfx0G83JiiHVA
VLqpjc8Ervl6yMNHyg8hyBkbV/IyeZVVJW2nu0ljkQwyTLr1GH1h2I7a/ioK6WlW
7lNK8OYLSEQ/B9ecaKf8dPDy1/Zt5f7I6RdJPRicSgsBUeX34CuJJuBiOB0k4Tih
JVhc43YexUDo+Sd/e2P3BgpdK3I0ksX5c58yO2z0OvpFHYSg2CYOdzEOj/mLKbOA
zQIDAQAB
-----END PUBLIC KEY-----`;
const AUTH_DOMAIN = "logintest.zenblox.com.au";

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const cookieHeader = request.headers.cookie?.[0]?.value || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const idToken = cookies["idToken"];
  if (!idToken) {
    return { status: "302", headers: { location: [{ key: "Location", value: AUTH_DOMAIN }] } };
  }

  try {
    const verified = jwt.verify(idToken, MS_PUBLIC_KEY, {
      audience: CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
    });

    console.log("JWT verified:", verified.sub);
    return request;
  } catch (err) {
    console.log("JWT verify failed:", err.message);
    return { status: "302", headers: { location: [{ key: "Location", value: AUTH_DOMAIN }] } };
  }
};
