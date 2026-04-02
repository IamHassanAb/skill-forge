import React from 'react';
import TopBar from '../shared/TopBar';

const SessionLayout = ({ stageTitle, sessionLabel, children }) => {
  return (
    <div className="ml-[210px] min-h-screen bg-[#110D0B] flex flex-col">
      <TopBar stageTitle={stageTitle} sessionLabel={sessionLabel} />
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SessionLayout;
