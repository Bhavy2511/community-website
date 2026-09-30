const garbaImage = (number) => `/community/garba-raas-2025/garbaraas-2025-${String(number).padStart(2, "0")}.jpg`;
const nutanImage = (number) => `/community/nutan-varsh-2025/nutan-varsh-milan-2025-${String(number).padStart(2, "0")}.jpeg`;
const legacyGarbaImage = (year, number) => `/community/garba-raas-${year}/garba-${year}-${String(number).padStart(2, "0")}.jpeg`;

export const garbaRaas2025Slides = [
  [1, "The circle begins", "Students and friends move together to open the evening."],
  [2, "Rhythm in every step", "Traditional movement, campus energy and a floor open to everyone."],
  [3, "A campus comes together", "Students, faculty, alumni and friends share one celebration."],
  [4, "A night to remember", "The colour and warmth of Navratri, carried far beyond Gujarat."],
  [5, "Dandiya in motion", "Every exchange is an invitation to join the rhythm."],
  [6, "Colour across campus", "Festive attire and shared energy light up the evening."],
  [7, "One open circle", "Newcomers and old friends find their step together."],
  [8, "Celebration, preserved", "Photographs carry the feeling into the next year."],
].map(([number, title, caption]) => ({ image: garbaImage(number), alt: `GarbaRaas 2025 photograph ${number}`, title, caption, year: "2025" }));

export const garbaRaas2025Archive = Array.from({ length: 12 }, (_, index) => ({
  id: `garba-2025-${index + 1}`,
  year: 2025,
  event: "GarbaRaas",
  image: garbaImage(index + 1),
  alt: `GarbaRaas 2025 photograph ${index + 1}`,
}));

const legacyGarbaSlideDetails = {
  2022: [
    ["The first circle", "Students celebrate GarbaRaas 2022 at IIT Guwahati."],
    ["Aarti at the heart", "Students gather for aarti at GarbaRaas 2022.", "center 18%"],
    ["Hands in rhythm", "Students gathered for the first time to celebrate aarti."],
    ["The founding gathering", "A group photo at GarbaRaas 2022."],
    ["Between the portraits", "Students pose for a group photo."],
    ["Friends in festival colour", "Students at GarbaRaas 2022."],
    ["Everyone in one frame", "GarbaRaas 2022 group photo."],
    ["Joy at the backdrop", "Friends pose at the GarbaRaas backdrop.", "center 27%"],
    ["The first community portrait", "Students pose together at GarbaRaas 2022."],
    ["The people who began it", "Students pose together at GarbaRaas 2022."],
    ["Aarti together", "Students take part in aarti at GarbaRaas 2022."],
  ],
  2023: [
    ["The team behind the evening", "A wide group portrait beneath the colourful canopy at the Swimming Pool Arena, where the 2023 celebration opened into the open air."],
    ["GarbaRaas 2023 poster", "The official 2023 invitation, announcing workshops at New SAC and the main Garba, Dandiya, aarti and prasad evenings at the Swimming Pool Parking Arena."],
    ["A circle of organisers", "Volunteers and organisers gather on the dance floor in bright traditional dress after helping bring the 2023 edition to life."],
    ["Lights over the arena", "Fabric ribbons, stage lighting and sound equipment transform the open-air venue into a festive night-time setting."],
    ["Ready for the raas", "Friends pose together in kurtas and event lanyards before joining the larger celebration at the arena."],
    ["The dance floor fills", "Students raise their hands and move together under the lights as the 2023 GarbaRaas reaches its liveliest moment."],
    ["Colour in every direction", "A mirrored disco ball and coloured lights reflect across the tent canopy, carrying the energy of the dance floor overhead."],
    ["Aarti before the raas", "The decorated aarti space, with diyas, flowers and a framed deity, holds the ritual centre of the celebration."],
  ],
  2024: [
    ["A room full of community", "Students gather for a relaxed group portrait inside the New SAC second-floor venue after rain moved the celebration indoors."],
    ["One loud, joyful frame", "Hands in the air and colourful traditional outfits capture the shared excitement of the 2024 GarbaRaas community."],
    ["Raas at New SAC", "The indoor dance floor glows pink as students step, clap and move together through the evening."],
    ["The rhythm continues", "A wide view of the packed New SAC hall shows that rain could change the venue, but not the celebration."],
    ["Practice becomes family", "A rehearsal group gathers before the event, showing the friendships and preparation behind the main nights."],
    ["GarbaRaas 2024 poster", "The official 2024 poster set out the workshop, aarti, prasad, Garba and Dandiya programme for the community."],
  ],
};

const legacyGarbaSlides = (year, count) => Array.from({ length: count }, (_, index) => {
  const [title, caption, imagePosition] = legacyGarbaSlideDetails[year]?.[index] || [`GarbaRaas ${year}`, `A moment from GarbaRaas ${year} at IIT Guwahati.`];
  return {
  image: legacyGarbaImage(year, index + 1),
  alt: `GarbaRaas ${year} photograph ${index + 1}`,
  title,
  caption,
  imagePosition,
  year: String(year),
  };
});

export const garbaRaas2022Slides = legacyGarbaSlides(2022, 11);
export const garbaRaas2023Slides = legacyGarbaSlides(2023, 8);
export const garbaRaas2024Slides = legacyGarbaSlides(2024, 6);
export const garbaRaas2022Archive = garbaRaas2022Slides.map((item, index) => ({ ...item, id: `garba-2022-${index + 1}`, event: "GarbaRaas" }));
export const garbaRaas2023Archive = garbaRaas2023Slides.map((item, index) => ({ ...item, id: `garba-2023-${index + 1}`, event: "GarbaRaas" }));
export const garbaRaas2024Archive = garbaRaas2024Slides.map((item, index) => ({ ...item, id: `garba-2024-${index + 1}`, event: "GarbaRaas" }));

export const garbaRaasWorkshopArchive = [
  { id: "workshop-1", image: "/community/garba-raas-2025/workshop/workshop-poster.jpg", alt: "GarbaRaas 2025 workshop poster" },
  { id: "workshop-2", image: "/community/garba-raas-2025/workshop/workshop3.jpg", alt: "GarbaRaas 2025 workshop" },
  { id: "workshop-3", image: "/community/garba-raas-2025/workshop/garbaraas-workshop-2025-01.jpg", alt: "GarbaRaas 2025 workshop moment" },
].map((item) => ({ ...item, year: 2025, event: "GarbaRaas workshop" }));

export const nutanVarsh2025Archive = Array.from({ length: 25 }, (_, index) => ({
  id: `nutan-2025-${index + 1}`,
  year: 2025,
  event: "Nutan Varsh Milan",
  image: nutanImage(index + 1),
  alt: `Nutan Varsh Milan 2025 photograph ${index + 1}`,
}));

export const nutanVarsh2025Poster = {
  id: "nutan-2025-poster",
  year: 2025,
  event: "Nutan Varsh Milan",
  image: "/community/nutan-varsh-2025/poster-first-time-iitg.jpg",
  alt: "Nutan Varsh Milan 2025, first time at IIT Guwahati poster",
  title: "First time at IITG",
  caption: "The official poster for the first Nutan Varsh Milan at IIT Guwahati.",
};

export const nutanVarsh2025Slides = [nutanVarsh2025Poster, ...nutanVarsh2025Archive.slice(0, 7)].map((item, index) => ({
  ...item,
  title: item.title || ["A warm beginning", "Around one table", "Familiar flavours", "Blessings together", "New introductions", "The shared table", "A growing family", "Memories carried forward"][index],
  caption: item.caption || "The 2025 gathering brings Gujarati New Year warmth to the IITG community.",
}));

export const farewell2025Slides = ["farewell-2025-01.jpg", "farewell-2025-02.jpg", "farewell-2025-03.jpg", "farewell-2025-04.jpg"].map((file, index) => ({
  image: `/community/farewell-2025/${file}`,
  alt: `Gujarati Community IITG Farewell 2025 photograph ${index + 1}`,
  title: ["A fond farewell", "Together to the end", "Memories we carry", "The next chapter"][index],
  caption: "A 2025 send-off for the people who made the community what it is.",
  year: "2025",
}));
