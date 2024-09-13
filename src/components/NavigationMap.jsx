import React, { useState } from 'react';
import Map from './Map';
import BuildingList from './BuildingList';

const NavigationMap = ({ filterBuildings, buildings }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
  };


  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow quichNav">
        <h3 className='homepageQuickNav'>Quick Navigation</h3>
        <BuildingList buildings={filterBuildings} handleBuildingClick={handleBuildingClick} />
      </div>
      <div className="flex-grow">
        <Map buildings={buildings} selectedBuilding={selectedBuilding} />
      </div>
    </div>
  );
};

export default NavigationMap;
