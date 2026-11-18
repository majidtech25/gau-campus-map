/* =========================================================
   GaU CAMPUS MAP DATA
   Traced from the team's campus layout map (full_uni_Layout1).
   Fields, Graduation Square and main roads added from the team's
   GIS map (Nov 2026: buildings, main roads, pathways, school fields),
   aligned to the same coordinates by matching buildings.
   Coordinates are PIXELS on that map at its original size
   (2576 × 1822). x = right, y = down. The page draws only
   walkways (lines) and places (dots): no building outlines.

   - nodes: every point a route can pass through.
       kind "place"    → appears in the dropdowns (needs name + cat)
       kind "junction" → path crossing; "near" names a landmark used
                         in directions ("At the Laboratory, turn left")
       kind "bend"     → just a corner in a path (never announced)
   - edges: walkways, both directions. A third item "road" marks a
       MAIN ROAD on the GIS map (drawn thicker); others are pathways.

   ⚠️ Names come from the map labels. Items marked CHECK need a
   walk-through to confirm before the map goes live.
   ========================================================= */

window.CAMPUS = {
  extent: { x: 330, y: 300, w: 1640, h: 1170 },   // initial / whole-campus view (incl. fields)

  categories: [
    ["gates", "Gates"],
    ["offices", "Offices"],
    ["lecture", "Lecture halls & labs"],
    ["halls", "Halls & hostels"],
    ["facilities", "Facilities"],
    ["worship", "Places of worship"],
    ["fields", "Fields & Graduation Square"]
  ],

  nodes: [
    // ---------- Places ----------
    { id: "gate",       kind: "place", cat: "gates",      name: "Main Gate", x: 452, y: 610 },
    { id: "spass",      kind: "place", cat: "lecture",    name: "SPASS Lecture Halls", x: 577, y: 696 },
    { id: "lh57",       kind: "place", cat: "lecture",    name: "LH5–LH7 & GIS Lab", x: 607, y: 689 },
    { id: "ict",        kind: "place", cat: "offices",    name: "ICT Department", x: 652, y: 682 },
    { id: "dean",       kind: "place", cat: "offices",    name: "Dean of Students Office", x: 690, y: 678 },
    { id: "lh14",       kind: "place", cat: "lecture",    name: "Lecture Halls LH1–LH4", x: 718, y: 676 },
    { id: "taifa",      kind: "place", cat: "halls",      name: "Taifa Hall", x: 752, y: 675 },
    { id: "prefab",     kind: "place", cat: "lecture",    name: "Prefab Lecture Halls", x: 872, y: 432 },
    { id: "ewaso",      kind: "place", cat: "halls",      name: "Ewaso Nyiro Hostel", x: 957, y: 422 },
    { id: "students",   kind: "place", cat: "facilities", name: "Students Centre", x: 995, y: 440 },
    { id: "galana",     kind: "place", cat: "halls",      name: "Galana Hostels", x: 1095, y: 350 },
    { id: "hostels",    kind: "place", cat: "halls",      name: "Hostels (east block)", x: 1200, y: 550 },
    { id: "hostoff",    kind: "place", cat: "offices",    name: "Hostel Offices", x: 995, y: 640 },
    { id: "tana",       kind: "place", cat: "halls",      name: "Tana Hostels", x: 1037, y: 632 },
    { id: "amani",      kind: "place", cat: "halls",      name: "Amani Hall", x: 930, y: 755 },
    { id: "mess",       kind: "place", cat: "facilities", name: "Mess & Cafeteria", x: 790, y: 770 },
    { id: "lt",         kind: "place", cat: "lecture",    name: "Lecture Theatre", x: 705, y: 797 },
    { id: "oldadmin",   kind: "place", cat: "offices",    name: "Administration Block & Old Library", x: 620, y: 808 },
    { id: "newadmin",   kind: "place", cat: "offices",    name: "New Administration Block", x: 556, y: 862 },
    { id: "lab",        kind: "place", cat: "lecture",    name: "Laboratory", x: 790, y: 858 },
    { id: "umoja",      kind: "place", cat: "halls",      name: "Umoja Hall", x: 870, y: 869 },
    { id: "dispensary", kind: "place", cat: "facilities", name: "Dispensary", x: 917, y: 970 },
    { id: "mathoff",    kind: "place", cat: "offices",    name: "Mathematics & SPASS Offices", x: 1020, y: 950 },
    { id: "sbs",        kind: "place", cat: "offices",    name: "SBS Offices", x: 1103, y: 885 },
    { id: "security",   kind: "place", cat: "facilities", name: "Security Office", x: 1110, y: 917 },
    { id: "newlhs",     kind: "place", cat: "lecture",    name: "New Lecture Halls (Safaricom)", x: 1070, y: 805 },
    { id: "schooledu",  kind: "place", cat: "offices",    name: "School of Education & SPASS Offices", x: 825, y: 975 },
    { id: "registrar",  kind: "place", cat: "offices",    name: "Research & Students Registrar", x: 745, y: 1070 },
    { id: "programs",   kind: "place", cat: "offices",    name: "Programs & Audit Offices", x: 735, y: 1000 },
    { id: "newlib",     kind: "place", cat: "facilities", name: "New Library", x: 700, y: 1110 },   // CHECK: no walkway drawn on the map; link assumed
    { id: "dvc",        kind: "place", cat: "offices",    name: "DVCs' Offices", x: 885, y: 1110 },
    { id: "procure",    kind: "place", cat: "offices",    name: "Procurement Office", x: 830, y: 1125 },
    { id: "tvetlh",     kind: "place", cat: "lecture",    name: "TVET Lecture Halls", x: 882, y: 1230 },
    { id: "utvet",      kind: "place", cat: "lecture",    name: "University TVET", x: 845, y: 1235 },
    { id: "police",     kind: "place", cat: "facilities", name: "Police Station", x: 1290, y: 990 },
    { id: "sports",     kind: "place", cat: "fields",     name: "Football Pitch", x: 1390, y: 805 },
    { id: "fieldwc",    kind: "place", cat: "facilities", name: "Field Washrooms", x: 1500, y: 862 },
    { id: "admissions", kind: "place", cat: "offices",    name: "Admissions Office", x: 487, y: 1012 },
    { id: "mosque",     kind: "place", cat: "worship",    name: "Mosque", x: 452, y: 1005 },

    // ---------- Fields (GIS map, Nov 2026) ----------
    { id: "gradsq",   kind: "place", cat: "fields", name: "Graduation Square (Hockey Boys Pitch)", x: 1490, y: 890 },
    { id: "hockeyg",  kind: "place", cat: "fields", name: "Hockey Pitch (Girls)", x: 1869, y: 907 },      // CHECK: no path drawn; reached across the field from Graduation Square
    { id: "handball", kind: "place", cat: "fields", name: "Handball Pitch", x: 1595, y: 1293 },           // CHECK: no path drawn from the west road
    { id: "netballb", kind: "place", cat: "fields", name: "Netball Pitch (Boys)", x: 1592, y: 1203 },     // CHECK: no path drawn
    { id: "netballg", kind: "place", cat: "fields", name: "Netball Pitch (Girls)", x: 1577, y: 1135 },    // CHECK: no path drawn
    { id: "volleyg",  kind: "place", cat: "fields", name: "Volleyball Pitch (Girls)", x: 1774, y: 1225 }, // CHECK: no path drawn from the west road
    { id: "volleyb",  kind: "place", cat: "fields", name: "Volleyball Pitch (Boys)", x: 1762, y: 1124 },  // CHECK: no path drawn
    { id: "basketg",  kind: "place", cat: "fields", name: "Basketball Pitch (Girls)", x: 1848, y: 731 },  // CHECK: no path drawn; reached along the Football Pitch
    { id: "basketb",  kind: "place", cat: "fields", name: "Basketball Pitch (Boys)", x: 1836, y: 657 },   // CHECK: no path drawn

    // ---------- Junctions (landmark = "near") ----------
    { id: "jGate",   kind: "junction", near: "the junction past the Main Gate", x: 530, y: 720 },
    { id: "jNorth",  kind: "junction", near: "the Prefab Lecture Halls", x: 890, y: 457 },
    { id: "jEwaso",  kind: "junction", near: "Ewaso Nyiro Hostel", x: 962, y: 447 },
    { id: "jGalana", kind: "junction", near: "Galana Hostels", x: 1110, y: 365 },
    { id: "jSite",   kind: "junction", near: "the construction site", x: 917, y: 647 },
    { id: "jEast",   kind: "junction", near: "the New Lecture Halls (east side)", x: 1310, y: 742 },
    { id: "jAdmin",  kind: "junction", near: "the Administration Block", x: 552, y: 817 },
    { id: "jSW",     kind: "junction", near: "the New Administration Block", x: 572, y: 910 },
    { id: "jMosque", kind: "junction", near: "the Mosque turn-off", x: 475, y: 935 },
    { id: "jLT",     kind: "junction", near: "the Lecture Theatre", x: 675, y: 800 },
    { id: "jMess",   kind: "junction", near: "the Mess & Cafeteria", x: 760, y: 782 },
    { id: "jLab",    kind: "junction", near: "the Laboratory crossroads", x: 788, y: 885 },
    { id: "jDisp",   kind: "junction", near: "Umoja Hall", x: 900, y: 862 },
    { id: "jMathW",  kind: "junction", near: "the Mathematics & SPASS Offices", x: 1005, y: 864 },
    { id: "jMath",   kind: "junction", near: "the SBS Offices", x: 1050, y: 858 },
    { id: "jNE",     kind: "junction", near: "the New Lecture Halls (south corner)", x: 1252, y: 818 },
    { id: "jPolice", kind: "junction", near: "the Police Station", x: 1387, y: 965 },
    { id: "jEdu",    kind: "junction", near: "the School of Education", x: 840, y: 1055 },
    { id: "jDVC",    kind: "junction", near: "the DVCs' Offices", x: 850, y: 1105 },
    { id: "jGrad",   kind: "junction", near: "Graduation Square", x: 1466, y: 875 },
    { id: "jWf1",    kind: "junction", near: "the Handball Pitch", x: 1594, y: 1415 },
    { id: "jWf2",    kind: "junction", near: "the Volleyball Pitches", x: 1775, y: 1392 },

    // ---------- Bends ----------
    { id: "bUp",   kind: "bend", x: 1000, y: 822 },
    { id: "bWest", kind: "bend", x: 397, y: 947 },   // west end of the main road (leaves the map)
    { id: "bRd",   kind: "bend", x: 1140, y: 832 },
    { id: "bD1",   kind: "bend", x: 1345, y: 892 },
    { id: "bS1",   kind: "bend", x: 1000, y: 1022 },
    { id: "bS2",   kind: "bend", x: 1255, y: 992 },
    { id: "bS3",   kind: "bend", x: 1317, y: 985 },
    { id: "bW1",   kind: "bend", x: 1452, y: 1097 },  // west road past the fields
    { id: "bW2",   kind: "bend", x: 1533, y: 1394 },
    { id: "bW3",   kind: "bend", x: 1563, y: 1419 },
    { id: "bOvalW", kind: "bend", x: 1644, y: 780 }   // CHECK: along the Football Pitch's west side (no path drawn)
  ],

  edges: [
    // Gate → north-west paths
    ["gate", "jGate", "road"], ["jGate", "spass"], ["spass", "lh57"], ["lh57", "ict"],
    ["ict", "dean"], ["dean", "lh14"], ["lh14", "taifa"], ["taifa", "jSite"],
    // North: prefab, Ewaso, Galana, hostels
    ["jSite", "jNorth"], ["jNorth", "prefab"], ["jNorth", "jEwaso"], ["jEwaso", "ewaso"],
    ["jEwaso", "students"], ["students", "jGalana"], ["jGalana", "galana"],
    ["jGalana", "hostels", "road"], ["hostels", "jEast", "road"],
    // East: sports field, washrooms
    ["jEast", "sports", "road"], ["sports", "fieldwc"],
    // Hostel offices / Tana, Amani
    ["jSite", "hostoff"], ["hostoff", "tana"], ["jSite", "amani"],
    // West spine
    ["jGate", "jAdmin", "road"], ["jAdmin", "newadmin", "road"], ["newadmin", "jSW", "road"],
    ["jSW", "jMosque", "road"], ["jMosque", "bWest", "road"], ["jMosque", "admissions", "road"], ["admissions", "mosque"],
    // Admin → Lecture Theatre → Mess
    ["jAdmin", "oldadmin"], ["oldadmin", "jLT"], ["ict", "jLT"], ["jLT", "lt"], ["lt", "jMess"],
    ["taifa", "jMess"], ["jMess", "mess"], ["jMess", "jLab"], ["jLab", "lab", "road"],
    // Main road
    ["jSW", "jLab", "road"], ["jLab", "umoja", "road"], ["umoja", "jDisp", "road"],
    ["jDisp", "dispensary"], ["jDisp", "bUp", "road"], ["bUp", "newlhs", "road"],
    ["jDisp", "jMathW", "road"], ["jMathW", "mathoff", "road"], ["jMathW", "jMath", "road"],
    ["jMath", "sbs"], ["sbs", "security"], ["jMath", "bRd", "road"], ["bRd", "jNE", "road"],
    ["jNE", "bD1", "road"], ["bD1", "jPolice", "road"],
    // South road
    ["jLab", "schooledu", "road"], ["schooledu", "jEdu", "road"], ["jEdu", "bS1", "road"], ["bS1", "bS2", "road"],
    ["bS2", "police", "road"], ["police", "bS3", "road"], ["bS3", "jPolice", "road"],
    ["jEdu", "registrar", "road"], ["registrar", "programs", "road"], ["registrar", "newlib"],
    ["jEdu", "jDVC", "road"], ["jDVC", "dvc"], ["jDVC", "procure", "road"], ["jDVC", "tvetlh"], ["tvetlh", "utvet", "road"],
    // Lecture halls (Safaricom) / Police → Graduation Square → Football Pitch (GIS map main road)
    ["jPolice", "jGrad", "road"], ["jGrad", "sports", "road"], ["jGrad", "gradsq"],
    ["gradsq", "hockeyg"],                                    // CHECK
    // West road beside the small pitches (GIS map main road)
    ["jPolice", "bW1", "road"], ["bW1", "bW2", "road"], ["bW2", "bW3", "road"], ["bW3", "jWf1", "road"], ["jWf1", "jWf2", "road"],
    ["jWf1", "handball"], ["handball", "netballb"], ["netballb", "netballg"],   // CHECK
    ["jWf2", "volleyg"], ["volleyg", "volleyb"],                                // CHECK
    // Basketball pitches, along the Football Pitch
    ["sports", "bOvalW"], ["bOvalW", "basketg"], ["basketg", "basketb"]          // CHECK
  ]
};
