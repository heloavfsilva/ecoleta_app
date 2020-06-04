import express from 'express';

const routes = express.Router();
const users = [
    'Diego',
    'Cleiton',
    'Robson',
    'Daniel'
];


routes.get('/', (req, res) => {
    return res.json({message: 'Hello World'});
});

routes.get('/users', (req, res) => {
    const search = String(req.query.search);
    const filteredUsers = search ? users.filter(user => user.includes(search)) : users;
    
    console.log('search');
    return res.json(filteredUsers);
})
routes.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users[id];
});

routes.post('/users', (req, res)=>{
    const user = {
        name: 'Diego',
        email: 'diego@rocketseat.com.br'
    };
    return res.json(user);
})

export default routes;