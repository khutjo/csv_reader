require("dotenv").config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const fs = require('fs')
const port = process.env.PORT || 3000
var path = require('path'); 


var app   = require('express')();  
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'));

app.use(fileUpload({
    createParentPath: true
}));


app.get('/',function(req,res){  
    fs.readFile("./uploads/uploadregister.txt", "utf8", (err, data) => 
    {
        if (err) {
            res.render('pages/index', {files: null, size: 0});
            return
        }
        let files = []
        data = data.trim().split("\r\n");
        let size = data.length
        data.forEach(line => {
            let linepart = line.split(",")
            files.push({ filename: linepart[0], fileid: linepart[1]})
        })
        res.render('views/pages/index', {files: files,size: size});
     });
});


app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/' + avatar.name);
            fs.appendFile('./uploads/uploadregister.txt', avatar.name+","+Date.now(), function (err) {
                if (err) {return res.send({
                    status: false,
                    message: 'No file uploaded'
                });}
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.name,
                        mimetype: avatar.mimetype,
                        size: avatar.size
                    }
                });
              });

            
        }
    } catch (err) {
        res.status(500).send(err);
    }
});





app.listen(port, console.log("Server running on port: "+port))
module.exports = app;








