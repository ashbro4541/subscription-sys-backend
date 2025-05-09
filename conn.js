var mysql=require('mysql2')

var util=require('util')

const conn=mysql.createConnection({

    host:'localhost',
    user:'root',
    database:'subscription-system',
    password:'',
    port:3306
})

conn.connect((err)=>{
    if(err)
    {
        console.log(err);
    }
    else
    {
        console.log("DB Connected...")
    }
})

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;