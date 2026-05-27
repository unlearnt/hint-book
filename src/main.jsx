import React from "react";
import { createRoot } from "react-dom/client";
import HintBookApp from "./HintBook.jsx";
import PasswordGate from "./PasswordGate.jsx";

createRoot(document.getElementById("root")).render(
  <PasswordGate>
    <HintBookApp />
  </PasswordGate>
);
