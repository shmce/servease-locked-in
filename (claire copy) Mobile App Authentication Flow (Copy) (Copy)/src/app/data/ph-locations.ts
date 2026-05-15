export const philippineLocations = {
  "Metro Manila": [
    "Caloocan",
    "Las Piñas",
    "Makati",
    "Malabon",
    "Mandaluyong",
    "Manila",
    "Marikina",
    "Muntinlupa",
    "Navotas",
    "Parañaque",
    "Pasay",
    "Pasig",
    "Pateros",
    "Quezon City",
    "San Juan",
    "Taguig",
    "Valenzuela"
  ],
  "Cavite": [
    "Bacoor",
    "Cavite City",
    "Dasmariñas",
    "Imus",
    "Tagaytay",
    "Trece Martires"
  ],
  "Laguna": [
    "Biñan",
    "Cabuyao",
    "Calamba",
    "San Pablo",
    "Santa Rosa"
  ],
  "Rizal": [
    "Angono",
    "Antipolo",
    "Binangonan",
    "Cainta",
    "Rodriguez",
    "San Mateo",
    "Taytay"
  ],
  "Bulacan": [
    "Balagtas",
    "Baliuag",
    "Bulakan",
    "Guiguinto",
    "Hagonoy",
    "Malolos",
    "Meycauayan",
    "Obando",
    "San Jose del Monte",
    "San Miguel",
    "Santa Maria"
  ],
  "Pampanga": [
    "Angeles City",
    "Mabalacat",
    "San Fernando"
  ],
  "Batangas": [
    "Batangas City",
    "Lipa",
    "Tanauan"
  ],
  "Cebu": [
    "Cebu City",
    "Lapu-Lapu",
    "Mandaue",
    "Talisay"
  ],
  "Davao del Sur": [
    "Davao City",
    "Digos"
  ]
};

export const getAllProvinces = () => Object.keys(philippineLocations);

export const getCitiesByProvince = (province: string) => {
  return philippineLocations[province as keyof typeof philippineLocations] || [];
};
