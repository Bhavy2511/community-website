export const CHANDA_HOSTELS = ["Brahmaputra", "Dhansiri", "Dihing", "Dikhow", "Disang", "Gaurang", "Kameng", "Kapili", "Manas", "Siang", "Umiam", "Barak", "Lohit", "Subansiri", "Married Scholars' Hostel", "Faculty Quarters", "Day scholar / local residence", "Other residence"];
export const CHANDA_BRANCHES = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electronics and Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biosciences & Bioengineering",
  "Design",
  "Humanities & Social Sciences",
  "Mathematics",
  "School of Energy Sciences and Engineering",
  "Agro and Rural Technology",
  "Health Sciences and Technology",
  "Centre for Sustainable Polymers",
  "Centre for Disaster Management and Research",
  "School of Data Science and Artificial Intelligence",
  "CICPS",
  "Other",
];

export const CHANDA_DEGREES = ["B.Tech", "B.Des", "M.Tech", "M.Des", "M.Sc", "M.A", "MBA", "PhD", "Other"];
export const CHANDA_YEARS_OF_STUDY = ["2027", "2028", "2029", "2030", "2031"];

export const isChandaFullName = (value) => /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(value);
export const isIitgEmail = (value) => /^[^\s@]+@iitg\.ac\.in$/i.test(value);
export const isIndianPhone = (value) => /^\d{10}$/.test(value);
export const iitgEmailFromUsername = (value) => {
  const email = String(value || "").trim().toLowerCase();
  return email && !email.includes("@") ? `${email}@iitg.ac.in` : email;
};
