INSERT INTO department (name)
VALUES ("HR"), 
       ("Finance"),
       ("Sales");
INSERT INTO role (title, salary, department_id)
VALUES ("HR", 65000.00, 1),
       ("Finance rep", 75000.00, 2),
       ("Sales rep", 50000.00, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Rogers", 1, 1),
       ("Kyle", "Howard", 2, 2),
       ("Steve", "crenshaw", 3, null),
       ("Ashley", "Robinson", 1, null);