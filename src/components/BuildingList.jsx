import React from 'react';

const BuildingList = ({ buildings, handleBuildingClick }) => {
  return (
    <ul className='quichNav mb-5'>
      {buildings.map((building) => (
        <li key={building.id} className='hover:cursor-pointer p-2 bg-white my-1 rounded-md'>
          <button onClick={() => handleBuildingClick(building)}> 
            {building.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default BuildingList;
