const database = require("./database");

// ---------------- party GET USERS method -------------------

const getUsers = (req, res) => {
	const initialSql = "SELECT firstname, lastname, city, language FROM users";
	const where = [];

	if (req.query.city != null) {
		where.push({
			column: "city",
			value: req.query.city,
			operator: "=",
		});
	}
	if (req.query.language != null) {
		where.push({
			column: "language",
			value: req.query.language,
			operator: "=",
		});
	}

	database
		.query(
			where.reduce(
				(sql, { column, operator }, index) =>
					`${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
				initialSql
			),
			where.map(({ value }) => value)
		)
		.then(([users]) => {
			res.json(users);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Error retrieving data from database");
		});
};

// ---------------- party GET USERS BY ID method -------------------

const getUserById = (req, res) => {
	const id = parseInt(req.params.id);

	database
		.query(
			"SELECT firstname, lastname, city, language FROM users WHERE id = ?",
			[id]
		)
		.then(([users]) => {
			if (users[0] != null) {
				res.json(users[0]);
			} else {
				res.status(404).send("Not Found");
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Error retrieving data from database");
		});
};

// ---------------- party POST USERS method -------------------

const postUser = (req, res) => {
	const { firstname, lastname, email, city, language, hashedPassword } =
		req.body;

	database
		.query(
			"INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)",
			[firstname, lastname, email, city, language, hashedPassword]
		)
		.then(([result]) => {
			res.location(`/api/users/${result.insertId}`).sendStatus(201);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Error saving the user");
		});
};

// ---------------- party UPDATE USERS BY ID method -------------------

const updateUser = (req, res) => {
	const id = parseInt(req.params.id);
	const { firstname, lastname, email, city, language, hashedPassword } =
		req.body;

	database
		.query("SELECT * FROM users WHERE id = ?", [id])
		.then(([users]) => {
			if (users.length === 0) {
				res.status(404).send("Not Found");
			} else {
				const existingUser = users[0];

				const updatedUser = {
					firstname: firstname || existingUser.firstname,
					lastname: lastname || existingUser.lastname,
					email: email || existingUser.email,
					city: city || existingUser.city,
					language: language || existingUser.language,
					hashedPassword: hashedPassword || existingUser.hashedPassword,
				};

				return database.query(
					"UPDATE users SET firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? WHERE id = ?",
					[
						updatedUser.firstname,
						updatedUser.lastname,
						updatedUser.email,
						updatedUser.city,
						updatedUser.language,
						updatedUser.hashedPassword,
						id,
					]
				);
			}
		})
		.then(([result]) => {
			if (result.affectedRows === 0) {
				res.status(404).send("Not Found");
			} else {
				res.sendStatus(204);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Error editing the user");
		});
};

// ---------------- party DELETE USERS method -------------------

const deleteUser = (req, res) => {
	const id = parseInt(req.params.id);

	database
		.query("DELETE FROM users WHERE id = ?", [id])
		.then(([result]) => {
			if (result.affectedRows === 0) {
				res.status(404).send("Not Found");
			} else {
				res.sendStatus(204);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Error deleting the user");
		});
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
	const { email } = req.body;

	database
		.query(
			"SELECT firstname, lastname, city, language, hashedPassword FROM users WHERE email = ?",
			[email]
		)
		.then(([users]) => {
			if (users[0] != null) {
        req.user = users[0];
				next();
			} else {
				res.sendStatus(401);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Error retrieving data from database");
		});
};

// ------------------ EXPORT method ----------------

module.exports = {
	getUsers,
	getUserById,
	postUser,
	updateUser,
	deleteUser,
	getUserByEmailWithPasswordAndPassToNext,
};