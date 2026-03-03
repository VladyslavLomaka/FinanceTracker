import React from 'react';
import {AssetsProvider} from './src/context/AssetsContext';
import RootNavigator from './src/navigation/RootNavigator';

const App: React.FC = () => {
  return (
    <AssetsProvider>
      <RootNavigator />
    </AssetsProvider>
  );
};

export default App;
