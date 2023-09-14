import React from "react";
import { deviceDetect } from "react-device-detect";

function Footer()
{
  return (
    <footer className="border-top text-center small text-muted py-3">
      <p className="m-0">
        Copyright &copy; 2023{" "} Task Management System. All rights reserved.
      </p>
      <p>Browser Type: {deviceDetect(navigator.userAgent).browserName + " " + deviceDetect(navigator.userAgent).browserFullVersion}</p>
    </footer>
  );
}

export default Footer;
