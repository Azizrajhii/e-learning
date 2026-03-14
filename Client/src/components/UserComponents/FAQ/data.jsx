import pdp from "./../images/pdp.jpg";
import imagetestforcomment from "./../images/imagetestforcomment.png";
import videotestforArticle from "./../videos/videoTest.mp4";

export const articlesData = [
  {
    id: 1,
    name: "Houssem Eddine",
    lastName: "Marzouk",
    pdp: pdp,
    title: "How to learn React?",
    content: "I want to start learning React. Any tips?",
    image: imagetestforcomment,
    poll : null,
    link: null,
    video: null,
    postedAt: "2003-05-21T14:32:00Z",
    nbLikes: 323330,
    comments: [
      {
        id: 404,
        name: "Yassmin",
        lastName: "Bahri",
        pdp: pdp,
        content: "Takdiiiis a chesmo",
        postedAt: "2003-05-21T14:32:00Z",
        mentions: [
          {
            userId: "67ca51151834c82af6a961d2",
            name: "Houssem Eddine",
            lastName: "Marzouk",
          },
          {
            userId: "67ca51151834c82af6a961d2",
            name: "Aziz",
            lastName: "Rajhi",
          },
        ],
        nbLikes: 3,
        replies: [
          {
            id: 201,
            pdp: pdp,
            name: "Aziz",
            lastName: "Rajhi",
            content: "I agree!",
            postedAt: "2003-05-21T14:32:00Z",
            nbLikes: 1,
            replies: [
              {
                id: 2031,
                pdp: pdp,
                name: "Oumayma",
                lastName: "Ben Said",
                content: "suiiiiiaaaaaaaaaaaaaaasdfsdfsdfsdf dsdfsdfsdfsdf sdfsdfsdf sdfsdf aaaaas dfsdfsdfs dfsdfsdfii",
                postedAt: "2024-04-10T14:02:00Z",
                nbLikes: 1,
                replies: [],
                mentions: []
              },
            ],
          },
          {
            id: 22202,
            pdp: pdp,
            name: "Ayoub",
            lastName: "Hamrouni",
            content: "neee belgassem",
            postedAt: "2025-03-10T14:02:00Z",
            nbLikes: 1,
            replies: [
              {
                id: 23203,
                pdp: pdp,
                name: "Saif",
                lastName: "Hidri",
                content: "behyaaa",
                postedAt: "2025-04-11T19:02:00Z",
                nbLikes: 1,
                replies: [],
                mentions: []
              },
            ],
            mentions: []
          },
        ],
      },
      {
        id: 43304,
        name: "Mohamed",
        lastName: "Mensi",
        pdp: pdp,
        content: "bch bch",
        postedAt: "2003-05-21T14:32:00Z",
        nbLikes: 3,
        replies: [],
        mentions: []
      },
    ],
  },
  {
    id: 2,
    name: "Houssem Eddine",
    lastName: "Marzouk",
    pdp: pdp,
    title: null,
    content: null,
    image: null,
    poll : {
      question : "chnowa loun el dela3 ???",
      answers : [
        {
          _id : "AN01",
          label : "ahmer",
          nbChosen : 420
        },
        {
          _id : "AN02",
          label : "bsisi",
          nbChosen : 660
        },
        {
          _id : "AN03",
          label : "5rawiii",
          nbChosen : 340
        },
        {
          _id : "AN04",
          label : "ka7lanzii",
          nbChosen : 1440
        }
      ]
    },
    postedAt: "2025-04-11T06:32:00Z",
    link: null,
    video: null,
    comments: [{
      id: 2031,
      pdp: pdp,
      name: "Oumayma",
      lastName: "Ben Said",
      content: "3ayedyy w snin dayma",
      postedAt: "2024-04-10T14:02:00Z",
      nbLikes: 1,
      replies: [],
      mentions: []
    }],
    nbLikes: 320,
  },
  {
    id: 3,
    name: "Houssem Eddine",
    lastName: "Marzouk",
    pdp: pdp,
    title: "Best programming languages?",
    content: "What are the top programming languages for 2025?",
    image: imagetestforcomment,
    poll : null,
    link: null,
    video: null,
    postedAt: "2025-04-01T14:32:00Z",
    comments: [],
    nbLikes: 320,
  },
  {
    id: 4,
    name: "Houssem Eddine",
    lastName: "Marzouk",
    pdp: pdp,
    title: "React?",
    content : 'React (also known as React.js or ReactJS) is a free and open-source front-end JavaScript library[5][6] that aims to make building user interfaces based on components more "seamless".[5] It is maintained by Meta (formerly Facebook) and a community of individual developers and companies.[7][8][9] React can be used to develop single-page, mobile, or server-rendered applications with frameworks like Next.js and Remix[a]. Because React is only concerned with the user interface and rendering components to the DOM, React applications often rely on libraries for routing and other client-side functionality.[11][12] A key advantage of React is that it only re-renders those parts of the page that have changed, avoiding unnecessary re-rendering of unchanged DOM elements. React code is made of entities called components.[14]: 10–12  These components are modular and can be reused.[14]: 70  React applications typically consist of many layers of components. The components are rendered to a root element in the DOM using the React DOM library. When rendering a component, values are passed between components through props (short for "properties"). Values internal to a component are called its state.',
    image: imagetestforcomment,
    poll : null,
    link: null,
    video: null,
    postedAt: "2025-04-10T14:32:00Z",
    comments: [],
    nbLikes: 320,
  },
  {
    id: 5,
    name: "Houssem Eddine",
    lastName: "Marzouk",
    pdp: pdp,
    title: "Movie",
    content : 'nighty ???',
    image: null,
    link: null,
    video: videotestforArticle,
    poll : null,
    postedAt: "2025-04-10T14:32:00Z",
    comments: [],
    nbLikes: 320,
  },
  {
    id: 6,
    name: "Houssem Eddine",
    lastName: "Marzouk",
    pdp: pdp,
    title: "post about netflix",
    content : 'this is the link of netflix ???',
    link: "https://www.netflix.com/tn-fr/",
    image: null,
    video: null,
    poll : null,
    postedAt: "2025-04-10T14:32:00Z",
    comments: [],
    nbLikes: 320,
  },
];

export const users = [
  {
    _id: 1,
    name: "Houssem",
    lastName: "Marzouk",
    pdp: pdp,
  },
  {
    _id: 2,
    name: "Aziz",
    lastName: "Rajhi",
    pdp: pdp,
  },
  {
    _id: 3,
    name: "Mohsen",
    lastName: "Rajhi",
    pdp: pdp,
  },
  {
    _id: 4,
    name: "gozdo8rii",
    lastName: "Rajhi",
    pdp: pdp,
  },
];