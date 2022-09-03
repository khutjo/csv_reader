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
            res.render('views/pages/index', {files: null, size: 0});
            return
        }
        let files = []
        data = data.trim().split("\r\n");
        let size = data.length
        data.forEach(line => {
            let linepart = line.split(",")
            files.push({ filename: linepart[0], fileid: encodeURI(linepart[1])})
        })
        res.render('views/pages/index', {files: files,size: size});
     });
});


app.get('/read', async (req, res) => {
    fs.readFile("./uploads/uploadregister.txt", "utf8", (err, data) => 
    {
        if (err) {
            res.render('iews/pages/index', {files: null, size: 0});
            return
        }
        data = data.trim().split("\r\n");
        data.forEach(line => {
            let linepart = line.split(",")
            if (linepart[1] == req.query.file)
            fs.readFile("./uploads/"+linepart[1], "utf8", (err, csvdata) => 
            {
                // let csvlines = csvdata.trim().split("\r\n");
                let filedata = []
                let skip = true
                    csvdata.trim().split("\r\n").forEach(csvlines => {
                        if (!skip){
                              
                        let csvline = csvlines.split(";")
                        filedata.push({StudentNumber: csvline[0],
                        Firstname: csvline[1],
                        Surname: csvline[2],
                        CourseCode: csvline[3],
                        CourseDescription: csvline[4],
                        Grade: csvline[5]})
                        }else
                            skip = false

                    })
                    return res.render('views/pages/readcsv', {filedata: filedata, filename: linepart[0]});
                });
        })
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
            let filename = parseInt(Math.random(Date.now()))+Date.now()
            avatar.mv('./uploads/' + filename);
            fs.appendFile('./uploads/uploadregister.txt', avatar.name+","+filename+"\r\n", function (err) {
                if (err) {
                    res.status(500).send(err);
                }else
                    res.redirect(301, "/");
              });           
        }
    } catch (err) {
        res.status(500).send(err);
    }
});





app.listen(port, console.log("Server running on port: "+port))
module.exports = app;








