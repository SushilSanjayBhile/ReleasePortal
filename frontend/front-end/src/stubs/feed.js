// TODO: need to club multiple fotos from same location, same user and approximate same timestamp. need to develop strategy for this.
// so that it won;t hamper recommendation.
// TODO: globalLocationId will be generated according to the google map grids. Entire earth will be divided into grids
// and will have a number. If some fotos fall under same grid, then they will have same globalLocationId.
// For a user: some fotos may fall under same grid, but may convey different meaning with fotos clicked
//  in same grid by him,
// so it will have different localLocationId.
// locationId: {local: ditinguishing the content, context of the foto from the fotos posted by the user on same location.}

export default [
    {
        id: '4',
        user: {
            uid: '4',
            username: 'Sharang Kulkarni',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/sharang_kulkarni.jpg`
        },
        description: `The place with sights to behold
        PC @pal_love_ @birla_mayur #yellowstonenationalpark #slc #friends #adventure #nature #beauty @ Yellowstone National Park`,
        date: new Date(),
        fotos: [
            // {uid:4, fotoId: 1, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/1.jpg`, lat: 44.578230, lng: -110.476446, title: '', date: '', description: ''},
            // {uid:4, fotoId: 2, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/2.jpg`, lat: 44.589611, lng: -110.338436, title: '', date: '', description: ''},
            // {uid:4, fotoId: 3, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/3.jpg`, lat: 44.568286, lng: -110.315493, title: '', date: '', description: ''},
            {uid:4, fotoId: 102, isVideo: true, locationId: { local: 0, global: 0}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/videos/video2.mp4`, lat: 44.553497, lng: -110.285649, title: '', date: '', description: ''},
            {uid:4, fotoId: 4, locationId: { local: 0, global: 0}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/4.jpg`, lat: 44.553497, lng: -110.285649, title: '', date: '', description: ''},
            // {uid:4, fotoId: 5, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/5.jpg`, lat: 44.530535, lng: -110.269639, title: '', date: '', description: ''},
            // {uid:4, fotoId: 6, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/6.jpg`, lat: 44.491217, lng: -110.267483, title: '', date: '', description: ''},
        ],
        videos: [
            `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/videos/video1.mp4`
        ]
    },
    {
        id: '7',
        user: {
            uid: '4',
            username: 'Sharang Kulkarni',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/sharang_kulkarni.jpg`
        },
        description: `The place with sights to behold
        PC @pal_love_ @birla_mayur #yellowstonenationalpark #slc #friends #adventure #nature #beauty @ Yellowstone National Park`,
        date: new Date(),
        fotos: [
            {uid:4, fotoId: 103, isVideo: true, locationId: { local: 0, global: 0}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/videos/video3.mp4`, lat: 44.553497, lng: -110.285649, title: '', date: '', description: ''},
            {uid:4, fotoId: 38, locationId: { local: 0, global: 0}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/1.jpg`, lat: 44.578230, lng: -110.476446, title: '', date: '', description: ''},
            {uid:4, fotoId: 39, locationId: { local: 1, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/2.jpg`, lat: 44.589611, lng: -110.338436, title: '', date: '', description: ''},
            {uid:4, fotoId: 40, locationId: { local: 1, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/3.jpg`, lat: 44.568286, lng: -110.315493, title: '', date: '', description: ''},
            {uid:4, fotoId: 41, locationId: { local: 2, global: 2}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/4.jpg`, lat: 44.553497, lng: -110.285649, title: '', date: '', description: ''},
            {uid:4, fotoId: 42, locationId: { local: 2, global: 2}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/5.jpg`, lat: 44.530535, lng: -110.269639, title: '', date: '', description: ''},
            {uid:4, fotoId: 43, locationId: { local: 3, global: 2}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/6.jpg`, lat: 44.491217, lng: -110.267483, title: '', date: '', description: ''},
        ],
        videos: [
            `${process.env.PUBLIC_URL}/data/fotos/SharangKulkarni/Journeys/0/videos/video1.mp4`
        ]
    },
    {
        id: '8',
        user: {
            uid: '7',
            username: 'Steve Jobs',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/stevejobs.png`
        },
        description: `best ice cream ever @ Yellowstone National Park`,
        date: new Date(),
        fotos: [
            {uid:7, fotoId: 44, locationId: { local: 0, global: 3}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/0/1.jpg`, lat: 44.284755, lng: -110.252183, title: '', date: '', description: ''},
        ],
        videos: [
        ]
    },
    {
        id: '9',
        user: {
            uid: '8',
            username: 'Grand Oriental',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/GrandOriental/grandoriental.jpg`
        },
        description: `delicacies @ Yellowstone National Park`,
        date: new Date(),
        fotos: [
            {uid:8, fotoId: 45, locationId: { local: 0, global: 3}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/GrandOriental/Journeys/0/2.jpg`, lat: 44.284755, lng: -110.252183, title: '', date: '', description: ''},
            {uid:8, fotoId: 46, locationId: { local: 0, global: 3}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/GrandOriental/Journeys/0/1.jpg`, lat: 44.284765, lng: -110.252193, title: '', date: '', description: ''},
        ],
        videos: [
        ]
    },
    {
        id: '1',
        user: {
            uid: '1',
            username: 'Natalie Osmann',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/nataly_osmann.png`
        },
        description: `The place with sights to behold
        PC @pal_love_ @birla_mayur #yellowstonenationalpark #slc #friends #adventure #nature #beauty @ Yellowstone National Park`,
        date: new Date(),
        fotos: [
            {uid:1, fotoId: 104, isVideo: true, locationId: { local: 0, global: 97}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/videos/video1.mp4`, lat: 29.6949577, lng: 83.3881236, title: '', date: '', description: ''},
            {uid:1, fotoId: 7, locationId: { local: 0, global: 97}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (2).png`, lat: 29.6949577, lng: 83.3881236, title: '', date: '', description: ''},
            {uid:1, fotoId: 8, locationId: { local: 1, global: 98}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (3).png`, lat: 29.501932, lng: 83.3881236, title: '', date: '', description: ''},
            {uid:1, fotoId: 9, locationId: { local: 2, global: 99}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (23).png`, lat: 30.245532, lng: 83.975249, title: '', date: '', description: ''},
            {uid:1, fotoId: 10, locationId: { local: 3, global: 100}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (24).png`, lat: 30.848191, lng: 81.548394, title: '', date: '', description: ''},
            {uid:1, fotoId: 11, locationId: { local: 4, global: 101}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (49).png`, lat: 30.8605812, lng: 81.2928702, title: '', date: '', description: ''},
            {uid:1, fotoId: 12, locationId: { local: 5, global: 102}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (53).png`, lat: 30.817868, lng: 81.301185, title: '', date: '', description: ''},
            {uid:1, fotoId: 13, locationId: { local: 6, global: 103}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (35).png`, lat: 30.986953, lng: 81.291927, title: '', date: '', description: ''},
            {uid:1, fotoId: 14, locationId: { local: 7, global: 104}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/Screenshot (71).png`, lat: 31.0529171, lng: 81.2762373, title: '', date: '', description: ''},
            // "29.6949577 83.3881236 May 5 2019 05:00:00 Screenshot (2).png",
            // "29.6949577 83.3881236 May 5 2019 05:00:00 Screenshot (3).png",
            // "29.501932 84.943022 May 5 2019 11:00:00 Screenshot (4).png",
            // "29.501932 84.943022 May 5 2019 11:00:30 Screenshot (5).png",
            // "29.501932 84.943022 May 5 2019 11:05:45 Screenshot (6).png",
            // "29.501932 84.943022 May 5 2019 11:10:00 Screenshot (7).png",
            // "29.502436 84.966791 May 5 2019 12:30:00 Screenshot (1).png",
            // "29.502438 84.966793 May 5 2019 12:30:00 Screenshot (8).png",
            // "29.502438 84.966793 May 5 2019 12:30:00 Screenshot (9).png",
            // "29.502440 84.966797 May 5 2019 12:30:00 Screenshot (11).png",
            // "29.502440 84.966797 May 5 2019 12:30:00 Screenshot (12).png",
            // "29.475939 84.5641013 May 5 2019 13:00:00 Screenshot (10).png",
            // "29.475939 84.5641013 May 5 2019 13:00:00 Screenshot (13).png",
            // "29.475939 84.5641013 May 5 2019 13:00:00 Screenshot (14).png",
            // "29.764122 83.906091 May 5 2019 16:00:00 Screenshot (15).png",
            // "29.764122 83.906091 May 5 2019 16:00:00 Screenshot (16).png",
            // "29.764122 83.906091 May 5 2019 16:00:00 Screenshot (17).png",
            // "29.764122 83.906091 May 5 2019 16:00:00 Screenshot (18).png",
            // "29.934410 83.645053 May 5 2019 20:00:00 Screenshot (19).png",
            // "29.934410 83.645053 May 5 2019 20:00:00 Screenshot (20).png",
            // "29.934410 83.645053 May 5 2019 20:00:00 Screenshot (21).png",

            // "30.245532 82.975249 May 6 2019 10:00:00 Screenshot (23).png",
            // "30.245532 82.975249 May 6 2019 10:05:00 Screenshot (24).png",
            // "30.245532 82.975249 May 6 2019 10:00:00 Screenshot (25).png",
            // "30.245536 82.975249 May 6 2019 11:00:00 Screenshot (26).png",
            // "30.245536 82.975249 May 6 2019 11:05:00 Screenshot (27).png",

            // "30.848191 81.548394 May 6 2019 18:00:00 Screenshot (28).png",
            // "30.848191 81.548394 May 6 2019 18:05:00 Screenshot (29).png",

            // "30.848191 81.548398 May 6 2019 18:20:00 Screenshot (30).png",
            // "30.848191 81.548398 May 6 2019 18:25:00 Screenshot (31).png",
            // "30.848191 81.548398 May 6 2019 18:30:00 Screenshot (32).png",
            // "30.848191 81.548398 May 6 2019 18:45:00 Screenshot (33).png",

            // "30.848192 81.548398 May 6 2019 20:45:00 Screenshot (34).png",

            // "30.8605812 81.2928702 May 7 2019 10:00:00 Screenshot (49).png",
            // "30.8605812 81.2928702 May 7 2019 10:20:00 Screenshot (50).png",
            // "30.8605812 81.2928702 May 7 2019 10:30:00 Screenshot (51).png",
            // "30.8605812 81.2928702 May 7 2019 11:00:00 Screenshot (52).png",

            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (53).png",
            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (54).png",
            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (55).png",
            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (56).png",

            // "30.848191 81.548399 May 8 2019 09:00:00 Screenshot (35).png",
            // "30.848191 81.548399 May 8 2019 09:00:00 Screenshot (36).png",

            // "30.848191 81.548400 May 9 2019 12:00:00 Screenshot (37).png",
            // "30.848191 81.548400 May 9 2019 12:00:00 Screenshot (38).png",
            // "30.848191 81.548400 May 9 2019 12:05:00 Screenshot (39).png",

            // "30.986953 81.291927 May 9 2019 15:05:00 Screenshot (40).png",
            // "30.986953 81.291927 May 9 2019 15:05:00 Screenshot (41).png",
            // "30.986953 81.291927 May 9 2019 15:10:00 Screenshot (42).png",

            // "30.995871 81.286222 May 10 2019 10:10:00 Screenshot (43).png",
            // "30.995871 81.286222 May 10 2019 10:20:00 Screenshot (44).png",
            // "30.995871 81.286222 May 10 2019 10:50:00 Screenshot (45).png",

            // "31.012038 81.277789 May 10 2019 13:00:00 Screenshot (46).png",
            // "31.012038 81.277789 May 10 2019 13:05:00 Screenshot (47).png",
            // "31.012038 81.277789 May 10 2019 13:10:00 Screenshot (48).png",

            // "31.025504 81.288556 May 10 2019 16:10:00 Screenshot (57).png",
            // "31.025504 81.288556 May 10 2019 16:10:00 Screenshot (58).png",
            // "31.025504 81.288556 May 10 2019 16:10:00 Screenshot (59).png",

            // "31.054737 81.297501 May 11 2019 10:10:00 Screenshot (60).png",
            // "31.054737 81.297501 May 11 2019 10:10:00 Screenshot (61).png",
            // "31.054737 81.297501 May 11 2019 10:10:00 Screenshot (62).png",

            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (63).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (64).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (65).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (66).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (67).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (68).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (69).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (70).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (71).png"
        ],
        videos: [
            `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/0/videos/video1.mp4`
        ]
    },
    {
        id: '2',
        user: {
            uid: '2',
            username: 'Abhijeet Chavan',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/abhijeet_chavan.jpg`
        },
        description: 'Mount Kailash Tour',
        date: new Date(),
        fotos: [
            {uid:2, fotoId: 15, locationId: { local: 0, global: 97}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (2).png`, lat: 29.6949577, lng: 83.3881236, title: '', date: '', description: ''},
            {uid:2, fotoId: 16, locationId: { local: 1, global: 98}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (4).png`, lat: 29.501932, lng: 83.3881236, title: '', date: '', description: ''},
            {uid:2, fotoId: 17, locationId: { local: 2, global: 99}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (23).png`, lat: 30.245532, lng: 83.975249, title: '', date: '', description: ''},
            {uid:2, fotoId: 18, locationId: { local: 3, global: 100}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (24).png`, lat: 30.848191, lng: 81.548394, title: '', date: '', description: ''},
            {uid:2, fotoId: 19, locationId: { local: 4, global: 101}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (49).png`, lat: 30.8605812, lng: 81.2928702, title: '', date: '', description: ''},
            {uid:2, fotoId: 20, locationId: { local: 5, global: 102}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (53).png`, lat: 30.817868, lng: 81.301185, title: '', date: '', description: ''},
            {uid:2, fotoId: 21, locationId: { local: 6, global: 103}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (34).png`, lat: 30.986953, lng: 81.291927, title: '', date: '', description: ''},
            {uid:2, fotoId: 22, locationId: { local: 7, global: 104}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/0/Screenshot (71).png`, lat: 31.0529171, lng: 81.2762373, title: '', date: '', description: ''},
            // "29.6949577 83.3881236 May 5 2019 05:00:00 Screenshot (2).png",
            // "29.501932 84.943022 May 5 2019 11:00:00 Screenshot (4).png",
            // "29.501932 84.943022 May 5 2019 11:00:30 Screenshot (5).png",
            // "29.501932 84.943022 May 5 2019 11:10:00 Screenshot (7).png",
            // "29.475939 84.5641013 May 5 2019 13:00:00 Screenshot (14).png",
            // "29.764122 83.906091 May 5 2019 16:00:00 Screenshot (15).png",
            // "29.764122 83.906091 May 5 2019 16:00:00 Screenshot (17).png",
            // "29.934410 83.645053 May 5 2019 20:00:00 Screenshot (20).png",
            // "29.934410 83.645053 May 5 2019 20:00:00 Screenshot (21).png",

            // "30.245532 82.975249 May 6 2019 10:00:00 Screenshot (23).png",
            // "30.245532 82.975249 May 6 2019 10:05:00 Screenshot (24).png",
            // "30.245532 82.975249 May 6 2019 10:00:00 Screenshot (25).png",

            // "30.848191 81.548394 May 6 2019 18:00:00 Screenshot (28).png",
            // "30.848191 81.548394 May 6 2019 18:05:00 Screenshot (29).png",

            // "30.848191 81.548398 May 6 2019 18:20:00 Screenshot (30).png",
            // "30.848191 81.548398 May 6 2019 18:25:00 Screenshot (31).png",

            // "30.848192 81.548398 May 6 2019 20:45:00 Screenshot (34).png",

            // "30.8605812 81.2928702 May 7 2019 10:00:00 Screenshot (49).png",

            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (53).png",
            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (54).png",
            // "30.817868 81.301185 May 7 2019 16:00:00 Screenshot (55).png",

            // "30.986953 81.291927 May 9 2019 15:05:00 Screenshot (41).png",
            // "30.986953 81.291927 May 9 2019 15:10:00 Screenshot (42).png",

            // "30.995871 81.286222 May 10 2019 10:10:00 Screenshot (43).png",
            // "30.995871 81.286222 May 10 2019 10:20:00 Screenshot (44).png",

            // "31.012038 81.277789 May 10 2019 13:05:00 Screenshot (47).png",

            // "31.025504 81.288556 May 10 2019 16:10:00 Screenshot (57).png",
            // "31.025504 81.288556 May 10 2019 16:10:00 Screenshot (58).png",

            // "31.054737 81.297501 May 11 2019 10:10:00 Screenshot (60).png",
            // "31.054737 81.297501 May 11 2019 10:10:00 Screenshot (61).png",
            // "31.054737 81.297501 May 11 2019 10:10:00 Screenshot (62).png",

            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (73).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (72).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (71).png"
        ],
        videos: [
        ],
    },
    {
        id: '3',
        user: {
            uid: '3',
            username: 'Rushikesh Patil',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/RushikeshPatil/nataly_osmann.png`
        },
        description: 'Mount Kailash Tour',
        date: new Date(),
        videos: [
        ],
        fotos: [
            {uid:3, fotoId: 23, locationId: { local: 0, global: 92}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/RushikeshPatil/Journeys/0/Screenshot (1).png`, lat: 28.976081, lng: 77.764565, title: '', date: '', description: ''},
            {uid:3, fotoId: 24, locationId: { local: 1, global: 93}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/RushikeshPatil/Journeys/0/Screenshot (3).png`, lat: 29.090978, lng: 77.858158, title: '', date: '', description: ''},
            {uid:3, fotoId: 25, locationId: { local: 2, global: 94}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/RushikeshPatil/Journeys/0/Screenshot (6).png`, lat: 29.770100, lng: 78.610660, title: '', date: '', description: ''},
            {uid:3, fotoId: 26, locationId: { local: 3, global: 95}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/RushikeshPatil/Journeys/0/Screenshot (9).png`, lat: 29.725287, lng: 78.662960, title: '', date: '', description: ''},
            {uid:3, fotoId: 27, locationId: { local: 4, global: 96}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/RushikeshPatil/Journeys/0/Screenshot (17).png`, lat: 31.0529171, lng: 81.2762373, title: '', date: '', description: ''},
            // "28.976081 77.764565 May 11 2019 15:10:00 Screenshot (1).png",
            // "28.976081 77.764565 May 11 2019 15:10:00 Screenshot (2).png",

            // "29.090978 77.858158 May 11 2019 15:10:00 Screenshot (3).png",

            // "29.379574 78.187993 May 11 2019 15:10:00 Screenshot (4).png",
            // "29.379574 78.187993 May 11 2019 15:10:00 Screenshot (5).png",

            // "29.770100 78.610660 May 11 2019 15:10:00 Screenshot (6).png",
            // "29.770100 78.610660 May 11 2019 15:10:00 Screenshot (7).png",
            // "29.770100 78.610660 May 11 2019 15:10:00 Screenshot (8).png",

            // "29.725287 78.662960 May 11 2019 15:10:00 Screenshot (9).png",
            // "29.725287 78.662960 May 11 2019 15:10:00 Screenshot (10).png",
            // "29.725287 78.662960 May 11 2019 15:10:00 Screenshot (11).png",

            // "30.700751 79.3394473 May 11 2019 15:10:00 Screenshot (12).png",
            // "30.700751 79.3394473 May 11 2019 15:10:00 Screenshot (13).png",
            // "30.700751 79.3394473 May 11 2019 15:10:00 Screenshot (14).png",

            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (15).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (16).png",
            // "31.0529171 81.2762373 May 11 2019 15:10:00 Screenshot (17).png"
        ]
    },
    {
        id: '5',
        user: {
            uid: '5',
            username: 'Alexander Tyrell',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/AlexanderTyrell/alexander_tyrell.png`
        },
        description: `#beautiful #yellowstone #worth visiting`,
        date: new Date(),
        fotos: [
            {uid:5, fotoId: 28, locationId: { local: 0, global: 0}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AlexanderTyrell/Journeys/0/1.jpg`, lat: 44.371894, lng: -109.976197, title: '', date: '', description: ''},
            {uid:5, fotoId: 29, locationId: { local: 1, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AlexanderTyrell/Journeys/0/2.jpg`, lat: 44.409121, lng: -110.185209, title: '', date: '', description: ''},
            {uid:5, fotoId: 30, locationId: { local: 2, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AlexanderTyrell/Journeys/0/3.jpg`, lat: 44.356711, lng: -110.192338, title: '', date: '', description: ''},
            {uid:5, fotoId: 31, locationId: { local: 3, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AlexanderTyrell/Journeys/0/4.jpg`, lat: 44.297730, lng: -110.194903, title: '', date: '', description: ''},
            {uid:5, fotoId: 32, locationId: { local: 4, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AlexanderTyrell/Journeys/0/5.jpg`, lat: 44.284755, lng: -110.252183, title: '', date: '', description: ''},
        ]
    },
    {
        id: '6',
        user: {
            uid: '6',
            username: 'Tom Felton',
            userpic: `${process.env.PUBLIC_URL}/data/fotos/TomFelton/tom_felton.png`
        },
        description: `#yellowstone #harrypotter #azkaban`,
        date: new Date(),
        fotos: [
            {uid:6, fotoId: 33, locationId: { local: 0, global: 0}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/TomFelton/Journeys/0/1.jpg`, lat: 44.483186, lng: -109.570583, title: '', date: '', description: ''},
            {uid:6, fotoId: 34, locationId: { local: 1, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/TomFelton/Journeys/0/2.jpg`, lat: 44.468373, lng: -110.634833, title: '', date: '', description: ''},
            {uid:6, fotoId: 35, locationId: { local: 2, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/TomFelton/Journeys/0/3.jpg`, lat: 44.394667, lng: -110.625470, title: '', date: '', description: ''},
            {uid:6, fotoId: 36, locationId: { local: 3, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/TomFelton/Journeys/0/4.jpg`, lat: 44.361921, lng: -110.609351, title: '', date: '', description: ''},
            {uid:6, fotoId: 37, locationId: { local: 4, global: 1}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/TomFelton/Journeys/0/5.jpg`, lat: 44.332416, lng: -110.620739, title: '', date: '', description: ''},
        ]
    },
]