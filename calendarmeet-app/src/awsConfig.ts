import { Amplify } from 'aws-amplify';

console.log('Environment variables:', {
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
  clientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION,
});

const oauthDomain = import.meta.env.VITE_AWS_OAUTH_DOMAIN;
const oauthRedirect = import.meta.env.VITE_AWS_OAUTH_REDIRECT_URL;
const oauthSignOut = import.meta.env.VITE_AWS_OAUTH_SIGNOUT_URL;

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || '',
      loginWith: {
        oauth: oauthDomain && oauthRedirect
          ? {
              domain: oauthDomain,
              scopes: ['email', 'openid', 'profile'],
              redirectSignIn: [oauthRedirect],
              redirectSignOut: [oauthSignOut || oauthRedirect],
              responseType: 'code',
            }
          : undefined,
      },
    },
  },
};

try {
  // Configure Amplify
  Amplify.configure(awsConfig, { ssr: false });
  console.log('AWS Amplify configured successfully');
} catch (error) {
  console.error('Error configuring AWS Amplify:', error);
}

export default awsConfig;
