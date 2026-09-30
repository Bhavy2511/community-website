"use client";

import { useState } from "react";
import MentorshipForm from "./MentorshipForm";

const panels = {
  mentee: { eyebrow: "FOR STUDENTS", title: "Find a mentor", copy: "Ask for a conversation around the next step—not a perfect answer." },
  mentor: { eyebrow: "FOR ALUMNI, SENIORS & FACULTY", title: "Become a mentor", copy: "Offer a little time, a story from your own path, or a practical answer someone else is searching for." },
};

export default function MentorshipSwitcher() {
  const [role, setRole] = useState("mentee");
  const panel = panels[role];
  return <section className="mentorship-switcher"><div className="mentorship-switcher-tabs" role="tablist" aria-label="Choose mentorship path"><button type="button" role="tab" aria-selected={role === "mentee"} className={role === "mentee" ? "active" : ""} onClick={() => setRole("mentee")}>I’m looking for a mentor</button><button type="button" role="tab" aria-selected={role === "mentor"} className={role === "mentor" ? "active" : ""} onClick={() => setRole("mentor")}>I’d like to mentor</button></div><div className="mentorship-switcher-panel"><p className="eyebrow">{panel.eyebrow}</p><h3>{panel.title}</h3><p>{panel.copy}</p><MentorshipForm role={role} /></div></section>;
}
