import "@styles/index.scss";
import "antd/dist/antd.less";

import { useContext, useEffect } from "react";

import { GlobalRouter } from "@routes/index";
import { MultiCloudContext } from "./Context/MultiCloutContext";
import { useAuth } from "./Hooks/useAuth";

function App() {
  const { user, refreshProfile } = useAuth();
  const { fetchMultiCloud } = useContext(MultiCloudContext);

  useEffect(() => {
    if (user && user.role) {
      fetchMultiCloud();
      refreshProfile();
    }
  }, [user]);

  return <GlobalRouter />;
}

export default App;
