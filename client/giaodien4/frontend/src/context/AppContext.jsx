import { createContext } from "react";
import { doctors, specialityData } from "../assets/assets";
import { services, reviews, staffs, appointments } from "../assets/data/db";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currencySymbol = "vnđ";
  const value = {
    doctors,
    specialityData,
    currencySymbol,
    services,
    reviews,
    staffs,
    appointments,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
