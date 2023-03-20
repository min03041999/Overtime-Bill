import React from "react";
import { Route, Switch } from "react-router-dom";
import Overtime from "../component/Overtime";

const Routes = () => {
  return (
    <Switch>
      <Route path="" component={Overtime} exact />
    </Switch>
  );
};

export default Routes;
