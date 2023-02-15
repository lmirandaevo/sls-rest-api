'use strict';

const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient( { region: 'us-east-1' });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return{
    statusCode,
    body: JSON.stringify(data),
  };
};
module.exports.createNote = async (event, context, cb) => {
  // context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);
  let index = 1.
  // debugger

  do{
    try{
      let params = {
        TableName: NOTES_TABLE_NAME,
        Item: {
          
          notesID: data.notesId + index++,
          title:   data.title,
          body:    data.body
        },
        ConditionExpression: 'attribute_not_exists(notesID)'
      }
      await documentClient.put(params).promise();
     
    // cb(null, {
    //           statusCode: 201,
    //           body: JSON.stringify(data)
    //         }
    //   );
    
    }catch(err){
    // cb(null, {
    //   statusCode: 500,
    //   body: JSON.stringify(err.message)
    // } );
    cb(null, send(500, err.message));
    }

  }while(index <= 100);

  cb(null, send(201, data));
};


module.exports.updateNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesID = event.pathParameters.idNota;
  let data = JSON.parse(event.body);

  try{
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesID },
      UpdateExpression: 'set #title = :title, #body = :body ',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title':  data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesID)'
    }

    await documentClient.update(params).promise();
    cb(null, send(200, data));
  } catch(err){
    // cb(null,{
    //     statusCode: 500,
    //     body: JSON.stringify(err.message) 
    // });

    cb(null, send(500, err.message));
  }

};

module.exports.deleteNote = async (event, context, cb)  => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesID = event.pathParameters.idNota  

  
  try{
    const params = {
        TableName: NOTES_TABLE_NAME,
        Key: { notesID },
        ConditionExpression: 'attribute_exists(notesID)'
    }

    await documentClient.delete(params).promise();
    cb(null, send(200, notesID));

  }catch(err){
    cb(null, send(500, err.message));
  }
};


module.exports.getAllNotes = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log(JSON.stringify(event))
  try{
    const params = {
      TableName: NOTES_TABLE_NAME
    }

    const notes = await documentClient.scan(params).promise();

    cb(null, send(200, notes));
  }catch(err){
    cb(null, send(500, err.message));
  }
};

