import app from "./index";

const port = Number(process.env.PORT || 4200);
app.listen(port, () => console.log(`Legal service running on ${port}`));