const studentPortrait = (file) => `/community/core-team/students/${file}`;
const professorPortrait = (file) => `/community/core-team/professors/${file}`;

const team2025 = [
  { name: "Viraj Nagariya", role: "Community Head", detail: "PhD Scholar - Centre for Sustainable Polymers", image: studentPortrait("viraj-nagariya.jpeg") },
  { name: "Krunal Khadayata", role: "Core team", detail: "M.Tech 2nd Year - Chemical Engineering", image: studentPortrait("krunal-khadayata.jpeg") },
  { name: "Dhruv Pansuriya", role: "Core team", detail: "B.Tech 3rd Year - Computer Science & Engineering", image: studentPortrait("dhruv-pansuriya.jpeg") },
  { name: "Jinay Mehta", role: "Core team", detail: "B.Tech 3rd Year - Chemistry", image: studentPortrait("jinay-mehta.jpg") },
  { name: "Keval Juthani", role: "Core team", detail: "M.Tech 1st Year - Computer Science & Engineering", image: studentPortrait("keval-juthani.jpeg") },
  { name: "Harshit Mehta", role: "Core team", detail: "M.Tech 1st Year - Computer Science & Engineering", image: studentPortrait("harshit-mehta.jpeg") },
  { name: "Het Patel", role: "Core team", detail: "B.Tech 3rd Year - Chemical Engineering", image: studentPortrait("het-patel.jpeg") },
];

const professors = [
  { name: "Prof. Uday S. Dixit", detail: "Department of Mechanical Engineering", image: professorPortrait("uday-s-dixit.jpg") },
  { name: "Prof. Prakash Kotecha", detail: "Department of Chemical Engineering", image: professorPortrait("prakash-kotecha.jpg") },
  { name: "Prof. Parameswar K. Iyer", detail: "Department of Chemistry and Centre for Nanotechnology", image: professorPortrait("parameswar-k-iyer.jpg") },
  { name: "Prof. Rajkumar P. Thummer", detail: "Department of Biosciences and Bioengineering", image: professorPortrait("rajkumar-p-thummer.jpg") },
  { name: "Prof. Tapan K. Mankodi", detail: "Department of Mechanical Engineering", image: professorPortrait("tapan-k-mankodi.jpg") },
  { name: "Prof. Keyur Sorathia", detail: "Department of Design", image: professorPortrait("keyur-sorathia.jpg") },
  { name: "Dr. Srinivasan Krishnaswamy", detail: "Department of Electronics and Electrical Engineering", image: professorPortrait("srinivasan-krishnaswamy.jpg") },
];

export const coreTeamByYear = {
  "2025": {
    label: "2025-26",
    students: team2025,
    professors,
  },
  "2026": {
    label: "2026-27",
    students: [
      team2025[0],
      { ...team2025[2], detail: "B.Tech 4th Year - Computer Science & Engineering" },
      { name: "Darshan Agrawal", role: "Core team", detail: "M.Tech 2nd Year - Mechanical Engineering", image: studentPortrait("darshan-agrawal.jpg") },
      { ...team2025[4], detail: "M.Tech 2nd Year - Computer Science & Engineering" },
      { ...team2025[5], detail: "M.Tech 2nd Year - Computer Science & Engineering" },
      { ...team2025[3], detail: "B.Tech 4th Year - Chemistry" },
      { ...team2025[6], detail: "B.Tech 4th Year - Chemical Engineering" },
      { name: "Aditya Bhawsar", role: "Core team", detail: "B.Tech 4th Year - Computer Science & Engineering", image: studentPortrait("aditya-bhawsar.png") },
      { name: "Ved Patel", role: "Core team", detail: "M.Tech 2nd Year", image: studentPortrait("ved-patel.jpeg") },
    ],
    professors,
  },
};
