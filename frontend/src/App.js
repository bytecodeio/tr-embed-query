import React from "react";
import "./App.css";

import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { DynamicExplore } from "./layouts/DynamicExplore";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path={'/'} element={<DynamicExplore />}/>
    </Routes>
  </BrowserRouter>
);
