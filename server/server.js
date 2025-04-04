import app from "./app.js";

// const PORT = process.env.PORT || 3030;
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 不必要
// app.listen(PORT, "124.223.143.202", () => {
//   console.log(`Server running on port ${PORT}`);
// });

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });
