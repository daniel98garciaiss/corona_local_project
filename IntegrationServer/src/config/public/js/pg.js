const {Pool, Client} = require('pg');

//securos
const poolSecuros = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'securos',
    password: 'postgres',
    port: 5432,
});

 
const querySecuros = async (q) => {
    try {
        const response = await poolSecuros.query(q);
        return response.rows;
    } catch (error) {
        
    }
}
 
module.exports = {
    querySecuros,
}
