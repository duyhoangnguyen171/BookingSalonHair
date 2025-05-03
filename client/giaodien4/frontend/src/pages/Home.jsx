import React, { useContext } from "react";
import Header from "../components/Header";
import TopServices from "../components/TopServices";
// import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import TopReviews from "../components/TopReviews";
import { AppContext } from "../context/AppContext";
import Staff from "../components/Staff";

const Home = () => {
  const { staffs, reviews } = useContext(AppContext);
  return (
    <div className="">
      <Banner />
      {/* <Header /> */}
      <TopServices />
      <TopReviews reviews={reviews} />
      <Staff staffs={staffs} />
      {/* <TopDoctors /> */}
    </div>
  );
};

export default Home;
