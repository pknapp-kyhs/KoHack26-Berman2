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
//specifically for the key, must be last get request or the whole thing breaks
app.get('/:key', (req, res) => {
    var k = req.params.key;
    res.type('text/html');
    let data = fs.readFileSync('main/main.html', 'utf-8');
    if(k){
        data = data.replace('</body>',`<script>loginkey = "${k}"</script></body>`)
        res.send(data);
    }
    else{
        res.send(data);
    }
});
//post request to add a review
app.post('/addReview',(req,res)=>{
    //error handling
    if(!req.body.key){
        res.send(new Error('key not valid'));
    }
    //reads accounts.json file
    let data = JSON.parse(fs.readFile('accounts.json'));
    for(let i = 0; i < data.length; i++){
        //checks if loginKey of a particular account is 
        if(data[i].loginKey === req.body.key){
            fs.readFile('reviews.json',(err, dat)=>{
                if(err){
                    throw new Error(err);
                }
                let parsedData = JSON.parse(dat);
                for(let x = 0; x < parsedData.shuls.length; x++){
                        if(parsedData.shuls[x].name === req.body.name){
                            parsedData.shuls[x].reviews.push({
                                text:req.body.text,
                                rating:req.body.rating,
                                category:req.body.category,
                                author:data[i].username,
                        })
                    }
                }
                fs.writeFile('reviews.json');

            })
        }
    }
});
app.post('/addShul',(req,res)=>{
    let body = req.body;
    let data = JSON.parse(fs.readFileSync('accounts.json'));
    data.shuls.push({
        name:body.name,
        lat:body.lat,
        lng:body.lng,
        location:body.location,
        reviews:[]
    })
    res.send('done');
})
//post request to sign in (data validation)
app.post('/signin',(req,res)=>{
    let key;
        let data = fs.readFileSync('accounts.json');
    for(let i = 0; i < data;i++){
        if(data[i].username === req.body.username && data[i].passcode === req.body.passcode){
            key = createKey();
            data[i].loginKey = key;
            fs.writeFile('accounts.json',data, (err)=>{if(err){
                throw new Error (err);
            }});
        }
    }
    res.send(JSON.stringify({key:key}));
});
app.post('/createAccount',(req,res)=>{
    let dat = req.body;
    let data = fs.readFileSync('accounts.json');
    data.users.push({
        username:dat.username,
        passcode:dat.passcode,
        userID:data.length+1,
        loginKey:null
});
res.send('success');
})
console.log(createKey());
app.listen(3000,()=>{console.log('Server online!')})