// import packages
const inquirer = require("inquirer");
const mysql = require("mysql2");
require('dotenv').config()
// connection to database storing output data into "db"
const db = mysql.createConnection(
    {
        // process to secure keys in .env file then copy .env file to be ignored in .gitignore
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    }

)
//db.connect is a method that is available from mysql2 allowing me to check if the connection to the database defined variable is functioning with an if() formulated to handle the error in case the connection does not function.
db.connect((error) => {
    if (error) {
        console.log(error)
    }
    else { console.log("connected to mysql successfully") }
})
// emptkrprompt = [{}] is the variable I am storing the aray of one object to be prompted to the user by initiating inquirer and using the .prompt() method at bottom of page when the user starts the npm program 
const emptkrprompt = [
    {
        type: "list",
        name: "employee_management",
        message: "what would you like to do",
        choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"]

    },
]
//im using db.query method used in CLT or PowerShell to check if it works is structured like: .query('first paramater in query for accessing data from the created tables', function goes here for handling the response and results from the defined query (err, results) {use console.table(results) here to view the response and results from the query} from mysql2 in the function viewDepartments() with the 'SELECT * FROM department'
function viewDepartments() {
    // query database
    db.query(
        'SELECT * FROM department', function (err, results) {
            console.table(results)
            init();
        }
    );
}
// contains query used to access tables as joined in schema.sql with powershell
function viewAllRoles() {
    db.query(
        'SELECT role.title, role.id, department.name, role.salary from role inner join department on role.department_id = department.id', function (err, results) {
            console.table(results)
            init();
        }
    )
}
// in the query() below im fetching the data from table'employee', then im fetching role data by using inner join and also fetching department name by using inner join then line 56 making employee table act as manager table via assigned id's from schema.sql
function viewAllEmployees() {
    db.query(
        `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON role.id = employee.role_id
        LEFT JOIN employee manager ON employee.manager_id = manager.id
        LEFT JOIN department ON role.department_id = department.id`, function (err, results) {
            console.table(results)
            init();
        }
    )
}
// I am adding a .prompt available via and initiated by inquirer to insert prompt allowing for the user to add a department of their choosing then I use .then(answer) method with another db.query for returning the users inputed response stored in answers, which is local and can change from each of the functions defined in this series and the .query () method allows for handling an error in case failure to connect/render as it did above in the first example of .query().  
function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: "name",
        message: "add a department...",
    }).then(answer => {
        db.query(
            'INSERT INTO department SET ?', answer, function (err, results) {
                console.log(results)
                init();
            })
    })
}
function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: "title",
            message: "enter the title of the role",
        },
        {
            type: 'input',
            name: "salary",
            message: "enter the salary",
        },
        {
            type: 'input',
            name: "department_id",
            message: "enter the department_id",
        },
    ]).then(answer => {
        db.query(
            'INSERT INTO role SET ?', answer, function (err, results) {
                console.log(results)
                init();
            })
    })
}
function addEmployee() {
    inquirer.prompt([
       {
        type: 'input',
        name: 'first_name',
        message: 'enter employee first name',
       },
       {
        type: 'input',
        name: 'last_name',
        message: 'enter employee last name',
       },
       {
        type: 'input',
        name: 'role_id',
        message: 'enter employee role id',
       },
       {
        type: 'input',
        name: 'manager_id',
        message: 'enter employee manager id',
       },
    ]).then(answer => {
        db.query(
            'INSERT INTO employee SET ?', answer, function (err, results) {
            console.table(results)
            init();
        })
    })
}
// can use select * from employee in powershell to check code above for returned table with added response from user after using npm start in the terminal here to respond to the added prompts
// I run select * from employees which gives me all the employees and stores them in the variable 'employees'. Then im running select * from role which returns all the roles and stores them into the variable 'roles'. 
// Once I get back all the data for the employees and roles then im running inquirer.prompt() to prompt the user with please select employee, and please select a new role for the employee. then using map() method with employees.map(results => ({})) the results within this is acting like an index for the loop initiated by the map() method and it contains all of the values of the arrays as the loop functions then by defining name: ${result.first_name}, ${results.last_name} this displays the data fronm the array specifically as defined with results.first_name and results.last_name displays for the users to see first and last name, and then value: result.id connects tables as defined for the code to update with the user inputed values into the defined tables employee and role since written as result.id local variable via the primary key for each table as '.id'.
// then using .then(answer) => {db.query()} to update the employee table role with SET ? and which employee to be updated with WHERE ?. the ? acts as a placeholder allowing for the user inputed data to be inserted there as its assigned in role_id: and id: with returned values from user that were stored in answer.role and answer.employee.
function updateEmployeeRole() {
    let employees;
    let roles;
    db.query(
        'SELECT * FROM employee', function (err, results) {
            console.log(results)
            employees = results;
            
            db.query( 'SELECT * FROM role', function (err, results) {
                console.log(results)
                roles = results;

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: 'please select employee', 
                        choices: employees.map(result => ( {
                            name: `${result.first_name} ${result.last_name}`, 
                            value: result.id
                        }
                        ))
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'please select a new role for the employee', 
                        choices: roles.map(result => ( {
                            name: result.title, 
                            value: result.id
                        }
                        ))
                    }
                ])
                .then(answer => {
                    db.query(`update employee SET ? WHERE ?`, [
                        {role_id: answer.role},
                        {id: answer.employee}
                    ], 
                    function (err, results) {
                        if(err){console.log(err)}
                        console.log(results)
                        init();
                    })
                })
            })
          
        }
    )
}
function init(){
// initiates inquirer
inquirer
    //.prompt() method calls the array object as it was defined at top of page.
    .prompt(emptkrprompt)
    // .then(answers) is where I store the users inputs from the initiated prompt. I use the functiobns below to call and display the functions as they are defined above for the response to the users answers
    .then((answers) => {
        console.log(answers)
        if (answers.employee_management == "view all departments") {
            viewDepartments()
        }
        else if (answers.employee_management == "view all roles") {
            viewAllRoles()
        }
        else if (answers.employee_management == "view all employees") {
            viewAllEmployees()
        }
        else if (answers.employee_management == "add a department") {
            addDepartment()
        }
        else if (answers.employee_management == "add a role") {
            addRole()
        }
        else if (answers.employee_management == "add an employee") {
            addEmployee()
        }
        else if (answers.employee_management == "update an employee role") {
            updateEmployeeRole()
        }
    })
}
init();