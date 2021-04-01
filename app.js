//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require('mongoose')
const app = express();
const _= require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Priyanshu:Sofiaansari@cluster0.mfkft.mongodb.net/TodolistDb",{useNewUrlParser: true})

const ItemSchema={
  name: String
}
const Item=mongoose.model("Item", ItemSchema);

const Item1=new Item({
  name: "Welcome to our todolist"
})

const Item2=new Item({
  name: "Hit + button to add new item"
})

const Item3=new Item({
  name: "<--- Hit this to delete"
})

const defaultItem=[Item1, Item2, Item3];

const ListSchema={
  name: String, 
  items: [ItemSchema]
}

const Lists = mongoose.model("list", ListSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){
  if(foundItems.length===0)
  {
    Item.insertMany(defaultItem, function(err){
      if(err)
        console.log(err)
      else 
        console.log("Inserted")
    })
  }
    else{
   res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

})
});

app.get("/:customListName", function(req, res){
  const ListName=_.capitalize(req.params.customListName);

  Lists.findOne({name:ListName}, function(err, result){
    if(!err)
    {
      if(!result)
      {
        const List= new Lists({
            name: ListName, 
            items: defaultItem
          })
         List.save();
         res.redirect("/"+ListName)
      }
      else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      
      }
    }
  })

  

})

app.post("/", function(req, res){

  const item = req.body.newItem;
  const NlistName= req.body.list

  const Itemadd= new Item({
      name: item
    })

  if(NlistName==="Today")
  {
    Itemadd.save()
    res.redirect("/");
  }
  else{
    Lists.findOne({name: NlistName}, function(err, result){
      if(err)
        console.log(err)
      else{
            result.items.push(Itemadd)
            result.save();
            res.redirect("/"+ NlistName);
       }  
        })
  }
  
});

app.post("/deleteItem", function(req, res){
  const delItem = req.body.Checkbox
  const listName= req.body.listName;

if(listName==="Today"){
  Item.findByIdAndRemove(delItem, function (err, result) { 
    if (err){ 
        console.log(err) 
    } 
    else{ 
        console.log("sucessfully deleted")
        res.redirect("/")
    } 
  }); 
  }
  else{
    Lists.findOneAndUpdate({name: listName}, {$pull: {items: {'_id': delItem}}}, function(err, foundList){
      if(err)
        console.log(err)
      else{
              res.redirect("/"+ listName)}
    })   
  }
 })

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT
if(port == null || port == "")
  port=3000;

app.listen(port , function() {
  console.log("Server started ");
});
