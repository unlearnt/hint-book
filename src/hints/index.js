import CA_DL from "./ca_dl.js";
import US_PR from "./us_greencard.js";
import DEU_ID from "./deu_id.js";

const PAGES = {
  [CA_DL.id]: CA_DL,
  [US_PR.id]: US_PR,
  [DEU_ID.id]: DEU_ID,
};

export default PAGES;
