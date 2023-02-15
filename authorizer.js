const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;  

const jwtVerifier = CognitoJwtVerifier.create({
    // userPoolId: "us-east-1_GENHIzJUZ",
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    // clientId: "5t7v36evaf02su131n121g4mhe",
    clientId: COGNITO_WEB_CLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
    var authResponse = {};
    authResponse.principalId = principalId;
    if( effect && resource ){
        let policyDocument = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": effect,
                    "Action": "execute-api:Invoke",
                    "Resource": resource
                },
            ]
        };
        authResponse.policyDocument = policyDocument;
    }
    authResponse.context = {
        foo: "bar"
    };
    console.log(JSON.stringify(authResponse));
    return authResponse;
};

exports.handler = async (event, context, callback) => {
    // Lamda authorizer code 
    var token = event.authorizationToken; // allow or deny
    console.log(token);
    //Validate the token
    try{
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));
        callback(null, generatePolicy("user", "Allow", event.methodArn));
    }catch(err){
       callback("Error, invalid token");   
    }
    // switch(token){
    //     case "Allow":
    //         callback(null, generatePolicy("user", "Allow", event.methodArn));
    //         break;
    //     case "Deny":
    //         callback(null, generatePolicy("user", "Deny", event.methodArn));
    //         break;
    //     default:
    //         callback("Error, invalid token");   
    // }
}