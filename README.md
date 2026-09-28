# Clinic Appointment System

SE2020 Web and Mobile Technologies group assignment.
React Native (Expo) + Node.js/Express + MongoDB, backend hosted online.

Patients book doctor appointments, doctors open time slots and write prescriptions,
and an admin approves everything.

**New to the project? Start with [SETUP.md](../SETUP.md)** — a step by step guide
from installing Node to running the app on your phone, including the errors you
are likely to hit.

## Folder layout

```
clinic-app/
  backend/    Node.js + Express + MongoDB REST API
  mobile/     React Native (Expo) app
```

## 1. Run the backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in your own values
npm run seed              # creates demo accounts and sample data
npm run dev               # or: npm start
```

`.env` values:

| Variable | Meaning |
| --- | --- |
| PORT | 5000 |
| MONGO_URI | Your MongoDB Atlas connection string |
| JWT_SECRET | Any long random string |
| JWT_EXPIRE | 7d |
| BASE_URL | Public URL of the API, used to build upload links |

Demo accounts created by `npm run seed`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@clinic.com | admin123 |
| Doctor | doctor@clinic.com | doctor123 |
| Patient | patient@clinic.com | patient123 |

## 2. Run the mobile app

```bash
cd mobile
npm install
npx expo install --fix    # aligns package versions with your Expo SDK
npx expo start
```

Set the API address in `mobile/src/config.js`:

- Testing on a real phone: `http://<your-computer-LAN-IP>:5000/api` (not `localhost`)
- Final demo: the hosted Render URL

## 3. Who owns what (6 members)

Authentication is built by the whole group. Each member then owns one module
end to end: model, route, controller, validation, mobile screens, testing.

| Member | Module | Backend files | Mobile screens |
| --- | --- | --- | --- |
| Group | Authentication | `controllers/authController.js`, `middleware/authMiddleware.js`, `middleware/roleMiddleware.js` | `screens/auth/` |
| M1 | Doctor management (main entity CRUD) | `controllers/doctorController.js`, `models/Doctor.js` | `patient/DoctorListScreen`, `patient/DoctorDetailScreen`, `admin/ManageDoctorsScreen`, `admin/DoctorFormScreen` |
| M2 | Specializations + time slots | `controllers/specializationController.js`, `controllers/scheduleController.js` | `admin/ManageSpecializationsScreen`, `doctor/MySlotsScreen` |
| M3 | Appointment booking (patient) | `controllers/appointmentController.js` (booking half) | `patient/BookAppointmentScreen`, `patient/MyAppointmentsScreen` |
| M4 | Approval + user management | `controllers/appointmentController.js` (status half), `controllers/userController.js`, `controllers/dashboardController.js` | `doctor/DoctorAppointmentsScreen`, `admin/ManageAppointmentsScreen`, `admin/ManageUsersScreen`, `admin/DashboardScreen` |
| M5 | Prescriptions + notifications | `controllers/prescriptionController.js`, `controllers/notificationController.js`, `utils/notify.js` | `doctor/WritePrescriptionScreen`, `shared/PrescriptionsScreen`, `shared/NotificationsScreen` |
| M6 | Upload service + deployment | `controllers/uploadController.js`, `middleware/uploadMiddleware.js`, `middleware/errorMiddleware.js`, `config/db.js` | `components/ImageUploadField`, `shared/ProfileScreen` |

## 4. API endpoints

Base URL: `<host>/api`

| Method | Endpoint | Access | Owner |
| --- | --- | --- | --- |
| POST | /auth/register | Public | Group |
| POST | /auth/login | Public | Group |
| GET | /auth/me | Logged in | Group |
| PUT | /auth/me | Logged in | Group |
| GET | /doctors | Logged in | M1 |
| GET | /doctors/:id | Logged in | M1 |
| POST | /doctors | Admin | M1 |
| PUT | /doctors/:id | Admin | M1 |
| DELETE | /doctors/:id | Admin | M1 |
| GET | /specializations | Logged in | M2 |
| POST | /specializations | Admin | M2 |
| PUT | /specializations/:id | Admin | M2 |
| DELETE | /specializations/:id | Admin | M2 |
| GET | /schedules | Logged in | M2 |
| POST | /schedules | Doctor, admin | M2 |
| PUT | /schedules/:id | Doctor, admin | M2 |
| DELETE | /schedules/:id | Doctor, admin | M2 |
| POST | /appointments | Patient | M3 |
| GET | /appointments/my | Patient | M3 |
| GET | /appointments/:id | Owner, doctor, admin | M3 |
| PUT | /appointments/:id/cancel | Patient | M3 |
| GET | /appointments | Doctor, admin | M4 |
| PUT | /appointments/:id/status | Doctor, admin | M4 |
| GET | /users | Admin | M4 |
| PUT | /users/:id/block | Admin | M4 |
| GET | /dashboard/stats | Admin | M4 |
| POST | /prescriptions | Doctor | M5 |
| GET | /prescriptions/my | Patient, doctor | M5 |
| GET | /prescriptions/:id | Owner, doctor, admin | M5 |
| GET | /notifications | Logged in | M5 |
| PUT | /notifications/:id/read | Owner | M5 |
| POST | /upload | Logged in | M6 |

Every response has the same shape:

```json
{ "success": true, "message": "Appointment created", "data": {} }
```

Status codes: 200 OK, 201 created, 400 bad input, 401 no/bad token,
403 wrong role, 404 not found, 500 server error.

## 5. Deploy the backend (Render)

1. Push this repo to GitHub.
2. MongoDB Atlas: create a cluster, add a database user, allow network access
   from anywhere (0.0.0.0/0) so Render can connect.
3. Render: New Web Service from the repo, root directory `backend`,
   build command `npm install`, start command `node server.js`.
4. Add every `.env` variable in the Render dashboard, and set `BASE_URL`
   to the Render URL.
5. Open the Render URL - it should answer `API is running`.
6. Test the endpoints with Postman against the live URL.
7. Put the Render URL into `mobile/src/config.js`.
8. The free tier sleeps when idle, so open the API once before the demo starts.

Note: uploaded files are stored on the server disk. Render's free disk is
temporary, so uploads disappear on redeploy. That is fine for the demo. For
permanent storage, swap `uploadMiddleware.js` to Cloudinary.

## 7. Automated test

`backend/tests/e2e.js` runs the whole flow against a temporary in-memory
MongoDB: registration, hashing, role protection, slot clashes, booking,
double-booking, approval, prescriptions, notifications, cancelling and
blocking. 40 checks, no Atlas connection needed.

```bash
cd backend
npm install --no-save mongodb-memory-server   # one time, downloads a test MongoDB
npm test
```

It is kept out of `dependencies` so a normal `npm install` stays small.

## 6. Business rules built in

- A slot can only be booked once, and is freed again if the appointment is cancelled or rejected.
- Two slots of the same doctor cannot overlap.
- Slots and bookings in the past are refused.
- Only a confirmed appointment can be marked completed.
- A prescription can only be written for a completed appointment, and only once.
- A specialization still used by a doctor cannot be deleted.
- A blocked user cannot log in or use the API.
