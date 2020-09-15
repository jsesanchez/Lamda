'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
const postTable = process.env.POSTS_TABLE;

//Create Response
function response(statusCode, message){
  return{
    statusCode:statusCode,
    body: JSON.stringify(message)
  }
}
//Create Post
module.exports.createPost = (event, contex, callback) => {
  console.log("Entro en createPost");
  const reqBody = JSON.parse(event.body);

  const post = {
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    userId: 1,
    title: reqBody.title,
    body: reqBody.body
  }

return db.put({
    TableName: postTable,
    Item: post
    })
    .promise().then(() => {
      callback(null, response(201, post));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
}

// Get all posts
module.exports.getAllPost = (event, context, callback) => {
  console.log("Entro en getAllPost");
  return db
    .scan({
      TableName: postTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};


//Get post by id

module.exports.getPostId = (event,contex,callback) => {
  console.log("Entro en getPostId");
  const id=event.pathParameters.id;

  const params = {
    Key:{
      id:id
    },
    TableName: postTable
  }  

  return db.get(params).promise().then(res =>{
    if(res.Item){
      callback(null, response(200,res.Item))
    }
    else callback(null, response(404,{error: 'Post not fond'}))
  })
  .catch(err => callback(null, response(err.statusCode, err)));
}




//Update post

module.exports.updatePost = (event,contex,callback) => {
  console.log("Entro en updatePost");
  const id=event.pathParameters.id;
  const body = JSON.parse(event.body);
  const paramName = body.paramName;
  const paramValue = body.paramValue;
  const params = {
    Key: {id:id},
    TableName:postTable,
    ConditionExpression: 'attribute_exist(id)',
    UpdateExpression: 'set ' + paramName + ' = :v',
    ExpressionAttributeValues : {
      ':v' : paramValue
    },
    ReturnValue: 'ALL_NEW'
  };
  return db.update(params).promise().then(res =>{
      callback(null, response(200,res))
    })
  .catch(err => callback(null, response(err.statusCode, err)));
}

//Delete a post

module.exports.deletePost = (event, contex, callback) => {
  console.log("Entro en deletePost");
  const id=event.pathParameters.id;
  const params = {
    Key:{
      id:id
    },
    TableName: postTable
  };

  return db.delete(params).promise().then(() =>{
    callback(null, response(200,{message: 'Post Deleted successfully'}))
  })
.catch(err => callback(null, response(err.statusCode, err)));
}