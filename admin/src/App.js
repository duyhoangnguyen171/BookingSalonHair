import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AdminPanel from "./component/common/AdminPanel";
import PrivateRoute from "./component/common/PrivateRoute";

import Contact from "./modules/contacts/Contact";
import Appointment  from "./modules/appointments/Appointment";
import LoginForm from "./modules/auth/LoginForm";
import Service from "./modules/services/Service";
import Users from "./modules/users/Users";
import WorkShift from "./modules/workshifts/WorkShift";

import UserAdd from './modules/users/UserAdd';
import UserEdit from './modules/users/UserEdit';
import UserView from './modules/users/UserView';

import AppointmentAdd from "./modules/appointments/AppointmentAdd";
import AppointmentEdit from "./modules/appointments/AppointmentEdit";
import AppointmentDetail from "./modules/appointments/AppointmentDetail";
import AppointmentCanceled from "./modules/appointments/AppointmentCanceled";

import ServiceAdd from "./modules/services/ServiceAdd";
import ServiceEdit from "./modules/services/ServiceEdit";

import WorkshiftCreate from "./modules/workshifts/WorkShiftCreate";
import WorkShiftEdit from "./modules/workshifts/WorkShiftEdit";
import RegisterShift from "./modules/workshifts/RegisterShift";
import WorkShiftDetail from "./modules/workshifts/WorkShiftDetail";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm />} />

        {/* Admin route protected */}
        <Route element={<PrivateRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminPanel />}>
            <Route path="users" element={<Users />} />
            <Route path="appointments" element={<Appointment />} />
            <Route path="services" element={<Service />} />
            <Route path="contact" element={<Contact />} />
            <Route path="workshifts" element={<WorkShift />} />
            <Route path="users/add" element={<UserAdd />} />
            <Route path="users/edit" element={<UserEdit />} />
            <Route path="users/view" element={<UserView />} />

            <Route path="appointments/add" element={<AppointmentAdd />} />
            <Route path="appointments/edit" element={<AppointmentEdit />} />
            <Route path="appointments/detail/:id" element={<AppointmentDetail />} />
            <Route path="appointments/canceled" element={<AppointmentCanceled />} />
            

            <Route path="services/add" element={<ServiceAdd />} />
            <Route path="services/edit" element={<ServiceEdit />} />

            <Route path="workshifts/create" element={<WorkshiftCreate />} />
            <Route path="workshifts/edit/:id" element={<WorkShiftEdit />} />
            <Route path="workshifts/register" element={<RegisterShift />} />
            <Route path="workshifts/details/view/:shiftId" element={<WorkShiftDetail />} />
          </Route>
        </Route>

        {/* Staff route protected */}
        <Route element={<PrivateRoute allowedRole="staff" />}>
          <Route path="/staff" element={<AdminPanel />}>
            <Route path="users" element={<Users />} />
            <Route path="appointments" element={<Appointment />} />
            <Route path="services" element={<Service />} />
            <Route path="contact" element={<Contact />} />
            <Route path="workshifts" element={<WorkShift />} />
            <Route path="users/add" element={<UserAdd />} />
            <Route path="users/edit" element={<UserEdit />} />
            <Route path="users/view" element={<UserView />} />
            <Route path="appointments/add" element={<AppointmentAdd />} />
            <Route path="appointments/edit" element={<AppointmentEdit />} />
            <Route path="services/add" element={<ServiceAdd />} />
            <Route path="services/edit" element={<ServiceEdit />} />

            <Route path="workshifts/register" element={<RegisterShift />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
