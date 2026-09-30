const placeholderMembers = (year, count = 8) => Array.from({ length: count }, (_, index) => ({
  name: `Core team member ${String(index + 1).padStart(2, "0")}`,
  role: `GarbaRaas ${year} core team`,
  image: "",
}));

const student = (name, degree, department, graduationYear, image = "") => ({
  name,
  role: `${degree} · ${department}`,
  detail: `Graduating ${graduationYear}`,
  image,
});

const foundingTeam = [
  { name: "Ujjawal Chhajer", role: "B.Tech · Electronics and Electrical Engineering", detail: "Graduated 2025", image: "/community/garbaraas-core-team/2022/ujjawal-chhajer.png" },
  { name: "Dhwani Doshi", role: "B.Des · Design", detail: "Graduated 2025", image: "/community/garbaraas-core-team/2022/dhwani-doshi.jpeg" },
  { name: "Yasharth Singh", role: "B.Tech · Mechanical Engineering", detail: "Graduated 2025", image: "/community/garbaraas-core-team/2022/yasharth-singh.png" },
  { name: "Utkarsh Singh", role: "B.Tech · Mechanical Engineering", detail: "Graduated 2025", image: "/community/garbaraas-core-team/2022/utkarsh-singh.jpeg" },
  { name: "Tanmay Totla", role: "Founding core team", image: "/community/garbaraas-core-team/2022/tanmay-totla.png" },
  { name: "Sakshi Sakhare", role: "B.Tech · Mechanical Engineering", detail: "Graduated 2025", image: "/community/garbaraas-core-team/2022/sakshi-sakhare.jpeg" },
  { name: "Sohil Monpara", role: "B.Tech · Mechanical Engineering", detail: "Graduated 2025", image: "/community/garbaraas-core-team/2022/sohil-monpara.png" },
];

export const garbaRaasCoreTeams = {
  2022: foundingTeam,
  2023: foundingTeam,
  2024: [
    student("Sitesh Kumar Goyal", "B.Tech", "Civil Engineering", 2026, "/community/garbaraas-core-team/2024/sitesh-kumar-goyal.png"),
    student("Karan Shah", "B.Des", "Design", 2026, "/community/garbaraas-core-team/2024/karan-shah.jpeg"),
    student("Krishna S Patel", "B.Tech", "Mechanical Engineering", 2026, "/community/garbaraas-core-team/2024/krishna-s-patel.jpg"),
    student("Dishant Kumar", "B.Tech", "Mathematics", 2026, "/community/garbaraas-core-team/2024/dishant-kumar.png"),
    student("Shubhang Shirolawala", "B.Tech", "Electronics and Electrical Engineering", 2026, "/community/garbaraas-core-team/2024/shubhang-shirolawala.png"),
    student("Dhyey Patel", "B.Tech", "Computer Science & Engineering", 2026, "/community/garbaraas-core-team/2024/dhyey-patel.png"),
    student("Sharvil Patel", "B.Tech", "Computer Science & Engineering", 2026, "/community/garbaraas-core-team/2024/sharvil-patel.png"),
    student("Kushal Patel", "B.Tech", "Electronics & Communication Engineering", 2026, "/community/garbaraas-core-team/2024/kushal-patel.png"),
  ],
  2025: [
    student("Surbhit Gang", "B.Tech", "Civil Engineering", 2027, "/community/garbaraas-core-team/2025/surbhit-gang.jpg"),
    student("Dhruv Pansuriya", "B.Tech", "Computer Science & Engineering", 2027, "/community/core-team/students/dhruv-pansuriya.jpeg"),
    student("Jinay Mehta", "B.Tech", "Chemistry", 2027, "/community/garbaraas-core-team/2025/jinay-mehta.png"),
    student("Naman Karwa", "B.Tech", "Mathematics", 2027, "/community/garbaraas-core-team/2025/naman-karwa.png"),
    student("Het Patel", "B.Tech", "Chemical Engineering", 2027, "/community/core-team/students/het-patel.jpeg"),
    student("Aditya Bhawsar", "B.Tech", "Computer Science & Engineering", 2027, "/community/garbaraas-core-team/2025/aditya-bhawsar.png"),
    student("Kashyap Pansuriya", "B.Tech", "Mathematics", 2027, "/community/garbaraas-core-team/2025/kashyap-pansuriya.png"),
    student("Tanisha Patel", "B.Tech", "Mechanical Engineering", 2027, "/community/garbaraas-core-team/2025/tanisha-patel.jpg"),
    student("Aryan Gupta", "B.Tech", "School of Data Science and Artificial Intelligence", 2027, "/community/garbaraas-core-team/2025/aryan-prajapati.png"),
    student("Udayraj Choudhary", "B.Tech", "Computer Science & Engineering", 2027, "/community/garbaraas-core-team/2025/udayraj-choudhary.png"),
    student("Krunalkumar Pravinbhai Khadayata", "M.Tech", "Chemical Engineering", 2026, "/community/core-team/students/krunal-khadayata.jpeg"),
    student("Viraj Bhaveshbhai Nagariya", "PhD", "Centre for Sustainable Polymers", 2028, "/community/core-team/students/viraj-nagariya.jpeg"),
  ],
  2026: placeholderMembers(2026, 10),
};

export const garbaRaasOriginStory = "In 2022, a group of students came together with a vision: to begin a lasting legacy and bring Gujarati culture to IIT Guwahati. The first GarbaRaas was held at Manas Community Hall, IITG. That student-led beginning grew into the celebration that brings students, faculty, alumni and friends into one open circle each year.";

export const garbaRaasCoreTeamNotes = {
  2023: "The founding students continued guiding the celebration in 2023 as GarbaRaas moved into an open-air format at the Swimming Pool Arena, IITG.",
};
