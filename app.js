const express =require("express");
const bodyparser =require("body-parser");
//const date =require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");

//console.log(date);
//console.log(date());

const app=express();

//var item="";
// let items =["buy food","cook food","eat food"];
// let workItems =[];

app.set("view engine","ejs");

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/mongosh?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.7.1/todolist");

const itemSchema ={
    name:String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name:"welcom to your todolist!"
})

const item2 = new Item({
    name:"hit the + to add new item."
})

const item3 = new Item({
    name:"hit - to delelt an item."
})

const defaultItems = [item1,item2,item3];

const ListSchema ={
    name:String,
    items:[itemSchema]
};

const List=mongoose.model("List",ListSchema);

//Item.insertMany(defaultItems)

// ------------------------------------

app.get("/",function(req,res){

    //et day =date();
    //let day=date.getDate();
    //let day=date.getDay();
    Item.find({}).then(function(foundItems){
        if(foundItems===0){
            Item.insertMany(defaultItems)
        
        res.render("/");
        }
        else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })
    .catch(function(err){
        console.log(err);
    });

    
    app.get("/:customListName",function(req,res){
        const customListName=_.capitalize(req.params.customListName);

        // List.findOne({name: customListName},function(err,foundList){
        //     if(!err){
        //         if(!foundList){
        //             const list = new List({
        //                 name:customListName,
        //                 items:defaultItems
        //             });
        //             list.save();
        //             res.redirect("/"+ customListName);
                    
        //         }else{
        //             res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
        //         }
        //     }
        // })

        List.findOne({ name: customListName }).then(foundList => {
            if (foundList) {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                })
            } else {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/" + customListName)
        }
    }).catch(err => console.log(err.body));
});

    });

    //res.render("list",{listTitle:"Today" ,newListItems: items});


    //res.render("list",{kindofday:day ,newListItems:items});








// ------------------------------------



// app.get("/",function(req,res){

//     //et day =date();
//     //let day=date.getDate();
//     //let day=date.getDay();
//     Item.find({}).then(function(foundItems){
//         res.render("list", { listTitle: "Today", newListItems: foundItems });
//       })
//       .catch(function(err){
//         console.log(err);
//       });

//     //res.render("list",{listTitle:"Today" ,newListItems: items});


//     //res.render("list",{kindofday:day ,newListItems:items});

// })
app.post("/",function(req,res){


    const itemName= req.body.newItem;
    const listName=req.body.list;

    const item = new Item({
        name:itemName
    })
    if(listName=="Today")
    {
        item.save();

        res.redirect("/");
    }
    else{
        List.findOne({ name:listName }).then(foundList => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);

    
    }).catch(err => console.log(err.body));
    }

    

})

app.post("/delete",function(req,res){
    //console.log(req.body.checkbox);
    const checkedItemId= req.body.checkbox;
    const listName=req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(del){
            if(del){
                console.log("deleted");
                res.redirect("/");
            }
            
        })
        .catch(function(err){
            console.log(err);
        })
    }
    else{

        List.findOne({ name: listName })
    .then((foundList) => {
        if (foundList) {
        foundList.items.pull({ _id: checkedItemId });
        return foundList.save();
        }
    })
    .then(() => {
        console.log("We have removed the item with id: " + checkedItemId + " from " + listName + " list");
        res.redirect("/" + listName);
    })
    .catch((err) => {
        console.log(err);
    });
        // List.findOneAndUpdate(
        //     {name: listName},
        //     {$pull:{items:{_id:checkedItemId}}}
        //     ,function(err,foundItems){
        //         if(!err)
        //         {
        //             res.redirect("/"+listName);
        //         }
        //     })
    }


})

// app.get("/work",function(req,res){
//     res.render("list",{listTitle:"work List",newListItems:workItems});
// })

// app.post("/work",function(req,res){
//     let item=req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })

app.get("/about",function(req,res){
    res.render("about")
});


app.listen(3000,function(){
    console.log("server started on port 3000");
})