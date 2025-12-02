// awsConfig.ts
import { Amplify, ResourcesConfig } from "aws-amplify";

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID!,
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID!,
      identityPoolId: undefined,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_AWS_OAUTH_DOMAIN!,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [import.meta.env.VITE_AWS_OAUTH_REDIRECT_URL!],
          redirectSignOut: [
            import.meta.env.VITE_AWS_OAUTH_SIGNOUT_URL ||
            import.meta.env.VITE_AWS_OAUTH_REDIRECT_URL!
          ],
          responseType: "code",
        }
      }
    }
  }
};

// Region MUST be added at the root, not inside Auth
(awsConfig as any).Auth.region = import.meta.env.VITE_AWS_REGION!;

// Debug BEFORE configuring
console.log("LOADED ENV:", {
  region: import.meta.env.VITE_AWS_REGION,
  pool: import.meta.env.VITE_AWS_USER_POOL_ID,
  client: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
  domain: import.meta.env.VITE_AWS_OAUTH_DOMAIN,
  redirect: import.meta.env.VITE_AWS_OAUTH_REDIRECT_URL
});
console.log("ENV TEST", import.meta.env.VITE_AWS_REGION);

// Configure AWS Amplify LAST
Amplify.configure(awsConfig);

export default awsConfig;
