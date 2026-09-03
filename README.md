\# Employee Attendance Management System



A full-stack web application for managing employee attendance, working hours, leave management, HR operations, and payroll.



Developed as part of the \*\*Inner Eye Consultancy Services LLP Developer Assignment\*\*.



\---



\# 1. Project Overview



The Employee Attendance Management System is a full-stack web application designed to manage employee attendance and HR operations through separate employee and HR interfaces.



The system provides secure authentication, attendance tracking, working-hours calculation, leave management, employee management, and payroll management.



The application contains two primary roles:



\- Employee

\- HR Administrator



\---



\# 2. Features



\## Employee Features



Employees can:



\- Register a new employee account

\- Log in securely

\- Log out

\- View employee dashboard

\- Check in for attendance

\- Check out after completing work

\- View attendance history

\- View working hours

\- Apply for leave

\- View leave balance

\- View leave history

\- View payroll information

\- Access only authorized employee pages



\## HR Features



HR administrators can:



\- Log in securely

\- View HR dashboard

\- View employee statistics

\- Manage employees

\- View employee attendance

\- Manage attendance records

\- View leave applications

\- Approve leave requests

\- Reject leave requests

\- Manage employee leave information

\- Create payroll records

\- Edit payroll records

\- Process payroll

\- Mark payroll as paid

\- View payroll reports

\- View payroll summaries

\- Access HR-only functionality



\---



\# 3. Technology Stack



\## Frontend



\- React

\- Vite

\- React Router

\- Axios

\- JavaScript

\- CSS



\## Backend



\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT

\- bcryptjs

\- Express Validator

\- Helmet

\- CORS

\- Express Rate Limit



\## Database



\- MongoDB



\---



\# 4. System Architecture



The application follows a client-server architecture.



```text

&#x20;                   Employee / HR

&#x20;                        |

&#x20;                        v

&#x20;               React Frontend

&#x20;                 localhost:5173

&#x20;                        |

&#x20;                        | HTTP / REST API

&#x20;                        v

&#x20;               Express Backend

&#x20;                 localhost:5000

&#x20;                        |

&#x20;            +-----------+-----------+

&#x20;            |                       |

&#x20;            v                       v

&#x20;     Authentication            Business Logic

&#x20;     \& Authorization           \& API Controllers

&#x20;            |                       |

&#x20;            +-----------+-----------+

&#x20;                        |

&#x20;                        v

&#x20;                   Mongoose

&#x20;                        |

&#x20;                        v

&#x20;                    MongoDB

Project Structure

Employee Attendance Management System/

│

├── backend/

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── models/

│   │   ├── routes/

│   │   ├── services/

│   │   ├── utils/

│   │   └── validators/

│   │

│   ├── createHR.js

│   ├── server.js

│   ├── package.json

│   ├── package-lock.json

│   ├── .env.example

│   └── node\_modules/

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── pages/

│   │   ├── routes/

│   │   └── services/

│   │

│   ├── public/

│   ├── package.json

│   ├── package-lock.json

│   └── node\_modules/

│

├── database/

│   └── DATABASE.md

│

└── README.md

Prerequisites



Install the following software before running the application:



Node.js

npm

MongoDB account or MongoDB local installation

Git (optional)



Verify Node.js:



node --version



Verify npm:



npm --version

Backend Environment Configuration



Create a .env file inside the backend directory.



Use:



backend/.env.example



as the template.



Example:



PORT=5000



MONGODB\_URI=your\_mongodb\_connection\_string



JWT\_SECRET=your\_jwt\_secret



JWT\_EXPIRES\_IN=1d



NODE\_ENV=development

Important



The actual .env file may contain private information such as:



MongoDB credentials

JWT secret

Other environment-specific configuration



Therefore, the actual .env file should not be shared publicly.



Only .env.example should be included in the repository.

MongoDB Database Setup



The application uses:



MongoDB



with:



Mongoose



The backend connects to MongoDB using:



MONGODB\_URI



from the .env file.



Example:



MONGODB\_URI=your\_mongodb\_connection\_string



The database does not require SQL scripts because the project uses MongoDB and Mongoose schemas.



Detailed database documentation is available in:



database/DATABASE.md



#Database Collections



The application uses the following MongoDB collections.



Users



Stores employee and HR account information.



Main fields include:



employeeId

name

email

password

role

department

designation

joiningDate

salary

status

createdAt

updatedAt



Supported roles:



employee

hr



Supported account statuses:



active

inactive



Passwords are stored as bcrypt hashes.



Attendances



Stores daily employee attendance.



Main fields include:



employee

date

checkIn

checkOut

workingMinutes

status

remarks

createdAt

updatedAt



Attendance statuses include:



present

late

half\_day

absent

leave

working



A unique compound index on:



employee + date



prevents duplicate attendance records for the same employee on the same day.



Leaves



Stores employee leave applications and HR decisions.



Main fields include:



employee

leaveType

startDate

endDate

totalDays

reason

status

approvedBy

approvedAt

rejectionReason

createdAt

updatedAt



Supported leave types:



casual

sick

earned

unpaid



Supported statuses:



pending

approved

rejected

cancelled

Leave Balances



Stores yearly leave balances for employees.



Main fields include:



employee

year

casual

sick

earned

unpaid

createdAt

updatedAt



Default balances:



Casual Leave: 12 days

Sick Leave: 10 days

Earned Leave: 15 days

Unpaid Leave: 0 days



A unique compound index on:



employee + year



ensures one leave-balance record per employee per year.



Payrolls



Stores monthly employee payroll information.



Main fields include:



employee

month

year

basicSalary

allowances

deductions

netSalary

status

processedAt

paidAt

remarks

createdAt

updatedAt



Payroll statuses:



pending

processed

paid



A unique compound index on:



employee + month + year



prevents duplicate payroll records for the same employee and month.



\#Database Relationships



The User entity is the central entity.



User

&#x20;|

&#x20;+---- Attendance

&#x20;|

&#x20;+---- Leave

&#x20;|

&#x20;+---- LeaveBalance

&#x20;|

&#x20;+---- Payroll



Relationships:



Attendance.employee

&#x20;       ↓

&#x20;    User.\_id



Leave.employee

&#x20;       ↓

&#x20;    User.\_id



Leave.approvedBy

&#x20;       ↓

&#x20;    User.\_id



LeaveBalance.employee

&#x20;       ↓

&#x20;    User.\_id



Payroll.employee

&#x20;       ↓

&#x20;    User.\_id



#Start the Backend



Development mode:



cd backend

npm run dev



Production/start mode:



cd backend

npm start



The backend runs on:



http://localhost:5000



#Backend API



The main API base URL is:



http://localhost:5000/api



Major API modules:



/api/auth

/api/attendance

/api/leave

/api/leave-balance

/api/employees

/api/hr-dashboard

/api/payroll



#Authentication



The application uses JWT-based authentication.



Authentication flow:



User Login

&#x20;   ↓

Backend validates credentials

&#x20;   ↓

Password verified using bcryptjs

&#x20;   ↓

JWT generated

&#x20;   ↓

Frontend stores authentication information

&#x20;   ↓

Protected API requests include authentication token

&#x20;   ↓

Backend verifies JWT

&#x20;   ↓

Role-based authorization is applied



Supported roles:



employee

hr



#Employee Registration



Employees can create their own accounts through:



/register



The registration form collects:



Full name

Email

Password

Confirm password

Department

Designation

Joining date

Salary



Employee IDs are generated automatically.



New registrations are assigned:



role = employee



HR accounts are managed separately.



\#Creating an HR Account



The backend contains:



backend/createHR.js



This script can be used to create an HR administrator account.



Make sure MongoDB is configured correctly in .env.



Run:



cd backend

node createHR.js



The created HR account can then be used to access the HR dashboard.



\#Employee Attendance



The attendance workflow is:



Check In

&#x20;   ↓

Working

&#x20;   ↓

Check Out

&#x20;   ↓

Attendance Completed



The system follows a daily attendance rule:



One check-in per employee per day

One check-out per employee per day

Working minutes are calculated after checkout

A second check-in is not allowed after the day's attendance has been completed

A new attendance record can be created on a subsequent day



Working time is calculated using the difference between:



checkOut - checkIn



The database also enforces uniqueness for the employee/date combination.



\#Attendance History



Employees can view their complete attendance history.



Attendance history includes:



Date

Check-in time

Check-out time

Working time

Attendance status

Remarks



Working time is displayed in hours and minutes where applicable.



\#Leave Management



Employees can apply for:



Casual leave

Sick leave

Earned leave

Unpaid leave



Leave requests contain:



Leave type

Start date

End date

Total days

Reason

Status



Initial status:



pending



HR can then:



Approve

Reject



leave requests.



\#Leave Balance



The system maintains yearly leave balances.



Default balances:



Casual Leave  → 12

Sick Leave    → 10

Earned Leave  → 15

Unpaid Leave  → 0



Approved leave is deducted from the relevant leave balance according to the application's leave-management logic.



\#HR Dashboard



The HR dashboard provides an overview of employee and attendance information.



HR can access information such as:



Total employees

Attendance statistics

Leave statistics

Payroll information

Employee records

Attendance records

Leave requests



#Employee Management



HR administrators can manage employee records.



Employee management includes:



Viewing employees

Viewing employee information

Managing employee status

Accessing employee-related HR information



#HR Attendance Management



HR administrators can view employee attendance information.



Attendance management allows HR to monitor:



Employee

Date

Check-in

Check-out

Working minutes

Attendance status

Remarks



#HR Leave Management



HR administrators can manage leave applications.



HR can:



View pending requests

View approved requests

View rejected requests

Approve leave

Reject leave

Review employee leave information



#Payroll Management



HR administrators can manage monthly payroll.



Payroll contains:



Basic salary

Allowances

Deductions

Net salary

Payroll status

Processing date

Payment date

Remarks



Payroll workflow:



Create Payroll

&#x20;     ↓

Pending

&#x20;     ↓

Process Payroll

&#x20;     ↓

Processed

&#x20;     ↓

Mark as Paid

&#x20;     ↓

Paid



The system prevents duplicate payroll records for the same:



Employee + Month + Year



#Payroll Reports



HR can view payroll summaries and reports.



Payroll functionality includes:



Overall payroll summary

Employee payroll information

Monthly payroll report

Employee payroll summary

Payroll status

Salary information



#Role-Based Access Control



The application provides separate access based on the user's role.



Employee Access



Employees can access:



Employee dashboard

Attendance

Attendance history

Leave management

Leave balance

Payroll information



Employees cannot access HR-only pages.



HR Access



HR administrators can access:



HR dashboard

Employee management

Attendance management

Leave management

Payroll management

Payroll reports



#Protected Routes



Frontend routes are protected based on authentication and role.



Examples:



Employee → Employee Dashboard

HR       → HR Dashboard



If an employee attempts to access an HR-only route, the application redirects the employee to the appropriate dashboard.



Backend APIs are independently protected using authentication and authorization middleware.



\#Security Features



The application implements multiple security measures.



Password Security



Passwords are hashed using:



bcryptjs



Passwords are never stored as plain text.



JWT Authentication



JWT tokens are used to authenticate protected requests.



Role-Based Authorization



HR-only APIs require the HR role.



Request Validation



Input validation is implemented using:



express-validator

Helmet



Helmet is used to improve HTTP security headers.



CORS



CORS is configured for frontend-backend communication.



Rate Limiting



Express Rate Limit is used to reduce excessive requests.



Environment Variables



Sensitive configuration is stored through environment variables.



Database Constraints



Unique database indexes are used to prevent duplicate records.



\#Frontend Setup



Open another terminal:



cd frontend



If dependencies are not already available:



npm install



Start the frontend:



npm run dev



The frontend runs on:



http://localhost:5173



Open:



http://localhost:5173



in a browser.



\#Frontend Architecture



The frontend is organized into:



src/

├── components/

├── context/

├── pages/

├── routes/

└── services/

Components



Reusable UI components.



Context



Application-level authentication state.



Pages



Employee, HR, login, registration, attendance, leave, and payroll screens.



Routes



Application routing and role-based route protection.



Services



API communication using Axios.



\#Authentication Context



The frontend uses an authentication context to manage:



Current user

Login state

Loading state

Login operation

Logout operation

Authentication status



Authentication information is persisted in browser local storage.



\#Frontend Pages



Major application pages include:



Login

Register

Employee Dashboard

Attendance

Attendance History

Leave Management

HR Dashboard

Employee Management

HR Attendance

HR Leave

HR Payroll



#Running the Complete Application



The application requires two terminals.



Terminal 1 — Backend

cd "D:\\Employee Attendance Management System\\backend"

npm run dev



Backend:



http://localhost:5000

Terminal 2 — Frontend

cd "D:\\Employee Attendance Management System\\frontend"

npm run dev



Frontend:



http://localhost:5173



Then open:



http://localhost:5173

36\. Production Build



To create a production build:



cd frontend

npm run build



The production build is generated inside:



frontend/dist



The build should complete successfully before final submission.




#Testing Checklist



Authentication

&#x20;Employee registration

&#x20;Employee login

&#x20;HR login

&#x20;Logout

&#x20;Invalid login handling

Employee

&#x20;Employee dashboard

&#x20;Check-in

&#x20;Check-out

&#x20;Attendance history

&#x20;Leave application

&#x20;Leave balance

&#x20;Leave history

&#x20;Payroll view

HR

&#x20;HR dashboard

&#x20;Employee management

&#x20;Attendance management

&#x20;Leave management

&#x20;Leave approval

&#x20;Leave rejection

&#x20;Payroll creation

&#x20;Payroll editing

&#x20;Payroll processing

&#x20;Payroll payment

&#x20;Payroll reports

&#x20;Payroll summaries

Security

&#x20;Protected routes

&#x20;Role-based frontend access

&#x20;Role-based backend access

&#x20;JWT authentication

&#x20;Password hashing

&#x20;Request validation

&#x20;Invalid authentication handling

Build

&#x20;Frontend production build tested successfully



#Environment Files



The project contains:



backend/.env.example



The .env.example file contains placeholders such as:



PORT=5000

MONGODB\_URI=your\_mongodb\_connection\_string

JWT\_SECRET=your\_jwt\_secret

JWT\_EXPIRES\_IN=1d

NODE\_ENV=development



The actual .env file should contain the real configuration locally.



Do not publish:



MongoDB username/password

JWT secret

API keys

Other private credentials



#Dependency Management



Backend dependencies are defined in:



backend/package.json

backend/package-lock.json



Frontend dependencies are defined in:



frontend/package.json

frontend/package-lock.json



If node\_modules is unavailable on another machine, dependencies can be restored with:



npm install



#Database Documentation



Additional database documentation is available at:



database/DATABASE.md



It contains information about:



MongoDB configuration

Collections

Fields

Relationships

Indexes

Database security

Database initialization



#Submission Contents



The completed assignment should contain:



Source Code

Database Models / Documentation

Frontend

Backend

package.json

package-lock.json

.env.example

README.md

Database Documentation

Setup Instructions

Testing Information



If the assignment submission specifically requires dependencies to be included, the project may also contain:



backend/node\_modules/

frontend/node\_modules/



The actual .env file containing private credentials should not be included.



\#Recommended Submission Structure



Employee Attendance Management System/

│

├── backend/

│   ├── src/

│   ├── createHR.js

│   ├── server.js

│   ├── package.json

│   ├── package-lock.json

│   ├── .env.example

│   └── node\_modules/

│

├── frontend/

│   ├── src/

│   ├── public/

│   ├── package.json

│   ├── package-lock.json

│   └── node\_modules/

│

├── database/

│   └── DATABASE.md

│

└── README.md



#Troubleshooting


Backend does not start



Check:



node --version

npm --version



Then verify that:



backend/.env



contains a valid MongoDB connection string.



Try:



npm install

npm run dev

MongoDB connection fails



Check:



MongoDB is running or MongoDB Atlas is available

MONGODB\_URI is correct

Database credentials are correct

Network access is configured correctly if using MongoDB Atlas

Frontend cannot connect to backend



Make sure the backend is running:



http://localhost:5000



Then start the frontend:



npm run dev



The frontend should run on:



http://localhost:5173

Login fails



Check:



Backend is running

MongoDB is connected

Email is correct

Password is correct

The account is active



For HR login, make sure an HR account has been created using:



node createHR.js



# Final Run Commands



Backend

cd backend

npm run dev

Frontend

cd frontend

npm run dev

Frontend production build

cd frontend

npm run build



#Project Status



The following major modules have been implemented and tested:



Employee Registration       ✓

Employee Login              ✓

HR Login                    ✓

Logout                      ✓

Employee Dashboard          ✓

HR Dashboard                ✓

Attendance Management       ✓

Attendance History          ✓

Leave Management            ✓

Leave Balance               ✓

Employee Management         ✓

HR Attendance Management    ✓

HR Leave Management         ✓

Payroll Management          ✓

Payroll Reports             ✓

Role-Based Access           ✓

JWT Authentication         ✓

Password Hashing            ✓

Request Validation          ✓

Security Middleware         ✓

Frontend Production Build   ✓



#Conclusion



The Employee Attendance Management System provides a complete solution for employee attendance and HR operations.



The system combines:



Secure authentication

Employee registration

Attendance tracking

Working-hours calculation

Leave management

Leave deduction

Employee management

HR dashboard

Payroll management

Role-based authorization

MongoDB database management

Security middleware

Professional frontend interface



The project is designed as a full-stack MERN-based application and can be configured and executed using the setup instructions provided in this document.



\# Developer



Employee Attendance Management System



Developed as part of the:



Inner Eye Consultancy Services LLP Developer Assignment

