export const config = {
  auth: {
    clientId: process.env.AUTH0_CLIENT_ID || "",
    authority: "https://login.microsoftonline.com/common",
    clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
    redirectUri: process.env.AUTH0_REDIRECT_URI || "",
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE,
    caPath: "./certs/http_ca.crt",
  },
  server: {
    port: 3000,
  },
};
