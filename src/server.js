const { response } = require('express');
const express = require('express');
const { v4 : uuidV4 } = require('uuid');

const server = express();

server.use(express.json());

let regularCustomers = [];

server.post('/account', (req, res) => {
	const { cpf, name } = req.body;

	const customerAlreadyExists = regularCustomers.some(customer => customer.cpf === cpf)

	if(customerAlreadyExists){
		return res.status(400).send({error: "Customer already exists!"})
	}

	let customer = {
		cpf,
		name,
		id: uuidV4(),
		statement: [],
	};

	regularCustomers.push(customer);

	return res.status(201).send();
});

server.listen(4040, () => console.log('>> Staring Development....'));
