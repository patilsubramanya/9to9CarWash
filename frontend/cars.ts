// data/cars.ts

export const CAR_DATA: Record<string, string[]> = {
  "Maruti Suzuki": [
    "Alto 800",
    "Alto K10",
    "A-Star",
    "WagonR",
    "Celerio",
    "Swift",
    "Dzire",
    "Baleno",
    "Ignis",
    "Ciaz",
    "Brezza",
    "Ertiga",
    "XL6",
    "S-Presso",
    "Eeco",
    "Vitara",
    "Grand Vitara",
    "Invicto",
    "e Vitara",
    "Omni",
    "Eeco",
    "Fronx",
    "Jimny",
    "Super Carry"
  ],

  Hyundai: [
    "Santro",
    "Grand i10 Nios",
    "i20",
    "i20 N Line",
    "Aura",
    "Verna",
    "Creta",
    "Venue",
    "Alcazar",
    "Tucson",
    "Exter",
    "Kona Electric"
  ],

  Tata: [
    "Nano",
    "Tiago",
    "Tigor",
    "Altroz",
    "Punch",
    "Nexon",
    "Harrier",
    "Safari",
    "Nexon EV",
    "Tiago EV",
    "Tigor EV"
  ],
  Honda: [
    "Amaze",
    "City 4th Gen",
    "City 5th Gen",
    "Jazz",
    "WR-V",
    "Elevate"
  ],
  Mahindra: [
    "Bolero",
    "Bolero Neo",
    "Scorpio Classic",
    "Scorpio N",
    "XUV300",
    "XUV700",
    "Thar",
    "Marazzo",
    "KUV100",
    "XUV400 EV"
  ],
  Toyota: [
    "Glanza",
    "Urban Cruiser",
    "Hycross",
    "Innova Crysta",
    "Fortuner",
    "Legender",
    "Camry",
    "Vellfire",
    "Rumion"
  ],
  Kia: [
    "Sonet",
    "Seltos",
    "Carens",
    "Carnival",
    "EV6"
  ],
  Renault: [
    "Kwid",
    "Triber",
    "Kiger"
  ],
  Nissan: [
    "Magnite",
    "Kicks"
  ],
  Volkswagen: [
    "Polo",
    "Vento",
    "Virtus",
    "Taigun",
    "Tiguan"
  ],
  Skoda: [
    "Slavia",
    "Kushaq",
    "Octavia",
    "Superb",
    "Kodiaq"
  ],
  MG: [
    "Hector",
    "Hector Plus",
    "Astor",
    "Gloster",
    "ZS EV",
    "Comet EV"
  ],
  Ford: [
    "Figo",
    "Aspire",
    "EcoSport",
    "Endeavour",
    "Freestyle"
  ],

  "Mercedes Benz": [
    "A Class",
    "C Class",
    "E Class",
    "S Class",
    "GLA",
    "GLC",
    "GLE",
    "GLS"
  ],
  BMW: [
    "2 Series",
    "3 Series",
    "5 Series",
    "7 Series",
    "X1",
    "X3",
    "X5"
  ],

  Audi: [
    "A3",
    "A4",
    "A6",
    "Q3",
    "Q5",
    "Q7"
  ]
};

export const BRANDS: string[] = Object.keys(CAR_DATA);

export const getModels = (brand: string): string[] => {
  return CAR_DATA[brand] || [];
};
