//jshint es version: 6

const express = require("express");
const mongoose = require('mongoose');
const app = express();
const bodyParser = require("body-parser");
const _ = require("lodash");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
main().catch(err => console.log(err));


//const date = require(__dirname + "/date.js");
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

  const itemsSchema = new mongoose.Schema({
    name: String
  });

  const Item = mongoose.model('Item', itemsSchema);

  const item1 = new Item({
     name: 'Buy Food' });

  const item2 = new Item({
     name: 'cook food' });

  const item3 = new Item({
     name: 'eat food' });


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res){

   Item.find().then((newListItems) => {
    if (newListItems.length  === 0){
        Item.insertMany(defaultItems).then(function(){
          console.log("Success");
        }).catch(function (err){
          console.log(err);
        });
        res.redirect("/");
    } else {
  res.render("list", {listTitle: "Today", newListItems: newListItems});
    }
           });
    });
  
app.get("/:customListName", function(req, res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}).then((newListItems) => {
  if (!newListItems){
    //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

        list.save();
        res.redirect("/" + customListName);
  } else {
        //show existing list
        res.render("list", {listTitle: newListItems.name, newListItems: newListItems.items});   
  }
         });

  });



        
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

app.post("/", function(req,res){

const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
  name: itemName
});

if (listName ==="Today"){

  item.save();
  res.redirect("/");

} else {
  List.findOne({name: listName}).then((newListItems) => {
    newListItems.items.push(item);
    newListItems.save();
    res.redirect("/" + listName);

        });

}


});

app.post("/delete", function(req,res){
const checkedItemID = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemID).then (function(){
    res.redirect("/");
    });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}).then (function(){
    res.redirect("/" +listName);
    });
}

});



app.get("/about", function(req, res){
    res.render("about");
})
app.listen(process.env.PORT, function(){
    console.log("server started on port 3000")
});
}
