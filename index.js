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
    if (req.query && req.query.alert){
        return res.render('views/pages/index', {files: null,size: 0, showalert: true , results: req.query.alert });
    }
    fs.readFile("./uploads/uploadregister.txt", "utf8", (err, data) => 
    {
        if (err) {
            return res.render('views/pages/index', {files: null, size: 0, showalert: true , results: "Error Retrieving List"});
        }
        let files = []
        data = data.trim().split("\r\n");
        let size = 0
        data.forEach(line => {
            let linepart = line.split(",")
            if (linepart[0].length > 0){
                files.push({ filename: linepart[0], timestamp: linepart[1], fileid: encodeURI(linepart[2])})
                size++
            }
        })
        res.render('views/pages/index', {files: files,size: size, showalert: false , results: ""});
     });
});


app.get('/read', async (req, res) => {
    try {
        fs.readFile("./uploads/uploadregister.txt", "utf8", (err, data) => 
        {
            if (err) {
                return res.redirect(301, "/?alert=" + encodeURIComponent("error loading csv"));
            }
            data = data.trim().split("\r\n");
            let found = false
            data.forEach(line => {
                let linepart = line.split(",")
                if (linepart[2] == req.query.file){
                    found = true
                    fs.readFile("./uploads/"+linepart[2], "utf8", (err, csvdata) => {
                        if (err) {
                            return res.redirect(301, "/?alert=" + encodeURIComponent("error loading csv"));
                        }
                        let filedata = []
                        let skip = true
                        try {
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
                        }catch (err) {
                            return res.redirect(301, "/?alert=" + encodeURIComponent("error loading csv"));
                        }
                    });
                }
            })
            if (!found){
                return res.redirect(301, "/?alert=" + encodeURIComponent("error file not found"));
            }
        });
    }
     catch (err) {
        return res.redirect(301, "/?alert=" + encodeURIComponent("error uploading file"));
    }
});

function padding(num){
    strnum = num.toString(10)
    if (strnum.length == 1)
        strnum = "0"+strnum
    return strnum
}

function gettimestamp(){
    var months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];

    const date = new Date();
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hour = padding(date.getHours());
    const minute = padding(date.getMinutes());
    const second = padding(date.getSeconds());
    return day +" "+ month+" "+ year +" "+hour+":"+minute+":"+second
}

app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            return res.redirect(301, "/?alert=" + encodeURIComponent("error uploading file"));
        } else {
            let csv = req.files.csv;
            
            let filename = parseInt(Math.random(Date.now()))+Date.now()
            fs.appendFile('./uploads/uploadregister.txt', csv.name+","+gettimestamp()+","+filename+"\r\n", function (err) {
                if (err) {
                    return res.redirect(301, "/?alert=" + encodeURIComponent("error uploading file"));
                }else
                    return res.redirect(301, "/?alert=" + encodeURIComponent("File Uploaded Successfully"));
            });
            csv.mv('./uploads/' + filename);    
        }
    } catch (err) {
        return res.redirect(301, "/?alert=" + encodeURIComponent("error uploading file"));
    }
});




app.listen(port, console.log("Server running on port: "+port))
module.exports = app;








