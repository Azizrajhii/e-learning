import React, { useState } from "react"; // Import useState
import "./Home.css";
import pdpImage from "../images/pdp.jpg";
import { PieChart } from "@mui/x-charts/PieChart";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Stack from "@mui/material/Stack";
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

const Article = ({ title, description, author, date, tag }) => {
  return (
    <div className="card">
      <div className="card-image">
        <div className="card-icon">L7</div>
      </div>
      <div className="card-content">
        <span className="tag">{tag}</span>
        <p className="publish-date">Published {date}</p>
        <h2 className="card-title">{title}</h2>
        <p className="card-description">{description}</p>
        <div className="author-info">
          <img
            src={pdpImage}
            alt={`Photo de l'auteur ${author}`}
            className="author-image"
          />
          <span className="author-name">{author}</span>
        </div>
      </div>
    </div>
  );
};

// Function to shuffle an array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateNumbers = (size) => {
  return shuffleArray([...Array(size)].map((_, i) => i));
};

const PetiteArticle = ({ title, content, imageUrl }) => {
  {
    /*const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };*/
  }

  return (
    <div className="PetiteArticle">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="PetiteArticle-image" />
      )}
      <div className="PetiteArticle-parag">
        <h1 className="PetiteArticle-title">{title}</h1>
        <div className="PetiteArticle-content">
          <p>{content.short}</p>
        </div>
        {/*<ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          className="list-grandarticle"
        >
          <CardContent>
            <Typography sx={{ marginBottom: 2 }}>Method:</Typography>
            {content.long &&
              content.long.map((step, index) => (
                <Typography key={index} sx={{ marginBottom: 2 }}>
                  {step}
                </Typography>
              ))}
          </CardContent>
        </Collapse>*/}
      </div>
    </div>
  );
};

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const GrandArticle = ({ title, subheader, image, content, pdp }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="GrandArticle-card">
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            <img src={pdp} alt="" />
          </Avatar>
        }
        title={title}
        subheader={subheader}
      />
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{
          width: 300,
          height: 200,
        }}
      />
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {content.short}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        className="list-grandarticle"
      >
        <CardContent>
          <Typography sx={{ marginBottom: 2 }}>Method:</Typography>
          {content.long.map((step, index) => (
            <Typography key={index} sx={{ marginBottom: 2 }}>
              {step}
            </Typography>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export const Home = () => {
  const nom = "Houssem Eddine";
  // Value formatter function
  const valueFormatter = (data) => {
    return `${data.value}%`;
  };

  // Data for the PieChart
  const desktopOS = [
    { label: "Python", value: 55 },
    { label: "Java", value: 25 },
    { label: "C++", value: 15 },
    { label: "Flutter", value: 2 },
    { label: "Other", value: 3 },
  ];

  // Articles data
  const articles = [
    {
      title: "HTML & CSS foundations",
      description:
        "These languages are the backbone of every website, defining structure, content, and presentation.",
      author: "Greg Hooper",
      date: "21 Dec 2023",
      tag: "Learning",
    },
    {
      title: "JavaScript Basics",
      description:
        "JavaScript is the programming language that powers the modern web. Learn the basics to get started.",
      author: "John Doe",
      date: "15 Jan 2024",
      tag: "Programming",
    },
    {
      title: "React for Beginners",
      description:
        "React is a popular JavaScript library for building user interfaces. This guide will help you get started.",
      author: "Jane Smith",
      date: "10 Feb 2024",
      tag: "Web Development",
    },
  ];

  const petiteArticlesData = [
    {
      id: 1,
      title: "Lizard",
      content: {
        short:
          "This impressive paella is a perfect party dish and a fun meal to cook together with your guests.",
        long: [
          "Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10 minutes.",
          "Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly browned, 6 to 8 minutes.",
          "Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook without stirring, until most of the liquid is absorbed, 15 to 18 minutes.",
          "Set aside off of the heat to let rest for 10 minutes, and then serve.",
        ],
      },
      imageUrl: pdpImage, // Replace with a valid URL
    },
    {
      id: 2,
      title: "Snake",
      content: {
        short:
          "This impressive paella is a perfect party dish and a fun meal to cook together with your guests.",
        long: [
          "Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10 minutes.",
          "Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly browned, 6 to 8 minutes.",
          "Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook without stirring, until most of the liquid is absorbed, 15 to 18 minutes.",
          "Set aside off of the heat to let rest for 10 minutes, and then serve.",
        ],
      },
      imageUrl: pdpImage, // Replace with a valid URL
    },
    {
      id: 3,
      title: "Turtle",
      content: {
        short:
          "This impressive paella is a perfect party dish and a fun meal to cook together with your guests.",
        long: [
          "Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10 minutes.",
          "Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly browned, 6 to 8 minutes.",
          "Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook without stirring, until most of the liquid is absorbed, 15 to 18 minutes.",
          "Set aside off of the heat to let rest for 10 minutes, and then serve.",
        ],
      },
      imageUrl: pdpImage, // Replace with a valid URL
    },
  ];

  const GrandArticlesData = [
    {
      id: 1,
      title: "Shrimp and Chorizo Paella",
      subheader: "September 14, 2016",
      pdp: pdpImage,
      image: pdpImage, // Replace with a valid URL
      content: {
        short:
          "This impressive paella is a perfect party dish and a fun meal to cook together with your guests.",
        long: [
          "Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10 minutes.",
          "Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly browned, 6 to 8 minutes.",
          "Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook without stirring, until most of the liquid is absorbed, 15 to 18 minutes.",
          "Set aside off of the heat to let rest for 10 minutes, and then serve.",
        ],
      },
    },
    {
      id: 2,
      title: "Grilled Salmon with Lemon",
      subheader: "October 5, 2023",
      pdp: pdpImage,
      image: pdpImage, // Replace with a valid URL
      content: {
        short:
          "A delicious and healthy grilled salmon recipe with a hint of lemon.",
        long: [
          "Preheat the grill to medium-high heat.",
          "Season the salmon with salt, pepper, and lemon zest.",
          "Grill the salmon for 4-5 minutes on each side until cooked through.",
          "Serve with a side of steamed vegetables.",
        ],
      },
    },
    {
      id: 3,
      title: "Classic Beef Burger",
      subheader: "November 20, 2023",
      pdp: pdpImage,
      image: pdpImage, // Replace with a valid URL
      content: {
        short: "A classic beef burger recipe that's perfect for any occasion.",
        long: [
          "Form ground beef into patties and season with salt and pepper.",
          "Grill the patties for 3-4 minutes on each side.",
          "Assemble the burgers with lettuce, tomato, cheese, and your favorite condiments.",
          "Serve with fries or a side salad.",
        ],
      },
    },
  ];

  // Shuffle the articles array
  const shuffledArticles = shuffleArray([...articles]);
  const shuffledPetiteArticles = shuffleArray([...petiteArticlesData]);
  const shuffledGrandArticles = shuffleArray([...GrandArticlesData]);
  const [randomNumbersRow1, setRandomNumbersRow1] = useState(() =>
    generateNumbers(2)
  );
  const [randomNumbersRow2, setRandomNumbersRow2] = useState(() =>
    generateNumbers(4)
  );
  const [randomNumbersColumn, setRandomNumbersColumn] = useState(() =>
    shuffleArray([0, 1])
  );

  const randomnumAr = 1;

  const settings = {
    valueFormatter: (value) => `${value}%`,
    height: 100,
    showTooltip: true,
    showHighlight: true,
  };

  const largeValues = [
    60, 65, 3, 68, 55, 30, 1, 1, 1, 30, 15, 10, 20, 40, 50, 77, 191,
  ];
  const [selectedDate, setSelectedDate] = useState(dayjs());


  return (
    <>
      <div className="Home">
        <div className="header-row">
          <div className="header-title"></div>
          <div className="header-calendar">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["DateCalendar", "DateCalendar", "DateCalendar"]}
              >
                <DemoItem label={'"year", "month" and "day"'}>
                  <DateCalendar
                    defaultValue={dayjs("2022-04-17")}
                    views={["year", "month", "day"]}
                  />
                </DemoItem>
                <DemoItem label={'"day"'}>
                  <DateCalendar views={["day"]} />
                </DemoItem>
                <DemoItem label={'"month" and "year"'}>
                  <DateCalendar
                    defaultValue={dayjs("2022-04-17")}
                    views={["month", "year"]}
                    openTo="month"
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
          </div>
        </div>
        {randomNumbersColumn.map((colIndex) => (
          <div className="home-content" key={colIndex}>
            {colIndex === 0 ? (
              <div className="row1">
                {randomnumAr === 1 ? (
                  <div className="largeArticle">
                    <Typography>Without fixed y-range</Typography>
                    <Stack
                      sx={{
                        width: "100%",
                        height: "calc(100% - 20px)", // Ensures it fills remaining space
                        mb: 2,
                        display: "flex",
                      }}
                      direction="row"
                    >
                      <Box
                        sx={{ flexGrow: 1, height: "100%", display: "flex" }}
                      >
                        <SparkLineChart
                          style={{ height: "100%", width: "100%" }}
                          data={largeValues}
                          {...settings}
                        />
                      </Box>
                    </Stack>
                  </div>
                ) : (
                  <div style={{ display: "flex" }}>aaa</div>
                )}
                {/* Comment Section */}
                {randomNumbersRow1.map((order, index) => (
                  <div
                    key={index}
                    style={{ order }}
                    className="row-articles-container"
                  >
                    {index === 0 ? (
                      <div className="commentaire-home">
                        <div className="commentaire-home-user_info">
                          <img src={pdpImage} alt="Photo de profil" />
                          <span>{nom}</span>
                        </div>
                        <div className="commentaire-home-content">
                          <p>
                            La tâche peut paraître lourde en moins de quatre
                            heures trente (4h30), mais si l'élève sait
                            s'organiser en fonction du temps dont il dispose, il
                            devrait s'en sortir relativement bien, comme l'ont
                            démontré les résultats des douze dernières années.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pie-chart-container">
                        <PieChart
                          series={[
                            {
                              data: desktopOS.map((item, index) => ({
                                ...item,
                                id: index, // Add a unique identifier
                              })),
                              highlightScope: {
                                fade: "global",
                                highlight: "item",
                              },
                              faded: {
                                innerRadius: 30,
                                additionalRadius: -30,
                                color: "gray",
                              },
                              valueFormatter, // Pass the valueFormatter
                            },
                          ]}
                          height={200}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* PieChart Section */}
              </div>
            ) : (
              <div className="row2">
                {randomNumbersRow2.map((order, index) => (
                  <div
                    key={index}
                    style={{ order }}
                    className="row-articles-container"
                  >
                    {index === 0 ? (
                      <div className="articles-container">
                        {shuffledArticles.slice(0, 1).map((article, index) => (
                          <Article
                            key={index}
                            title={article.title}
                            description={article.description}
                            author={article.author}
                            date={article.date}
                            tag={article.tag}
                          />
                        ))}
                      </div>
                    ) : index === 1 ? (
                      <div>
                        {shuffledGrandArticles.slice(0, 1).map((article) => (
                          <GrandArticle
                            key={article.id}
                            title={article.title}
                            subheader={article.subheader}
                            image={article.image}
                            content={article.content}
                            pdp={article.pdp}
                          />
                        ))}
                      </div>
                    ) : index === 2 ? (
                      <div className="restArticle">a</div>
                    ) : (
                      <div className="PetiteArticles-Container">
                        {shuffledPetiteArticles.slice(0, 1).map((article) => (
                          <PetiteArticle
                            key={article.id} // Unique key for each article
                            title={article.title}
                            content={article.content}
                            imageUrl={article.imageUrl}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
