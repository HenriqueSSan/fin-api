const express = require('express');
const { v4: uuidV4 } = require('uuid');

const server = express();

server.use(express.json());

let regularCustomers = [];

// MIddleware
function verifyIfExistsAccountCPF(req, res, next) {
	const { cpf } = req.headers;

	const customer = regularCustomers.find((customer) => customer.cpf === cpf);

	if (!customer) {
		return res.status(400).json({ error: 'Customer not found' });
	}

	req.customer = customer;

	return next();
}

function getBalance(statement) {
	const balance = statement.reduce((acc, operation) => {
		if (operation.type === 'CREDIT') {
			return acc + operation.amount;
		} else {
			return acc - operation.amount;
		}
	}, 0);

	return balance;
}

server.post('/account', (req, res) => {
	const { cpf, name } = req.body;

	const customerAlreadyExists = regularCustomers.some(
		(customer) => customer.cpf === cpf
	);

	if (customerAlreadyExists) {
		return res.status(400).send({ error: 'Customer already exists!' });
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

server.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
	const { customer } = req;

	return res.json(customer.statement);
});

server.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
	const { description, amount } = req.body;
	const { customer } = req;

	const statementOperation = {
		description,
		amount,
		create_at: new Date(),
		type: 'CREDIT',
	};

	customer.statement.push(statementOperation);

	return res.status(201).send();
});

server.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
	const { amount } = req.body;

	const { customer } = req;

	const balance = getBalance(customer.statement);

	if (balance < amount) {
		return res.status(400).json({ error: 'Insufficient funds!' });
	}

	const statementOperation = {
		amount,
		create_at: new Date(),
		type: 'DEBIT',
	};

	customer.statement.push(statementOperation);

	return res.status(201).send();
});

server.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
	const { customer } = req;
	const { date } = req.query;

	const dateFormat = new Date(date + ' 00:00');

	const statement = customer.statement.filter(
		(statement) =>
			statement.create_at.toDateString() === new Date(dateFormat).toDateString()
	);

	return res.status(200).json(statement);
});

server.put('/account', verifyIfExistsAccountCPF, (req, res) => {
	const { name } = req.body;
	const { customer } = req;

	customer.name = name;

	return res.status(201).send();
});

server.listen(4040, () => console.log('>> Staring Development....'));
