/* =========================================================
   GaU CAMPUS MAP DATA
   Traced from the team's campus layout map (full_uni_Layout1).
   Coordinates are PIXELS on that map at its original size
   (2576 × 1822). x = right, y = down. The page draws only
   walkways (lines) and places (dots): no building outlines.

   - nodes: every point a route can pass through.
       kind "place"    → appears in the dropdowns (needs name + cat)
       kind "junction" → path crossing; "near" names a landmark used
                         in directions ("At the Laboratory, turn left")
       kind "bend"     → just a corner in a path (never announced)
   - edges: walkways (the purple lines on the map), both directions.

   ⚠️ Names come from the map labels. Items marked CHECK need a
   walk-through to confirm before the map goes live.
   ========================================================= */

window.CAMPUS = {
  extent: { x: 330, y: 300, w: 1300, h: 1000 },   // initial view (campus core)

  categories: [
    ["gates", "Gates"],
    ["offices", "Offices"],
    ["lecture", "Lecture halls & labs"],
    ["halls", "Halls & hostels"],
    ["facilities", "Facilities"],
    ["worship", "Places of worship"]
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
    { id: "sports",     kind: "place", cat: "facilities", name: "Sports Field (oval)", x: 1390, y: 805 },  // CHECK: unlabeled on the map
    { id: "fieldwc",    kind: "place", cat: "facilities", name: "Field Washrooms", x: 1500, y: 862 },
    { id: "admissions", kind: "place", cat: "offices",    name: "Admissions Office", x: 487, y: 1012 },
    { id: "mosque",     kind: "place", cat: "worship",    name: "Mosque", x: 452, y: 1005 },

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

    // ---------- Bends ----------
    { id: "bUp",   kind: "bend", x: 1000, y: 822 },
    { id: "bWest", kind: "bend", x: 397, y: 947 },   // west end of the main road (leaves the map)
    { id: "bRd",   kind: "bend", x: 1140, y: 832 },
    { id: "bD1",   kind: "bend", x: 1345, y: 892 },
    { id: "bS1",   kind: "bend", x: 1000, y: 1022 },
    { id: "bS2",   kind: "bend", x: 1255, y: 992 },
    { id: "bS3",   kind: "bend", x: 1317, y: 985 }
  ],

  edges: [
    // Gate → north-west paths
    ["gate", "jGate"], ["jGate", "spass"], ["spass", "lh57"], ["lh57", "ict"],
    ["ict", "dean"], ["dean", "lh14"], ["lh14", "taifa"], ["taifa", "jSite"],
    // North: prefab, Ewaso, Galana, hostels
    ["jSite", "jNorth"], ["jNorth", "prefab"], ["jNorth", "jEwaso"], ["jEwaso", "ewaso"],
    ["jEwaso", "students"], ["students", "jGalana"], ["jGalana", "galana"],
    ["jGalana", "hostels"], ["hostels", "jEast"],
    // East: sports field, washrooms
    ["jEast", "sports"], ["sports", "fieldwc"],
    // Hostel offices / Tana, Amani
    ["jSite", "hostoff"], ["hostoff", "tana"], ["jSite", "amani"],
    // West spine
    ["jGate", "jAdmin"], ["jAdmin", "newadmin"], ["newadmin", "jSW"],
    ["jSW", "jMosque"], ["jMosque", "bWest"], ["jMosque", "admissions"], ["admissions", "mosque"],
    // Admin → Lecture Theatre → Mess
    ["jAdmin", "oldadmin"], ["oldadmin", "jLT"], ["ict", "jLT"], ["jLT", "lt"], ["lt", "jMess"],
    ["taifa", "jMess"], ["jMess", "mess"], ["jMess", "jLab"], ["jLab", "lab"],
    // Main road
    ["jSW", "jLab"], ["jLab", "umoja"], ["umoja", "jDisp"],
    ["jDisp", "dispensary"], ["jDisp", "bUp"], ["bUp", "newlhs"],
    ["jDisp", "jMathW"], ["jMathW", "mathoff"], ["jMathW", "jMath"],
    ["jMath", "sbs"], ["sbs", "security"], ["jMath", "bRd"], ["bRd", "jNE"],
    ["jNE", "bD1"], ["bD1", "jPolice"],
    // South road
    ["jLab", "schooledu"], ["schooledu", "jEdu"], ["jEdu", "bS1"], ["bS1", "bS2"],
    ["bS2", "police"], ["police", "bS3"], ["bS3", "jPolice"],
    ["jEdu", "registrar"], ["registrar", "programs"], ["registrar", "newlib"],
    ["jEdu", "jDVC"], ["jDVC", "dvc"], ["jDVC", "procure"], ["jDVC", "tvetlh"], ["tvetlh", "utvet"]
  ]
};
