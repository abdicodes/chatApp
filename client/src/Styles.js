// styling file

import { makeStyles } from "@mui/styles";
const Styles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: "100%",
    height: "80vh",
  },
  headBG: {
    backgroundColor: "#e0e0e0",
  },
  borderRight500: {
    borderRight: "1px solid #e0e0e0",
  },
  messageArea: {
    height: "60vh",
    overflowY: "auto",
  },
  video: {
    width: "220px",
    height: "180px",
  },
  gridContainer: {
    justifyContent: "center",
  },
  paper: {
    padding: "2px",
    border: "1px  black",
    margin: "2px",
    marginTop: "50px",
    marginBottom: "50px",
  },
  Container: {
    padding: "200px",
  },
  bodyContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-around",
  },
});
export default Styles;
