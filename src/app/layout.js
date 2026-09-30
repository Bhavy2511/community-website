import "./globals.css";
import "./compact-directory.css";
import { Analytics } from "@vercel/analytics/next";
import CurtainTransition from "../components/CurtainTransition";
export const metadata={
  title:"Gujarati Community IITG",
  description:"Culture, community and connection for Gujaratis at IIT Guwahati.",
  // Use the same approved Gujarat, lion and IITG building mark as the site header.
  icons:{icon:[{url:"/icon.svg?v=3",type:"image/svg+xml"}]},
};
export default function RootLayout({children}){return <html lang="en"><body><CurtainTransition />{children}<Analytics /></body></html>;}
