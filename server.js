//defines main variables
const express = require('express');
const app = express();
app.use(express.json());
const digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//creates unique login key of numbers and letters
function createKey(value = ''){
    if(value.length < 15){
        return createKey(value+digits.split("")[Math.floor(Math.random() * digits.length)]);
    }
    else{
        let data = fs.readFileSync('accounts.json')
        return value;


    }
}




//gets main with a possible user authentication key when logged in. Unfinished, will require key authentication for proper stuff
app.get('/:key', (req, res) => {
    res.type('text/html')
    res.sendFile(path.join(__dirname, 'main', 'main.html'))
});
//sends users to the login page
app.get('/login',(req, res)=>{
    res.type("text/html");
    res.sendFile(path.join(__dirname, 'login','login.html'));
});
//unfinished get request, will require authenticated key to use
app.get('/addRating/:key',()=>{
    res.type(
    'text/html');
    res.sendFile(path.join(__dirname,'addrating','addrating.html'));
});
app.post('AddReview',(req,res)=>{
    var key = req.body.key;

})