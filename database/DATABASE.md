\# Database Documentation



\## Database Technology



The Employee Attendance Management System uses MongoDB as its database and Mongoose as the ODM (Object Data Modeling) library.



The backend connects to MongoDB using the `MONGODB\_URI` environment variable.



\## Database Configuration



Add the MongoDB connection string to the backend `.env` file:



MONGODB\_URI=your\_mongodb\_connection\_string



Example:



MONGODB\_URI=mongodb+srv://<username>:<password>@<cluster>/<database>



The actual database credentials must not be committed to GitHub.



\## Collections



The application uses the following MongoDB collections.



\### 1. Users



Purpose:

Stores employee and HR account information.



Main fields:

\- employeeId

\- name

\- email

\- password

\- role

\- department

\- designation

\- joiningDate

\- salary

\- status

\- createdAt

\- updatedAt



Roles:

\- employee

\- hr



Account status:

\- active

\- inactive



Passwords are stored as bcrypt hashes rather than plain text.



\---



\### 2. Attendances



Purpose:

Stores employee daily attendance records.



Main fields:

\- employee

\- date

\- checkIn

\- checkOut

\- workingMinutes

\- status

\- remarks

\- createdAt

\- updatedAt



Attendance status values:

\- present

\- late

\- half\_day

\- absent

\- leave

\- working



A unique compound index on employee and date ensures that an employee can have only one attendance record per day.



\---



\### 3. Leaves



Purpose:

Stores employee leave applications and HR decisions.



Main fields:

\- employee

\- leaveType

\- startDate

\- endDate

\- totalDays

\- reason

\- status

\- approvedBy

\- approvedAt

\- rejectionReason

\- createdAt

\- updatedAt



Leave types:

\- casual

\- sick

\- earned

\- unpaid



Leave statuses:

\- pending

\- approved

\- rejected

\- cancelled



\---



\### 4. LeaveBalances



Purpose:

Stores the yearly leave balance of each employee.



Main fields:

\- employee

\- year

\- casual

\- sick

\- earned

\- unpaid

\- createdAt

\- updatedAt



Default annual balances:

\- Casual Leave: 12 days

\- Sick Leave: 10 days

\- Earned Leave: 15 days

\- Unpaid Leave: 0 days



A unique compound index on employee and year ensures one leave-balance record per employee per year.



\---



\### 5. Payrolls



Purpose:

Stores monthly employee payroll information.



Main fields:

\- employee

\- month

\- year

\- basicSalary

\- allowances

\- deductions

\- netSalary

\- status

\- processedAt

\- paidAt

\- remarks

\- createdAt

\- updatedAt



Payroll statuses:

\- pending

\- processed

\- paid



A unique compound index on employee, month and year ensures one payroll record per employee for each month.



\## Relationships



User is the central entity.



User

&#x20;|

&#x20;+---- Attendance

&#x20;|

&#x20;+---- Leave

&#x20;|

&#x20;+---- LeaveBalance

&#x20;|

&#x20;+---- Payroll



Attendance.employee -> User.\_id



Leave.employee -> User.\_id



Leave.approvedBy -> User.\_id



LeaveBalance.employee -> User.\_id



Payroll.employee -> User.\_id



\## Database Initialization



The application uses Mongoose models to create and manage collections automatically.



No manual SQL script is required.



After configuring MongoDB and starting the backend, the application connects to the configured database and creates collections as required when records are inserted.



\## Database Backup



For production use, regular MongoDB backups should be configured.



For local development, the database can be managed through MongoDB Atlas or a local MongoDB installation.



\## Security



Database credentials must be stored in the backend `.env` file.



The `.env` file must not be committed to the repository.



Use `.env.example` as the configuration template.

