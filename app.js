 const MongoClient = require('mongodb').MongoClient;
 const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true});

const express = require('express');
const expressSession = require('express-session');
var bodyParser = require("body-parser");

var jsonParser = bodyParser.json();

var app = express();
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
var secretValue = 'secret';
var collectionTask= [];
var users =[]

mongoClient.connect(function(error, client){
    if(error)
    {
        console.log(error);
    }
    const db = client.db('taskdb');
    const collection = db.collection('task');
    let i=0;
    collection.find().toArray(function(error, result){
        collectionTask[i] = result;
        console.log(collectionTask[i]);
        i++;
    })
    let j=0;
    const collectionUsers = db.collection('user');
    collectionUsers.find().toArray(function(error, result){
       users[j] = result;
        console.log(users[j]);
        j++;
    })
    console.log(collectionUsers);
    console.log(users);

});
// mongoClient.connect(function(error, client){
//     const db = client.db('taskdb');
//     const collection = db.collection('user');

//  let tasks = [{name: 'Nataly', description: '111'},
//                ];
//     collection.insertMany(tasks, function(error, result){
//         if(error) {
//             console.log(error);
//         }
//         console.log(result);
//     })

// // client.close();
//  });

app.engine('hbs', expressHbs({
    layoutsDir: 'views/layots',
    defaultLayout: 'layot',
    extname: 'hbs',
    helpers:{
       NavAuth: function(user) {
           if(user !=null)
            return new hbs.SafeString(`<a class="nav-link" href="/logout">LogOut</a>`);
            else{
                return new hbs.SafeString(`<a class="nav-link" href="/login">LogIn</a> <a class="nav-link" href="/signup">Sing up</a>`);
            }
        },
       IndexAuth: function(user) {
           if(user!=null)
           {
               return new hbs.SafeString(`
               <div class="m-5">
               <h1>List tasks</h1>
               <form name="taskForm">
                   
                    <input type="hidden" class="form-control"  name="id" value="-1">
                
                   <div class="form-group">
                     <label for="exampleInputEmail1">Name</label>
                     <input type="text" class="form-control" id="name" name="name">
                    </div>
                    <div class="form-group">
                       <label for="exampleInputEmail1">Description</label>
                       <input type="text" class="form-control" id="description" name="description">
                      </div>
                   <button type="submit" class="btn btn-primary m-1">Submit</button>
                 </form>
                 <table class="table">
                   <thead>
                     <tr>
                       <th scope="col">Id</th>
                       <th scope="col">Name</th>
                       <th scope="col">Description</th>
                       <th scope="col"></th>
                       <th scope="col"></th>
                     </tr>
                   </thead>
                   <tbody>
                   
                   </tbody>
                 </table>  
           </div>
               `);
           }
           else{
            return new hbs.SafeString(`<h1>Login first</h1>`);
           }
           
       } 

    }
}));

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + "/views/partials")

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: secretValue
}));

app.use('/login', function(request, response){

    response.render('login.hbs', {
        flag:  request.session.user,
        user:  request.session.flag
      })

});
app.use('/logout', function(request, response){

     request.session.user = null;
     request.session.flag = null;
    response.render('index.hbs', {
        flag:  request.session.user,
        user:  request.session.flag
      })

});
app.use('/signup', function(request, response){

    response.render('signup.hbs', {
        flag:  request.session.user,
        user:  request.session.flag
      })

});
app.post("/api/users",jsonParser, function(request, response){
    
    if(!request.body){
        response.sendStatus(400);
    }
    mongoClient.connect(function(error, client){
        if(error)
        {
            console.log(error);
        }
        const db = client.db('taskdb');
        const collectionUsers = db.collection('user');
       
        collectionUsers.find({name:request.body.name}).toArray(function(error, result){
            request.session.flag = true;
            request.session.user = request.body.name
            response.render('index.hbs', {
                flag:  request.session.flag,
                user:   request.session.user
            })
           
         });
        
    
    });
    
});
app.post("/api/users/signup",jsonParser, function(request, response){
    
    if(!request.body){
        response.sendStatus(400);
    }
    mongoClient.connect(function(error, client){
        if(error)
        {
            console.log(error);
        }
        const db = client.db('taskdb');
        const collectionUsers = db.collection('user');
          collectionUsers.insertOne({name:request.body.name, password:request.body.password}, function(error, result){
        if(error) {
            console.log(error);
        }
        console.log(result);
        }) 
    });

});
app.post("/api/tasks",jsonParser, function(request, response){

    mongoClient.connect(function(error, client){
        if(error)
        {
            console.log(error);
        }
        const db = client.db('taskdb');
        const collection = db.collection('task');
        
        let task = {name: request.body.name, description: request.body.description};
        
        let tmp = collection.insertOne(task, function(error, result){
                    if(error) {
                        console.log(error);
                    }
                    console.log(result);
                }) 

        let i=0;

        collection.find().toArray(function(error, result){
            collectionTask[i] = result;
            console.log(collectionTask[i]);
            i++;
        }) 

    response.send(task);
    });
});
app.put("/api/tasks",jsonParser, function(request, response){

    mongoClient.connect(function(error, client){
        if(error)
        {
            console.log(error);
        }
        const db = client.db('taskdb');
        const collection = db.collection('task');
        console.log('hhhhh');
        let task = {id:request.body.id, name: request.body.name, description: request.body.description};
        collection.updateOne({_id:  request.body.id},  {$set:{name: request.body.name, description: request.body.description}},
                  function(error, result){
                     console.log(result);
                 }
                );

        let i=0;
        collection.find().toArray(function(error, result){
            collectionTask[i] = result;
            console.log(collectionTask[i]);
            i++;
        }) 

    response.send(task);
    });
});

app.get("/api/tasks/:id", function(request, response){ 
    var id = request.params.id;
    console.log('ok');
    let task = collectionTask[0].find(u=>u.id = id);
    console.log(task);
    response.send(task);
 });
 app.delete("/api/tasks/:id", function(request, response){ 

    var id = request.params.id;
    mongoClient.connect(function(error, client){
        if(error)
        {
            console.log(error);
        }
        const db = client.db('taskdb');
        const collection = db.collection('task');
        console.log(id);
        collection.deleteOne({_id: id}, function(error, result){
                console.log(result);
             });
    });
    response.send(id);
 });
app.get("/api/tasks", function(request, response){ 
    response.send(collectionTask);
 });

app.use('/', function(request, response){

    response.render('index.hbs', {
      flag:  request.session.flag,
      user:  request.session.user
    // flag:  true,
    // user: 1
    })

});


app.listen(3000, function(){
    console.log(`Server started 3000`);
});

