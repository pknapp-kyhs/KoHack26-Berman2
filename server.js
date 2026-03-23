//defines main variables
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
app.use(express.json());
const digits = '01234567890123456789abcdefghisjklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//creates unique login key of numbers and letters recursively (cool)
function createKey(value = ''){
    if(value.length < 18){
        return createKey(value+digits.split("")[Math.floor(Math.random() * digits.length)]);
    }
    else{
        let data = JSON.parse(fs.readFileSync('accounts.json'));
        for(let i = 0; i < data.length; i++){
            //handles an absurdly unlikely edge case of two randomly generated keys being identical
            if(data[i].loginKey === value){
                return createKey('');
            }
        }
   return value;
    }
}
//gets main with a possible user authentication key when logged in.
app.get('/',(req,res)=>{
    res.type('text/html');
    res.sendFile(path.join(__dirname,'main',"main.html"));
})
//sends users to login page
app.get('/login',(req, res)=>{
    res.type("text/html");
    res.sendFile(path.join(__dirname, 'login','login.html'));
});
app.get('/addrating',(req,res)=>{
    let k = req.query.key
    let s = req.query.shul
    let data = JSON.stringify(fs.readFileSync(path.join(__dirname, '/addrating/addrating.html'), 'utf-8'));
    console.log(data);
    if(s&&k){
    data = data.replace('</body>',`<script>key = ${k}; currentShul = ${s}; </script></body>`)}
    res.type('text/html');
    console.log(typeof data);
    res.send(JSON.parse(data));
})
//specifically for the key, must be last get request or the whole thing breaks
app.get('/:key', (req, res) => {
    var k = req.params.key;
    res.type('text/html');
    let data = fs.readFileSync('main/main.html', 'utf-8');
    if(k){
        data = data.replace('</body>',`<script>loginkey = "${k}"; window.onload=()=>{loggy.style.display = 'none'; adding.style.display = 'block';}</script></body>`)
        res.send(data);
    }
    else{
        res.send(data);
    }
});
//post request to add a review
app.post('/addReview',(req,res)=>{
    console.log(req.body);
    //error handling
    if(!req.body.key){
        res.send(new Error('key not valid'));
    }
    //reads accounts.json file
    let data = JSON.parse(fs.readFileSync('accounts.json'));
    console.log(data);
    for(let i = 0; i < data.users.length; i++){
        //checks if loginKey of a particular account is 
        if(data.users[i].loginKey === req.body.key){
            console.log("readdddddddd");
                let parsedData = JSON.parse(fs.readFileSync('reviews.json'));
                for(let x = 0; x < parsedData.shuls.length; x++){
                        if(parsedData.shuls[x].name === req.body.name){
                            parsedData.shuls[x].reviews.push({
                                text:req.body.text,
                                ratings:{
                                    "Shabbat_Elevator":req.body.els,
                                    "Entrance_Exit":req.body.ee,
                                    "Wheelchair_access":req.body.wc
                                },
                                author:data.users[i].username,
                        })
                    }
                }
                fs.writeFile('reviews.json',JSON.stringify(parsedData),()=>{});
        }
    }
}
);
app.post('/addShul',(req,res)=>{
    let body = req.body;
    let data = JSON.parse(fs.readFileSync('reviews.json'));
    data.shuls.push({
        name:body.name,
        lat:body.lat,
        lng:body.lng,
        location:body.location,
        ratings:[],
        description:body.des
    })
    fs.writeFileSync('reviews.json',JSON.stringify(data));
    res.send('done');
})
//post request to sign in (data validation)
app.post('/signin',(req,res)=>{
    let key = 0;
    console.log(req.body);
    let data = JSON.parse(fs.readFileSync('accounts.json'));
    for(let i = 0; i < data.users.length; i++){
        console.log(data.users);
        if(data.users[i].username === req.body.username && data.users[i].passcode === req.body.passcode){
            key = createKey();
            console.log('password match')
            data.users[i].loginKey = key;
            fs.writeFileSync('accounts.json',JSON.stringify(data), (err)=>{if(err){
                throw new Error (err);
            }});
        }
    }
    res.send(JSON.stringify({key:key}));
});
//allows users to create an account
app.post('/createAccount',(req,res)=>{
    let dat = req.body;
    let data = JSON.parse(fs.readFileSync('accounts.json'));
    //makes sure no duplicate usernames
    for(let i = 0; i < data.users.length; i++){
        if(data.users[i].username === dat.username){
            res.send('Error: Username already taken');
        }
    }
    data.users.push({
        username:dat.username,
        passcode:dat.passcode,
        userID:data.users.length+1,
        loginKey:null
});
fs.writeFileSync('accounts.json',JSON.stringify(data));
res.send('success');
})
//allows you to search for keywords in accounts file
app.post('/search',
    (req,res)=>{
        var bod = req.body;
    let data = JSON.parse(fs.readFileSync('reviews.json'));
    let resu = [];
    console.log(data.shuls.length);
    //loops through shuls to find any with included term
    for(let i = 0; i < data.shuls.length; i++){
        console.log(data.shuls[i].location);
       if(data.shuls[i].name.includes(bod.string) || data.shuls[i].location.includes(bod.string) || data.shuls[i].location.includes(bod.string)){
        resu.push(data.shuls[i]);
       }
    }
    res.type('application/json')
    res.send(JSON.stringify({results:resu}));
})
app.post('/reviews.json',(req,res)=>{
    res.type('application/json');
    res.send(fs.readFileSync('reviews.json'));
})
console.log(createKey());
app.listen(3000,()=>{console.log('Server online!')});