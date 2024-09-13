import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Search from "../components/Search";
import NavigationMap from "../components/NavigationMap";

const Home = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search).get("search") || "";
  const [quickNavData, setQuickNavData] = useState([]);
  const [allBuildingsData, setAllBuildingsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quickNavRes, allBuildingsRes] = await Promise.all([
          fetch("http://localhost:5173/data/quick-navigation.json"),
          fetch("http://localhost:5173/data/buildings.json"),
        ]);

        if (!quickNavRes.ok || !allBuildingsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const quickNavResult = await quickNavRes.json();
        const allBuildingsResult = await allBuildingsRes.json();

        setQuickNavData(quickNavResult);
        setAllBuildingsData(allBuildingsResult);

        if (params) {
          setFilteredData(
            allBuildingsResult.filter((building) =>
              building.name.toLowerCase().includes(params.toLowerCase())
            )
          );
        } else {
          // Use quickNavResult here to set the first seven buildings
          setFilteredData(quickNavResult);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [params]);

  return (
    <>
      <header className="header py-5">Summit Navigation App</header>
      <main className="flex min-h-screen flex-col items-center w-full justify-between p-8 hompageContent homepageDashboard">
        <div className="text-3xl">Where would you like to go?</div>
        <div className="w-full">
          <Search />
          <NavigationMap
            filterBuildings={filteredData}
            buildings={allBuildingsData}
          />
        </div>
      </main>
    </>
  );
};

export default Home;
