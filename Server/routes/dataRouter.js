import { router } from "./oNetRouter";
import dataController from "../controllers/dataController";

app.get("/getData", dataController.getDataFromDatabase);
